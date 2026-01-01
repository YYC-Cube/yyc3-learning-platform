/**
 * YYC³ ModelAdapter Package Entry Point
 * 智能模型适配器包入口文件
 *
 * Exports all ModelAdapter interfaces and implementations
 * 导出所有模型适配器接口和实现
 */

// Import all interfaces and types first
import type {
  ModelCredentials,
  ModelConfig,
  ModelCapabilities,
  ModelLimits,
  ModelPricing,
  ModelProvider,
  TaskType,
  ModelRequest,
  ChatMessage,
  ContentBlock,
  ToolCall,
  ToolChoice,
  MessageMetadata,
  RequestMetadata,
  RequestExecutionContext,
  UserPreferences,
  SystemState,
  ToolDefinition,
  ResourceConstraints,
  ModelResponse,
  FinishReason,
  TokenUsage,
  ResponseMetadata,
  SafetyRating,
  ToolCallResult,
  ModelHealthCheck,
  HealthMetrics,
  RoutingStrategy,
  RoutingRule,
  RoutingCondition,
  RoutingAction,
  FallbackStrategy,
  LoadBalancingConfig,
  CacheConfig,
  MonitoringConfig,
  AlertThresholds,
  ModelAdapterConfig,
  SecurityConfig,
  ComplianceStandard,
  AccessControlConfig,
  ModelMetrics,
  ProviderMetrics,
  AdapterMetrics,
  ErrorAnalysis,
  ErrorEvent,
  Modality,
  IModelAdapter,
  IModelProvider,
  IModelRouter,
  IModelCache,
  IModelMonitor,
  ModelSelectionCriteria,
  ModelBenchmark,
  ModelRecommendation,
  BatchRequest,
  BatchResponse,
  RoutingMetrics,
  CacheStats,
  TimeRange,
  MonitoringReport,
  ReportSummary,
  ModelReport,
  ProviderReport,
  PerformanceAnalysis,
  LatencyAnalysis,
  ThroughputAnalysis,
  CostAnalysis,
  ReliabilityAnalysis,
  Alert
} from './IModelAdapter.js';

// Import the main implementation
import { ModelAdapter } from './ModelAdapter.js';

// Import provider implementations
import { OpenAIProvider } from './OpenAIProvider.js';
import { GoogleProvider } from './GoogleProvider.js';

// Import core components
import { IntelligentCacheLayer, CacheConfig as IntelligentCacheConfig } from './core/IntelligentCacheLayer.js';
import { EnhancedStreamingProcessor, StreamingConfig } from './core/EnhancedStreamingProcessor.js';

// Re-export all types
export type {
  ModelCredentials,
  ModelConfig,
  ModelCapabilities,
  ModelLimits,
  ModelPricing,
  ModelProvider,
  TaskType,
  ModelRequest,
  ChatMessage,
  ContentBlock,
  ToolCall,
  ToolChoice,
  MessageMetadata,
  RequestMetadata,
  RequestExecutionContext,
  UserPreferences,
  SystemState,
  ToolDefinition,
  ResourceConstraints,
  ModelResponse,
  FinishReason,
  TokenUsage,
  ResponseMetadata,
  SafetyRating,
  ToolCallResult,
  ModelHealthCheck,
  HealthMetrics,
  RoutingStrategy,
  RoutingRule,
  RoutingCondition,
  RoutingAction,
  FallbackStrategy,
  LoadBalancingConfig,
  CacheConfig,
  MonitoringConfig,
  AlertThresholds,
  ModelAdapterConfig,
  SecurityConfig,
  ComplianceStandard,
  AccessControlConfig,
  ModelMetrics,
  ProviderMetrics,
  AdapterMetrics,
  ErrorAnalysis,
  ErrorEvent,
  Modality,
  IModelAdapter,
  IModelProvider,
  IModelRouter,
  IModelCache,
  IModelMonitor,
  ModelSelectionCriteria,
  ModelBenchmark,
  ModelRecommendation,
  BatchRequest,
  BatchResponse,
  RoutingMetrics,
  CacheStats,
  TimeRange,
  MonitoringReport,
  ReportSummary,
  ModelReport,
  ProviderReport,
  PerformanceAnalysis,
  LatencyAnalysis,
  ThroughputAnalysis,
  CostAnalysis,
  ReliabilityAnalysis,
  Alert
};

// Main implementation
export { ModelAdapter };

// Provider implementations
export { OpenAIProvider };
export { GoogleProvider };

// Core components
export { IntelligentCacheLayer };
export { EnhancedStreamingProcessor };

// Re-export cache types
export type {
  CacheLevel,
  CacheStrategy,
  CacheMetadata,
  CacheResult,
  CacheGetOptions,
  CacheSetOptions,
  CacheStats,
  WarmupPattern,
  WarmupReport,
  EvictionResult,
  ConsistencyCheck,
  CacheConfig,
  CachePerformanceReport
};

// Re-export streaming types
export type {
  StreamingConfig,
  StreamingMetrics,
  StreamBuffer,
  PrefetchContext,
  StreamPerformanceReport
};

// Package version
export const VERSION = '1.0.0';

/**
 * Create a new ModelAdapter instance
 * 创建新的模型适配器实例
 */
export function createModelAdapter(): ModelAdapter {
  return new ModelAdapter();
}

/**
 * Default configuration for ModelAdapter
 * 模型适配器默认配置
 */
export const DEFAULT_MODEL_ADAPTER_CONFIG: ModelAdapterConfig = {
  defaultModel: 'gpt-4',
  fallbackModel: 'gpt-3.5-turbo',
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
    ttl: 300000, // 5 minutes
    maxSize: 1000,
    strategy: 'lru',
    compressionEnabled: true,
    encryptionEnabled: false
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60000, // 1 minute
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
    dataRetentionPolicy: 2592000000, // 30 days
    complianceStandards: [],
    accessControl: {
      rbacEnabled: false,
      defaultPermissions: [],
      adminRoles: ['admin'],
      userRoles: ['user']
    }
  }
};

/**
 * Model provider presets
 * 模型提供商预设
 */
export const MODEL_PRESETS = {
  openai: {
    gpt4: {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai' as ModelProvider,
      model: 'gpt-4',
      capabilities: {
        maxTokens: 8192,
        maxContextLength: 128000,
        supportedModalities: ['text', 'code'],
        streamingSupport: true,
        functionCalling: true,
        visionSupport: false,
        codeGeneration: true,
        reasoning: true,
        multilingual: true,
        customInstructions: true
      }
    },
    gpt35: {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai' as ModelProvider,
      model: 'gpt-3.5-turbo',
      capabilities: {
        maxTokens: 4096,
        maxContextLength: 16385,
        supportedModalities: ['text', 'code'],
        streamingSupport: true,
        functionCalling: true,
        visionSupport: false,
        codeGeneration: true,
        reasoning: true,
        multilingual: true,
        customInstructions: true
      }
    }
  },
  anthropic: {
    claude3: {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic' as ModelProvider,
      model: 'claude-3-opus-20240229',
      capabilities: {
        maxTokens: 4096,
        maxContextLength: 200000,
        supportedModalities: ['text', 'image'],
        streamingSupport: true,
        functionCalling: true,
        visionSupport: true,
        codeGeneration: true,
        reasoning: true,
        multilingual: true,
        customInstructions: true
      }
    }
  },
  google: {
    gemini: {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google' as ModelProvider,
      model: 'gemini-pro',
      capabilities: {
        maxTokens: 8192,
        maxContextLength: 32768,
        supportedModalities: ['text', 'image'],
        streamingSupport: true,
        functionCalling: true,
        visionSupport: true,
        codeGeneration: true,
        reasoning: true,
        multilingual: true,
        customInstructions: true
      }
    }
  }
};

/**
 * Utility functions
 * 工具函数
 */

/**
 * Create a basic model request
 * 创建基础模型请求
 */
export function createModelRequest(
  taskType: TaskType,
  prompt: string,
  options: Partial<ModelRequest> = {}
): ModelRequest {
  return {
    id: generateId(),
    taskType,
    prompt,
    temperature: 0.7,
    maxTokens: 1000,
    stream: false,
    metadata: {
      requestId: generateId(),
      priority: 'normal',
      tags: []
    },
    ...options
  };
}

/**
 * Generate a unique ID
 * 生成唯一ID
 */
export function generateId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Estimate token count for text
 * 估算文本的token数量
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost for a model usage
 * 计算模型使用成本
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  pricing: ModelPricing
): number {
  const inputCost = (inputTokens / 1000) * pricing.inputTokensPer1K;
  const outputCost = (outputTokens / 1000) * pricing.outputTokensPer1K;
  return inputCost + outputCost;
}

/**
 * Validate model configuration
 * 验证模型配置
 */
export function validateModelConfig(config: Partial<ModelConfig>): string[] {
  const errors: string[] = [];

  if (!config.id) errors.push('Model ID is required');
  if (!config.name) errors.push('Model name is required');
  if (!config.provider) errors.push('Model provider is required');
  if (!config.model) errors.push('Model name is required');
  if (!config.credentials?.apiKey) errors.push('API key is required');
  if (!config.capabilities) errors.push('Model capabilities are required');

  return errors;
}

/**
 * Select best model for task type
 * 为任务类型选择最佳模型
 */
export function selectBestModelForTask(
  taskType: TaskType,
  availableModels: ModelConfig[]
): ModelConfig | null {
  if (availableModels.length === 0) return null;

  // Simple selection logic - can be enhanced with more sophisticated algorithms
  const preferences: Record<TaskType, string[]> = {
    conversation: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    analysis: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    generation: ['gpt-4', 'claude-3-opus', 'gpt-3.5-turbo'],
    summarization: ['claude-3-opus', 'gpt-4', 'gemini-pro'],
    translation: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    classification: ['gpt-4', 'claude-3-opus', 'gpt-3.5-turbo'],
    extraction: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    code: ['gpt-4', 'claude-3-opus', 'gpt-3.5-turbo'],
    reasoning: ['gpt-4', 'claude-3-opus', 'gemini-pro'],
    creative: ['gpt-4', 'claude-3-opus', 'gemini-pro']
  };

  const preferredOrder = preferences[taskType] || preferences.conversation;

  for (const preferredModel of preferredOrder) {
    const model = availableModels.find(m => m.model === preferredModel);
    if (model) return model;
  }

  // Fallback to first available model
  return availableModels[0] || null;
}

/**
 * Format latency for display
 * 格式化延迟用于显示
 */
export function formatLatency(latencyMs: number): string {
  if (latencyMs < 1000) {
    return `${latencyMs}ms`;
  } else if (latencyMs < 60000) {
    return `${(latencyMs / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(latencyMs / 60000);
    const seconds = ((latencyMs % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Format cost for display
 * 格式化成本用于显示
 */
export function formatCost(cost: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  }).format(cost);
}

/**
 * Check if model supports specific capability
 * 检查模型是否支持特定功能
 */
export function modelSupportsCapability(
  model: ModelConfig,
  capability: keyof ModelCapabilities
): boolean {
  return Boolean(model.capabilities?.[capability]);
}

/**
 * Get model capabilities as string array
 * 获取模型功能作为字符串数组
 */
export function getModelCapabilityNames(capabilities: ModelCapabilities): string[] {
  const capabilityNames: (keyof ModelCapabilities)[] = [
    'streamingSupport',
    'functionCalling',
    'visionSupport',
    'codeGeneration',
    'reasoning',
    'multilingual',
    'customInstructions'
  ];

  return capabilityNames.filter(name => capabilities[name]) as string[];
}

/**
 * Create error response for failed request
 * 为失败的请求创建错误响应
 */
export function createErrorResponse(
  requestId: string,
  modelId: string,
  error: Error
): ModelResponse {
  return {
    id: generateId(),
    requestId,
    modelId,
    content: `Error: ${error.message}`,
    finishReason: 'error',
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0
    },
    metadata: {
      latency: 0,
      model: modelId,
      provider: 'unknown' as ModelProvider,
      timestamp: Date.now(),
      requestId,
      processingTime: 0,
      retryCount: 0,
      cacheHit: false,
      confidence: 0
    }
  };
}