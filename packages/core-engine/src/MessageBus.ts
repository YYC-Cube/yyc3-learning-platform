import { EventEmitter } from 'events';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('MessageBus');

// ==================== 类型定义 ====================

export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface MessageEnvelope {
  id: string;
  type: string;
  payload: any;
  priority: MessagePriority;
  timestamp: number;
  sender: string;
  correlationId?: string;
  replyTo?: string;
  expireAt?: number;
  retryCount: number;
  maxRetries: number;
  metadata: Record<string, any>;
}

export interface MessageHandler {
  (message: MessageEnvelope): Promise<void>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffFactor: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

export interface MessageBusConfig {
  maxQueueSize: number;
  retryPolicy: RetryPolicy;
  enablePersistence: boolean;
  deadLetterQueueSize: number;
}

export interface MessageBusMetrics {
  totalMessages: number;
  messagesInQueue: number;
  messagesProcessed: number;
  messagesFailed: number;
  averageProcessingTime: number;
  throughput: number;
}

// ==================== 消息总线实现 ====================

export class MessageBus extends EventEmitter {
  private messageQueue: MessageEnvelope[] = [];
  private handlers: Map<string, MessageHandler[]> = new Map();
  private deadLetterQueue: MessageEnvelope[] = [];
  private processing: Set<string> = new Set();
  private config: MessageBusConfig;
  private metrics: MessageBusMetrics;
  private startTime: number;

  constructor(config: Partial<MessageBusConfig> = {}) {
    super();
    this.config = {
      maxQueueSize: 1000,
      retryPolicy: {
        maxRetries: 3,
        backoffFactor: 2,
        initialDelayMs: 100,
        maxDelayMs: 5000
      },
      enablePersistence: false,
      deadLetterQueueSize: 100,
      ...config
    };

    this.metrics = {
      totalMessages: 0,
      messagesInQueue: 0,
      messagesProcessed: 0,
      messagesFailed: 0,
      averageProcessingTime: 0,
      throughput: 0
    };

    this.startTime = Date.now();
    this.startProcessing();
  }

  /**
   * 发布消息到总线
   */
  async publish(
    type: string,
    payload: any,
    options: {
      priority?: MessagePriority;
      correlationId?: string;
      replyTo?: string;
      ttl?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const message: MessageEnvelope = {
      id: this.generateMessageId(),
      type,
      payload,
      priority: options.priority || MessagePriority.NORMAL,
      timestamp: Date.now(),
      sender: 'system',
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      expireAt: options.ttl ? Date.now() + options.ttl : undefined,
      retryCount: 0,
      maxRetries: this.config.retryPolicy.maxRetries,
      metadata: options.metadata || {}
    };

    // 检查队列容量
    if (this.messageQueue.length >= this.config.maxQueueSize) {
      throw new Error('Message queue is full');
    }

    // 按优先级插入队列
    this.insertByPriority(message);
    
    this.metrics.totalMessages++;
    this.metrics.messagesInQueue = this.messageQueue.length;

    // 触发消息发布事件
    this.emit('message:published', message);

    return message.id;
  }

  /**
   * 订阅消息类型
   */
  subscribe(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /**
   * 取消订阅
   */
  unsubscribe(type: string, handler?: MessageHandler): void {
    if (!handler) {
      this.handlers.delete(type);
    } else {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  /**
   * 请求-响应模式
   */
  async request<T = any>(
    type: string,
    payload: any,
    timeoutMs: number = 5000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const correlationId = this.generateMessageId();
      const replyType = `${type}:reply`;
      
      // 设置超时
      const timeout = setTimeout(() => {
        this.unsubscribe(replyType, responseHandler);
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      // 响应处理器
      const responseHandler: MessageHandler = async (message) => {
        if (message.correlationId === correlationId) {
          clearTimeout(timeout);
          this.unsubscribe(replyType, responseHandler);
          resolve(message.payload);
        }
      };

      // 订阅响应
      this.subscribe(replyType, responseHandler);

      // 发送请求
      this.publish(type, payload, {
        correlationId,
        replyTo: replyType
      }).catch(reject);
    });
  }

  /**
   * 开始处理消息
   */
  private startProcessing(): void {
    setInterval(() => {
      this.processNextMessage();
    }, 10); // 每10ms处理一次
  }

  /**
   * 处理下一条消息
   */
  private async processNextMessage(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    // 移除过期消息
    this.removeExpiredMessages();

    const message = this.messageQueue.shift();
    if (!message) return;

    this.metrics.messagesInQueue = this.messageQueue.length;

    // 检查是否正在处理
    if (this.processing.has(message.id)) return;

    this.processing.add(message.id);

    const startTime = Date.now();

    try {
      await this.deliverMessage(message);
      
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, true);
      
      this.emit('message:processed', message);
    } catch (error: any) {
      logger.error(`[MessageBus] Failed to process message ${message.id}:`, error);
      
      await this.handleFailedMessage(message, error);
      
      this.updateMetrics(Date.now() - startTime, false);
      this.emit('message:failed', { message, error });
    } finally {
      this.processing.delete(message.id);
    }
  }

  /**
   * 投递消息到处理器
   */
  private async deliverMessage(message: MessageEnvelope): Promise<void> {
    const handlers = this.handlers.get(message.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];
    
    const allHandlers = [...handlers, ...wildcardHandlers];

    if (allHandlers.length === 0) {
      logger.warn(`[MessageBus] No handlers for message type: ${message.type}`);
      return;
    }

    // 并行执行所有处理器
    await Promise.all(
      allHandlers.map(handler => 
        this.executeHandler(handler, message)
      )
    );
  }

  /**
   * 执行处理器
   */
  private async executeHandler(
    handler: MessageHandler,
    message: MessageEnvelope
  ): Promise<void> {
    try {
      await handler(message);
    } catch (error: any) {
      logger.error('[MessageBus] Handler error:', error);
      throw error;
    }
  }

  /**
   * 处理失败的消息
   */
  private async handleFailedMessage(
    message: MessageEnvelope,
    error: Error
  ): Promise<void> {
    message.retryCount++;

    if (message.retryCount < message.maxRetries) {
      // 计算退避延迟
      const delay = Math.min(
        this.config.retryPolicy.initialDelayMs * 
        Math.pow(this.config.retryPolicy.backoffFactor, message.retryCount - 1),
        this.config.retryPolicy.maxDelayMs
      );

      // 延迟后重新入队
      setTimeout(() => {
        this.insertByPriority(message);
        this.emit('message:retrying', { message, attempt: message.retryCount });
      }, delay);
    } else {
      // 移到死信队列
      this.moveToDeadLetterQueue(message, error);
    }
  }

  /**
   * 移动到死信队列
   */
  private moveToDeadLetterQueue(
    message: MessageEnvelope,
    error: Error
  ): void {
    this.deadLetterQueue.push({
      ...message,
      metadata: {
        ...message.metadata,
        error: error.message,
        failedAt: Date.now()
      }
    });

    // 限制死信队列大小
    if (this.deadLetterQueue.length > this.config.deadLetterQueueSize) {
      this.deadLetterQueue.shift();
    }

    this.emit('message:dead', message);
  }

  /**
   * 按优先级插入消息
   */
  private insertByPriority(message: MessageEnvelope): void {
    let inserted = false;
    
    for (let i = 0; i < this.messageQueue.length; i++) {
      if (message.priority > this.messageQueue[i].priority) {
        this.messageQueue.splice(i, 0, message);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.messageQueue.push(message);
    }
  }

  /**
   * 移除过期消息
   */
  private removeExpiredMessages(): void {
    const now = Date.now();
    this.messageQueue = this.messageQueue.filter(msg => {
      if (msg.expireAt && msg.expireAt < now) {
        this.emit('message:expired', msg);
        return false;
      }
      return true;
    });
  }

  /**
   * 更新指标
   */
  private updateMetrics(processingTime: number, success: boolean): void {
    if (success) {
      this.metrics.messagesProcessed++;
    } else {
      this.metrics.messagesFailed++;
    }

    // 更新平均处理时间
    const total = this.metrics.messagesProcessed + this.metrics.messagesFailed;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (total - 1) + processingTime) / total;

    // 计算吞吐量（消息/秒）
    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.metrics.messagesProcessed / uptime;
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 获取指标
   */
  getMetrics(): MessageBusMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取死信队列
   */
  getDeadLetterQueue(): MessageEnvelope[] {
    return [...this.deadLetterQueue];
  }

  /**
   * 清空死信队列
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): {
    size: number;
    processing: number;
    capacity: number;
    utilizationRate: number;
  } {
    return {
      size: this.messageQueue.length,
      processing: this.processing.size,
      capacity: this.config.maxQueueSize,
      utilizationRate: this.messageQueue.length / this.config.maxQueueSize
    };
  }

  /**
   * 暂停消息处理
   */
  pause(): void {
    this.emit('bus:paused');
  }

  /**
   * 恢复消息处理
   */
  resume(): void {
    this.emit('bus:resumed');
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.messageQueue = [];
    this.processing.clear();
    this.metrics.messagesInQueue = 0;
    this.emit('bus:cleared');
  }
}

// ==================== 单例导出 ====================

export const messageBus = new MessageBus();
