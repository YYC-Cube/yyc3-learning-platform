import { EventEmitter } from 'events';
export declare enum MessagePriority {
    CRITICAL = 0,
    HIGH = 1,
    NORMAL = 2,
    LOW = 3
}
export declare enum MessageType {
    ENGINE_EVENT = "engine.event",
    TASK_REQUEST = "task.request",
    TASK_RESPONSE = "task.response",
    GOAL_UPDATE = "goal.update",
    DECISION_REQUEST = "decision.request",
    DECISION_RESPONSE = "decision.response",
    MODEL_REQUEST = "model.request",
    MODEL_RESPONSE = "model.response",
    LEARNING_UPDATE = "learning.update",
    RESOURCE_ALLOCATION = "resource.allocation",
    COLLABORATION = "collaboration",
    HEALTH_CHECK = "health.check",
    SYSTEM = "system"
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
export declare class EnhancedMessageBus extends EventEmitter {
    private messageQueue;
    private handlers;
    private deadLetterQueue;
    private processing;
    private config;
    private metrics;
    private startTime;
    private traces;
    private subscriptions;
    private router;
    private persistence?;
    private processingTimer?;
    private metricsTimer?;
    constructor(config?: MessageBusConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private initializeMetrics;
    publish(type: MessageType, payload: any, options?: {
        priority?: MessagePriority;
        correlationId?: string;
        replyTo?: string;
        ttl?: number;
        metadata?: MessageMetadata;
        sender?: string;
    }): Promise<string>;
    subscribe(type: MessageType, handler: MessageHandler, options?: {
        filter?: MessageFilter;
        id?: string;
    }): string;
    unsubscribe(subscriptionId: string): boolean;
    request<T = any>(type: MessageType, payload: any, timeoutMs?: number): Promise<T>;
    reply<T = any>(originalMessage: MessageEnvelope, payload: T): Promise<void>;
    private insertByPriority;
    private startProcessing;
    private getNextMessage;
    private isExpired;
    private processMessage;
    private getHandlersForMessage;
    private matchesFilter;
    private executeWithTimeout;
    private handleProcessingError;
    private isRetryableError;
    private retryMessage;
    private moveToDeadLetterQueue;
    private handleExpiredMessage;
    private updateProcessingTime;
    private startMetricsCollection;
    private updateMetrics;
    private startTrace;
    private updateTrace;
    private generateMessageId;
    private generateTraceId;
    private generateSubscriptionId;
    getMetrics(): MessageBusMetrics;
    getTrace(messageId: string): MessageTrace | undefined;
    getTracesByTraceId(traceId: string): MessageTrace[];
    getDeadLetterQueue(): MessageEnvelope[];
    retryFromDeadLetterQueue(messageId: string): Promise<boolean>;
    clearDeadLetterQueue(): void;
    getQueueSize(): number;
    getSubscriptions(): Subscription[];
    shutdown(): Promise<void>;
    private waitForProcessing;
}
export { EnhancedMessageBus as MessageBus };
//# sourceMappingURL=EnhancedMessageBus.d.ts.map