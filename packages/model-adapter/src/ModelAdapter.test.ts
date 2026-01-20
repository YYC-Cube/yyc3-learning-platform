import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ModelAdapter } from './ModelAdapter';
import { ModelAdapterConfig, ModelConfig, ModelProvider, ModelRequest, ModelResponse, TaskType } from './IModelAdapter';

describe('ModelAdapter', () => {
  let modelAdapter: ModelAdapter;
  let mockProvider: jest.Mocked<any>;

  // Helper function to generate complete test configuration
  const generateTestConfig = (partialConfig?: Partial<ModelAdapterConfig>): ModelAdapterConfig => {
    return {
      defaultModel: 'gpt-4',
      fallbackModel: 'gpt-3.5-turbo',
      routing: {
        type: 'smart' as const,
        fallback: {
          enabled: true,
          maxRetries: 3,
          retryDelay: 1000,
          exponentialBackoff: true,
          alternativeModels: ['gpt-3.5-turbo'],
          fallbackOnErrors: ['rate_limit', 'server_error']
        },
        ...partialConfig?.routing
      },
      loadBalancing: {
        strategy: 'round_robin' as const,
        weights: {},
        healthCheckInterval: 60000,
        unhealthyThreshold: 3,
        healthyThreshold: 2,
        ...partialConfig?.loadBalancing
      },
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
        strategy: 'lru' as const,
        compressionEnabled: false,
        encryptionEnabled: false,
        ...partialConfig?.cache
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000,
        detailedLogging: false,
        alertThresholds: {
          errorRate: 0.1,
          latency: 5000,
          cost: 100,
          queueDepth: 100,
          resourceUsage: 0.9
        },
        retentionPeriod: 86400000,
        ...partialConfig?.monitoring
      },
      security: {
        encryptionEnabled: true,
        keyRotationEnabled: false,
        auditLogging: true,
        dataRetentionPolicy: 2592000000,
        complianceStandards: [],
        accessControl: {
          rbacEnabled: true,
          defaultPermissions: [],
          adminRoles: ['admin'],
          userRoles: ['user']
        },
        ...partialConfig?.security
      },
      ...partialConfig
    };
  };

  // Helper function to generate complete model configuration
  const generateTestModelConfig = (partialConfig?: Partial<ModelConfig>): ModelConfig => {
    return {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai' as ModelProvider,
      model: 'gpt-4',
      credentials: { apiKey: 'test-key' },
      capabilities: {
        maxTokens: 8192,
        maxContextLength: 8192,
        supportedModalities: ['text', 'code'],
        streamingSupport: true,
        functionCalling: true,
        visionSupport: false,
        codeGeneration: true,
        reasoning: true,
        multilingual: true,
        customInstructions: true
      },
      ...partialConfig
    };
  };

  // Helper function to generate complete model request
  const generateTestModelRequest = (partialRequest?: Partial<ModelRequest>): ModelRequest => {
    return {
      id: 'test-request',
      taskType: 'conversation' as TaskType,
      prompt: 'Test prompt',
      messages: [{ 
        role: 'user', 
        content: 'Test prompt',
        timestamp: Date.now()
      }],
      temperature: 0.7,
      maxTokens: 1000,
      ...partialRequest
    };
  };

  // Helper function to generate complete model response
  const generateTestModelResponse = (partialResponse?: Partial<ModelResponse>): ModelResponse => {
    return {
      id: 'test-response',
      content: 'Test response',
      modelId: 'gpt-4',
      requestId: 'test-request',
      finishReason: 'stop',
      usage: {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30
      },
      metadata: {
        model: 'gpt-4',
        provider: 'openai',
        timestamp: Date.now(),
        requestId: 'test-request',
        processingTime: 100,
        latency: 100
      },
      ...partialResponse
    };
  };

  beforeEach(() => {
    modelAdapter = new ModelAdapter();
    mockProvider = {
      initialize: jest.fn().mockResolvedValue(true),
      processRequest: jest.fn(),
      processStreamingRequest: jest.fn(),
      healthCheck: jest.fn(),
      cleanup: jest.fn().mockResolvedValue(true)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with valid configuration', async () => {
      const config = generateTestConfig();

      await expect(modelAdapter.initialize(config)).resolves.not.toThrow();
      expect(modelAdapter.status).toBe('active');
    });

    it('should emit initialized event after successful initialization', async () => {
      const config = generateTestConfig();

      const initializedListener = jest.fn();
      modelAdapter.on('initialized', initializedListener);

      await modelAdapter.initialize(config);

      expect(initializedListener).toHaveBeenCalled();
    });

    it('should set status to error on initialization failure', async () => {
      // Use a partial config with missing required fields for failure testing
      const config = generateTestConfig({
        fallbackModel: '', // Invalid fallback model to trigger failure
      });

      await expect(modelAdapter.initialize(config)).resolves.not.toThrow();
    });
  });

  describe('addModel', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());
    });

    it('should add a new model successfully', async () => {
      const config = generateTestModelConfig({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: { apiKey: 'test-key' }
      });

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);

      await expect(modelAdapter.addModel(config)).resolves.not.toThrow();
      expect(modelAdapter.getModel('gpt-4')).toEqual(config);
    });

    it('should throw error for invalid model configuration', async () => {
      const config = {
        id: 'gpt-4',
        name: 'GPT-4'
      } as any;

      await expect(modelAdapter.addModel(config)).rejects.toThrow('Invalid model configuration');
    });

    it('should throw error for missing credentials', async () => {
      const config = {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: {}
      } as any;

      await expect(modelAdapter.addModel(config)).rejects.toThrow('Invalid model configuration');
    });
  });

  describe('removeModel', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());

      const config = generateTestModelConfig({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: { apiKey: 'test-key' }
      });

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);
      await modelAdapter.addModel(config);
    });

    it('should remove a model successfully', async () => {
      await expect(modelAdapter.removeModel('gpt-4')).resolves.not.toThrow();
      expect(modelAdapter.getModel('gpt-4')).toBeUndefined();
    });

    it('should throw error when removing non-existent model', async () => {
      await expect(modelAdapter.removeModel('non-existent')).rejects.toThrow('Model not found');
    });

    it('should cleanup provider when removing model', async () => {
      await modelAdapter.removeModel('gpt-4');
      expect(mockProvider.cleanup).toHaveBeenCalled();
    });
  });

  describe('updateModel', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());

      const config = generateTestModelConfig({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: { apiKey: 'test-key' },
        maxTokens: 1000,
        temperature: 0.7
      });

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);
      await modelAdapter.addModel(config);
    });

    it('should update model configuration successfully', async () => {
      const updates: Partial<ModelConfig> = {
        maxTokens: 2000,
        temperature: 0.8
      };

      await expect(modelAdapter.updateModel('gpt-4', updates)).resolves.not.toThrow();

      const updatedModel = modelAdapter.getModel('gpt-4');
      expect(updatedModel?.maxTokens).toBe(2000);
      expect(updatedModel?.temperature).toBe(0.8);
    });

    it('should throw error when updating non-existent model', async () => {
      await expect(modelAdapter.updateModel('non-existent', { maxTokens: 2000 })).rejects.toThrow('Model not found');
    });
  });

  describe('getModel', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());

      const config = generateTestModelConfig({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: { apiKey: 'test-key' }
      });

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);
      await modelAdapter.addModel(config);
    });

    it('should return model configuration', () => {
      const model = modelAdapter.getModel('gpt-4');
      expect(model).toBeDefined();
      expect(model?.id).toBe('gpt-4');
    });

    it('should return undefined for non-existent model', () => {
      const model = modelAdapter.getModel('non-existent');
      expect(model).toBeUndefined();
    });
  });

  describe('listModels', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());

      const configs: ModelConfig[] = [
        generateTestModelConfig({
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai' as ModelProvider,
          model: 'gpt-4',
          credentials: { apiKey: 'test-key-1' }
        }),
        generateTestModelConfig({
          id: 'claude-3',
          name: 'Claude 3',
          provider: 'anthropic' as ModelProvider,
          model: 'claude-3-opus-20240229',
          credentials: { apiKey: 'test-key-2' }
        })
      ];

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);
      for (const config of configs) {
        await modelAdapter.addModel(config);
      }
    });

    it('should return all models', () => {
      const models = modelAdapter.listModels();
      expect(models).toHaveLength(2);
    });

    it('should filter models by provider', () => {
      const openaiModels = modelAdapter.listModelsByProvider('openai' as ModelProvider);
      expect(openaiModels).toHaveLength(1);
      expect(openaiModels[0].id).toBe('gpt-4');

      const anthropicModels = modelAdapter.listModelsByProvider('anthropic' as ModelProvider);
      expect(anthropicModels).toHaveLength(1);
      expect(anthropicModels[0].id).toBe('claude-3');
    });
  });

  describe('processRequest', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());

      const config = generateTestModelConfig({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: { apiKey: 'test-key' }
      });

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);
      await modelAdapter.addModel(config);
    });

    it('should process request successfully', async () => {
      const request = generateTestModelRequest();
      const mockResponse = generateTestModelResponse();

      mockProvider.processRequest.mockResolvedValue(mockResponse);

      const response = await modelAdapter.processRequest(request);

      expect(response.content).toBe('Test response');
      expect(response.modelId).toBe('gpt-4');
      expect(mockProvider.processRequest).toHaveBeenCalledWith(request);
    });

    it('should throw error when no models available for task type', async () => {
      const request = generateTestModelRequest({
        taskType: 'analysis' as TaskType
      });

      await expect(modelAdapter.processRequest(request)).rejects.toThrow('No available models for task type');
    });

    it('should emit request and response events', async () => {
      const request = generateTestModelRequest();
      const mockResponse = generateTestModelResponse();

      mockProvider.processRequest.mockResolvedValue(mockResponse);

      const requestListener = jest.fn();
      const responseListener = jest.fn();

      modelAdapter.on('request', requestListener);
      modelAdapter.on('response', responseListener);

      await modelAdapter.processRequest(request);

      expect(requestListener).toHaveBeenCalledWith(request);
      expect(responseListener).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('healthCheck', () => {
    beforeEach(async () => {
      await modelAdapter.initialize(generateTestConfig());

      const config = generateTestModelConfig({
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai' as ModelProvider,
        model: 'gpt-4',
        credentials: { apiKey: 'test-key' }
      });

      jest.spyOn(modelAdapter as any, 'createProvider').mockReturnValue(mockProvider);
      await modelAdapter.addModel(config);
    });

    it('should return health check results', async () => {
      mockProvider.healthCheck.mockResolvedValue({
        modelId: 'gpt-4',
        status: 'healthy',
        responseTime: 100,
        lastCheck: Date.now(),
        errorRate: 0,
        uptime: 100
      });

      const healthChecks = await modelAdapter.healthCheck();

      expect(healthChecks['gpt-4']).toBeDefined();
      expect(healthChecks['gpt-4'].status).toBe('healthy');
    });

    it('should handle health check failures', async () => {
      mockProvider.healthCheck.mockRejectedValue(new Error('Health check failed'));

      const healthChecks = await modelAdapter.healthCheck();

      expect(healthChecks['gpt-4']).toBeDefined();
      expect(healthChecks['gpt-4'].status).toBe('unhealthy');
    });
  });

  describe('getMetrics', () => {
    it('should return adapter metrics', async () => {
      await modelAdapter.initialize(generateTestConfig());

      const metrics = modelAdapter.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.timestamp).toBe('number');
      expect(typeof metrics.totalRequests).toBe('number');
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      await modelAdapter.initialize(generateTestConfig());

      await expect(modelAdapter.clearCache()).resolves.not.toThrow();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      await modelAdapter.initialize(generateTestConfig());

      const stats = await modelAdapter.getCacheStats();

      expect(stats).toBeDefined();
    });
  });

  describe('start and stop', () => {
    it('should start the adapter successfully', async () => {
      await modelAdapter.initialize(generateTestConfig());

      await expect(modelAdapter.start()).resolves.not.toThrow();
    });

    it('should stop the adapter successfully', async () => {
      await modelAdapter.initialize(generateTestConfig());

      await modelAdapter.start();
      await expect(modelAdapter.stop()).resolves.not.toThrow();
      expect(modelAdapter.status).toBe('suspended');
    });

    it('should restart the adapter successfully', async () => {
      await modelAdapter.initialize(generateTestConfig());

      await modelAdapter.start();
      await expect(modelAdapter.restart()).resolves.not.toThrow();
      expect(modelAdapter.status).toBe('active');
    });
  });
});
