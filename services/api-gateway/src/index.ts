import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { AgenticCore } from '../../../packages/autonomous-engine/src/core/AgenticCore';
import { ToolRegistry, RegisteredTool } from '../../../packages/tool-registry/src/ToolRegistry';
import { VectorKnowledgeBase } from '../../../packages/knowledge-base/src/VectorKnowledgeBase';
import { MetaLearningLayer } from '../../../packages/learning-system/src/MetaLearningLayer';
import { LearningSystem } from '../../../packages/learning-system/src/LearningSystem';
import { EventDispatcher, eventDispatcher } from '../../../packages/core-engine/src/EventDispatcher';
import { logger } from '../../../lib/logger';
import fetch from 'node-fetch';

// Import or define LearningError interface
type ErrorType = 'validation' | 'processing' | 'integration' | 'configuration' | 'runtime';
type LayerType = 'behavioral' | 'strategic' | 'knowledge' | 'integration';
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
  [key: string]: any;
}

interface LearningError {
  id: string;
  timestamp: number;
  type: ErrorType;
  layer: LayerType;
  severity: ErrorSeverity;
  message: string;
  context: ErrorContext;
  stack?: string;
}

// ==================== 类型定义 ====================

interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
}

// ==================== API网关 ====================

export class APIGateway {
  private app: express.Application;
  private port: number;
  private agentEngine: AgenticCore;
  private eventDispatcher: EventDispatcher;
  private toolRegistry: ToolRegistry;
  private vectorKnowledgeBase: VectorKnowledgeBase;
  private metaLearningLayer: MetaLearningLayer;
  private learningSystem: LearningSystem;
  private serviceUrls: {
    aiEngine: string;
    dataService: string;
  };

  constructor(port: number = 4000) {
    this.app = express();
    this.port = port;
    this.eventDispatcher = eventDispatcher;
    this.agentEngine = new AgenticCore({
      maxConcurrentTasks: 10,
      enableLearning: true
    });
    // 实例化工具和服务
    this.toolRegistry = new ToolRegistry({ 
      enableHealthCheck: true,
      maxCacheSize: 1000,
      healthCheckInterval: 30000,
      maxResults: 100,
      defaultCacheTTL: 3600000, // 1小时
      enableMetrics: true
    });
    this.vectorKnowledgeBase = new VectorKnowledgeBase(384);
    this.metaLearningLayer = new MetaLearningLayer();
    this.learningSystem = new LearningSystem();
    this.serviceUrls = {
      aiEngine: process.env.AI_ENGINE_URL || 'http://localhost:3201',
      dataService: process.env.DATA_SERVICE_URL || 'http://localhost:3202'
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventSubscriptions();
  }

  // ==================== 中间件配置 ====================

  private setupMiddleware(): void {
    // 安全中间件
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // JSON解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 限制100个请求
      message: '请求过于频繁，请稍后再试'
    });
    this.app.use('/api/', limiter);

    // 认证中间件
    this.app.use('/api/', this.authenticate.bind(this));

    // 日志中间件
    this.app.use(this.logger.bind(this));

    // 错误处理
    this.app.use(this.errorHandler.bind(this));
  }

  // ==================== 路由配置 ====================

  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime()
      });
    });

    // ==================== Agent API ====================

    // 处理用户输入
    this.app.post('/api/agent/process', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { text, context } = req.body;

        if (!text) {
          return res.status(400).json({ error: '缺少必需的参数: text' });
        }

        const response = await this.agentEngine.processInput({
          text,
          context: {
            ...context,
            userId: req.userId!,
            sessionId: req.sessionId!,
            environment: 'web',
            permissions: ['read', 'write']
          }
        });

        res.json(response);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取系统状态
    this.app.get('/api/agent/status', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const status = this.agentEngine.getSystemStatus();
        res.json(status);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== Tool Registry API ====================

    // 获取所有工具
    this.app.get('/api/tools', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const tools = this.toolRegistry.getTools();
        const metadata = tools.map((tool: RegisteredTool) => tool.metadata);
        res.json({ tools: metadata });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 搜索工具
    this.app.get('/api/tools/search', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
          return res.status(400).json({ error: '缺少搜索查询参数: q' });
        }

        const tools = this.toolRegistry.searchTools(q);
        res.json({ tools: tools.map((t: RegisteredTool) => t.metadata) });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 执行工具
    this.app.post('/api/tools/execute', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { toolId, input } = req.body;

        if (!toolId || !input) {
          return res.status(400).json({ error: '缺少必需的参数: toolId, input' });
        }

        const result = await this.toolRegistry.execute(toolId, input, {
          userId: req.userId!,
          sessionId: req.sessionId!,
          timestamp: Date.now(),
          environment: 'web',
          permissions: ['read', 'write']
        });

        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取工具统计
    this.app.get('/api/tools/:toolId/stats', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { toolId } = req.params;
        const stats = this.toolRegistry.getToolStats(toolId);

        if (!stats) {
          return res.status(404).json({ error: '工具未找到' });
        }

        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== Knowledge Base API ====================

    // 添加知识
    this.app.post('/api/knowledge/add', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { text, metadata } = req.body;

        if (!text) {
          return res.status(400).json({ error: '缺少必需的参数: text' });
        }

        const id = await this.vectorKnowledgeBase.addEmbedding(text, metadata);
        res.json({ id, success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 语义搜索
    this.app.post('/api/knowledge/search', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { query, topK = 10, threshold = 0.7, filters } = req.body;

        if (!query) {
          return res.status(400).json({ error: '缺少必需的参数: query' });
        }

        const results = await this.vectorKnowledgeBase.semanticSearch(query, topK, threshold, filters);
        res.json({ results });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // RAG查询
    this.app.post('/api/knowledge/rag', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { query, topK = 5, threshold = 0.7, filters } = req.body;

        if (!query) {
          return res.status(400).json({ error: '缺少必需的参数: query' });
        }

        const result = await this.vectorKnowledgeBase.ragQuery({
          query,
          topK,
          threshold,
          filters
        });

        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取知识库统计
    this.app.get('/api/knowledge/stats', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const stats = this.vectorKnowledgeBase.getStats();
        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== 数据服务路由代理 ====================

    // 用户数据路由
    this.app.get('/api/users/:id', this.proxyToDataService.bind(this));
    this.app.put('/api/users/:id', this.proxyToDataService.bind(this));
    
    // 课程数据路由
    this.app.get('/api/courses', this.proxyToDataService.bind(this));
    this.app.get('/api/courses/:id', this.proxyToDataService.bind(this));
    this.app.post('/api/courses', this.proxyToDataService.bind(this));
    
    // 考试结果路由
    this.app.get('/api/users/:userId/exam-results', this.proxyToDataService.bind(this));
    this.app.post('/api/exam-results', this.proxyToDataService.bind(this));
    
    // ==================== AI引擎服务路由代理 ====================
    
    // AI处理路由
    this.app.post('/api/ai/process', this.proxyToAIEngine.bind(this));
    this.app.post('/api/ai/generate', this.proxyToAIEngine.bind(this));
    this.app.post('/api/ai/embed', this.proxyToAIEngine.bind(this));

    // ==================== Learning System API ====================

    // 记录经验
    this.app.post('/api/learning/experience', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { state, action, reward, nextState, metadata } = req.body;

        if (!state || !action || reward === undefined || !nextState) {
          return res.status(400).json({ error: '缺少必需的参数' });
        }

        const experience = {
          id: `exp_${Date.now()}`,
          state,
          action,
          reward,
          nextState,
          timestamp: Date.now(),
          metadata: metadata || {}
        };

        this.metaLearningLayer.recordExperience(experience);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取学习统计
    this.app.get('/api/learning/stats', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const stats = this.metaLearningLayer.getStatistics();
        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 选择动作
    this.app.post('/api/learning/action', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { state } = req.body;

        if (!state) {
          return res.status(400).json({ error: '缺少必需的参数: state' });
        }

        const action = this.metaLearningLayer.selectAction(state);
        res.json({ action });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== 系统管理 API ====================

    // 获取系统统计
    this.app.get('/api/system/stats', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const stats = {
          agent: this.agentEngine.getSystemStatus(),
          tools: this.toolRegistry.getSystemStats(),
          knowledge: this.vectorKnowledgeBase.getStats(),
          learning: this.metaLearningLayer.getStatistics()
        };

        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404处理
    this.app.use((req, res) => {
      res.status(404).json({ error: '接口不存在' });
    });
  }

  // ==================== 中间件实现 ====================

  private async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // 从请求头获取令牌
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ error: '未提供认证令牌' });
        return;
      }

      // 这里应该验证JWT token
      // 简化实现：直接从token提取userId
      req.userId = token.split('_')[0] || 'anonymous';
      req.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      next();
    } catch (error) {
      res.status(401).json({ error: '认证失败' });
    }
  }

  private logger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
    });

    next();
  }

  // ==================== 事件订阅 ====================

  private setupEventSubscriptions(): void {
    // 订阅学习系统事件
    if (this.learningSystem) {
      this.learningSystem.on('learned', (result: any) => {
        logger.info('[Learning] New learning result:', result);
      });

      this.learningSystem.on('adapted', (strategy: any) => {
        logger.info('[Learning] Strategy adapted:', strategy);
      });

      this.learningSystem.on('insight', (insight: any) => {
        logger.info('[Learning] New insight:', insight);
      });

      this.learningSystem.on('error', (error: LearningError) => {
        logger.error('[Learning] Error:', error);
      });
    }
  }

  // ==================== 服务代理 ====================

  private async proxyToDataService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const url = `${this.serviceUrls.dataService}${req.path}`;
      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      logger.error('[Proxy] Data service error:', error);
      res.status(500).json({ error: '数据服务不可用' });
    }
  }

  private async proxyToAIEngine(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const url = `${this.serviceUrls.aiEngine}${req.path}`;
      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      logger.error('[Proxy] AI engine error:', error);
      res.status(500).json({ error: 'AI引擎服务不可用' });
    }
  }

  private errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    logger.error('[Error]', err);

    res.status(500).json({
      error: '服务器内部错误',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // ==================== 服务器管理 ====================

  public start(): void {
    this.app.listen(this.port, () => {
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// ==================== 启动服务 ====================

if (require.main === module) {
  const gateway = new APIGateway(parseInt(process.env.PORT || '4000'));
  gateway.start();
}

export default APIGateway;
