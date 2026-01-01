/**
 * Ollama本地模型提供器
 * 支持本地部署的开源模型，提供成本优化和隐私保护
 */

import { EventEmitter } from 'events';
import { type IChatProvider, type ChatRequest, type ChatResponse, type ModelInfo, type ModelMetrics } from '../types/ai-providers';
import { createLogger } from '../utils/logger';

const logger = createLogger('OllamaProvider');

// Ollama API 接口定义
interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    num_predict?: number;
    seed?: number;
  };
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaConfig {
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  defaultModels?: {
    chat: string;
    code: string;
    analysis: string;
    reasoning: string;
  };
}

/**
 * Ollama本地模型提供器
 */
export class OllamaProvider extends EventEmitter implements IChatProvider {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly defaultModels: Record<string, string>;

  private models: Map<string, OllamaModel> = new Map();
  private metrics: Map<string, ModelMetrics> = new Map();
  private isInitialized = false;

  constructor(config: OllamaConfig = {}) {
    super();

    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.timeout = config.timeout || 120000; // 2分钟超时（性能优化）
    this.retryAttempts = config.retryAttempts || 2; // 减少重试次数，避免无限等待
    this.retryDelay = config.retryDelay || 5000; // 增加重试间隔

    // 根据可用模型设置默认模型（性能优化版本）
    this.defaultModels = config.defaultModels || {
      chat: 'llama3.2:1b',                      // 对话使用1B模型（最快响应）
      code: 'qwen2.5-coder:1.5b',              // 代码生成使用1.5B模型（专业）
      analysis: 'llama3.2:1b',                  // 分析使用1B模型（轻量）
      reasoning: 'qwen2.5-coder:1.5b',          // 复杂推理使用1.5B模型（平衡）
      fallback: 'llama3.2:1b'                 // 降级使用最快模型
    };
  }

  /**
   * 初始化Ollama提供器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 检查Ollama服务可用性
      await this.checkHealth();

      // 获取可用模型列表
      await this.loadModels();

      // 初始化指标
      this.initializeMetrics();

      this.isInitialized = true;
      this.emit('initialized');

    } catch (error) {
      logger.error('Failed to initialize Ollama Provider', error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  private async checkHealth(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Ollama service not available: ${error.message}`);
    }
  }

  /**
   * 加载可用模型
   */
  private async loadModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();

      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid response from Ollama API');
      }

      this.models.clear();

      for (const model of data.models) {
        this.models.set(model.name, model);

        // 更新模型信息映射
        this.updateModelMetrics(model.name);
      }

    } catch (error) {
      throw new Error(`Failed to load Ollama models: ${error.message}`);
    }
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): void {
    for (const modelName of Array.from(this.models.keys())) {
      this.updateModelMetrics(modelName);
    }
  }

  /**
   * 更新模型指标
   */
  private updateModelMetrics(modelName: string): void {
    const model = this.models.get(modelName);
    if (!model) return;

    const existingMetrics = this.metrics.get(modelName);

    this.metrics.set(modelName, {
      requests: existingMetrics?.requests || 0,
      errors: existingMetrics?.errors || 0,
      avgResponseTime: existingMetrics?.avgResponseTime || 0,
      totalTokens: existingMetrics?.totalTokens || 0,
      totalCost: 0, // 本地模型无API成本
      lastUsed: existingMetrics?.lastUsed || null,
      successRate: existingMetrics?.successRate || 1.0
    });
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): ModelInfo[] {
    const models: ModelInfo[] = [];

    for (const [name, model] of Array.from(this.models.entries())) {
      const metrics = this.metrics.get(name);

      // 根据模型特征确定用途
      const capabilities = this.getModelCapabilities(name);

      models.push({
        id: name,
        name: this.getDisplayName(name),
        description: this.getModelDescription(name),
        provider: 'ollama',
        capabilities,
        contextWindow: this.getContextWindow(model),
        inputCost: 0, // 本地模型免费
        outputCost: 0, // 本地模型免费
        maxTokens: this.getMaxTokens(model),
        metrics: metrics || {
          requests: 0,
          errors: 0,
          avgResponseTime: 0,
          totalTokens: 0,
          totalCost: 0,
          lastUsed: null,
          successRate: 1.0
        },
        metadata: {
          parameterSize: model.details.parameter_size,
          quantization: model.details.quantization_level,
          family: model.details.family,
          size: model.size,
          modified: model.modified_at
        }
      });
    }

    return models;
  }

  /**
   * 获取模型能力
   */
  private getModelCapabilities(modelName: string): string[] {
    const capabilities: string[] = ['text'];

    if (modelName.includes('coder')) {
      capabilities.push('code', 'analysis', 'reasoning');
    }

    if (modelName.includes('instruct') || modelName.includes('chat')) {
      capabilities.push('chat', 'instruction-following');
    }

    if (modelName.includes('33b') || modelName.includes('30b')) {
      capabilities.push('complex-reasoning');
    }

    if (modelName.includes('1b') || modelName.includes('1.5b')) {
      capabilities.push('fast-inference');
    }

    return capabilities;
  }

  /**
   * 获取显示名称
   */
  private getDisplayName(modelName: string): string {
    const nameMap: Record<string, string> = {
      'deepseek-coder:33b': 'DeepSeek Coder 33B',
      'llama3.2:3b-instruct-q4_K_M': 'Llama 3.2 3B Instruct',
      'qwen3-coder:30b': 'Qwen3 Coder 30B',
      'qwen2.5-coder:1.5b': 'Qwen2.5 Coder 1.5B',
      'llama3.2:1b': 'Llama 3.2 1B'
    };

    return nameMap[modelName] || modelName;
  }

  /**
   * 获取模型描述
   */
  private getModelDescription(modelName: string): string {
    const descriptions: Record<string, string> = {
      'deepseek-coder:33b': '强大的33B参数代码生成模型，适合复杂编程任务',
      'llama3.2:3b-instruct-q4_K_M': '轻量级3B对话模型，适合基础对话和指令跟随',
      'qwen3-coder:30b': '专业30B编程模型，精通多种编程语言和框架',
      'qwen2.5-coder:1.5b': '超轻量级1.5B代码模型，快速响应基础编程需求',
      'llama3.2:1b': '迷你1B模型，极快响应速度，适合简单任务'
    };

    return descriptions[modelName] || `本地模型: ${modelName}`;
  }

  /**
   * 获取上下文窗口大小
   */
  private getContextWindow(model: OllamaModel): number {
    // 根据模型家族确定上下文窗口
    const family = model.details.family.toLowerCase();

    if (family.includes('llama')) {
      return family.includes('3') ? 8192 : 4096;
    } else if (family.includes('qwen')) {
      return model.details.parameter_size.includes('30') || model.details.parameter_size.includes('33') ? 8192 : 4096;
    } else if (family.includes('deepseek')) {
      return 8192;
    }

    return 4096; // 默认值
  }

  /**
   * 获取最大token数
   */
  private getMaxTokens(model: OllamaModel): number {
    const contextWindow = this.getContextWindow(model);
    return Math.floor(contextWindow * 0.75); // 保留25%给响应
  }

  /**
   * 聊天接口实现
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const modelName = request.model || this.selectBestModel(request);

    try {
      // 更新请求指标
      this.updateRequestMetrics(modelName, 'request');

      // 调用Ollama API
      const response = await this.callOllamaAPI(modelName, request);

      const responseTime = Date.now() - startTime;

      // 更新成功指标
      this.updateRequestMetrics(modelName, 'success', responseTime);

      const chatResponse: ChatResponse = {
        content: response.response,
        model: modelName,
        usage: {
          promptTokens: response.prompt_eval_count || 0,
          completionTokens: response.eval_count || 0,
          totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
        },
        finishReason: response.done ? 'stop' : 'length',
        metadata: {
          provider: 'ollama',
          responseTime,
          loadDuration: response.load_duration,
          evalDuration: response.eval_duration,
          totalDuration: response.total_duration
        }
      };

      this.emit('response', chatResponse);
      return chatResponse;

    } catch (error) {
      // 更新错误指标
      this.updateRequestMetrics(modelName, 'error');

      this.emit('error', { model: modelName, error });
      throw error;
    }
  }

  /**
   * 选择最佳模型
   */
  private selectBestModel(request: ChatRequest): string {
    // 基于请求内容和历史选择合适的模型
    const content = request.messages?.[request.messages.length - 1]?.content?.toLowerCase() || '';

    // 代码相关任务
    if (content.includes('code') || content.includes('programming') || content.includes('debug')) {
      return this.defaultModels.code;
    }

    // 复杂推理任务
    if (content.length > 1000 || content.includes('analyze') || content.includes('complex')) {
      return this.defaultModels.reasoning;
    }

    // 简单分析任务
    if (content.includes('simple') || content.includes('quick')) {
      return this.defaultModels.analysis;
    }

    // 默认对话模型
    return this.defaultModels.chat;
  }

  /**
   * 调用Ollama API (with intelligent fallback)
   */
  private async callOllamaAPI(modelName: string, request: ChatRequest): Promise<OllamaGenerateResponse> {
    // 构建prompt
    const prompt = this.buildPrompt(request.messages || []);

    // 智能降级策略：优先使用指定模型，失败时降级到快速模型
    const modelsToTry = [modelName];

    // 如果不是最快的模型，添加快速模型作为降级选项
    if (modelName !== this.defaultModels.fallback) {
      modelsToTry.push(this.defaultModels.fallback);
    }

    let lastError: Error;

    for (const modelToUse of modelsToTry) {
      const ollamaRequest: OllamaGenerateRequest = {
        model: modelToUse,
        prompt,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          top_p: request.topP || 0.9,
          num_predict: request.maxTokens || 2048,
          ...(request.seed !== undefined && { seed: request.seed })
        }
      };

      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        try {
          const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ollamaRequest),
            signal: AbortSignal.timeout(this.timeout)
          });

          if (!response.ok) {
            throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`);
          }

          const data: OllamaGenerateResponse = await response.json();

          if (!data.response) {
            throw new Error('Invalid response from Ollama API');
          }

          return data;

        } catch (error) {
          lastError = error;

          if (attempt < this.retryAttempts - 1) {
            logger.warn(`Ollama request failed for model ${modelToUse} (attempt ${attempt + 1}/${this.retryAttempts}), retrying...`, error);
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
          }
        }
      }

      logger.warn(`Model ${modelToUse} failed after ${this.retryAttempts} attempts, trying next model...`);
    }

    throw new Error(`All Ollama models failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * 构建prompt
   */
  private buildPrompt(messages: Array<{role: string; content: string}>): string {
    if (messages.length === 0) {
      return '';
    }

    // 简单的prompt构建，可以根据需要优化
    let prompt = '';

    for (const message of messages) {
      const rolePrefix = message.role === 'system' ? 'System:' :
                        message.role === 'user' ? 'User:' :
                        message.role === 'assistant' ? 'Assistant:' :
                        'User:';

      prompt += `${rolePrefix} ${message.content}\n\n`;
    }

    prompt += 'Assistant:';

    return prompt;
  }

  /**
   * 更新请求指标
   */
  private updateRequestMetrics(modelName: string, type: 'request' | 'success' | 'error', responseTime?: number): void {
    const metrics = this.metrics.get(modelName);
    if (!metrics) return;

    if (type === 'request') {
      metrics.requests++;
    } else if (type === 'success') {
      if (responseTime) {
        // 计算平均响应时间
        const totalRequests = metrics.requests || 1;
        metrics.avgResponseTime = (metrics.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
      }
      metrics.lastUsed = new Date();
    } else if (type === 'error') {
      metrics.errors++;
    }

    // 计算成功率
    metrics.successRate = metrics.requests > 0 ?
      (metrics.requests - metrics.errors) / metrics.requests : 1.0;
  }

  /**
   * 获取模型指标
   */
  getModelMetrics(modelName: string): ModelMetrics | undefined {
    return this.metrics.get(modelName);
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    this.models.clear();
    this.metrics.clear();
    this.isInitialized = false;

    this.removeAllListeners();
  }
}

/**
 * 创建Ollama提供器实例的工厂函数
 */
export function createOllamaProvider(config?: OllamaConfig): OllamaProvider {
  return new OllamaProvider(config);
}