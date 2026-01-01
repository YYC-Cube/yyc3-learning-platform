import { EventEmitter } from 'events';

export enum MessagePriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3
}

export enum MessageType {
  ENGINE_EVENT = 'engine.event',
  TASK_REQUEST = 'task.request',
  TASK_RESPONSE = 'task.response',
  GOAL_UPDATE = 'goal.update',
  DECISION_REQUEST = 'decision.request',
  DECISION_RESPONSE = 'decision.response',
  MODEL_REQUEST = 'model.request',
  MODEL_RESPONSE = 'model.response',
  LEARNING_UPDATE = 'learning.update',
  RESOURCE_ALLOCATION = 'resource.allocation',
  COLLABORATION = 'collaboration',
  HEALTH_CHECK = 'health.check',
  SYSTEM = 'system'
}

export interface MessageEnvelope {
  id: string;
  type: MessageType;
  payload: any;
  priority: MessagePriority;
  timestamp: number;
  sender: string;
  correlationId?: string;
  replyTo?: string;
  expireAt?: number;
  retryCount: number;
  maxRetries: number;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  tags?: string[];
  category?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  error?: string;
  custom?: Record<string, any>;
}

export interface MessageHandler {
  (message: MessageEnvelope): void | Promise<void>;
}

export interface MessageBusConfig {
  maxQueueSize?: number;
  retryPolicy?: RetryPolicy;
  enablePersistence?: boolean;
  deadLetterQueueSize?: number;
  enableMetrics?: boolean;
  enableTracing?: boolean;
  maxProcessingTime?: number;
  maxConcurrentMessages?: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffFactor: number;
  initialDelayMs: number;
  maxDelayMs: number;
  retryableErrors?: string[];
}

export interface MessageBusMetrics {
  totalMessages: number;
  messagesInQueue: number;
  messagesProcessed: number;
  messagesFailed: number;
  messagesRetried: number;
  messagesExpired: number;
  averageProcessingTime: number;
  throughput: number;
  errorRate: number;
  retryRate: number;
  messagesByType: Record<string, number>;
  messagesByPriority: Record<MessagePriority, number>;
  deadLetterQueueSize: number;
}

export interface MessageTrace {
  messageId: string;
  traceId: string;
  events: TraceEvent[];
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
}

export interface TraceEvent {
  timestamp: number;
  event: string;
  handler?: string;
  metadata?: Record<string, any>;
}

export interface MessageFilter {
  type?: MessageType | MessageType[];
  priority?: MessagePriority | MessagePriority[];
  tags?: string[];
  sender?: string;
  correlationId?: string;
  customFilter?: (message: MessageEnvelope) => boolean;
}

export interface Subscription {
  id: string;
  type: MessageType;
  handler: MessageHandler;
  filter?: MessageFilter;
  active: boolean;
  createdAt: number;
}

export interface MessageRouter {
  route(message: MessageEnvelope): string[];
  addRoute(pattern: string, destination: string): void;
  removeRoute(pattern: string): void;
  getRoutes(): Record<string, string[]>;
}

export interface MessagePersistence {
  save(message: MessageEnvelope): Promise<void>;
  load(): Promise<MessageEnvelope[]>;
  clear(): Promise<void>;
}

export class EnhancedMessageBus extends EventEmitter {
  private messageQueue: MessageEnvelope[] = [];
  private handlers: Map<string, Subscription[]> = new Map();
  private deadLetterQueue: MessageEnvelope[] = [];
  private processing: Set<string> = new Set();
  private config: Required<MessageBusConfig>;
  private metrics: MessageBusMetrics;
  private startTime: number;
  private traces: Map<string, MessageTrace> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private router: MessageRouter;
  private persistence?: MessagePersistence;
  private processingTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  constructor(config: MessageBusConfig = {}) {
    super();
    this.config = {
      maxQueueSize: config.maxQueueSize || 1000,
      retryPolicy: config.retryPolicy || {
        maxRetries: 3,
        backoffFactor: 2,
        initialDelayMs: 100,
        maxDelayMs: 5000,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
      },
      enablePersistence: config.enablePersistence || false,
      deadLetterQueueSize: config.deadLetterQueueSize || 100,
      enableMetrics: config.enableMetrics || true,
      enableTracing: config.enableTracing || true,
      maxProcessingTime: config.maxProcessingTime || 30000,
      maxConcurrentMessages: config.maxConcurrentMessages || 10
    };

    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();
    this.router = new DefaultMessageRouter();

    if (this.config.enablePersistence) {
      this.persistence = new InMemoryPersistence();
    }

    this.startProcessing();
    this.startMetricsCollection();
  }

  private initializeMetrics(): MessageBusMetrics {
    return {
      totalMessages: 0,
      messagesInQueue: 0,
      messagesProcessed: 0,
      messagesFailed: 0,
      messagesRetried: 0,
      messagesExpired: 0,
      averageProcessingTime: 0,
      throughput: 0,
      errorRate: 0,
      retryRate: 0,
      messagesByType: {},
      messagesByPriority: {
        [MessagePriority.CRITICAL]: 0,
        [MessagePriority.HIGH]: 0,
        [MessagePriority.NORMAL]: 0,
        [MessagePriority.LOW]: 0
      },
      deadLetterQueueSize: 0
    };
  }

  async publish(
    type: MessageType,
    payload: any,
    options: {
      priority?: MessagePriority;
      correlationId?: string;
      replyTo?: string;
      ttl?: number;
      metadata?: MessageMetadata;
      sender?: string;
    } = {}
  ): Promise<string> {
    const message: MessageEnvelope = {
      id: this.generateMessageId(),
      type,
      payload,
      priority: options.priority || MessagePriority.NORMAL,
      timestamp: Date.now(),
      sender: options.sender || 'system',
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      expireAt: options.ttl ? Date.now() + options.ttl : undefined,
      retryCount: 0,
      maxRetries: this.config.retryPolicy.maxRetries,
      metadata: options.metadata || {}
    };

    if (this.config.enableTracing) {
      const traceId = message.metadata.traceId || this.generateTraceId();
      message.metadata.traceId = traceId;
      this.startTrace(message);
    }

    if (this.messageQueue.length >= this.config.maxQueueSize) {
      throw new Error('Message queue is full');
    }

    this.insertByPriority(message);

    this.metrics.totalMessages++;
    this.metrics.messagesInQueue = this.messageQueue.length;
    this.metrics.messagesByType[type] = (this.metrics.messagesByType[type] || 0) + 1;
    this.metrics.messagesByPriority[message.priority]++;

    if (this.persistence) {
      await this.persistence.save(message);
    }

    this.emit('message:published', message);

    return message.id;
  }

  subscribe(
    type: MessageType,
    handler: MessageHandler,
    options?: {
      filter?: MessageFilter;
      id?: string;
    }
  ): string {
    const subscriptionId = options?.id || this.generateSubscriptionId();
    const subscription: Subscription = {
      id: subscriptionId,
      type,
      handler,
      filter: options?.filter,
      active: true,
      createdAt: Date.now()
    };

    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(subscription);
    this.subscriptions.set(subscriptionId, subscription);

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.active = false;
    const handlers = this.handlers.get(subscription.type);
    if (handlers) {
      const index = handlers.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }

    this.subscriptions.delete(subscriptionId);
    return true;
  }

  async request<T = any>(
    type: MessageType,
    payload: any,
    timeoutMs: number = 5000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const correlationId = this.generateMessageId();
      const replyType = `${type}:reply` as MessageType;

      const timeout = setTimeout(() => {
        this.unsubscribe(responseHandlerId);
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const responseHandlerId = this.subscribe(replyType, async (message) => {
        if (message.correlationId === correlationId) {
          clearTimeout(timeout);
          this.unsubscribe(responseHandlerId);
          resolve(message.payload);
        }
      });

      this.publish(type, payload, {
        correlationId,
        replyTo: replyType
      }).catch(reject);
    });
  }

  async reply<T = any>(
    originalMessage: MessageEnvelope,
    payload: T
  ): Promise<void> {
    if (!originalMessage.replyTo) {
      throw new Error('Original message does not have a replyTo field');
    }

    await this.publish(
      originalMessage.replyTo as MessageType,
      payload,
      {
        correlationId: originalMessage.correlationId,
        metadata: originalMessage.metadata
      }
    );
  }

  private insertByPriority(message: MessageEnvelope): void {
    let index = 0;
    while (index < this.messageQueue.length && 
           this.messageQueue[index].priority <= message.priority) {
      index++;
    }
    this.messageQueue.splice(index, 0, message);
  }

  private startProcessing(): void {
    const processNext = async () => {
      if (this.processing.size >= this.config.maxConcurrentMessages) {
        this.processingTimer = setTimeout(processNext, 100);
        return;
      }

      const message = this.getNextMessage();
      if (!message) {
        this.processingTimer = setTimeout(processNext, 100);
        return;
      }

      if (this.isExpired(message)) {
        this.handleExpiredMessage(message);
        this.processingTimer = setTimeout(processNext, 0);
        return;
      }

      await this.processMessage(message);
      this.processingTimer = setTimeout(processNext, 0);
    };

    this.processingTimer = setTimeout(processNext, 0);
  }

  private getNextMessage(): MessageEnvelope | null {
    if (this.messageQueue.length === 0) return null;
    const message = this.messageQueue.shift()!;
    this.metrics.messagesInQueue = this.messageQueue.length;
    return message;
  }

  private isExpired(message: MessageEnvelope): boolean {
    return message.expireAt !== undefined && Date.now() > message.expireAt;
  }

  private async processMessage(message: MessageEnvelope): Promise<void> {
    const processingId = `${message.id}-${message.retryCount}`;
    this.processing.add(processingId);

    if (this.config.enableTracing) {
      this.updateTrace(message.id, 'processing');
    }

    const startTime = Date.now();
    let processingTime = 0;

    try {
      const handlers = this.getHandlersForMessage(message);
      if (handlers.length === 0) {
        console.warn(`[EnhancedMessageBus] No handlers for message type ${message.type}`);
        return;
      }

      for (const subscription of handlers) {
        if (!subscription.active) continue;

        try {
          await this.executeWithTimeout(
            Promise.resolve(subscription.handler(message)),
            this.config.maxProcessingTime
          );
        } catch (error) {
          console.error(`[EnhancedMessageBus] Handler error:`, error);
          throw error;
        }
      }

      processingTime = Date.now() - startTime;
      this.metrics.messagesProcessed++;
      this.updateProcessingTime(processingTime);
      this.emit('message:processed', message);

      if (this.config.enableTracing) {
        this.updateTrace(message.id, 'completed');
      }

    } catch (error) {
      processingTime = Date.now() - startTime;
      await this.handleProcessingError(message, error as Error);
    } finally {
      this.processing.delete(processingId);
    }
  }

  private getHandlersForMessage(message: MessageEnvelope): Subscription[] {
    const handlers = this.handlers.get(message.type) || [];
    return handlers.filter(sub => {
      if (!sub.active) return false;
      if (!sub.filter) return true;
      return this.matchesFilter(message, sub.filter);
    });
  }

  private matchesFilter(message: MessageEnvelope, filter: MessageFilter): boolean {
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      if (!types.includes(message.type)) return false;
    }

    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      if (!priorities.includes(message.priority)) return false;
    }

    if (filter.tags && filter.tags.length > 0) {
      const messageTags = message.metadata.tags || [];
      const hasAllTags = filter.tags.every(tag => messageTags.includes(tag));
      if (!hasAllTags) return false;
    }

    if (filter.sender && message.sender !== filter.sender) return false;

    if (filter.correlationId && message.correlationId !== filter.correlationId) {
      return false;
    }

    if (filter.customFilter && !filter.customFilter(message)) {
      return false;
    }

    return true;
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Handler timeout')), timeoutMs)
      )
    ]);
  }

  private async handleProcessingError(
    message: MessageEnvelope,
    error: Error
  ): Promise<void> {
    this.metrics.messagesFailed++;

    const isRetryable = this.isRetryableError(error);
    if (isRetryable && message.retryCount < message.maxRetries) {
      await this.retryMessage(message);
    } else {
      await this.moveToDeadLetterQueue(message, error);
    }
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = this.config.retryPolicy.retryableErrors || [];
    return retryableErrors.some(err => error.message.includes(err));
  }

  private async retryMessage(message: MessageEnvelope): Promise<void> {
    message.retryCount++;
    const delay = Math.min(
      this.config.retryPolicy.initialDelayMs * 
      Math.pow(this.config.retryPolicy.backoffFactor, message.retryCount),
      this.config.retryPolicy.maxDelayMs
    );

    this.metrics.messagesRetried++;

    setTimeout(() => {
      this.insertByPriority(message);
      this.metrics.messagesInQueue = this.messageQueue.length;
    }, delay);
  }

  private async moveToDeadLetterQueue(
    message: MessageEnvelope,
    error: Error
  ): Promise<void> {
    if (this.deadLetterQueue.length >= this.config.deadLetterQueueSize) {
      this.deadLetterQueue.shift();
    }

    message.metadata.error = error.message;
    this.deadLetterQueue.push(message);
    this.metrics.deadLetterQueueSize = this.deadLetterQueue.length;

    console.error(`[EnhancedMessageBus] Message ${message.id} moved to dead letter queue:`, error);
    this.emit('message:dead_letter', message);
  }

  private handleExpiredMessage(message: MessageEnvelope): void {
    this.metrics.messagesExpired++;
    logger.warn(`[EnhancedMessageBus] Message ${message.id} expired`);

    if (this.config.enableTracing) {
      this.updateTrace(message.id, 'expired');
    }

    this.emit('message:expired', message);
  }

  private updateProcessingTime(processingTime: number): void {
    const total = this.metrics.averageProcessingTime * (this.metrics.messagesProcessed - 1);
    this.metrics.averageProcessingTime = (total + processingTime) / this.metrics.messagesProcessed;
  }

  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) return;

    this.metricsTimer = setInterval(() => {
      this.updateMetrics();
    }, 60000);
  }

  private updateMetrics(): void {
    const uptime = Date.now() - this.startTime;
    this.metrics.throughput = this.metrics.messagesProcessed / (uptime / 1000);
    this.metrics.errorRate = this.metrics.messagesFailed / this.metrics.totalMessages;
    this.metrics.retryRate = this.metrics.messagesRetried / this.metrics.totalMessages;
  }

  private startTrace(message: MessageEnvelope): void {
    const trace: MessageTrace = {
      messageId: message.id,
      traceId: message.metadata.traceId!,
      events: [
        {
          timestamp: Date.now(),
          event: 'created',
          metadata: { type: message.type, priority: message.priority }
        }
      ],
      startTime: Date.now(),
      status: 'pending'
    };
    this.traces.set(message.id, trace);
  }

  private updateTrace(messageId: string, event: string, handler?: string): void {
    const trace = this.traces.get(messageId);
    if (!trace) return;

    trace.events.push({
      timestamp: Date.now(),
      event,
      handler,
      metadata: {}
    });

    if (event === 'completed' || event === 'failed' || event === 'expired') {
      trace.endTime = Date.now();
      trace.duration = trace.endTime - trace.startTime;
      trace.status = event as any;
    }
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(): MessageBusMetrics {
    return { ...this.metrics };
  }

  getTrace(messageId: string): MessageTrace | undefined {
    return this.traces.get(messageId);
  }

  getTracesByTraceId(traceId: string): MessageTrace[] {
    return Array.from(this.traces.values()).filter(t => t.traceId === traceId);
  }

  getDeadLetterQueue(): MessageEnvelope[] {
    return [...this.deadLetterQueue];
  }

  async retryFromDeadLetterQueue(messageId: string): Promise<boolean> {
    const index = this.deadLetterQueue.findIndex(m => m.id === messageId);
    if (index === -1) return false;

    const message = this.deadLetterQueue.splice(index, 1)[0];
    message.retryCount = 0;
    delete message.metadata.error;

    this.insertByPriority(message);
    this.metrics.deadLetterQueueSize = this.deadLetterQueue.length;
    return true;
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
    this.metrics.deadLetterQueueSize = 0;
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  async shutdown(): Promise<void> {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    await this.waitForProcessing();

    if (this.persistence) {
      await this.persistence.clear();
    }

    this.removeAllListeners();
  }

  private async waitForProcessing(): Promise<void> {
    const maxWait = 5000;
    const start = Date.now();

    while (this.processing.size > 0 && Date.now() - start < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

class DefaultMessageRouter implements MessageRouter {
  private routes: Map<string, string[]> = new Map();

  route(message: MessageEnvelope): string[] {
    const destinations: string[] = [];
    for (const [pattern, dests] of this.routes.entries()) {
      if (this.matchesPattern(message.type, pattern)) {
        destinations.push(...dests);
      }
    }
    return destinations;
  }

  addRoute(pattern: string, destination: string): void {
    if (!this.routes.has(pattern)) {
      this.routes.set(pattern, []);
    }
    this.routes.get(pattern)!.push(destination);
  }

  removeRoute(pattern: string): void {
    this.routes.delete(pattern);
  }

  getRoutes(): Record<string, string[]> {
    return Object.fromEntries(this.routes);
  }

  private matchesPattern(type: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return type.startsWith(prefix);
    }
    return type === pattern;
  }
}

class InMemoryPersistence implements MessagePersistence {
  private messages: MessageEnvelope[] = [];

  async save(message: MessageEnvelope): Promise<void> {
    this.messages.push(message);
  }

  async load(): Promise<MessageEnvelope[]> {
    return [...this.messages];
  }

  async clear(): Promise<void> {
    this.messages = [];
  }
}

export { EnhancedMessageBus as MessageBus };
