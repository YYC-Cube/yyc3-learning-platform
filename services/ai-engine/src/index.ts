/**
 * @file AI引擎服务
 * @description YYC³ AI引擎服务，负责AI推理、生成和智能处理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { EventDispatcher, eventDispatcher } from '@/packages/core-engine/src/EventDispatcher';
import { AgenticCore } from '@/packages/autonomous-engine/src/core/AgenticCore';
import { VectorKnowledgeBase } from '@/packages/knowledge-base/src/VectorKnowledgeBase';

// ==================== 类型定义 ====================

interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
}

interface AIEngineConfig {
  port: number;
  maxConcurrentTasks: number;
  enableLearning: boolean;
  enableEventPublishing: boolean;
}

// ==================== AI引擎服务 ====================

export class AIEngineService {
  private app: express.Application;
  private config: AIEngineConfig;
  private agentCore: AgenticCore;
  private knowledgeBase: VectorKnowledgeBase;
  private eventDispatcher: EventDispatcher;

  constructor(config: Partial<AIEngineConfig> = {}) {
    this.config = {
      port: parseInt(process.env.PORT || '3201'),
      maxConcurrentTasks: 10,
      enableLearning: true,
      enableEventPublishing: true,
      ...config
    };

    this.app = express();
    this.agentCore = new AgenticCore({
      maxConcurrentTasks: this.config.maxConcurrentTasks,
      enableLearning: this.config.enableLearning
    });
    this.knowledgeBase = new VectorKnowledgeBase();
    this.eventDispatcher = eventDispatcher;

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
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3200'],
      credentials: true
    }));

    // JSON解析
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'AI服务请求过于频繁，请稍后再试'
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
        uptime: process.uptime(),
        service: 'yyc3-ai-engine',
        version: '1.0.0'
      });
    });

    // ==================== AI处理 API ====================

    // 处理用户输入
    this.app.post('/api/ai/process', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { text, context, model = 'default' } = req.body;

        if (!text) {
          return res.status(400).json({ error: '缺少必需的参数: text' });
        }

        // 发布事件：AI请求开始
        if (this.config.enableEventPublishing) {
          await this.eventDispatcher.publish('ai:request:start', {
            requestId: `req_${Date.now()}`,
            userId: req.userId,
            text,
            context,
            model,
            timestamp: Date.now()
          }, {
            source: 'yyc3-ai-engine',
            metadata: {
              correlationId: req.headers['x-correlation-id'] as string
            }
          });
        }

        const response = await this.agentCore.processInput({
          text,
          context: {
            ...context,
            userId: req.userId!,
            sessionId: req.sessionId!,
            environment: 'web',
            model
          }
        });

        // 发布事件：AI请求完成
        if (this.config.enableEventPublishing) {
          await this.eventDispatcher.publish('ai:request:complete', {
            requestId: `req_${Date.now()}`,
            userId: req.userId,
            text,
            response,
            model,
            timestamp: Date.now()
          }, {
            source: 'yyc3-ai-engine',
            metadata: {
              correlationId: req.headers['x-correlation-id'] as string
            }
          });
        }

        res.json(response);
      } catch (error: any) {
        // 发布事件：AI请求失败
        if (this.config.enableEventPublishing) {
          await this.eventDispatcher.publish('ai:request:error', {
            requestId: `req_${Date.now()}`,
            userId: (req as AuthenticatedRequest).userId,
            error: error.message,
            timestamp: Date.now()
          }, {
            source: 'yyc3-ai-engine',
            metadata: {
              correlationId: req.headers['x-correlation-id'] as string
            }
          });
        }
        res.status(500).json({ error: error.message });
      }
    });

    // 生成内容
    this.app.post('/api/ai/generate', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { prompt, model = 'default', parameters = {} } = req.body;

        if (!prompt) {
          return res.status(400).json({ error: '缺少必需的参数: prompt' });
        }

        const response = await this.agentCore.generate({
          prompt,
          model,
          parameters,
          context: {
            userId: req.userId!,
            sessionId: req.sessionId!,
            environment: 'web'
          }
        });

        res.json(response);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 嵌入生成
    this.app.post('/api/ai/embed', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { text, model = 'default' } = req.body;

        if (!text) {
          return res.status(400).json({ error: '缺少必需的参数: text' });
        }

        const embedding = await this.agentCore.createEmbedding({
          text,
          model,
          context: {
            userId: req.userId!,
            sessionId: req.sessionId!,
            environment: 'web'
          }
        });

        res.json(embedding);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 获取AI引擎状态
    this.app.get('/api/ai/status', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const status = this.agentCore.getSystemStatus();
        res.json(status);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404处理
    this.app.use((req, res) => {
      res.status(404).json({ error: '接口不存在' });
    });
  }

  // ==================== 事件订阅配置 ====================

  private setupEventSubscriptions(): void {
    // 订阅知识库更新事件
    this.eventDispatcher.subscribe('knowledge:updated', async (event) => {
      try {
        // 刷新本地知识库缓存
        await this.knowledgeBase.refresh();
      } catch (error) {
      }
    });

    // 订阅用户偏好更新事件
    this.eventDispatcher.subscribe('user:preferences:updated', async (event) => {
      try {
        const { userId, preferences } = event.payload;
        // 更新用户偏好设置
        await this.agentCore.updateUserPreferences(userId, preferences);
      } catch (error) {
      }
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
    });

    next();
  }

  private errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    res.status(500).json({
      error: 'AI服务内部错误',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // ==================== 服务器管理 ====================

  public start(): void {
    this.app.listen(this.config.port, () => {
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// ==================== 启动服务 ====================

if (require.main === module) {
  const aiEngine = new AIEngineService();
  aiEngine.start();
}

export default AIEngineService;