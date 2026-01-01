/**
 * AI提供商类型定义
 */

// 基础接口
export interface IChatProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
  getAvailableModels(): ModelInfo[];
  getModelMetrics?(modelName: string): ModelMetrics | undefined;
  cleanup?(): Promise<void>;
}

// 请求和响应接口
export interface ChatRequest {
  messages?: Array<{role: string; content: string}>;
  content?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  seed?: number;
  scenario?: string;
  priority?: string;
  costBudget?: string;
  requiresReasoning?: boolean;
  requiresCreativity?: boolean;
  requiresDataAnalysis?: boolean;
  context?: any;
  fallback?: boolean;
  fallbackFrom?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  confidence?: number;
  metadata?: any;
}

// 模型信息接口
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  capabilities: string[];
  contextWindow: number;
  inputCost: number;  // 每千tokens成本
  outputCost: number; // 每千tokens成本
  maxTokens: number;
  metrics: ModelMetrics;
  metadata?: {
    parameterSize?: string;
    quantization?: string;
    family?: string;
    size?: number;
    modified?: string;
  };
}

// 模型指标接口
export interface ModelMetrics {
  requests: number;
  errors: number;
  avgResponseTime: number; // 毫秒
  totalTokens: number;
  totalCost: number;
  lastUsed: Date | null;
  successRate: number; // 0-1之间
}

// 事件接口
export interface ProviderEvent {
  type: 'initialized' | 'response' | 'error' | 'metrics_updated';
  data: any;
  timestamp: Date;
}