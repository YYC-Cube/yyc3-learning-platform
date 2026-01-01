/**
 * @fileoverview Enhanced streaming processor for real-time inference optimization
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { EventEmitter } from 'events';
import { ModelRequest, ModelResponse, ChatMessage } from './IModelAdapter';

export interface StreamingConfig {
  enableBuffering: boolean;
  bufferSize: number;
  bufferFlushInterval: number;
  enableCompression: boolean;
  enableDeduplication: boolean;
  maxConcurrentStreams: number;
  streamTimeout: number;
  retryOnFailure: boolean;
  maxRetries: number;
  enablePrefetch: boolean;
  prefetchThreshold: number;
}

export interface StreamingMetrics {
  totalStreams: number;
  activeStreams: number;
  totalChunks: number;
  averageChunkSize: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  retryRate: number;
  compressionRatio: number;
  deduplicationRate: number;
}

export interface StreamBuffer {
  chunks: ModelResponse[];
  size: number;
  lastFlush: number;
}

export interface PrefetchContext {
  requestId: string;
  prompt: string;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}

export class EnhancedStreamingProcessor extends EventEmitter {
  private config: StreamingConfig;
  private activeStreams = new Map<string, AbortController>();
  private streamBuffers = new Map<string, StreamBuffer>();
  private prefetchQueue = new Map<string, PrefetchContext>();
  private metrics: StreamingMetrics;
  private latencyHistory: number[] = [];
  private chunkSizes: number[] = [];
  private errorCount: number = 0;
  private retryCount: number = 0;
  private deduplicationHits: number = 0;
  private compressionSavings: number = 0;

  constructor(config: Partial<StreamingConfig> = {}) {
    super();

    this.config = {
      enableBuffering: config.enableBuffering ?? true,
      bufferSize: config.bufferSize ?? 10,
      bufferFlushInterval: config.bufferFlushInterval ?? 100,
      enableCompression: config.enableCompression ?? true,
      enableDeduplication: config.enableDeduplication ?? true,
      maxConcurrentStreams: config.maxConcurrentStreams ?? 100,
      streamTimeout: config.streamTimeout ?? 60000,
      retryOnFailure: config.retryOnFailure ?? true,
      maxRetries: config.maxRetries ?? 3,
      enablePrefetch: config.enablePrefetch ?? true,
      prefetchThreshold: config.prefetchThreshold ?? 0.8
    };

    this.metrics = this.initializeMetrics();
    this.startCleanupTask();
  }

  private initializeMetrics(): StreamingMetrics {
    return {
      totalStreams: 0,
      activeStreams: 0,
      totalChunks: 0,
      averageChunkSize: 0,
      averageLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      retryRate: 0,
      compressionRatio: 0,
      deduplicationRate: 0
    };
  }

  async processStream(
    request: ModelRequest,
    streamProcessor: (request: ModelRequest) => AsyncIterable<ModelResponse>,
    onChunk: (chunk: ModelResponse) => void
  ): Promise<void> {
    const startTime = Date.now();
    const streamId = request.id;

    try {
      this.metrics.totalStreams++;
      this.metrics.activeStreams++;

      const controller = new AbortController();
      this.activeStreams.set(streamId, controller);

      if (this.config.enableBuffering) {
        await this.processWithBuffering(request, streamProcessor, onChunk, controller.signal);
      } else {
        await this.processDirect(request, streamProcessor, onChunk, controller.signal);
      }

      this.emit('stream:completed', { streamId, duration: Date.now() - startTime });
    } catch (error) {
      this.errorCount++;
      this.emit('stream:error', { streamId, error });

      if (this.config.retryOnFailure && this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        await this.processStream(request, streamProcessor, onChunk);
        return;
      }

      throw error;
    } finally {
      this.activeStreams.delete(streamId);
      this.streamBuffers.delete(streamId);
      this.metrics.activeStreams--;
      this.updateMetrics();
    }
  }

  private async processWithBuffering(
    request: ModelRequest,
    streamProcessor: (request: ModelRequest) => AsyncIterable<ModelResponse>,
    onChunk: (chunk: ModelResponse) => void,
    signal: AbortSignal
  ): Promise<void> {
    const buffer: ModelResponse[] = [];
    const streamId = request.id;

    this.streamBuffers.set(streamId, {
      chunks: buffer,
      size: 0,
      lastFlush: Date.now()
    });

    const flushBuffer = async () => {
      if (buffer.length > 0) {
        const chunksToFlush = [...buffer];
        buffer.length = 0;
        this.streamBuffers.set(streamId, {
          chunks: buffer,
          size: 0,
          lastFlush: Date.now()
        });

        for (const chunk of chunksToFlush) {
          onChunk(chunk);
        }
      }
    };

    const flushInterval = setInterval(flushBuffer, this.config.bufferFlushInterval);

    try {
      for await (const chunk of streamProcessor(request)) {
        if (signal.aborted) {
          throw new Error('Stream aborted');
        }

        const processedChunk = await this.processChunk(chunk);
        buffer.push(processedChunk);

        if (buffer.length >= this.config.bufferSize) {
          await flushBuffer();
        }
      }

      await flushBuffer();
    } finally {
      clearInterval(flushInterval);
    }
  }

  private async processDirect(
    request: ModelRequest,
    streamProcessor: (request: ModelRequest) => AsyncIterable<ModelResponse>,
    onChunk: (chunk: ModelResponse) => void,
    signal: AbortSignal
  ): Promise<void> {
    for await (const chunk of streamProcessor(request)) {
      if (signal.aborted) {
        throw new Error('Stream aborted');
      }

      const processedChunk = await this.processChunk(chunk);
      onChunk(processedChunk);
    }
  }

  private async processChunk(chunk: ModelResponse): Promise<ModelResponse> {
    const startTime = Date.now();

    this.metrics.totalChunks++;

    const content = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
    this.chunkSizes.push(content.length);

    if (this.config.enableDeduplication) {
      const deduplicated = this.deduplicateChunk(chunk);
      if (deduplicated === null) {
        this.deduplicationHits++;
        this.emit('chunk:deduplicated', { chunkId: chunk.id });
        return chunk;
      }
    }

    if (this.config.enableCompression) {
      const compressed = this.compressChunk(chunk);
      if (compressed) {
        const originalSize = content.length;
        const compressedSize = JSON.stringify(compressed).length;
        this.compressionSavings += (originalSize - compressedSize);
        chunk = compressed;
      }
    }

    const latency = Date.now() - startTime;
    this.latencyHistory.push(latency);

    this.emit('chunk:processed', { chunkId: chunk.id, latency });

    return chunk;
  }

  private deduplicateChunk(chunk: ModelResponse): ModelResponse | null {
    const content = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
    
    if (!content || content.length < 10) {
      return null;
    }

    return chunk;
  }

  private compressChunk(chunk: ModelResponse): ModelResponse | null {
    const content = typeof chunk.content === 'string' ? chunk.content : JSON.stringify(chunk.content);
    
    if (content.length < 100) {
      return null;
    }

    return chunk;
  }

  async prefetch(request: ModelRequest, streamProcessor: (request: ModelRequest) => AsyncIterable<ModelResponse>): Promise<void> {
    if (!this.config.enablePrefetch) {
      return;
    }

    const context: PrefetchContext = {
      requestId: request.id,
      prompt: request.prompt,
      timestamp: Date.now(),
      priority: request.metadata?.priority || 'normal'
    };

    this.prefetchQueue.set(request.id, context);
    this.emit('prefetch:started', { requestId: request.id });

    try {
      for await (const chunk of streamProcessor(request)) {
        this.emit('prefetch:chunk', { requestId: request.id, chunk });
      }
    } catch (error) {
      this.emit('prefetch:error', { requestId: request.id, error });
    } finally {
      this.prefetchQueue.delete(request.id);
    }
  }

  cancelStream(streamId: string): void {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
      this.emit('stream:cancelled', { streamId });
    }
  }

  getMetrics(): StreamingMetrics {
    return { ...this.metrics };
  }

  private updateMetrics(): void {
    if (this.chunkSizes.length > 0) {
      this.metrics.averageChunkSize = this.chunkSizes.reduce((a, b) => a + b, 0) / this.chunkSizes.length;
    }

    if (this.latencyHistory.length > 0) {
      this.metrics.averageLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
      
      const sorted = [...this.latencyHistory].sort((a, b) => a - b);
      this.metrics.p50Latency = sorted[Math.floor(sorted.length * 0.5)];
      this.metrics.p95Latency = sorted[Math.floor(sorted.length * 0.95)];
      this.metrics.p99Latency = sorted[Math.floor(sorted.length * 0.99)];
    }

    if (this.metrics.totalStreams > 0) {
      this.metrics.errorRate = this.errorCount / this.metrics.totalStreams;
      this.metrics.retryRate = this.retryCount / this.metrics.totalStreams;
    }

    if (this.metrics.totalChunks > 0) {
      this.metrics.deduplicationRate = this.deduplicationHits / this.metrics.totalChunks;
      this.metrics.compressionRatio = this.compressionSavings / (this.chunkSizes.reduce((a, b) => a + b, 0) || 1);
    }
  }

  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.latencyHistory = [];
    this.chunkSizes = [];
    this.errorCount = 0;
    this.retryCount = 0;
    this.deduplicationHits = 0;
    this.compressionSavings = 0;
  }

  private startCleanupTask(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [streamId, buffer] of this.streamBuffers.entries()) {
        if (now - buffer.lastFlush > this.config.bufferFlushInterval * 10) {
          this.streamBuffers.delete(streamId);
        }
      }

      for (const [requestId, context] of this.prefetchQueue.entries()) {
        if (now - context.timestamp > this.config.streamTimeout) {
          this.prefetchQueue.delete(requestId);
        }
      }
    }, 60000);
  }

  async cleanup(): Promise<void> {
    for (const [streamId, controller] of this.activeStreams.entries()) {
      controller.abort();
    }
    this.activeStreams.clear();
    this.streamBuffers.clear();
    this.prefetchQueue.clear();
    this.resetMetrics();
  }
}
