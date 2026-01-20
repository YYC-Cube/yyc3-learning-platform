/**
 * YYC³ ModelAdapter Implementation
 * 智能模型适配器实现
 *
 * Provides unified interface for multiple AI model providers with intelligent routing
 * 为多个AI模型提供商提供统一接口和智能路由
 */

// 替代Node.js的EventEmitter，使用Web环境兼容的事件发射器
class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.listeners.has(event)) {
      return false;
    }
    this.listeners.get(event)!.forEach(listener => listener(...args));
    return true;
  }

  removeListener(event: string, listener: Function): this {
    if (!this.listeners.has(event)) {
      return this;
    }
    const listeners = this.listeners.get(event)!.filter(l => l !== listener);
    if (listeners.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, listeners);
    }
    return this;
  }
}

// 替代Node.js的crypto模块，使用Web Crypto API
const createHash = (algorithm: string) => {
  return {
    update: (data: string) => {
      return {
        digest: async (encoding: string) => {
          const encoder = new TextEncoder();
          const dataBuffer = encoder.encode(data);
          const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), dataBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      };
    }
  };
};

const randomBytes = (size: number): Buffer => {
  const array = new Uint8Array(size);
  crypto.getRandomValues(array);
  // 简单模拟Buffer接口
  return { ...array, toString: (encoding: BufferEncoding) => Buffer.from(array).toString(encoding) } as any;
};
import {
  IModelAdapter,
  IModelProvider,
  IModelRouter,
  IModelCache,
  IModelMonitor,
  ModelAdapterConfig,
  ModelConfig,
  ModelRequest,
  ModelResponse,
  ModelHealthCheck,
  AdapterMetrics,
  ModelMetrics,
  ProviderMetrics,
  ErrorAnalysis,
  ErrorEvent,
  ModelProvider,
  TaskType,
  RoutingStrategy,
  CacheStats,
  TimeRange,
  MonitoringReport,
  BatchRequest,
  BatchResponse,
  RequestMetadata,
  RoutingMetrics,
  ModelCapabilities,
  ModelPricing,
  FinishReason,
  ToolChoice,
  ContentBlock
} from './IModelAdapter';

import { EnhancedStreamingProcessor, StreamingConfig } from './core/EnhancedStreamingProcessor';
import { IntelligentCacheLayer, CacheConfig, CacheStrategy } from './core/IntelligentCacheLayer';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('ModelAdapter');

/**
 * Main ModelAdapter class that orchestrates all model providers
 * 主模型适配器类，协调所有模型提供商
 */
export class ModelAdapter extends EventEmitter implements IModelAdapter {
  private _config!: ModelAdapterConfig;
  private _models = new Map<string, ModelConfig>();
  private _providers = new Map<ModelProvider, IModelProvider>();
  private _router: IModelRouter;
  private _cache: IntelligentCacheLayer;
  private _monitor: IModelMonitor;
  private _streamingProcessor: EnhancedStreamingProcessor;
  private _status: 'initializing' | 'active' | 'suspended' | 'error' = 'initializing';
  private _metrics: AdapterMetrics;
  private _requestTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private _activeRequests = new Map<string, AbortController>();

  constructor() {
    super();
    this._metrics = this.initializeMetrics();
    this._router = new SmartModelRouter();
    this._cache = new IntelligentCacheLayer();
    this._monitor = new ModelMonitor();
    this._streamingProcessor = new EnhancedStreamingProcessor();
  }

  // Getters
  get config(): ModelAdapterConfig {
    return { ...this._config };
  }

  get models(): Map<string, ModelConfig> {
    return new Map(this._models);
  }

  get metrics(): AdapterMetrics {
    return { ...this._metrics };
  }

  get status(): 'initializing' | 'active' | 'suspended' | 'error' {
    return this._status;
  }

  /**
   * Initialize the ModelAdapter with configuration
   * 使用配置初始化模型适配器
   */
  async initialize(config: ModelAdapterConfig): Promise<void> {
    try {
      this._status = 'initializing';
      this._config = { ...config };

      // Initialize cache with multi-level configuration
      const cacheConfig: CacheConfig = {
        l1Size: config.cache?.maxSize || 1000,
        l1TTL: config.cache?.ttl || 60000,
        l2Size: '1gb',
        l2Policy: CacheStrategy.LRU,
        l3Size: '10gb',
        l3TTL: 86400000,
        l4TTL: 604800000,
        persistentPath: './cache',
        enableCompression: true,
        writeBufferSize: 1024 * 1024,
        clusteringEnabled: false
      };

      // Reinitialize cache with configuration
      this._cache = new IntelligentCacheLayer(cacheConfig);

      // Initialize monitor and router (optional initialization)
      if ('initialize' in this._monitor && typeof this._monitor.initialize === 'function') {
        await this._monitor.initialize(config.monitoring);
      }
      if ('initialize' in this._router && typeof this._router.initialize === 'function') {
        await this._router.initialize(config.routing);
      }

      this._status = 'active';
      this.emit('initialized');
    } catch (error) {
      this._status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start the ModelAdapter
   * 启动模型适配器
   */
  async start(): Promise<void> {
    if (this._status !== 'active') {
      throw new Error(`Cannot start ModelAdapter in status: ${this._status}`);
    }

    try {
      // Start monitoring
      this.startMetricsCollection();

      // Start health checks
      this.startHealthChecks();

      this.emit('started');
    } catch (error) {
      this._status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the ModelAdapter
   * 停止模型适配器
   */
  async stop(): Promise<void> {
    try {
      this._status = 'suspended';

      // Cancel all active requests
      for (const [requestId, controller] of this._activeRequests) {
        controller.abort();
      }
      this._activeRequests.clear();

      // Clear timeouts
      for (const timeout of this._requestTimeouts.values()) {
        clearTimeout(timeout);
      }
      this._requestTimeouts.clear();

      // Cleanup providers
      for (const provider of this._providers.values()) {
        await provider.cleanup();
      }

      this.emit('stopped');
    } catch (error) {
      this._status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Restart the ModelAdapter
   * 重启模型适配器
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.initialize(this._config);
    await this.start();
  }

  /**
   * Add a new model configuration
   * 添加新的模型配置
   */
  async addModel(config: ModelConfig): Promise<void> {
    try {
      // Validate configuration
      this.validateModelConfig(config);

      // Create and initialize provider
      const provider = this.createProvider(config.provider);
      await provider.initialize(config);

      // Store model and provider
      this._models.set(config.id, config);
      this._providers.set(config.provider, provider);

      this.emit('modelAdded', config);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Remove a model
   * 移除模型
   */
  async removeModel(modelId: string): Promise<void> {
    try {
      const config = this._models.get(modelId);
      if (!config) {
        throw new Error(`Model not found: ${modelId}`);
      }

      const provider = this._providers.get(config.provider);
      if (provider) {
        await provider.cleanup();
        this._providers.delete(config.provider);
      }

      this._models.delete(modelId);

      this.emit('modelRemoved', modelId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Update model configuration
   * 更新模型配置
   */
  async updateModel(modelId: string, config: Partial<ModelConfig>): Promise<void> {
    try {
      const existingConfig = this._models.get(modelId);
      if (!existingConfig) {
        throw new Error(`Model not found: ${modelId}`);
      }

      const updatedConfig = { ...existingConfig, ...config };
      await this.removeModel(modelId);
      await this.addModel(updatedConfig);

      this.emit('modelUpdated', modelId, updatedConfig);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get model configuration
   * 获取模型配置
   */
  getModel(modelId: string): ModelConfig | undefined {
    return this._models.get(modelId);
  }

  /**
   * List all models
   * 列出所有模型
   */
  listModels(): ModelConfig[] {
    return Array.from(this._models.values());
  }

  /**
   * List models by provider
   * 按提供商列出模型
   */
  listModelsByProvider(provider: ModelProvider): ModelConfig[] {
    return this.listModels().filter(model => model.provider === provider);
  }

  /**
   * Get available models for a specific task type
   * 获取特定任务类型的可用模型
   */
  getAvailableModels(taskType: TaskType): ModelConfig[] {
    return this.listModels().filter(model =>
      model.capabilities && this.isModelSuitableForTask(model, taskType)
    );
  }

  /**
   * Process a model request
   * 处理模型请求
   */
  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      // Record request
      this._monitor.recordRequest(request);
      this.emit('request', request);

      // Check cache first
      const cacheKey = await this.generateCacheKey(request);
      const cacheResult = await this._cache.get<ModelResponse>(cacheKey);
      if (cacheResult.hit) {
        this.emit('response', cacheResult.value);
        return cacheResult.value;
      }

      // Select appropriate model
      const availableModels = this.getAvailableModels(request.taskType);
      if (availableModels.length === 0) {
        throw new Error(`No available models for task type: ${request.taskType}`);
      }

      const selectedModel = await this._router.selectModel(
        request,
        availableModels,
        this._config.routing
      );

      // Create abort controller for timeout
      const controller = new AbortController();
      this._activeRequests.set(request.id, controller);

      // Set timeout
      const timeout = setTimeout(() => {
        controller.abort();
      }, request.metadata?.deadline ? request.metadata.deadline - Date.now() : 30000);

      this._requestTimeouts.set(request.id, timeout);

      // Process request with selected provider
      const provider = this._providers.get(selectedModel.provider);
      if (!provider) {
        throw new Error(`Provider not found: ${selectedModel.provider}`);
      }

      const response = await provider.processRequest(request);

      // Update response metadata
      response.requestId = request.id;
      response.modelId = selectedModel.id;
      response.metadata.latency = Date.now() - startTime;

      // Cache response with multi-level strategy
      await this._cache.set(cacheKey, response, {
        ttl: this._config.cache.ttl,
        strategy: 'write-through',
        priority: 'medium'
      });

      // Record response
      this._monitor.recordResponse(response);
      this.emit('response', response);

      return response;
    } catch (error) {
      // Record error
      this._monitor.recordError(error as Error, { request });
      this.emit('error', error);
      throw error;
    } finally {
      // Cleanup
      this._activeRequests.delete(request.id);
      const timeout = this._requestTimeouts.get(request.id);
      if (timeout) {
        clearTimeout(timeout);
        this._requestTimeouts.delete(request.id);
      }
    }
  }

  /**
   * Process streaming request
   * 处理流式请求
   */
  async processStreamingRequest(
    request: ModelRequest,
    onChunk: (chunk: ModelResponse) => void
  ): Promise<void> {
    try {
      this._monitor.recordRequest(request);
      this.emit('request', request);

      // Select model
      const availableModels = this.getAvailableModels(request.taskType);
      const selectedModel = await this._router.selectModel(
        request,
        availableModels,
        this._config.routing
      );

      // Process streaming with enhanced processor
      const provider = this._providers.get(selectedModel.provider);
      if (!provider) {
        throw new Error(`Provider not found: ${selectedModel.provider}`);
      }

      const streamingConfig: StreamingConfig = {
        enableBuffering: true,
        bufferSize: 10,
        bufferFlushInterval: 100,
        enableCompression: true,
        enableDeduplication: true,
        maxConcurrentStreams: 100,
        streamTimeout: 60000,
        retryOnFailure: true,
        maxRetries: 3,
        enablePrefetch: true,
        prefetchThreshold: 0.8
      };

      await this._streamingProcessor.processStream(
        request,
        (req: ModelRequest) => {
          const streamProcessor = async function* (streamRequest: ModelRequest): AsyncIterable<ModelResponse> {
            const chunks: ModelResponse[] = [];
            await provider.processStreamingRequest(streamRequest, (chunk) => {
              chunks.push(chunk);
            });
            yield* chunks;
          };
          return streamProcessor(request);
        },
        onChunk
      );
    } catch (error) {
      this._monitor.recordError(error as Error, { request });
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Cancel a request
   * 取消请求
   */
  async cancelRequest(requestId: string): Promise<void> {
    const controller = this._activeRequests.get(requestId);
    if (controller) {
      controller.abort();
    }

    const timeout = this._requestTimeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this._requestTimeouts.delete(requestId);
    }
  }



  /**
   * Generate streaming text from a prompt (callback version)
   * 从提示生成流式文本（回调版本）
   */
  async generateStream(
    options: {
      prompt: string;
      maxTokens?: number;
      temperature?: number;
      model?: string;
      systemPrompt?: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<void>;

  /**
   * Generate streaming text from a prompt (async generator version)
   * 从提示生成流式文本（异步生成器版本）
   */
  generateStream(
    options: {
      prompt: string;
      maxTokens?: number;
      temperature?: number;
      model?: string;
      systemPrompt?: string;
    }
  ): AsyncIterable<{ text: string }>;

  /**
   * Implementation of generateStream method overloads
   */
  async generateStream(
    options: {
      prompt: string;
      maxTokens?: number;
      temperature?: number;
      model?: string;
      systemPrompt?: string;
    },
    onChunk: (chunk: string) => void
  ): Promise<void>;

  generateStream(
    options: {
      prompt: string;
      maxTokens?: number;
      temperature?: number;
      model?: string;
      systemPrompt?: string;
    }
  ): AsyncIterable<{ text: string }>;

  generateStream(
    options: {
      prompt: string;
      maxTokens?: number;
      temperature?: number;
      model?: string;
      systemPrompt?: string;
    },
    onChunk?: (chunk: string) => void
  ): Promise<void> | AsyncIterable<{ text: string }> {
    const requestBase = {
      id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskType: 'generation' as const,
      prompt: options.prompt,
      metadata: {
        requestId: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        priority: 'normal' as const
      }
    };

    const request: ModelRequest = requestBase;

    if (options.systemPrompt !== undefined) {
      request.systemPrompt = options.systemPrompt;
    }
    if (options.maxTokens !== undefined) {
      request.maxTokens = options.maxTokens;
    }
    if (options.temperature !== undefined) {
      request.temperature = options.temperature;
    }

    request.stream = true;

    if (onChunk) {
      // Callback version - return a promise
      return this.processStreamingRequest(request, (chunk) => {
        const content = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
        onChunk(content);
      });
    } else {
      // Async generator version - return an async iterable
      const modelAdapter = this;
      
      return {
        [Symbol.asyncIterator]() {
          let done = false;
          let error: Error | null = null;
          const chunks: { text: string }[] = [];
          let resolveNext: ((value: IteratorResult<{ text: string }>) => void) | null = null;
          
          // Start processing the request
          modelAdapter.processStreamingRequest(request, (chunk) => {
            const content = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
            const iterResult = { value: { text: content }, done: false };
            
            if (resolveNext) {
              resolveNext(iterResult);
              resolveNext = null;
            } else {
              chunks.push({ text: content });
            }
          })
          .then(() => {
            done = true;
            if (resolveNext) {
              resolveNext({ value: undefined, done: true });
              resolveNext = null;
            }
          })
          .catch((err) => {
            error = err;
            done = true;
            if (resolveNext) {
              resolveNext({ value: undefined, done: true });
              resolveNext = null;
            }
          });
          
          return {
            next() {
              if (error) {
                throw error;
              }
              
              if (chunks.length > 0) {
                return Promise.resolve({ value: chunks.shift()!, done: false });
              } else if (done) {
                return Promise.resolve({ value: undefined, done: true });
              } else {
                return new Promise<IteratorResult<{ text: string }>>((resolve) => {
                  resolveNext = resolve;
                });
              }
            }
          };
        }
      };
    }
  }

  /**
   * Perform health check on all models
   * 对所有模型执行健康检查
   */
  async healthCheck(): Promise<Record<string, ModelHealthCheck>> {
    const healthChecks: Record<string, ModelHealthCheck> = {};

    for (const [modelId, config] of this._models) {
      try {
        const provider = this._providers.get(config.provider);
        if (provider) {
          healthChecks[modelId] = await provider.healthCheck();
        }
      } catch (error) {
        healthChecks[modelId] = {
          modelId,
          status: 'unhealthy',
          responseTime: -1,
          lastCheck: Date.now(),
          errorRate: 100,
          uptime: 0,
          metrics: {
            requestsPerMinute: 0,
            errorRate: 100,
            averageLatency: -1,
            p95Latency: -1,
            p99Latency: -1,
            timeoutRate: 100,
            queueDepth: 0
          }
        };
      }
    }

    return healthChecks;
  }

  /**
   * Get metrics
   * 获取指标
   */
  getMetrics(): AdapterMetrics {
    return { ...this._metrics };
  }

  /**
   * Get model metrics
   * 获取模型指标
   */
  getModelMetrics(modelId: string): ModelMetrics | undefined {
    if (!this._metrics.providerMetrics) return undefined;
    
    return Object.values(this._metrics.providerMetrics)
      .flatMap(pm => pm.models)
      .find(m => m.modelId === modelId);
  }

  /**
   * Generate text from a prompt (convenience method)
   * 从提示生成文本（便捷方法）
   */
  async generateText(options: {
    id?: string;
    taskType?: TaskType;
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    metadata?: RequestMetadata;
  }): Promise<ModelResponse> {
    const request: ModelRequest = {
      id: options.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskType: options.taskType || 'generation',
      prompt: options.prompt,
      metadata: options.metadata || {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        priority: 'normal'
      }
    };

    if (options.systemPrompt !== undefined) {
      request.systemPrompt = options.systemPrompt;
    }
    if (options.temperature !== undefined) {
      request.temperature = options.temperature;
    }
    if (options.maxTokens !== undefined) {
      request.maxTokens = options.maxTokens;
    }

    return this.processRequest(request);
  }

  /**
   * Generate text from a prompt (simple version)
   * 从提示生成文本（简单版本）
   */
  async generate(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    systemPrompt?: string;
  }): Promise<{ text: string; usage?: any }> {
    const response = await this.generateText({
      prompt: options.prompt,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      systemPrompt: options.systemPrompt
    });

    // Handle both string and ContentBlock[] response types
    const textContent = Array.isArray(response.content)
      ? response.content.map(block => block.content as string).join('')
      : response.content || '';

    return {
      text: textContent,
      usage: response.usage
    };
  }

  /**
   * Get provider metrics
   * 获取提供商指标
   */
  getProviderMetrics(provider: ModelProvider): ProviderMetrics | undefined {
    return this._metrics.providerMetrics?.[provider];
  }

  /**
   * Update configuration
   * 更新配置
   */
  async updateConfig(config: Partial<ModelAdapterConfig>): Promise<void> {
    this._config = { ...this._config, ...config };

    // Update router configuration
    if (config.routing) {
      await this._router.updateRoutingStrategy(config.routing);
    }
  }

  /**
   * Reset configuration to defaults
   * 重置配置为默认值
   */
  async resetConfig(): Promise<void> {
    const defaultConfig: ModelAdapterConfig = {
      defaultModel: '',
      fallbackModel: '',
      routing: {
        type: 'smart',
        fallback: {
          enabled: true,
          maxRetries: 3,
          retryDelay: 1000,
          exponentialBackoff: true,
          alternativeModels: [],
          fallbackOnErrors: ['timeout', 'rate_limit', 'error']
        }
      },
      loadBalancing: {
        strategy: 'round_robin',
        weights: {},
        healthCheckInterval: 60000,
        unhealthyThreshold: 3,
        healthyThreshold: 2
      },
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
        strategy: 'lru',
        compressionEnabled: true,
        encryptionEnabled: false
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000,
        detailedLogging: true,
        alertThresholds: {
          errorRate: 5,
          latency: 5000,
          cost: 100,
          queueDepth: 100,
          resourceUsage: 80
        },
        retentionPeriod: 2592000000 // 30 days
      },
      security: {
        encryptionEnabled: true,
        keyRotationEnabled: true,
        auditLogging: true,
        dataRetentionPolicy: 2592000000,
        complianceStandards: [],
        accessControl: {
          rbacEnabled: false,
          defaultPermissions: [],
          adminRoles: ['admin'],
          userRoles: ['user']
        }
      }
    };

    await this.updateConfig(defaultConfig);
  }

  /**
   * Clear cache
   * 清除缓存
   */
  async clearCache(): Promise<void> {
    await this._cache.clear();
  }

  /**
   * Get cache statistics
   * 获取缓存统计
   */
  async getCacheStats(): Promise<CacheStats> {
    const statsArray = await this._cache.getStats();
    
    const aggregated: CacheStats = {
      size: 0,
      hitRate: 0,
      missRate: 0,
      evictions: 0,
      memoryUsage: 0
    };
    
    for (const stats of statsArray) {
      aggregated.size += stats.size;
      aggregated.evictions += stats.evictions;
      aggregated.memoryUsage += stats.memoryUsage;
    }
    
    const totalRequests = statsArray.reduce((sum, s) => sum + s.hits + s.misses, 0);
    const totalHits = statsArray.reduce((sum, s) => sum + s.hits, 0);
    
    if (totalRequests > 0) {
      aggregated.hitRate = totalHits / totalRequests;
      aggregated.missRate = 1 - aggregated.hitRate;
    }
    
    return aggregated;
  }

  // Private helper methods

  private initializeMetrics(): AdapterMetrics {
    return {
      timestamp: Date.now(),
      totalRequests: 0,
      totalErrors: 0,
      totalCost: 0,
      averageLatency: 0,
      cacheHitRate: 0,
      providerMetrics: {} as Record<ModelProvider, ProviderMetrics>,
      topModels: [],
      errorAnalysis: {
        totalErrors: 0,
        errorsByType: {} as Record<string, number>,
        errorsByProvider: {} as Record<ModelProvider, number>,
        errorsByModel: {} as Record<string, number>,
        recentErrors: []
      }
    };
  }

  private validateModelConfig(config: ModelConfig): void {
    if (!config.id || !config.name || !config.provider || !config.model) {
      throw new Error('Invalid model configuration: missing required fields');
    }

    if (!config.credentials || !config.credentials.apiKey) {
      throw new Error('Invalid model configuration: missing credentials');
    }
  }

  private createProvider(provider: ModelProvider): IModelProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      case 'google':
        return new GoogleProvider();
      case 'azure':
        return new AzureProvider();
      case 'local':
        return new LocalProvider();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private isModelSuitableForTask(model: ModelConfig, taskType: TaskType): boolean {
    // Simple suitability check - can be enhanced with more complex logic
    return true;
  }

  private async generateCacheKey(request: ModelRequest): Promise<string> {
    const keyData = {
      taskType: request.taskType,
      prompt: request.prompt,
      messages: request.messages,
      temperature: request.temperature,
      maxTokens: request.maxTokens
    };
    return await createHash('sha256').update(JSON.stringify(keyData)).digest('hex');
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this._metrics.timestamp = Date.now();
      this._metrics = this.calculateMetrics();
      this.emit('metrics', this._metrics);
    }, this._config.monitoring.metricsInterval);
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      const healthChecks = await this.healthCheck();

      // Emit health status for unhealthy models
      for (const [modelId, health] of Object.entries(healthChecks)) {
        if (health.status !== 'healthy') {
          this.emit('healthWarning', modelId, health);
        }
      }
    }, this._config.loadBalancing.healthCheckInterval);
  }

  private calculateMetrics(): AdapterMetrics {
    // This would aggregate metrics from all providers and calculate derived metrics
    // Implementation would depend on the specific monitoring requirements
    return { ...this._metrics, timestamp: Date.now() };
  }
}

// Mock provider implementations - would be implemented separately

class SmartModelRouter implements IModelRouter {
  async selectModel(
    request: ModelRequest,
    availableModels: ModelConfig[],
    strategy: RoutingStrategy
  ): Promise<ModelConfig> {
    // Smart routing logic
    switch (strategy.type) {
      case 'fastest':
        return this.selectFastestModel(availableModels);
      case 'least_cost':
        return this.selectLeastCostModel(availableModels);
      case 'best_quality':
        return this.selectBestQualityModel(availableModels);
      case 'smart':
      default:
        return this.selectSmartModel(request, availableModels);
    }
  }

  async initialize?(strategy: RoutingStrategy): Promise<void> {
    // Initialize router
  }

  updateRoutingStrategy(strategy: RoutingStrategy): void {
    // Update strategy
  }

  getRoutingMetrics(): RoutingMetrics {
    return {
      totalRoutings: 0,
      routingByStrategy: {},
      routingByModel: {},
      routingByProvider: {} as Record<ModelProvider, number>,
      averageRoutingTime: 0,
      routingErrors: 0
    };
  }

  private selectFastestModel(models: ModelConfig[]): ModelConfig {
    // Return model with best expected latency
    return models[0] || ({} as ModelConfig);
  }

  private selectLeastCostModel(models: ModelConfig[]): ModelConfig {
    // Return model with lowest cost
    return models[0] || ({} as ModelConfig);
  }

  private selectBestQualityModel(models: ModelConfig[]): ModelConfig {
    // Return model with highest quality
    return models[0] || ({} as ModelConfig);
  }

  private selectSmartModel(request: ModelRequest, models: ModelConfig[]): ModelConfig {
    // Smart selection based on request characteristics
    return models[0] || ({} as ModelConfig);
  }
}

class ModelCache implements IModelCache {
  private cache = new Map<string, { response: ModelResponse; expires: number }>();
  private config?: any;

  async initialize?(config: any): Promise<void> {
    this.config = config;
  }

  async get(key: string): Promise<ModelResponse | null> {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  async set(key: string, response: ModelResponse, ttl = 300000): Promise<void> {
    this.cache.set(key, {
      response,
      expires: Date.now() + ttl
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getStats(): Promise<CacheStats> {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      missRate: 0,
      evictions: 0,
      memoryUsage: 0
    };
  }
}

class ModelMonitor implements IModelMonitor {
  async initialize?(config: any): Promise<void> {
    // Initialize monitor
  }

  recordRequest(request: ModelRequest): void {
    // Record request
  }

  recordResponse(response: ModelResponse): void {
    // Record response
  }

  recordError(error: Error, context: any): void {
    // Record error
  }

  async getMetrics(timeRange?: TimeRange): Promise<AdapterMetrics> {
    return {} as AdapterMetrics;
  }

  async generateReport(timeRange?: TimeRange): Promise<MonitoringReport> {
    return {} as MonitoringReport;
  }

  setAlertThresholds(thresholds: any): void {
    // Set thresholds
  }
}

// Import OpenAI SDK
import OpenAI from 'openai';

// OpenAI Provider Implementation
class OpenAIProvider implements IModelProvider {
  readonly provider: ModelProvider = 'openai';
  readonly capabilities: ModelCapabilities;
  readonly status: 'active' | 'inactive' | 'error' = 'active';
  private client: OpenAI | null = null;
  private modelConfig: ModelConfig | null = null;
  private lastHealthCheck: number = 0;

  constructor() {
    this.capabilities = {
      maxTokens: 8192, // Default for GPT-4
      maxContextLength: 128000, // Default for GPT-4
      supportedModalities: ['text', 'code'],
      streamingSupport: true,
      functionCalling: true,
      visionSupport: false,
      codeGeneration: true,
      reasoning: true,
      multilingual: true,
      customInstructions: true
    };
  }

  async initialize(config: ModelConfig): Promise<void> {
    try {
      this.modelConfig = config;
      
      // Update capabilities based on model config
      if (config.capabilities) {
        this.capabilities.maxTokens = config.capabilities.maxTokens;
        this.capabilities.maxContextLength = config.capabilities.maxContextLength;
        this.capabilities.supportedModalities = config.capabilities.supportedModalities;
        this.capabilities.streamingSupport = config.capabilities.streamingSupport;
        this.capabilities.functionCalling = config.capabilities.functionCalling;
        this.capabilities.visionSupport = config.capabilities.visionSupport;
        this.capabilities.codeGeneration = config.capabilities.codeGeneration;
        this.capabilities.reasoning = config.capabilities.reasoning;
        this.capabilities.multilingual = config.capabilities.multilingual;
        this.capabilities.customInstructions = config.capabilities.customInstructions;
      }

      // Create OpenAI client
      this.client = new OpenAI({
        apiKey: config.credentials.apiKey,
        baseURL: config.credentials.baseURL,
        organization: config.credentials.organization,
        timeout: config.credentials.timeout || 30000,
        defaultHeaders: config.credentials.additionalHeaders
      });
    } catch (error) {
      logger.error('Failed to initialize OpenAIProvider:', error);
      throw error;
    }
  }

  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    if (!this.client || !this.modelConfig) {
      throw new Error('OpenAIProvider not initialized');
    }

    try {
      const startTime = Date.now();
      
      // Prepare base request parameters
      const baseRequest: Partial<OpenAI.Chat.ChatCompletionCreateParams> = {
        model: this.modelConfig.model,
        messages: this.formatMessages(request),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || this.capabilities.maxTokens,
        top_p: request.topP || 1,
        frequency_penalty: request.frequencyPenalty || 0,
        presence_penalty: request.presencePenalty || 0,
        stop: request.stopSequences || null,
        stream: false
      };

      // Conditionally add tools if available
      if (request.tools && request.tools.length > 0) {
        baseRequest.tools = request.tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.function.name,
            parameters: JSON.parse(tool.function.arguments)
          }
        }));
      }

      // Conditionally add tool_choice if it has a value
      const toolChoice = this.mapToolChoice(request.toolChoice);
      if (toolChoice) {
        baseRequest.tool_choice = toolChoice;
      }

      // Cast to the appropriate type
      const openaiRequest = baseRequest as OpenAI.Chat.ChatCompletionCreateParams;

      // Send request to OpenAI API
      const openaiResponse = await this.client.chat.completions.create(openaiRequest);
      const endTime = Date.now();

      // Map OpenAI response to ModelResponse
      return this.mapOpenAIResponse(openaiResponse as OpenAI.Chat.ChatCompletion, request, startTime, endTime);
    } catch (error) {
      logger.error('OpenAI API request failed:', error);
      throw error;
    }
  }

  async processStreamingRequest(
    request: ModelRequest,
    onChunk: (chunk: ModelResponse) => void
  ): Promise<void> {
    if (!this.client || !this.modelConfig) {
      throw new Error('OpenAIProvider not initialized');
    }

    try {
      // Prepare base request parameters
      const baseRequest: Partial<OpenAI.Chat.ChatCompletionCreateParams> = {
        model: this.modelConfig.model,
        messages: this.formatMessages(request),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || this.capabilities.maxTokens,
        top_p: request.topP || 1,
        frequency_penalty: request.frequencyPenalty || 0,
        presence_penalty: request.presencePenalty || 0,
        stop: request.stopSequences || null,
        stream: true
      };

      // Conditionally add tools if available
      if (request.tools && request.tools.length > 0) {
        baseRequest.tools = request.tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.function.name,
            parameters: JSON.parse(tool.function.arguments)
          }
        }));
      }

      // Conditionally add tool_choice if it has a value
      const toolChoice = this.mapToolChoice(request.toolChoice);
      if (toolChoice) {
        baseRequest.tool_choice = toolChoice;
      }

      // Cast to the appropriate type
      const openaiRequest = baseRequest as OpenAI.Chat.ChatCompletionCreateParams;

      // Send streaming request to OpenAI API
      const stream = await this.client.chat.completions.create(openaiRequest);
      
      // Process streaming chunks
      for await (const chunk of stream as any) {
        const modelResponse: ModelResponse = {
          id: chunk.id || `stream-${Date.now()}`,
          requestId: request.id,
          modelId: this.modelConfig.id,
          content: chunk.choices[0]?.delta?.content || '',
          finishReason: this.mapFinishReason(chunk.choices[0]?.finish_reason),
          usage: {
            inputTokens: 0, // Not available in streaming
            outputTokens: 0, // Not available in streaming
            totalTokens: 0
          },
          metadata: {
            latency: Date.now() - (request.metadata?.requestId ? Date.now() : 0),
            model: this.modelConfig.model,
            provider: this.provider,
            timestamp: Date.now(),
            requestId: request.id,
            processingTime: 0,
            cacheHit: false
          },
          streaming: true
        };

        onChunk(modelResponse);

        if (chunk.choices[0]?.finish_reason) {
          break;
        }
      }
    } catch (error) {
      logger.error('OpenAI streaming request failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<ModelHealthCheck> {
    if (!this.client) {
      return {
        modelId: this.modelConfig?.id || 'unknown',
        status: 'unhealthy',
        responseTime: -1,
        lastCheck: Date.now(),
        errorRate: 100,
        uptime: 0,
        metrics: {
          requestsPerMinute: 0,
          errorRate: 100,
          averageLatency: -1,
          p95Latency: -1,
          p99Latency: -1,
          timeoutRate: 100,
          queueDepth: 0
        }
      };
    }

    try {
      const startTime = Date.now();
      
      // Simple health check using models.list endpoint
      await this.client.models.list();
      
      const responseTime = Date.now() - startTime;
      this.lastHealthCheck = Date.now();

      return {
        modelId: this.modelConfig?.id || 'unknown',
        status: 'healthy',
        responseTime,
        lastCheck: Date.now(),
        errorRate: 0,
        uptime: 100,
        metrics: {
          requestsPerMinute: 0,
          errorRate: 0,
          averageLatency: responseTime,
          p95Latency: responseTime,
          p99Latency: responseTime,
          timeoutRate: 0,
          queueDepth: 0
        }
      };
    } catch (error) {
      logger.error('OpenAI health check failed:', error);
      return {
        modelId: this.modelConfig?.id || 'unknown',
        status: 'unhealthy',
        responseTime: -1,
        lastCheck: Date.now(),
        errorRate: 100,
        uptime: 0,
        metrics: {
          requestsPerMinute: 0,
          errorRate: 100,
          averageLatency: -1,
          p95Latency: -1,
          p99Latency: -1,
          timeoutRate: 100,
          queueDepth: 0
        }
      };
    }
  }

  getCapabilities(): ModelCapabilities {
    return this.capabilities;
  }

  validateConfig(config: ModelConfig): boolean {
    return !!(config && config.credentials && config.credentials.apiKey && config.model);
  }

  async cleanup(): Promise<void> {
    this.client = null;
    this.modelConfig = null;
  }

  // Helper methods
  private formatMessages(request: ModelRequest): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // Add system prompt if provided
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      });
    }

    // Add conversation history if provided
    if (request.messages) {
      for (const msg of request.messages) {
        // Only handle system, user, and assistant messages
        if (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content as string
          });
        }
        // Skip tool messages for now
      }
    }

    // Add current prompt if provided
    if (request.prompt && !request.messages) {
      messages.push({
        role: 'user',
        content: request.prompt
      });
    }

    return messages;
  }

  private mapFinishReason(reason?: string): FinishReason {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'tool_calls':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  private mapToolChoice(toolChoice?: ToolChoice): OpenAI.Chat.ChatCompletionToolChoiceOption | undefined {
    if (!toolChoice) return undefined;

    switch (toolChoice.type) {
      case 'none':
        return 'none';
      case 'auto':
        return 'auto';
      case 'required':
        return 'required';
      case 'function':
        if (toolChoice.function) {
          return {
            type: 'function',
            function: {
              name: toolChoice.function.name
            }
          };
        }
        return undefined;
      default:
        return undefined;
    }
  }

  private mapOpenAIResponse(
    openaiResponse: OpenAI.Chat.ChatCompletion,
    request: ModelRequest,
    startTime: number,
    endTime: number
  ): ModelResponse {
    const choice = openaiResponse.choices[0];
    const usage = openaiResponse.usage;
    const cost = this.calculateCost(usage, this.modelConfig!.pricing);

    return {
      id: openaiResponse.id,
      requestId: request.id,
      modelId: this.modelConfig!.id,
      content: choice?.message?.content || '',
      finishReason: this.mapFinishReason(choice?.finish_reason),
      usage: {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        ...(cost !== undefined && { cost })
      },
      metadata: {
        latency: endTime - startTime,
        model: openaiResponse.model,
        provider: this.provider,
        timestamp: Date.now(),
        requestId: request.id,
        processingTime: endTime - startTime,
        cacheHit: false
      },
      toolCalls: choice?.message?.tool_calls?.map(toolCall => ({
        id: toolCall.id,
        toolName: toolCall.function.name,
        success: true,
        result: toolCall.function.arguments,
        executionTime: endTime - startTime
      })) || []
    };
  }

  private calculateCost(usage?: any, pricing?: ModelPricing): number | undefined {
    if (!usage || !pricing) return undefined;

    const inputCost = (usage.prompt_tokens / 1000) * pricing.inputTokensPer1K;
    const outputCost = (usage.completion_tokens / 1000) * pricing.outputTokensPer1K;

    return inputCost + outputCost;
  }
}

class AnthropicProvider implements IModelProvider {
  readonly provider: ModelProvider = 'anthropic';
  readonly capabilities: any = {};
  readonly status: 'active' | 'inactive' | 'error' = 'active';

  async initialize(config: ModelConfig): Promise<void> {}
  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    return {} as ModelResponse;
  }
  async processStreamingRequest(request: ModelRequest, onChunk: any): Promise<void> {}
  async healthCheck(): Promise<ModelHealthCheck> {
    return {} as ModelHealthCheck;
  }
  getCapabilities(): any {
    return this.capabilities;
  }
  validateConfig(config: ModelConfig): boolean {
    return true;
  }
  async cleanup(): Promise<void> {}
}

class GoogleProvider implements IModelProvider {
  readonly provider: ModelProvider = 'google';
  readonly capabilities: any = {};
  readonly status: 'active' | 'inactive' | 'error' = 'active';

  async initialize(config: ModelConfig): Promise<void> {}
  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    return {} as ModelResponse;
  }
  async processStreamingRequest(request: ModelRequest, onChunk: any): Promise<void> {}
  async healthCheck(): Promise<ModelHealthCheck> {
    return {} as ModelHealthCheck;
  }
  getCapabilities(): any {
    return this.capabilities;
  }
  validateConfig(config: ModelConfig): boolean {
    return true;
  }
  async cleanup(): Promise<void> {}
}

class AzureProvider implements IModelProvider {
  readonly provider: ModelProvider = 'azure';
  readonly capabilities: any = {};
  readonly status: 'active' | 'inactive' | 'error' = 'active';

  async initialize(config: ModelConfig): Promise<void> {}
  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    return {} as ModelResponse;
  }
  async processStreamingRequest(request: ModelRequest, onChunk: any): Promise<void> {}
  async healthCheck(): Promise<ModelHealthCheck> {
    return {} as ModelHealthCheck;
  }
  getCapabilities(): any {
    return this.capabilities;
  }
  validateConfig(config: ModelConfig): boolean {
    return true;
  }
  async cleanup(): Promise<void> {}
}

class LocalProvider implements IModelProvider {
  readonly provider: ModelProvider = 'local';
  readonly capabilities: any = {};
  readonly status: 'active' | 'inactive' | 'error' = 'active';

  async initialize(config: ModelConfig): Promise<void> {}
  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    return {} as ModelResponse;
  }
  async processStreamingRequest(request: ModelRequest, onChunk: any): Promise<void> {}
  async healthCheck(): Promise<ModelHealthCheck> {
    return {} as ModelHealthCheck;
  }
  getCapabilities(): any {
    return this.capabilities;
  }
  validateConfig(config: ModelConfig): boolean {
    return true;
  }
  async cleanup(): Promise<void> {}
}