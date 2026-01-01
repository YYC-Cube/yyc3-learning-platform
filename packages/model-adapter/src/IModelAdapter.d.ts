/**
 * YYC³ ModelAdapter Interface Definitions
 * 智能模型适配器接口定义
 *
 * Provides unified interfaces for multiple AI model providers
 * 支持多种AI模型提供商的统一接口
 */
export interface ModelCredentials {
    apiKey: string;
    baseURL?: string;
    organization?: string;
    timeout?: number;
    maxRetries?: number;
    additionalHeaders?: Record<string, string>;
}
export interface ModelConfig {
    id: string;
    name: string;
    provider: ModelProvider;
    model: string;
    version?: string;
    credentials: ModelCredentials;
    capabilities: ModelCapabilities;
    limits?: ModelLimits;
    pricing?: ModelPricing;
}
export interface ModelCapabilities {
    maxTokens: number;
    maxContextLength: number;
    supportedModalities: Modality[];
    streamingSupport: boolean;
    functionCalling: boolean;
    visionSupport: boolean;
    codeGeneration: boolean;
    reasoning: boolean;
    multilingual: boolean;
    customInstructions: boolean;
}
export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
export interface ModelLimits {
    requestsPerMinute: number;
    tokensPerMinute: number;
    requestsPerDay: number;
    tokensPerDay: number;
    concurrentRequests: number;
}
export interface ModelPricing {
    inputTokensPer1K: number;
    outputTokensPer1K: number;
    currency: string;
    unit: 'token' | 'character' | 'request';
}
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'local' | 'huggingface' | 'cohere' | 'mistral';
export type TaskType = 'conversation' | 'analysis' | 'generation' | 'summarization' | 'translation' | 'classification' | 'extraction' | 'code' | 'reasoning' | 'creative';
export interface ModelRequest {
    id: string;
    taskType: TaskType;
    prompt: string;
    messages?: ChatMessage[];
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    tools?: ToolCall[];
    toolChoice?: ToolChoice;
    stream?: boolean;
    metadata?: RequestMetadata;
    context?: RequestExecutionContext;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | ContentBlock[];
    timestamp: number;
    metadata?: MessageMetadata;
}
export interface ContentBlock {
    type: Modality;
    content: string | any;
    metadata?: Record<string, any>;
}
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
export interface ToolChoice {
    type: 'none' | 'auto' | 'required' | 'function';
    function?: {
        name: string;
    };
}
export interface MessageMetadata {
    tokenCount?: number;
    model?: string;
    cost?: number;
    latency?: number;
    confidence?: number;
}
export interface RequestMetadata {
    userId?: string;
    sessionId?: string;
    requestId: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
    budget?: number;
    deadline?: number;
}
export interface RequestExecutionContext {
    conversationHistory: ChatMessage[];
    userPreferences: UserPreferences;
    systemState: SystemState;
    availableTools: ToolDefinition[];
    resourceConstraints: ResourceConstraints;
}
export interface UserPreferences {
    language: string;
    responseStyle: 'concise' | 'detailed' | 'technical' | 'conversational';
    temperaturePreference: number;
    maxTokensPreference: number;
    disabledFeatures?: string[];
    customInstructions?: string;
}
export interface SystemState {
    currentGoal?: string;
    activeTasks: string[];
    recentContext: string[];
    systemLoad: number;
    availableResources: string[];
}
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
    required: string[];
    type: 'function';
}
export interface ResourceConstraints {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    maxAPICalls: number;
    allowedOperations: string[];
}
export interface ModelResponse {
    id: string;
    requestId: string;
    modelId: string;
    content: string | ContentBlock[];
    finishReason: FinishReason;
    usage: TokenUsage;
    metadata: ResponseMetadata;
    toolCalls?: ToolCallResult[];
    streaming?: boolean;
}
export type FinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error' | 'timeout' | 'rate_limit';
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    reasoningTokens?: number;
    cost?: number;
}
export interface ResponseMetadata {
    latency: number;
    model: string;
    provider: ModelProvider;
    timestamp: number;
    requestId: string;
    processingTime: number;
    queueTime?: number;
    retryCount?: number;
    cacheHit?: boolean;
    confidence?: number;
    safetyRatings?: SafetyRating[];
}
export interface SafetyRating {
    category: string;
    severity: 'low' | 'medium' | 'high';
    blocked: boolean;
    reason?: string;
}
export interface ToolCallResult {
    id: string;
    toolName: string;
    success: boolean;
    result?: any;
    error?: string;
    executionTime: number;
}
export interface ModelHealthCheck {
    modelId: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    responseTime: number;
    lastCheck: number;
    errorRate: number;
    uptime: number;
    metrics: HealthMetrics;
}
export interface HealthMetrics {
    requestsPerMinute: number;
    errorRate: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    timeoutRate: number;
    queueDepth: number;
}
export interface RoutingStrategy {
    type: 'round_robin' | 'weighted' | 'least_cost' | 'fastest' | 'best_quality' | 'smart';
    weights?: Record<string, number>;
    rules?: RoutingRule[];
    fallback?: FallbackStrategy;
}
export interface RoutingRule {
    condition: RoutingCondition;
    action: RoutingAction;
    priority: number;
    enabled: boolean;
}
export interface RoutingCondition {
    taskType?: TaskType[];
    complexity?: 'simple' | 'medium' | 'complex';
    maxTokens?: number;
    maxLatency?: number;
    maxCost?: number;
    requiredCapabilities?: string[];
    excludedProviders?: ModelProvider[];
    customCondition?: string;
}
export interface RoutingAction {
    selectModel: string[];
    preferProvider?: ModelProvider;
    excludeModel?: string[];
    overrideConfig?: Partial<ModelConfig>;
}
export interface FallbackStrategy {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
    alternativeModels: string[];
    fallbackOnErrors: string[];
}
export interface LoadBalancingConfig {
    strategy: 'round_robin' | 'weighted' | 'least_connections' | 'response_time';
    weights: Record<string, number>;
    healthCheckInterval: number;
    unhealthyThreshold: number;
    healthyThreshold: number;
}
export interface CacheConfig {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    strategy: 'lru' | 'lfu' | 'fifo';
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
}
export interface MonitoringConfig {
    enabled: boolean;
    metricsInterval: number;
    detailedLogging: boolean;
    alertThresholds: AlertThresholds;
    retentionPeriod: number;
}
export interface AlertThresholds {
    errorRate: number;
    latency: number;
    cost: number;
    queueDepth: number;
    resourceUsage: number;
}
export interface ModelAdapterConfig {
    defaultModel: string;
    fallbackModel: string;
    routing: RoutingStrategy;
    loadBalancing: LoadBalancingConfig;
    cache: CacheConfig;
    monitoring: MonitoringConfig;
    security: SecurityConfig;
}
export interface SecurityConfig {
    encryptionEnabled: boolean;
    keyRotationEnabled: boolean;
    auditLogging: boolean;
    dataRetentionPolicy: number;
    complianceStandards: ComplianceStandard[];
    accessControl: AccessControlConfig;
}
export interface ComplianceStandard {
    name: string;
    version: string;
    enabled: boolean;
    requirements: string[];
}
export interface AccessControlConfig {
    rbacEnabled: boolean;
    defaultPermissions: string[];
    adminRoles: string[];
    userRoles: string[];
}
export interface ModelMetrics {
    modelId: string;
    timestamp: number;
    requestCount: number;
    successCount: number;
    errorCount: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    cacheHitRate: number;
    queueDepth: number;
}
export interface ProviderMetrics {
    provider: ModelProvider;
    timestamp: number;
    models: ModelMetrics[];
    totalRequests: number;
    totalErrors: number;
    totalCost: number;
    averageLatency: number;
    uptime: number;
}
export interface AdapterMetrics {
    timestamp: number;
    totalRequests: number;
    totalErrors: number;
    totalCost: number;
    averageLatency: number;
    cacheHitRate: number;
    providerMetrics: Record<ModelProvider, ProviderMetrics>;
    topModels: ModelMetrics[];
    errorAnalysis: ErrorAnalysis;
}
export interface ErrorAnalysis {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByProvider: Record<ModelProvider, number>;
    errorsByModel: Record<string, number>;
    recentErrors: ErrorEvent[];
}
export interface ErrorEvent {
    timestamp: number;
    modelId: string;
    requestId: string;
    errorType: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
}
export interface IModelAdapter {
    readonly config: ModelAdapterConfig;
    readonly models: Map<string, ModelConfig>;
    readonly metrics: AdapterMetrics;
    readonly status: 'initializing' | 'active' | 'suspended' | 'error';
    initialize(config: ModelAdapterConfig): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    addModel(config: ModelConfig): Promise<void>;
    removeModel(modelId: string): Promise<void>;
    updateModel(modelId: string, config: Partial<ModelConfig>): Promise<void>;
    getModel(modelId: string): ModelConfig | undefined;
    listModels(): ModelConfig[];
    listModelsByProvider(provider: ModelProvider): ModelConfig[];
    getAvailableModels(taskType: TaskType): ModelConfig[];
    processRequest(request: ModelRequest): Promise<ModelResponse>;
    processStreamingRequest(request: ModelRequest, onChunk: (chunk: ModelResponse) => void): Promise<void>;
    cancelRequest(requestId: string): Promise<void>;
    healthCheck(): Promise<Record<string, ModelHealthCheck>>;
    getMetrics(): AdapterMetrics;
    getModelMetrics(modelId: string): ModelMetrics | undefined;
    getProviderMetrics(provider: ModelProvider): ProviderMetrics | undefined;
    updateConfig(config: Partial<ModelAdapterConfig>): Promise<void>;
    resetConfig(): Promise<void>;
    clearCache(): Promise<void>;
    getCacheStats(): Promise<CacheStats>;
    on(event: 'request', listener: (request: ModelRequest) => void): void;
    on(event: 'response', listener: (response: ModelResponse) => void): void;
    on(event: 'error', listener: (error: Error) => void): void;
    on(event: 'metrics', listener: (metrics: AdapterMetrics) => void): void;
}
export interface IModelProvider {
    readonly provider: ModelProvider;
    readonly capabilities: ModelCapabilities;
    readonly status: 'active' | 'inactive' | 'error';
    initialize(config: ModelConfig): Promise<void>;
    processRequest(request: ModelRequest): Promise<ModelResponse>;
    processStreamingRequest(request: ModelRequest, onChunk: (chunk: ModelResponse) => void): Promise<void>;
    healthCheck(): Promise<ModelHealthCheck>;
    getCapabilities(): ModelCapabilities;
    validateConfig(config: ModelConfig): boolean;
    cleanup(): Promise<void>;
}
export interface IModelRouter {
    selectModel(request: ModelRequest, availableModels: ModelConfig[], strategy: RoutingStrategy): Promise<ModelConfig>;
    updateRoutingStrategy(strategy: RoutingStrategy): void;
    getRoutingMetrics(): RoutingMetrics;
}
export interface RoutingMetrics {
    totalRoutings: number;
    routingByStrategy: Record<string, number>;
    routingByModel: Record<string, number>;
    routingByProvider: Record<ModelProvider, number>;
    averageRoutingTime: number;
    routingErrors: number;
}
export interface IModelCache {
    get(key: string): Promise<ModelResponse | null>;
    set(key: string, response: ModelResponse, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    getStats(): Promise<CacheStats>;
}
export interface CacheStats {
    size: number;
    hitRate: number;
    missRate: number;
    evictions: number;
    memoryUsage: number;
    compressionRatio?: number;
}
export interface IModelMonitor {
    recordRequest(request: ModelRequest): void;
    recordResponse(response: ModelResponse): void;
    recordError(error: Error, context: any): void;
    getMetrics(timeRange?: TimeRange): Promise<AdapterMetrics>;
    generateReport(timeRange?: TimeRange): Promise<MonitoringReport>;
    setAlertThresholds(thresholds: AlertThresholds): void;
}
export interface TimeRange {
    start: number;
    end: number;
}
export interface MonitoringReport {
    timeRange: TimeRange;
    summary: ReportSummary;
    modelReports: ModelReport[];
    providerReports: ProviderReport[];
    recommendations: string[];
    alerts: Alert[];
}
export interface ReportSummary {
    totalRequests: number;
    totalCost: number;
    averageLatency: number;
    errorRate: number;
    cacheHitRate: number;
    topModels: string[];
    issues: string[];
}
export interface ModelReport {
    modelId: string;
    metrics: ModelMetrics;
    performance: PerformanceAnalysis;
    issues: string[];
    recommendations: string[];
}
export interface ProviderReport {
    provider: ModelProvider;
    metrics: ProviderMetrics;
    models: ModelReport[];
    issues: string[];
    recommendations: string[];
}
export interface PerformanceAnalysis {
    latencyAnalysis: LatencyAnalysis;
    throughputAnalysis: ThroughputAnalysis;
    costAnalysis: CostAnalysis;
    reliabilityAnalysis: ReliabilityAnalysis;
}
export interface LatencyAnalysis {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    trend: 'improving' | 'stable' | 'degrading';
}
export interface ThroughputAnalysis {
    requestsPerMinute: number;
    tokensPerMinute: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}
export interface CostAnalysis {
    totalCost: number;
    costPerRequest: number;
    costPerToken: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    optimization: string[];
}
export interface ReliabilityAnalysis {
    uptime: number;
    errorRate: number;
    timeoutRate: number;
    availability: number;
    trend: 'improving' | 'stable' | 'degrading';
}
export interface Alert {
    id: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    modelId?: string;
    provider?: ModelProvider;
    resolved: boolean;
    resolvedAt?: number;
}
export interface ModelSelectionCriteria {
    taskType: TaskType;
    complexity: 'simple' | 'medium' | 'complex';
    maxLatency?: number;
    maxCost?: number;
    requiredCapabilities: string[];
    excludedProviders?: ModelProvider[];
    qualityThreshold?: number;
}
export interface ModelBenchmark {
    modelId: string;
    taskType: TaskType;
    quality: number;
    speed: number;
    cost: number;
    reliability: number;
    lastUpdated: number;
}
export interface ModelRecommendation {
    modelId: string;
    confidence: number;
    reasoning: string;
    expectedQuality: number;
    expectedCost: number;
    expectedLatency: number;
}
export interface BatchRequest {
    id: string;
    requests: ModelRequest[];
    parallel: boolean;
    onProgress?: (completed: number, total: number) => void;
}
export interface BatchResponse {
    id: string;
    responses: ModelResponse[];
    errors: Error[];
    totalTime: number;
    totalCost: number;
}
//# sourceMappingURL=IModelAdapter.d.ts.map