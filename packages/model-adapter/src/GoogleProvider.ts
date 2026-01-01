/**
 * @fileoverview Google Generative AI Provider Implementation for ModelAdapter
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
  SafetyRating,
  TokenUsage
} from './IModelAdapter';

import { createLogger } from '@yyc3/ai-engine/src/utils/logger';

const logger = createLogger('GoogleProvider');

export interface GoogleConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export class GoogleProvider implements IModelProvider {
  readonly provider: ModelProvider = 'google';
  private _config: ModelConfig | null = null;
  private _status: 'active' | 'inactive' | 'error' = 'inactive';
  private _apiKey: string = '';
  private _baseURL: string = 'https://generativelanguage.googleapis.com/v1beta';
  private _timeout: number = 60000;
  private _maxRetries: number = 3;
  private _requestCount: number = 0;
  private _errorCount: number = 0;
  private _lastError: string = '';
  private _lastHealthCheck: number = 0;
  private _uptime: number = 0;
  private _startTime: number = 0;

  readonly capabilities: ModelCapabilities = {
    maxTokens: 1048576,
    maxContextLength: 1048576,
    supportedModalities: ['text', 'image', 'audio', 'video', 'code'],
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
    this._baseURL = config.credentials.baseURL || 'https://generativelanguage.googleapis.com/v1beta';
    this._timeout = config.credentials.timeout || 60000;
    this._maxRetries = config.credentials.maxRetries || 3;
    this._startTime = Date.now();

    try {
      await this.healthCheck();
      this._status = 'active';
    } catch (error) {
      this._status = 'error';
      throw new Error(`Google provider initialization failed: ${(error as Error).message}`);
    }
  }

  async processRequest(request: ModelRequest): Promise<ModelResponse> {
    if (this._status !== 'active') {
      throw new Error(`Google provider is not active. Current status: ${this._status}`);
    }

    const startTime = Date.now();
    this._requestCount++;

    try {
      const response = await this._makeRequest(request);
      const latency = Date.now() - startTime;

      return {
        id: response.candidates[0]?.content?.parts?.[0]?.text || '',
        requestId: request.id,
        modelId: this._config!.id,
        content: this._parseContent(response.candidates[0]?.content),
        finishReason: this._parseFinishReason(response.candidates[0]?.finishReason),
        usage: this._parseUsage(response.usageMetadata),
        metadata: {
          latency,
          model: this._config!.model,
          provider: this.provider,
          timestamp: Date.now(),
          requestId: request.id,
          processingTime: latency,
          retryCount: 0,
          cacheHit: false,
          safetyRatings: this._parseSafetyRatings(response.candidates[0]?.safetyRatings)
        },
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
      throw new Error(`Google provider is not active. Current status: ${this._status}`);
    }

    this._requestCount++;
    const startTime = Date.now();

    try {
      const response = await fetch(`${this._baseURL}/models/${this._config!.model}:streamGenerateContent?key=${this._apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._buildRequestBody(request))
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
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
          if (line.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(line);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (content) {
                fullContent += content;
                totalTokens += this._estimateTokens(content);

                onChunk({
                  id: parsed.candidates?.[0]?.content?.parts?.[0]?.text || '',
                  requestId: request.id,
                  modelId: this._config!.id,
                  content,
                  finishReason: this._parseFinishReason(parsed.candidates?.[0]?.finishReason),
                  usage: {
                    inputTokens: 0,
                    outputTokens: totalTokens,
                    totalTokens: totalTokens
                  },
                  metadata: {
                    latency: Date.now() - startTime,
                    model: this._config!.model,
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
      const response = await fetch(`${this._baseURL}/models?key=${this._apiKey}`, {
        method: 'GET'
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      this._uptime = Date.now() - this._startTime;
      const errorRate = this._requestCount > 0 ? this._errorCount / this._requestCount : 0;

      const health: ModelHealthCheck = {
        modelId: this._config?.id || 'google-provider',
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
        modelId: this._config?.id || 'google-provider',
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
    const body = this._buildRequestBody(request);

    for (let attempt = 0; attempt < this._maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this._timeout);

        const response = await fetch(`${this._baseURL}/models/${this._config!.model}:generateContent?key=${this._apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Google API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
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

  private _buildRequestBody(request: ModelRequest): any {
    const contents: any[] = [];

    if (request.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: request.systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }

    if (request.messages && request.messages.length > 0) {
      for (const msg of request.messages) {
        const role = msg.role === 'assistant' ? 'model' : msg.role;
        contents.push({
          role,
          parts: this._formatContent(msg.content)
        });
      }
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: request.prompt }]
      });
    }

    const body: any = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 4000,
        topP: request.topP ?? 1.0,
        topK: request.topK ?? 40
      }
    };

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map(tool => ({
        functionDeclarations: [{
          name: tool.function.name,
          description: tool.function.name,
          parameters: JSON.parse(tool.function.arguments)
        }]
      }));
    }

    if (request.stopSequences) {
      body.generationConfig.stopSequences = request.stopSequences;
    }

    return body;
  }

  private _formatContent(content: string | ContentBlock[]): any[] {
    if (typeof content === 'string') {
      return [{ text: content }];
    }

    return content.map(block => {
      if (block.type === 'text') {
        return { text: block.content };
      } else if (block.type === 'image') {
        return {
          inlineData: {
            mimeType: 'image/jpeg',
            data: block.content
          }
        };
      }
      return { text: String(block.content) };
    });
  }

  private _parseContent(content: any): string | ContentBlock[] {
    if (!content) {
      return '';
    }

    if (content.parts && Array.isArray(content.parts)) {
      return content.parts.map((part: any) => ({
        type: part.text ? 'text' : part.inlineData ? 'image' : 'text',
        content: part.text || part.inlineData?.data || JSON.stringify(part),
        metadata: part.metadata
      }));
    }

    return String(content);
  }

  private _parseFinishReason(reason: string | undefined): FinishReason {
    const mapping: Record<string, FinishReason> = {
      'STOP': 'stop',
      'MAX_TOKENS': 'length',
      'SAFETY': 'content_filter',
      'RECITATION': 'content_filter',
      'OTHER': 'error'
    };

    return mapping[reason || ''] || 'stop';
  }

  private _parseUsage(usage: any): TokenUsage {
    const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;
    const totalTokens = usage?.totalTokenCount || inputTokens + outputTokens;

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
      cachedTokens: usage?.cachedContentTokenCount || 0,
      cost
    };
  }

  private _parseSafetyRatings(ratings: any[]): SafetyRating[] {
    if (!ratings || !Array.isArray(ratings)) {
      return [];
    }

    return ratings.map((rating: any) => ({
      category: rating.category || '',
      severity: rating.probability === 'HIGH' ? 'high' :
        rating.probability === 'MEDIUM' ? 'medium' : 'low',
      blocked: rating.blocked || false,
      reason: ''
    }));
  }

  private _estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
