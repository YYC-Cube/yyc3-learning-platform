/**
 * @fileoverview WebSocket API使用示例 - 演示如何通过WebSocket API使用YYC³服务
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import WebSocket from 'ws';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  messageId: string;
}

class YYC3WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private url: string = 'ws://localhost:3200/ws') {}

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${token}`);

        this.ws.on('open', () => {
          console.log('✅ WebSocket连接已建立');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data: string) => {
          try {
            const message: WebSocketMessage = JSON.parse(data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ 消息解析错误:', error);
          }
        });

        this.ws.on('error', (error) => {
          console.error('❌ WebSocket错误:', error);
          reject(error);
        });

        this.ws.on('close', () => {
          console.log('🔌 WebSocket连接已关闭');
          this.stopHeartbeat();
          this.handleReconnect();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    } else {
      console.log(`📩 收到消息: ${message.type}`, message.data);
    }
  }

  on(eventType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(eventType, handler);
  }

  off(eventType: string): void {
    this.messageHandlers.delete(eventType);
  }

  send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        messageId: this.generateMessageId(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('❌ WebSocket未连接');
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(
        `🔄 ${delay}ms后尝试重新连接... (尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        console.log('🔄 正在重新连接...');
      }, delay);
    } else {
      console.error('❌ 达到最大重连次数，停止重连');
    }
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  disconnect(): void {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close();
      this.ws = null;
    }
  }
}

async function webSocketApiExample() {
  console.log('=== YYC³ WebSocket API 使用示例 ===\n');

  try {
    const client = new YYC3WebSocketClient('ws://localhost:3200/ws');

    const token = 'your-jwt-token';

    await client.connect(token);

    client.on('reasoning:start', (data) => {
      console.log('🧠 推理开始:', data);
    });

    client.on('reasoning:progress', (data) => {
      console.log('📊 推理进度:', data);
    });

    client.on('reasoning:complete', (data) => {
      console.log('✅ 推理完成:', data);
    });

    client.on('generation:start', (data) => {
      console.log('🤖 生成开始:', data);
    });

    client.on('generation:chunk', (data) => {
      process.stdout.write(data.text);
    });

    client.on('generation:complete', (data) => {
      console.log('\n✅ 生成完成:', data);
    });

    client.on('metrics:update', (data) => {
      console.log('📈 指标更新:', data);
    });

    client.on('learning:update', (data) => {
      console.log('🧠 学习更新:', data);
    });

    client.on('error', (data) => {
      console.error('❌ 错误:', data);
    });

    console.log('\n🧠 发起推理请求...');
    client.send('reasoning:request', {
      context: '优化项目开发流程',
      constraints: ['时间限制', '预算限制'],
      objectives: ['效率提升', '质量保证'],
    });

    console.log('\n🤖 发起生成请求...');
    client.send('generation:request', {
      prompt: '请简述敏捷开发的核心原则',
      maxTokens: 300,
    });

    console.log('\n📊 订阅指标更新...');
    client.send('metrics:subscribe', {
      interval: 5000,
    });

    console.log('\n🧠 订阅学习更新...');
    client.send('learning:subscribe', {
      interval: 10000,
    });

    setTimeout(() => {
      console.log('\n🔌 断开连接...');
      client.disconnect();
    }, 60000);
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

webSocketApiExample();
