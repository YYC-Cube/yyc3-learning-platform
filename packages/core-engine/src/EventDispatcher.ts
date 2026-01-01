/**
 * 事件分发器 - 高级发布订阅系统
 */

import { EventEmitter } from 'events';

// ==================== 类型定义 ====================

export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface Event<T = any> {
  id: string;
  type: string;
  priority: EventPriority;
  timestamp: number;
  payload: T;
  metadata: EventMetadata;
  source: string;
}

export interface EventMetadata {
  version: string;
  correlationId?: string;
  causationId?: string;
  tags: string[];
  ttl?: number;
}

export interface EventHandler<T = any> {
  (event: Event<T>): Promise<void> | void;
}

export interface EventFilter {
  types?: string[];
  priorities?: EventPriority[];
  tags?: string[];
  sources?: string[];
  custom?: (event: Event) => boolean;
}

export interface EventTransformer<TInput = any, TOutput = any> {
  (event: Event<TInput>): Event<TOutput> | Promise<Event<TOutput>>;
}

export interface EventSubscription {
  id: string;
  type: string;
  handler: EventHandler;
  filter?: EventFilter;
  transformer?: EventTransformer;
  priority: EventPriority;
}

export interface EventDispatcherConfig {
  enableReplay: boolean;
  maxReplayEvents: number;
  enableEventStore: boolean;
  enableMetrics: boolean;
  enableMiddleware: boolean;
}

export interface EventMiddleware {
  (event: Event, next: () => Promise<void>): Promise<void>;
}

export interface EventMetrics {
  totalEvents: number;
  eventsByType: Map<string, number>;
  eventsByPriority: Map<EventPriority, number>;
  averageProcessingTime: number;
  failedEvents: number;
}

// ==================== 事件分发器实现 ====================

export class EventDispatcher extends EventEmitter {
  private config: EventDispatcherConfig;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventStore: Event[] = [];
  private metrics: EventMetrics;
  private middlewares: EventMiddleware[] = [];

  constructor(config: Partial<EventDispatcherConfig> = {}) {
    super();

    this.config = {
      enableReplay: true,
      maxReplayEvents: 1000,
      enableEventStore: true,
      enableMetrics: true,
      enableMiddleware: true,
      ...config
    };

    this.metrics = {
      totalEvents: 0,
      eventsByType: new Map(),
      eventsByPriority: new Map(),
      averageProcessingTime: 0,
      failedEvents: 0
    };
  }

  /**
   * 发布事件
   */
  async publish<T = any>(
    type: string,
    payload: T,
    options: {
      priority?: EventPriority;
      source?: string;
      metadata?: Partial<EventMetadata>;
    } = {}
  ): Promise<string> {
    const event: Event<T> = {
      id: this.generateEventId(),
      type,
      priority: options.priority || EventPriority.NORMAL,
      timestamp: Date.now(),
      payload,
      metadata: {
        version: '1.0.0',
        tags: [],
        ...options.metadata
      },
      source: options.source || 'system'
    };

    // 存储事件
    if (this.config.enableEventStore) {
      this.storeEvent(event);
    }

    // 更新指标
    if (this.config.enableMetrics) {
      this.updateMetrics(event);
    }

    // 执行中间件
    if (this.config.enableMiddleware) {
      await this.executeMiddlewares(event);
    }

    // 分发事件
    await this.dispatch(event);

    return event.id;
  }

  /**
   * 批量发布事件
   */
  async publishBatch(
    events: Array<{
      type: string;
      payload: any;
      options?: {
        priority?: EventPriority;
        source?: string;
        metadata?: Partial<EventMetadata>;
      };
    }>
  ): Promise<string[]> {
    return Promise.all(
      events.map(({ type, payload, options }) =>
        this.publish(type, payload, options)
      )
    );
  }

  /**
   * 订阅事件
   */
  subscribe<T = any>(
    type: string,
    handler: EventHandler<T>,
    options: {
      priority?: EventPriority;
      filter?: EventFilter;
      transformer?: EventTransformer;
    } = {}
  ): string {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      type,
      handler,
      filter: options.filter,
      transformer: options.transformer,
      priority: options.priority || EventPriority.NORMAL
    };

    // 支持通配符订阅
    const subscriptionKey = type;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, []);
    }

    const subs = this.subscriptions.get(subscriptionKey)!;
    subs.push(subscription);

    // 按优先级排序
    subs.sort((a, b) => b.priority - a.priority);

    this.emit('subscription:added', subscription);

    return subscription.id;
  }

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [type, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      
      if (index > -1) {
        const subscription = subs.splice(index, 1)[0];
        
        if (subs.length === 0) {
          this.subscriptions.delete(type);
        }

        this.emit('subscription:removed', subscription);
        return true;
      }
    }

    return false;
  }

  /**
   * 分发事件
   */
  private async dispatch(event: Event): Promise<void> {
    const startTime = Date.now();
    const matchedSubscriptions = this.findMatchingSubscriptions(event);

    await Promise.all(
      matchedSubscriptions.map(async subscription => {
        try {
          // 应用过滤器
          if (subscription.filter && !this.applyFilter(event, subscription.filter)) {
            return;
          }

          // 应用转换器
          let transformedEvent = event;
          if (subscription.transformer) {
            transformedEvent = await subscription.transformer(event);
          }

          // 执行处理器
          await subscription.handler(transformedEvent);

          this.emit('event:handled', {
            event: transformedEvent,
            subscription
          });

        } catch (error: any) {
          this.metrics.failedEvents++;
          
          this.emit('event:error', {
            event,
            subscription,
            error
          });
        }
      })
    );

    // 更新处理时间
    const processingTime = Date.now() - startTime;
    this.updateProcessingTime(processingTime);
  }

  /**
   * 查找匹配的订阅
   */
  private findMatchingSubscriptions(event: Event): EventSubscription[] {
    const matched: EventSubscription[] = [];

    // 精确匹配
    const exactSubs = this.subscriptions.get(event.type);
    if (exactSubs) {
      matched.push(...exactSubs);
    }

    // 通配符匹配
    for (const [pattern, subs] of this.subscriptions.entries()) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(event.type)) {
          matched.push(...subs);
        }
      }
    }

    return matched;
  }

  /**
   * 应用过滤器
   */
  private applyFilter(event: Event, filter: EventFilter): boolean {
    if (filter.types && !filter.types.includes(event.type)) {
      return false;
    }

    if (filter.priorities && !filter.priorities.includes(event.priority)) {
      return false;
    }

    if (filter.sources && !filter.sources.includes(event.source)) {
      return false;
    }

    if (filter.tags && filter.tags.length > 0) {
      const hasTag = filter.tags.some(tag => 
        event.metadata.tags.includes(tag)
      );
      if (!hasTag) return false;
    }

    if (filter.custom && !filter.custom(event)) {
      return false;
    }

    return true;
  }

  /**
   * 执行中间件
   */
  private async executeMiddlewares(event: Event): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        return;
      }

      const middleware = this.middlewares[index++];
      await middleware(event, next);
    };

    await next();
  }

  /**
   * 添加中间件
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * 重放事件
   */
  async replay(
    filter?: EventFilter,
    options: {
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): Promise<void> {
    if (!this.config.enableReplay) {
      throw new Error('Event replay is disabled');
    }

    let events = [...this.eventStore];

    // 应用过滤器
    if (filter) {
      events = events.filter(event => this.applyFilter(event, filter));
    }

    // 时间范围过滤
    if (options.startTime) {
      events = events.filter(e => e.timestamp >= options.startTime!);
    }
    if (options.endTime) {
      events = events.filter(e => e.timestamp <= options.endTime!);
    }

    // 限制数量
    if (options.limit) {
      events = events.slice(-options.limit);
    }

    // 重放事件
    for (const event of events) {
      await this.dispatch(event);
    }

    this.emit('replay:completed', {
      count: events.length,
      filter,
      options
    });
  }

  /**
   * 存储事件
   */
  private storeEvent(event: Event): void {
    this.eventStore.push(event);

    // 限制存储大小
    if (this.eventStore.length > this.config.maxReplayEvents) {
      this.eventStore.shift();
    }
  }

  /**
   * 更新指标
   */
  private updateMetrics(event: Event): void {
    this.metrics.totalEvents++;

    // 按类型统计
    const typeCount = this.metrics.eventsByType.get(event.type) || 0;
    this.metrics.eventsByType.set(event.type, typeCount + 1);

    // 按优先级统计
    const priorityCount = this.metrics.eventsByPriority.get(event.priority) || 0;
    this.metrics.eventsByPriority.set(event.priority, priorityCount + 1);
  }

  /**
   * 更新处理时间
   */
  private updateProcessingTime(processingTime: number): void {
    const total = this.metrics.totalEvents;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (total - 1) + processingTime) / total;
  }

  /**
   * 获取事件历史
   */
  getEventHistory(
    filter?: EventFilter,
    limit: number = 100
  ): Event[] {
    let events = [...this.eventStore];

    if (filter) {
      events = events.filter(event => this.applyFilter(event, filter));
    }

    return events.slice(-limit);
  }

  /**
   * 获取订阅列表
   */
  getSubscriptions(type?: string): EventSubscription[] {
    if (type) {
      return this.subscriptions.get(type) || [];
    }

    const allSubs: EventSubscription[] = [];
    for (const subs of this.subscriptions.values()) {
      allSubs.push(...subs);
    }
    return allSubs;
  }

  /**
   * 获取指标
   */
  getMetrics(): EventMetrics {
    return {
      ...this.metrics,
      eventsByType: new Map(this.metrics.eventsByType),
      eventsByPriority: new Map(this.metrics.eventsByPriority)
    };
  }

  /**
   * 清空事件存储
   */
  clearEventStore(): void {
    this.eventStore = [];
    this.emit('store:cleared');
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 生成订阅ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ==================== 单例导出 ====================

export const eventDispatcher = new EventDispatcher();
