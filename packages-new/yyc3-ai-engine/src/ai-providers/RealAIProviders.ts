import { EventEmitter } from 'events';
import type { ChatRequest, ChatResponse, ModelMetrics } from '../types/ai-providers';
import { createLogger } from '../utils/logger';
import { OllamaConfig, OllamaProvider } from './OllamaProvider';

const logger = createLogger('RealAIProviders');

// 真实AI提供商接口
export interface RealAIProvider {
  name: string;
  type: 'openai' | 'claude' | 'ollama';
  chat(request: ChatRequest): Promise<ChatResponse>;
  analyze(request: AnalysisRequest): Promise<AnalysisResponse>;
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  recommend(request: RecommendationRequest): Promise<RecommendationResponse>;
  getMetrics(): ModelMetrics;
  isAvailable(): boolean;
  validateConnection(): Promise<void>;
  healthCheck(): Promise<void>;
}

// 请求和响应类型定义
export interface AnalysisRequest {
  type: string;
  data: any;
  context?: any;
}

export interface AnalysisResponse {
  result: any;
  confidence: number;
  insights?: string[];
}

export interface GenerationRequest {
  type: string;
  prompt: string;
  data?: any;
  parameters?: any;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationResponse {
  content: string;
  metadata?: any;
}

export interface RecommendationRequest {
  type: string;
  context: any;
  preferences?: any;
}

export interface RecommendationResponse {
  recommendations: any[];
  reasoning?: string;
}

// AI提供商配置
export interface AIProviderConfig {
  providers: {
    openai?: {
      apiKey: string;
      baseURL?: string;
      models: string[];
    };
    claude?: {
      apiKey: string;
      baseURL?: string;
      models: string[];
    };
    ollama?: {
      baseURL: string;
      models: string[];
      enabled?: boolean;
      timeout?: number;
      retryAttempts?: number;
      defaultModels?: {
        chat?: string;
        code?: string;
        analysis?: string;
        reasoning?: string;
      };
    };
  };
  costLimits: CostLimits;
  routingStrategy: 'round-robin' | 'least-cost' | 'best-performance';
  fallbackEnabled: boolean;
}

// 成本限制配置
export interface CostLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perRequestLimit: number;
  currentCost?: number;
}

// 定价信息
export interface Pricing {
  input: number;
  output: number;
}

// 使用记录
export interface UsageRecord {
  provider: string;
  requestType: string;
  duration: number;
  tokens: number;
  cost: number;
  timestamp: Date;
}

// 扩展的ChatRequest接口
export interface ExtendedChatRequest extends ChatRequest {
  systemPrompt?: string;
  frequencyPenalty?: number;
  presencePenalty?: number;
  optimizedPrompt?: string;
  confidence?: number;
}

// OpenAI配置
export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
}

// Claude配置
export interface ClaudeConfig {
  apiKey: string;
}

// 真实AI提供商管理器
export class RealAIProvidersManager extends EventEmitter {
  private providers: Map<string, RealAIProvider> = new Map();
  private router: AIProviderRouter;
  private monitor: AIUsageMonitor;
  private costOptimizer: AICostOptimizer;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: AIProviderConfig) {
    super();
    this.router = new AIProviderRouter();
    this.monitor = new AIUsageMonitor();
    this.costOptimizer = new AICostOptimizer(config.costLimits);
    // 异步初始化，存储Promise以便等待
    this.initializationPromise = this.initializeProviders(config);
  }

  /**
   * 等待所有提供器初始化完成
   */
  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  private async initializeProviders(config: AIProviderConfig): Promise<void> {
    // 初始化OpenAI提供商
    if (config.providers.openai?.apiKey) {
      const openaiProvider = new OpenAIRealProvider(config.providers.openai);
      await openaiProvider.validateConnection();
      this.providers.set('openai', openaiProvider);
    }

    // 初始化Claude提供商
    if (config.providers.claude?.apiKey) {
      const claudeProvider = new ClaudeRealProvider(config.providers.claude);
      await claudeProvider.validateConnection();
      this.providers.set('claude', claudeProvider);
    }

    // 初始化Ollama本地模型提供商
    if (config.providers.ollama) {
      const ollamaConfig = {
        baseUrl: config.providers.ollama.baseURL,
        models: config.providers.ollama.models
      };
      const ollamaAdapter = new OllamaProviderAdapter(ollamaConfig);
      await ollamaAdapter.validateConnection();
      this.providers.set('ollama', ollamaAdapter);
    }
  }

  // 智能聊天接口
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // 智能路由选择最佳提供商
      const provider = await this.router.selectProvider(request, this.providers);

      // 预处理请求
      const processedRequest = await this.preprocessRequest(request);

      // 执行AI调用
      const response = await provider.chat(processedRequest);

      // 后处理响应
      const processedResponse = await this.postprocessResponse(response);

      // 记录使用情况
      const usage: UsageRecord = {
        provider: provider.name,
        requestType: 'chat',
        duration: Date.now() - startTime,
        tokens: this.estimateTokens(request),
        cost: await this.costOptimizer.calculateCost(provider.name, request, response),
        timestamp: new Date()
      };

      this.monitor.recordUsage(usage);

      return processedResponse;

    } catch (error) {
      logger.error('AI聊天失败', error);

      const fallbackProvider = await this.router.selectFallbackProvider(request, this.providers);
      if (fallbackProvider) {
        return await this.chat({
          ...request,
          fallback: true
        });
      }

      throw new Error(`AI聊天失败，无可用的备用提供商: ${error.message}`);
    }
  }

  // 分析接口
  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const provider = await this.router.selectProvider(request, this.providers);
    return await provider.analyze(request);
  }

  // 生成接口
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const provider = await this.router.selectProvider(request, this.providers);
    return await provider.generate(request);
  }

  // 推荐接口
  async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
    const provider = await this.router.selectProvider(request, this.providers);
    return await provider.recommend(request);
  }

  // 预处理请求
  private async preprocessRequest(request: ChatRequest): Promise<ExtendedChatRequest> {
    return {
      ...request,
      // 添加企业上下文
      context: {
        ...request.context,
        enterprise: {
          timestamp: new Date(),
          requestId: `req_${Date.now()}`,
          session: this.generateSessionId()
        }
      },
      // 优化提示词
      optimizedPrompt: await this.optimizePrompt(request.content, request.scenario)
    };
  }

  // 后处理响应
  private async postprocessResponse(response: ChatResponse): Promise<ChatResponse> {
    // AI响应质量检查
    const qualityScore = await this.assessResponseQuality(response);

    // 敏感内容检测
    const securityCheck = await this.securityCheck(response);

    return {
      ...response,
      metadata: {
        ...response.metadata,
        confidence: response.metadata?.confidence || 0.8,
        qualityScore,
        securityStatus: securityCheck.safe ? 'safe' : 'flagged',
        sources: response.metadata?.sources || [],
        model: response.model || 'unknown',
        usage: response.usage || {}
      }
    };
  }

  // 优化提示词
  private async optimizePrompt(content: string, scenario?: string): Promise<string> {
    const optimization = await this.providers.get('openai')?.generate({
      type: 'prompt-optimization',
      prompt: content,
      data: {
        content: content,
        scenario: scenario || 'general',
        constraints: ['professional', 'helpful', 'accurate']
      }
    });

    return optimization?.content || content;
  }

  // 评估响应质量
  private async assessResponseQuality(response: any): Promise<number> {
    // 简化的质量评估
    let score = 0.5; // 基础分

    if (response.content && response.content.length > 0) score += 0.2;
    if (response.confidence && response.confidence > 0.8) score += 0.2;
    if (response.sources && response.sources.length > 0) score += 0.1;

    return Math.min(score, 1.0);
  }

  // 安全检查
  private async securityCheck(response: any): Promise<{ safe: boolean; issues: string[] }> {
    const issues: string[] = [];
    let safe = true;

    // 简化的安全检查
    if (response.content) {
      const suspiciousPatterns = [
        /password|token|secret|key/i,
        /hack|exploit|vulnerability/i,
        /illegal|fraud|scam/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(response.content)) {
          issues.push(`检测到敏感内容: ${pattern.source}`);
          safe = false;
        }
      }
    }

    return { safe, issues };
  }

  // 估算Token使用量
  private estimateTokens(request: ChatRequest): number {
    const text = request.content || '';
    // 简化计算：4个字符约等于1个token
    return Math.ceil(text.length / 4);
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  // 获取使用统计
  getUsageStats(): UsageStats {
    return this.monitor.getStats();
  }

  // 获取成本分析
  getCostAnalysis(): CostAnalysis {
    return this.monitor.getCostAnalysis();
  }
}

// AI提供商路由器
export class AIProviderRouter {
  async selectProvider(request: any, providers: Map<string, RealAIProvider>): Promise<RealAIProvider> {
    const complexity = this.analyzeComplexity(request);
    const priority = request.priority || 'medium';
    const costBudget = request.costBudget || 'medium';

    // 成本敏感且简单的请求使用Ollama本地模型
    if (costBudget === 'low' && complexity <= 0.5 && providers.has('ollama')) {
      return providers.get('ollama')!;
    }

    // 复杂推理使用GPT-4
    if (complexity > 0.8 && priority === 'high' && providers.has('openai')) {
      return providers.get('openai')!;
    }

    // 长文本处理使用Claude
    if ((request.content?.length || 0) > 10000 && providers.has('claude')) {
      return providers.get('claude')!;
    }

    // 默认选择可用的最佳提供商
    const preferredOrder = ['ollama', 'openai', 'claude'];
    for (const providerName of preferredOrder) {
      if (providers.has(providerName)) {
        return providers.get(providerName)!;
      }
    }

    throw new Error('没有可用的AI提供商');
  }

  async selectFallbackProvider(request: any, providers: Map<string, RealAIProvider>): Promise<RealAIProvider | null> {
    const excludedProvider = request.fallbackFrom;

    for (const [name, provider] of Array.from(providers.entries())) {
      if (name !== excludedProvider) {
        try {
          await provider.healthCheck();
          return provider;
        } catch (error) {
          logger.warn(`提供商 ${name} 不可用`, error);
        }
      }
    }

    return null;
  }

  private analyzeComplexity(request: any): number {
    let complexity = 0;

    // 基于内容长度
    const contentLength = request.content?.length || 0;
    if (contentLength > 5000) complexity += 0.3;
    if (contentLength > 10000) complexity += 0.2;

    // 基于任务类型
    if (request.requiresReasoning) complexity += 0.4;
    if (request.requiresCreativity) complexity += 0.3;
    if (request.requiresDataAnalysis) complexity += 0.2;

    // 基于场景
    if (request.scenario === 'recruitment') complexity += 0.1;
    if (request.scenario === 'performance-analysis') complexity += 0.2;
    if (request.scenario === 'strategy-planning') complexity += 0.3;

    return Math.min(complexity, 1.0);
  }
}

// OpenAI真实提供商
export class OpenAIRealProvider implements RealAIProvider {
  name = 'openai';
  type: 'openai' = 'openai';
  private apiKey: string;
  private metrics: ModelMetrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    totalTokens: 0,
    totalCost: 0,
    lastUsed: null,
    successRate: 1
  };
  private available = true;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
  }

  getMetrics(): ModelMetrics {
    return { ...this.metrics };
  }

  isAvailable(): boolean {
    return this.available;
  }

  async validateConnection(): Promise<void> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI API连接失败: ${response.status}`);
      }

    } catch (error) {
      throw new Error(`OpenAI连接验证失败: ${error.message}`);
    }
  }

  async chat(request: ExtendedChatRequest): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: request.systemPrompt || '你是一个专业的AI助手。'
            },
            {
              role: 'user',
              content: request.content
            }
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 4000,
          top_p: request.topP || 1,
          frequency_penalty: request.frequencyPenalty || 0,
          presence_penalty: request.presencePenalty || 0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        confidence: 0.9,
        model: data.model,
        usage: data.usage
      };

    } catch (error) {
      logger.error('OpenAI聊天调用失败', error);
      throw error;
    }
  }

  async analyze(request: AnalysisRequest): Promise<any> {
    return await this.chat({
      ...request,
      content: `请分析以下内容：${JSON.stringify(request.data)}`,
      systemPrompt: '你是一个专业的AI分析师，提供深入的分析和洞察。'
    });
  }

  async generate(request: GenerationRequest): Promise<any> {
    return await this.chat({
      ...request,
      content: request.prompt,
      systemPrompt: '你是一个专业的AI内容生成器。'
    });
  }

  async recommend(request: RecommendationRequest): Promise<any> {
    return await this.chat({
      ...request,
      content: `请基于以下信息提供推荐：${JSON.stringify(request.context)}`,
      systemPrompt: '你是一个专业的AI推荐系统，提供个性化的建议。'
    });
  }

  async healthCheck(): Promise<void> {
    await this.validateConnection();
  }
}

// Claude真实提供商
export class ClaudeRealProvider implements RealAIProvider {
  name = 'claude';
  type: 'claude' = 'claude';
  private apiKey: string;
  private metrics: ModelMetrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    totalTokens: 0,
    totalCost: 0,
    lastUsed: null,
    successRate: 1
  };
  private available = true;

  constructor(config: ClaudeConfig) {
    this.apiKey = config.apiKey;
  }

  getMetrics(): ModelMetrics {
    return { ...this.metrics };
  }

  isAvailable(): boolean {
    return this.available;
  }

  async validateConnection(): Promise<void> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{
            role: 'user',
            content: 'Hello'
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API连接失败: ${response.status}`);
      }

    } catch (error) {
      throw new Error(`Claude连接验证失败: ${error.message}`);
    }
  }

  async chat(request: ExtendedChatRequest): Promise<any> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model || 'claude-3-sonnet-20240229',
          max_tokens: request.maxTokens || 4000,
          messages: [{
            role: 'user',
            content: request.content
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        confidence: 0.85,
        model: data.model,
        usage: data.usage
      };

    } catch (error) {
      logger.error('Claude聊天调用失败', error);
      throw error;
    }
  }

  async analyze(request: AnalysisRequest): Promise<any> {
    return await this.chat({
      ...request,
      content: `分析以下内容：${JSON.stringify(request.data)}`
    });
  }

  async generate(request: GenerationRequest): Promise<any> {
    return await this.chat({
      ...request,
      content: request.prompt
    });
  }

  async recommend(request: RecommendationRequest): Promise<any> {
    return await this.chat({
      ...request,
      content: `基于以下信息提供推荐：${JSON.stringify(request.context)}`
    });
  }

  async healthCheck(): Promise<void> {
    await this.validateConnection();
  }
}

// Ollama本地模型提供商适配器
export class OllamaProviderAdapter implements RealAIProvider {
  name = 'ollama';
  type: 'ollama' = 'ollama';
  private ollamaProvider: OllamaProvider;
  private metrics: ModelMetrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    totalTokens: 0,
    totalCost: 0,
    lastUsed: null,
    successRate: 1
  };
  private available = true;

  constructor(config: OllamaConfig) {
    this.ollamaProvider = new OllamaProvider(config);
  }

  getMetrics(): ModelMetrics {
    return { ...this.metrics };
  }

  isAvailable(): boolean {
    return this.available;
  }

  async validateConnection(): Promise<void> {
    await this.ollamaProvider.initialize();
  }

  async chat(request: ExtendedChatRequest): Promise<any> {
    // 转换请求格式
    const ollamaRequest = {
      messages: [
        { role: 'system', content: request.systemPrompt || '你是一个专业的AI助手。' },
        { role: 'user', content: request.content }
      ],
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      topP: request.topP
    };

    const response = await this.ollamaProvider.chat(ollamaRequest);

    return {
      content: response.content,
      confidence: 0.8, // 本地模型置信度较高
      model: response.model,
      usage: response.usage,
      metadata: response.metadata
    };
  }

  async analyze(request: AnalysisRequest): Promise<any> {
    return await this.chat({
      content: `请分析以下内容：${JSON.stringify(request.data)}`,
      systemPrompt: '你是一个专业的AI分析师，提供深入的分析和洞察。'
    });
  }

  async generate(request: GenerationRequest): Promise<any> {
    return await this.chat({
      content: request.prompt,
      systemPrompt: '你是一个专业的AI内容生成器。'
    });
  }

  async recommend(request: RecommendationRequest): Promise<any> {
    return await this.chat({
      content: `请基于以下信息提供推荐：${JSON.stringify(request.context)}`,
      systemPrompt: '你是一个专业的AI推荐系统，提供个性化的建议。'
    });
  }

  async healthCheck(): Promise<void> {
    await this.ollamaProvider.initialize();
  }
}

// 使用监控器
export class AIUsageMonitor {
  private usage: UsageRecord[] = [];

  recordUsage(usage: UsageRecord): void {
    this.usage.push({
      ...usage,
      timestamp: usage.timestamp || new Date()
    });

    if (this.usage.length > 1000) {
      this.usage = this.usage.slice(-1000);
    }
  }

  getStats(): UsageStats {
    const totalCost = this.usage.reduce((sum, record) => sum + record.cost, 0);
    const totalTokens = this.usage.reduce((sum, record) => sum + record.tokens, 0);
    const providerStats = this.usage.reduce((stats, record) => {
      stats[record.provider] = (stats[record.provider] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    return {
      totalRequests: this.usage.length,
      totalCost,
      totalTokens,
      averageCostPerRequest: this.usage.length > 0 ? totalCost / this.usage.length : 0,
      averageTokensPerRequest: this.usage.length > 0 ? totalTokens / this.usage.length : 0,
      providerUsage: providerStats,
      requestsByHour: this.getRequestsByHour(),
      costByDay: this.getCostByDay()
    };
  }

  getCostAnalysis(): CostAnalysis {
    const dailyCosts = this.getCostByDay();
    const totalCost = Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0);

    return {
      totalCost,
      dailyAverage: totalCost / Math.max(Object.keys(dailyCosts).length, 1),
      peakDay: this.getPeakDay(dailyCosts),
      costTrend: this.calculateCostTrend(dailyCosts),
      projectedMonthlyCost: totalCost * 30
    };
  }

  private getRequestsByHour(): Record<string, number> {
    const hourCounts: Record<string, number> = {};

    for (const record of this.usage) {
      const hour = new Date(record.timestamp).getHours().toString();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    return hourCounts;
  }

  private getCostByDay(): Record<string, number> {
    const dayCosts: Record<string, number> = {};

    for (const record of this.usage) {
      const day = new Date(record.timestamp).toISOString().split('T')[0];
      dayCosts[day] = (dayCosts[day] || 0) + record.cost;
    }

    return dayCosts;
  }

  private getPeakDay(dailyCosts: Record<string, number>): string {
    let maxCost = 0;
    let peakDay = '';

    for (const [day, cost] of Object.entries(dailyCosts)) {
      if (cost > maxCost) {
        maxCost = cost;
        peakDay = day;
      }
    }

    return peakDay;
  }

  private calculateCostTrend(dailyCosts: Record<string, number>): 'increasing' | 'decreasing' | 'stable' {
    const costs = Object.values(dailyCosts);
    if (costs.length < 2) return 'stable';

    const recent = costs.slice(-7).reduce((sum, cost) => sum + cost, 0) / Math.min(7, costs.length);
    const older = costs.slice(-14, -7).reduce((sum, cost) => sum + cost, 0) / Math.min(7, costs.length);

    if (recent > older * 1.1) return 'increasing';
    if (recent < older * 0.9) return 'decreasing';
    return 'stable';
  }
}

// 成本优化器
export class AICostOptimizer {
  private costLimits: CostLimits;
  private usageHistory: Array<{ provider: string; cost: number; timestamp: Date }> = [];

  constructor(costLimits: CostLimits) {
    this.costLimits = costLimits;
  }

  async calculateCost(provider: string, request: any, response: any): Promise<number> {
    const pricing = this.getPricing(provider);
    const inputTokens = response.usage?.prompt_tokens || this.estimateTokens(request);
    const outputTokens = response.usage?.completion_tokens || this.estimateTokens(response);

    const cost = (inputTokens * pricing.input) + (outputTokens * pricing.output);

    this.usageHistory.push({
      provider,
      cost,
      timestamp: new Date()
    });

    return cost;
  }

  private getPricing(provider: string): Pricing {
    const pricingMap: Record<string, Pricing> = {
      'openai': {
        input: 0.01,
        output: 0.03
      },
      'claude': {
        input: 0.003,
        output: 0.015
      },
      'local': {
        input: 0,
        output: 0
      }
    };

    return pricingMap[provider] || { input: 0.01, output: 0.03 };
  }

  private estimateTokens(data: any): number {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    return Math.ceil(text.length / 4);
  }

  shouldUseLocalModel(request: any): boolean {
    return this.costLimits.currentCost > this.costLimits.dailyLimit * 0.8;
  }

  async optimizeProviderSelection(
    request: any,
    availableProviders: string[]
  ): Promise<{ provider: string; reason: string }> {
    const estimatedCosts = await Promise.all(
      availableProviders.map(async provider => ({
        provider,
        estimatedCost: await this.estimateRequestCost(provider, request),
        efficiency: this.getCostEfficiency(provider)
      }))
    );

    const sortedProviders = estimatedCosts.sort((a, b) => {
      if (this.costLimits.currentCost > this.costLimits.dailyLimit * 0.7) {
        return a.estimatedCost - b.estimatedCost;
      }
      return b.efficiency - a.efficiency;
    });

    const selected = sortedProviders[0];
    return {
      provider: selected.provider,
      reason: selected.provider === 'local'
        ? '成本优化：使用本地模型以降低成本'
        : `效率优化：选择成本效率最高的提供商 (${selected.efficiency.toFixed(2)})`
    };
  }

  checkCostLimits(): {
    withinLimits: boolean;
    currentCost: number;
    dailyLimit: number;
    monthlyLimit: number;
    percentageUsed: number;
    warningLevel: 'none' | 'low' | 'medium' | 'high';
  } {
    const currentCost = this.costLimits.currentCost || 0;
    const dailyPercentage = (currentCost / this.costLimits.dailyLimit) * 100;
    const monthlyPercentage = (currentCost / this.costLimits.monthlyLimit) * 100;

    let warningLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    if (dailyPercentage > 90 || monthlyPercentage > 90) {
      warningLevel = 'high';
    } else if (dailyPercentage > 70 || monthlyPercentage > 70) {
      warningLevel = 'medium';
    } else if (dailyPercentage > 50 || monthlyPercentage > 50) {
      warningLevel = 'low';
    }

    return {
      withinLimits: dailyPercentage < 100 && monthlyPercentage < 100,
      currentCost,
      dailyLimit: this.costLimits.dailyLimit,
      monthlyLimit: this.costLimits.monthlyLimit,
      percentageUsed: Math.max(dailyPercentage, monthlyPercentage),
      warningLevel
    };
  }

  getOptimalModel(request: any, provider: string): string {
    const complexity = this.analyzeRequestComplexity(request);
    const priority = request.priority || 'medium';

    if (provider === 'openai') {
      if (complexity > 0.8 && priority === 'high') {
        return 'gpt-4-turbo-preview';
      }
      return 'gpt-3.5-turbo';
    }

    if (provider === 'claude') {
      if (complexity > 0.8) {
        return 'claude-3-opus-20240229';
      }
      if (complexity > 0.5) {
        return 'claude-3-sonnet-20240229';
      }
      return 'claude-3-haiku-20240307';
    }

    if (provider === 'local') {
      return 'llama2';
    }

    return 'default';
  }

  async estimateRequestCost(provider: string, request: any): Promise<number> {
    const pricing = this.getPricing(provider);
    const estimatedInputTokens = this.estimateTokens(request);
    const estimatedOutputTokens = estimatedInputTokens * 0.75;

    return (estimatedInputTokens * pricing.input) + (estimatedOutputTokens * pricing.output);
  }

  getCostEfficiency(provider: string): number {
    const providerUsage = this.usageHistory.filter(u => u.provider === provider);
    if (providerUsage.length === 0) return 0.5;

    const avgCost = providerUsage.reduce((sum, u) => sum + u.cost, 0) / providerUsage.length;
    const pricing = this.getPricing(provider);
    const baseCost = (pricing.input + pricing.output) / 2;

    return Math.min(baseCost / avgCost, 1.0);
  }

  suggestCostOptimizations(): Array<{
    type: 'model' | 'provider' | 'caching' | 'batching';
    priority: 'high' | 'medium' | 'low';
    description: string;
    estimatedSavings: number;
  }> {
    const suggestions: Array<{
      type: 'model' | 'provider' | 'caching' | 'batching';
      priority: 'high' | 'medium' | 'low';
      description: string;
      estimatedSavings: number;
    }> = [];

    const costCheck = this.checkCostLimits();

    if (costCheck.warningLevel === 'high') {
      suggestions.push({
        type: 'provider',
        priority: 'high',
        description: '当前成本接近限制，建议切换到本地模型或更经济的提供商',
        estimatedSavings: 0.7
      });
    }

    const openaiUsage = this.usageHistory.filter(u => u.provider === 'openai');
    if (openaiUsage.length > 10) {
      suggestions.push({
        type: 'model',
        priority: 'medium',
        description: '考虑将部分GPT-4请求降级到GPT-3.5以降低成本',
        estimatedSavings: 0.5
      });
    }

    const avgCostPerRequest = this.usageHistory.reduce((sum, u) => sum + u.cost, 0) / this.usageHistory.length;
    if (avgCostPerRequest > 0.01) {
      suggestions.push({
        type: 'caching',
        priority: 'medium',
        description: '实施响应缓存以减少重复请求',
        estimatedSavings: 0.3
      });
    }

    if (this.usageHistory.length > 50) {
      suggestions.push({
        type: 'batching',
        priority: 'low',
        description: '考虑批量处理相似请求以提高效率',
        estimatedSavings: 0.15
      });
    }

    return suggestions;
  }

  private analyzeRequestComplexity(request: any): number {
    let complexity = 0;

    const contentLength = request.content?.length || 0;
    if (contentLength > 5000) complexity += 0.3;
    if (contentLength > 10000) complexity += 0.2;

    if (request.requiresReasoning) complexity += 0.4;
    if (request.requiresCreativity) complexity += 0.3;
    if (request.requiresDataAnalysis) complexity += 0.2;

    return Math.min(complexity, 1.0);
  }

  resetCostTracking(): void {
    this.usageHistory = [];
    this.costLimits.currentCost = 0;
  }
}

// 使用统计接口
export interface UsageStats {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  averageCostPerRequest: number;
  averageTokensPerRequest: number;
  providerUsage: Record<string, number>;
  requestsByHour: Record<string, number>;
  costByDay: Record<string, number>;
}

// 成本分析接口
export interface CostAnalysis {
  totalCost: number;
  dailyAverage: number;
  peakDay: string;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  projectedMonthlyCost: number;
}
