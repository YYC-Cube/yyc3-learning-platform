/**
 * @file 数据服务
 * @description YYC³ 数据服务，负责数据存储、检索和管理
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
import { SecurityManager } from '@/packages/core-engine/src/SecurityManager';
import { createLogger } from '../../lib/logger';

const logger = createLogger('DataService');

// ==================== 类型定义 ====================

interface AuthenticatedRequest extends Request {
  userId?: string;
  sessionId?: string;
}

interface DataServiceConfig {
  port: number;
  enableEventPublishing: boolean;
  maxConnections: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Course {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  answers: Record<string, any>;
  createdAt: Date;
}

// ==================== 数据服务 ====================

export class DataService {
  private app: express.Application;
  private config: DataServiceConfig;
  private securityManager: SecurityManager;
  private eventDispatcher: EventDispatcher;
  private mockData: {
    users: User[];
    courses: Course[];
    examResults: ExamResult[];
  };

  constructor(config: Partial<DataServiceConfig> = {}) {
    this.config = {
      port: parseInt(process.env.PORT || '3202'),
      enableEventPublishing: true,
      maxConnections: 100,
      ...config
    };

    this.app = express();
    this.securityManager = new SecurityManager();
    this.eventDispatcher = eventDispatcher;
    this.mockData = this.initializeMockData();

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
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3200', 'http://localhost:3201'],
      credentials: true
    }));

    // JSON解析
    this.app.use(express.json({ limit: '20mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '20mb' }));

    // 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: '数据服务请求过于频繁，请稍后再试'
    });
    this.app.use('/api/', limiter);

    // 认证中间件
    this.app.use('/api/', this.authenticate.bind(this));

    // 日志中间件
    this.app.use(this.requestLogger.bind(this));

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
        service: 'data-service'
      });
    });

    // ==================== 用户数据API ====================

    // 获取用户信息
    this.app.get('/api/users/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { id } = req.params;
        const user = this.mockData.users.find(u => u.id === id);

        if (!user) {
          return res.status(404).json({ error: '用户不存在' });
        }

        this.publishEvent('user.retrieved', { userId: id, user });
        res.json({ success: true, data: user });
      } catch (error) {
        res.status(500).json({ error: '获取用户信息失败' });
      }
    });

    // 更新用户信息
    this.app.put('/api/users/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        const userIndex = this.mockData.users.findIndex(u => u.id === id);

        if (userIndex === -1) {
          return res.status(404).json({ error: '用户不存在' });
        }

        const updatedUser = {
          ...this.mockData.users[userIndex],
          ...updateData,
          updatedAt: new Date()
        };

        this.mockData.users[userIndex] = updatedUser;
        this.publishEvent('user.updated', { userId: id, updates: updateData });
        res.json({ success: true, data: updatedUser });
      } catch (error) {
        res.status(500).json({ error: '更新用户信息失败' });
      }
    });

    // ==================== 课程数据API ====================

    // 获取课程列表
    this.app.get('/api/courses', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const courses = this.mockData.courses;
        this.publishEvent('courses.retrieved', { count: courses.length });
        res.json({ success: true, data: courses });
      } catch (error) {
        res.status(500).json({ error: '获取课程列表失败' });
      }
    });

    // 获取单个课程
    this.app.get('/api/courses/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { id } = req.params;
        const course = this.mockData.courses.find(c => c.id === id);

        if (!course) {
          return res.status(404).json({ error: '课程不存在' });
        }

        this.publishEvent('course.retrieved', { courseId: id });
        res.json({ success: true, data: course });
      } catch (error) {
        res.status(500).json({ error: '获取课程信息失败' });
      }
    });

    // 创建课程
    this.app.post('/api/courses', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const courseData = req.body;
        const newCourse: Course = {
          id: `course-${Date.now()}`,
          ...courseData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.mockData.courses.push(newCourse);
        this.publishEvent('course.created', { courseId: newCourse.id, course: newCourse });
        res.status(201).json({ success: true, data: newCourse });
      } catch (error) {
        res.status(500).json({ error: '创建课程失败' });
      }
    });

    // ==================== 考试结果API ====================

    // 获取用户考试结果
    this.app.get('/api/users/:userId/exam-results', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { userId } = req.params;
        const results = this.mockData.examResults.filter(r => r.userId === userId);
        this.publishEvent('examResults.retrieved', { userId, count: results.length });
        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ error: '获取考试结果失败' });
      }
    });

    // 保存考试结果
    this.app.post('/api/exam-results', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const resultData = req.body;
        const newResult: ExamResult = {
          id: `result-${Date.now()}`,
          ...resultData,
          createdAt: new Date()
        };

        this.mockData.examResults.push(newResult);
        this.publishEvent('examResult.created', { resultId: newResult.id, result: newResult });
        res.status(201).json({ success: true, data: newResult });
      } catch (error) {
        res.status(500).json({ error: '保存考试结果失败' });
      }
    });
  }

  // ==================== 事件订阅 ====================

  private setupEventSubscriptions(): void {
    // 订阅来自其他服务的事件
    this.eventDispatcher.subscribe('user.created', async (event) => {
      // 处理用户创建事件，如初始化用户数据
    });

    this.eventDispatcher.subscribe('ai.content.generated', async (event) => {
      // 处理AI生成内容的存储
    });
  }

  // ==================== 辅助方法 ====================

  private initializeMockData(): {
    users: User[];
    courses: Course[];
    examResults: ExamResult[];
  } {
    return {
      users: [
        {
          id: 'user-1',
          email: 'test@example.com',
          name: '测试用户',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01')
        },
        {
          id: 'user-2',
          email: 'admin@example.com',
          name: '管理员',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01')
        }
      ],
      courses: [
        {
          id: 'course-1',
          title: 'TypeScript基础',
          description: '学习TypeScript的基本概念和语法',
          author: 'YYC³团队',
          createdAt: new Date('2025-01-05'),
          updatedAt: new Date('2025-01-05')
        },
        {
          id: 'course-2',
          title: 'React高级开发',
          description: '深入学习React的高级特性和最佳实践',
          author: 'YYC³团队',
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date('2025-01-10')
        }
      ],
      examResults: [
        {
          id: 'result-1',
          userId: 'user-1',
          examId: 'exam-1',
          score: 85,
          answers: { 'q1': 'A', 'q2': 'B', 'q3': 'C' },
          createdAt: new Date('2025-01-15')
        }
      ]
    };
  }

  private authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    // 简化的认证逻辑
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 验证token并设置用户信息
      req.userId = 'user-1'; // 模拟认证
      req.sessionId = `session-${Date.now()}`;
      next();
    } else {
      res.status(401).json({ error: '未授权' });
    }
  }

  private requestLogger(req: Request, res: Response, next: NextFunction): void {
    next();
  }

  private errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    logger.error('错误:', err);
    res.status(err.status || 500).json({
      error: err.message || '服务器内部错误'
    });
  }

  private publishEvent(eventName: string, data: any): void {
    if (this.config.enableEventPublishing) {
      this.eventDispatcher.publish(eventName, {
        service: 'data-service',
        timestamp: Date.now(),
        ...data
      });
    }
  }

  // ==================== 服务启动 ====================

  public start(): void {
    this.app.listen(this.config.port, () => {
    });
  }
}

// ==================== 启动服务 ====================

if (require.main === module) {
  const dataService = new DataService();
  dataService.start();
}