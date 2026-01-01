/**
 * @fileoverview REST API使用示例 - 演示如何通过REST API使用YYC³服务
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

interface ReasoningResponse {
  success: boolean;
  data: {
    reasoningId: string;
    result: {
      conclusion: string;
      confidence: number;
      steps: Array<{
        step: number;
        action: string;
        estimatedTime: string;
      }>;
      alternatives: Array<{
        option: string;
        score: number;
        reason: string;
      }>;
    };
    metadata: {
      model: string;
      processingTime: number;
      tokensUsed: number;
    };
  };
}

class YYC3Client {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3200') {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data: AuthResponse = await response.json();

    if (data.success) {
      this.token = data.data.token;
      console.log('✅ 登录成功，令牌已保存');
    } else {
      throw new Error('登录失败');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async reason(params: {
    context: string;
    constraints?: string[];
    objectives?: string[];
    options?: {
      depth?: string;
      timeout?: number;
    };
  }): Promise<ReasoningResponse> {
    console.log('🧠 发起智能推理请求...');
    const response = await this.request<ReasoningResponse>('/api/v1/engine/reason', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    console.log('✅ 推理完成');
    return response;
  }

  async generateText(prompt: string, maxTokens: number = 1000): Promise<any> {
    console.log('🤖 发起文本生成请求...');
    const response = await this.request('/api/v1/model/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, maxTokens })
    });
    console.log('✅ 生成完成');
    return response;
  }

  async getMetrics(): Promise<any> {
    console.log('📊 获取系统指标...');
    const response = await this.request('/api/v1/analytics/metrics');
    console.log('✅ 指标获取完成');
    return response;
  }

  async getLearningData(): Promise<any> {
    console.log('🧠 获取学习数据...');
    const response = await this.request('/api/v1/learning/data');
    console.log('✅ 学习数据获取完成');
    return response;
  }
}

async function restApiExample() {
  console.log('=== YYC³ REST API 使用示例 ===\n');

  try {
    const client = new YYC3Client('http://localhost:3200');

    await client.login('user@example.com', 'your-password');

    const reasoningResult = await client.reason({
      context: '优化项目开发流程',
      constraints: ['时间限制', '预算限制'],
      objectives: ['效率提升', '质量保证'],
      options: {
        depth: 'deep',
        timeout: 30000
      }
    });

    console.log('\n📊 推理结果:');
    console.log(`结论: ${reasoningResult.data.result.conclusion}`);
    console.log(`置信度: ${reasoningResult.data.result.confidence}`);
    console.log(`处理时间: ${reasoningResult.data.metadata.processingTime}ms`);
    console.log(`使用Token: ${reasoningResult.data.metadata.tokensUsed}`);

    const generationResult = await client.generateText(
      '请简述敏捷开发的核心原则',
      500
    );

    console.log('\n🤖 生成结果:');
    console.log(generationResult.data.text);

    const metrics = await client.getMetrics();
    console.log('\n📈 系统指标:');
    console.log(JSON.stringify(metrics, null, 2));

    const learningData = await client.getLearningData();
    console.log('\n🧠 学习数据:');
    console.log(JSON.stringify(learningData, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

restApiExample();
