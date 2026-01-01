/**
 * @fileoverview 高级功能示例 - 演示YYC³的高级功能使用
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { AutonomousAIEngine } from '@yyc3/autonomous-engine';
import { ModelAdapter } from '@yyc3/model-adapter';
import { RateLimiter, RateLimitStrategy } from '@yyc3/core-engine';
import { ValidationUtility } from '@yyc3/core-engine';
import { EncryptionUtility } from '@yyc3/core-engine';

async function advancedFeaturesExample() {
  console.log('=== YYC³ 高级功能示例 ===\n');

  try {
    const apiKey = process.env.YYC3_API_KEY || 'your-api-key';

    const aiEngine = new AutonomousAIEngine({
      apiKey,
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.8
    });

    console.log('✅ 自主AI引擎初始化成功');

    const modelAdapter = new ModelAdapter({
      provider: 'openai',
      apiKey,
      model: 'gpt-4',
      streaming: true
    });

    console.log('✅ 模型适配器初始化成功（流式模式）');

    const rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000,
      strategy: RateLimitStrategy.TOKEN_BUCKET
    });

    console.log('✅ 速率限制器初始化成功（令牌桶策略）');

    rateLimiter.on('rateLimit:exceeded', (data) => {
      console.warn(`⚠️ 速率限制触发: ${JSON.stringify(data)}`);
    });

    const validationUtility = ValidationUtility.getInstance();
    console.log('✅ 验证工具初始化成功');

    const encryptionUtility = EncryptionUtility.getInstance();
    console.log('✅ 加密工具初始化成功');

    const userInput = '测试用户输入';
    const sanitizedInput = validationUtility.sanitizeInput(userInput);
    console.log(`\n🔒 输入验证: "${userInput}" -> "${sanitizedInput}"`);

    const sensitiveData = '敏感信息';
    const encrypted = await encryptionUtility.encrypt(sensitiveData);
    console.log(`🔐 数据加密: "${sensitiveData}" -> "${encrypted.substring(0, 20)}..."`);

    const decrypted = await encryptionUtility.decrypt(encrypted);
    console.log(`🔓 数据解密: "${encrypted.substring(0, 20)}..." -> "${decrypted}"`);

    const identifier = 'user-123';
    for (let i = 0; i < 5; i++) {
      const result = await rateLimiter.check(identifier);
      console.log(`\n📊 请求 ${i + 1}:`, {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: new Date(result.resetTime).toISOString()
      });
    }

    const streamResponse = await modelAdapter.generateStream({
      prompt: '请用三句话介绍人工智能的发展历程',
      maxTokens: 300
    });

    console.log('\n🌊 流式生成结果:');
    for await (const chunk of streamResponse) {
      process.stdout.write(chunk.text);
    }
    console.log('\n');

    const complexReasoning = await aiEngine.reason({
      context: '企业数字化转型',
      constraints: ['预算限制', '技术栈限制', '团队规模限制'],
      objectives: ['业务连续性', '数据安全', '用户体验'],
      options: {
        depth: 'deep',
        timeout: 60000,
        includeAlternatives: true
      }
    });

    console.log('\n🧠 深度推理结果:');
    console.log(JSON.stringify(complexReasoning, null, 2));

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

advancedFeaturesExample();
