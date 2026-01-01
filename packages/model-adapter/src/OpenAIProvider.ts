/**
 * @fileoverview OpenAI Provider Implementation for ModelAdapter
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import {
  ContentBlock,
  FinishReason,
  IModelProvider,
  ModelCapabilities,
  ModelConfig,
  ModelHealthCheck,
  ModelProvider,
  ModelRequest,
  ModelResponse,
  TokenUsage
} from './IModelAdapter';

import { createLogger } from '@yyc3/ai-engine/src/utils/logger';

const logger = createLogger('OpenAIProvider');

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  timeout?: number;
  maxRetries?: number;
}

export class OpenAIProvider implements IModelProvider {
  readonly provider: ModelProvider = 'openai';
  private _config: ModelConfig | null = null;
  private _status: 'active' | 'inactive' | 'error' = 'inactive';
  private _apiKey: string = '';
  private _baseURL: string = 'https://api.openai.com/v1';
  private _organization: string = '';
  private _timeout: number = 60000;
  private _maxRetries: number = 3;
  private _requestCount: number = 0;
  private _errorCount: number = 0;
  private _lastError: string = '';
  private _lastHealthCheck: number = 0;
  private _uptime: number = 0;
  private _startTime: number = 0;

  readonly capabilities: ModelCapabilities = {
    maxTokens: 128000,
    maxContextLength: 128000,
    supportedModalities: ['text', 'image', 'audio', 'code'],
    streamingSupport: true,
    functionCalling: true,
    visionSupport: true,
    codeGeneration: true,
    reasoning: true,
    multilingual: true,
    customInstructions: true
  };

  get status(): 'active' | 'inactive' | 'error' {
    return this._status;
  }

  async initialize(config: ModelConfig): Promise<void> {
    this._config = config;
    this._apiKey = config.credentials.apiKey;
    this._baseURL = config.credentials.baseURL || 'https://api.openai.com/v1';
    this._organization = config.credentials.organization || '';
    this._timeout = config.credentials.timeout || 60000;
    this._maxRetries = config.credentials.maxRetries || 3;
    this._startTime = Date.now();

    try {
      await this.healthCheck();
      this._status = 'active';
    } catch (error) {
      this._status = 'error';
      throw new Error(`OpenAI provider initialization failed: ${(error as Error).message}`);
    }
  }

  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    if (this._status !== 'active') {
      throw new Error(`OpenAI provider is not active. Current status: ${this._status}`);
    }

    const startTime = Date.now();
    this._requestCount++;

    try {
      const response = await this._makeRequest(request);
      const latency = Date.now() - startTime;

      return {
        id: response.id,
        requestId: request.id,
        modelId: this._config!.id,
        content: this._parseContent(response.choices[0].message.content),
        finishReason: this._parseFinishReason(response.choices[0].finish_reason),
        usage: this._parseUsage(response.usage),
        metadata: {
          latency,
          model: response.model,
          provider: this.provider,
          timestamp: Date.now(),
          requestId: request.id,
          processingTime: latency,
          retryCount: 0,
          cacheHit: false
        },
        toolCalls: response.choices[0].message.tool_calls?.map((tc: any) => ({
          id: tc.id,
          toolName: tc.function.name,
          success: true,
          result: JSON.parse(tc.function.arguments),
          executionTime: 0
        })),
        streaming: false
      };
    } catch (error) {
      this._errorCount++;
      this._lastError = (error as Error).message;
      throw error;
    }
  }

  async processStreamingRequest(
    request: ModelRequest,
    onChunk: (chunk: ModelResponse) => void
  ): Promise<void> {
    if (this._status !== 'active') {
      throw new Error(`OpenAI provider is not active. Current status: ${this._status}`);
    }

    this._requestCount++;
    const startTime = Date.now();

    try {
      const response = await fetch(`${this._baseURL}/chat/completions`, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(this._buildRequestBody(request, true))
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let totalTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                totalTokens += this._estimateTokens(content);

                onChunk({
                  id: parsed.id,
                  requestId: request.id,
                  modelId: this._config!.id,
                  content,
                  finishReason: 'stop',
                  usage: {
                    inputTokens: 0,
                    outputTokens: totalTokens,
                    totalTokens: totalTokens
                  },
                  metadata: {
                    latency: Date.now() - startTime,
                    model: parsed.model,
                    provider: this.provider,
                    timestamp: Date.now(),
                    requestId: request.id,
                    processingTime: Date.now() - startTime
                  },
                  streaming: true
                });
              }
            } catch (e) {
              logger.error('Error parsing streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      this._errorCount++;
      this._lastError = (error as Error).message;
      throw error;
    }
  }

  async healthCheck(): Promise<ModelHealthCheck> {
    const startTime = Date.now();
    this._lastHealthCheck = startTime;

    try {
      const response = await fetch(`${this._baseURL}/models`, {
        method: 'GET',
        headers: this._getHeaders()
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      this._uptime = Date.now() - this._startTime;
      const errorRate = this._requestCount > 0 ? this._errorCount / this._requestCount : 0;

      const health: ModelHealthCheck = {
        modelId: this._config?.id || 'openai-provider',
        status: errorRate > 0.1 ? 'degraded' : 'healthy',
        responseTime,
        lastCheck: this._lastHealthCheck,
        errorRate,
        uptime: this._uptime,
        metrics: {
          requestsPerMinute: this._requestCount,
          errorRate,
          averageLatency: responseTime,
          p95Latency: responseTime * 1.5,
          p99Latency: responseTime * 2,
          timeoutRate: 0,
          queueDepth: 0
        }
      };

      if (health.status === 'healthy') {
        this._status = 'active';
      }

      return health;
    } catch (error) {
      this._status = 'error';
      this._lastError = (error as Error).message;

      return {
        modelId: this._config?.id || 'openai-provider',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: this._lastHealthCheck,
        errorRate: 1,
        uptime: this._uptime,
        metrics: {
          requestsPerMinute: this._requestCount,
          errorRate: 1,
          averageLatency: Date.now() - startTime,
          p95Latency: (Date.now() - startTime) * 1.5,
          p99Latency: (Date.now() - startTime) * 2,
          timeoutRate: 1,
          queueDepth: 0
        }
      };
    }
  }

  getCapabilities(): ModelCapabilities {
    return this.capabilities;
  }

  validateConfig(config: ModelConfig): boolean {
    return !!(
      config.credentials?.apiKey &&
      config.model &&
      config.id
    );
  }

  async cleanup(): Promise<void> {
    this._status = 'inactive';
    this._config = null;
    this._apiKey = '';
  }

  private async _makeRequest(request: ModelRequest): Promise<any> {
    const body = this._buildRequestBody(request, false);

    for (let attempt = 0; attempt < this._maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this._timeout);

        const response = await fetch(`${this._baseURL}/chat/completions`, {
          method: 'POST',
          headers: this._getHeaders(),
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
          );
        }

        return await response.json();
      } catch (error) {
        if (attempt === this._maxRetries - 1) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private _buildRequestBody(request: ModelRequest, stream: boolean): any {
    const messages: any[] = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    if (request.messages && request.messages.length > 0) {
      messages.push(...request.messages.map(msg => ({
        role: msg.role,
        content: this._formatContent(msg.content)
      })));
    } else {
      messages.push({ role: 'user', content: request.prompt });
    }

    const body: any = {
      model: this._config?.model || 'gpt-4-turbo-preview',
      messages,
      stream,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4000,
      top_p: request.topP ?? 1.0
    };

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.function.name,
          description: tool.function.name,
          parameters: tool.function.arguments
        }
      }));
    }

    if (request.toolChoice) {
      body.tool_choice = request.toolChoice.type === 'function'
        ? { type: 'function', function: { name: request.toolChoice.function?.name } }
        : request.toolChoice.type;
    }

    if (request.stopSequences) {
      body.stop = request.stopSequences;
    }

    return body;
  }

  private _formatContent(content: string | ContentBlock[]): any {
    if (typeof content === 'string') {
      return content;
    }

    return content.map(block => {
      if (block.type === 'text') {
        return { type: 'text', text: block.content };
      } else if (block.type === 'image') {
        return {
          type: 'image_url',
          image_url: { url: block.content }
        };
      }
      return { type: 'text', text: String(block.content) };
    });
  }

  private _parseContent(content: any): string | ContentBlock[] {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content.map((block: any) => ({
        type: block.type || 'text',
        content: block.text || block.image_url?.url || block.content,
        metadata: block.metadata
      }));
    }

    return String(content);
  }

  private _parseFinishReason(reason: string | null): FinishReason {
    const mapping: Record<string, FinishReason> = {
      'stop': 'stop',
      'length': 'length',
      'content_filter': 'content_filter',
      'tool_calls': 'tool_calls',
      'error': 'error'
    };

    return mapping[reason || ''] || 'stop';
  }

  private _parseUsage(usage: any): TokenUsage {
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    const totalTokens = usage?.total_tokens || inputTokens + outputTokens;

    const pricing = this._config?.pricing;
    let cost = 0;
    if (pricing) {
      cost = (inputTokens / 1000) * pricing.inputTokensPer1K +
        (outputTokens / 1000) * pricing.outputTokensPer1K;
    }

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens: usage?.prompt_tokens_details?.cached_tokens || 0,
      cost
    };
  }

  private _getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._apiKey}`
    };

    if (this._organization) {
      headers['OpenAI-Organization'] = this._organization;
    }

    return { ...headers, ...this._config?.credentials.additionalHeaders };
  }

  private _estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
