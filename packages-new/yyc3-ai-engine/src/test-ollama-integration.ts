#!/usr/bin/env bun

/**
 * Ollama本地模型集成测试
 * 验证本地AI模型的基本功能和性能
 */

import { OllamaProvider } from './ai-providers/OllamaProvider';
import { RealAIProvidersManager, type AIProviderConfig } from './ai-providers/RealAIProviders';

// 测试配置
const testConfig: AIProviderConfig = {
  providers: {
    ollama: {
      enabled: true,
      baseURL: 'http://localhost:11434',
      models: ['llama3.2:3b-instruct-q4_K_M', 'qwen2.5-coder:1.5b', 'llama3.2:1b', 'deepseek-coder:33b'],
      timeout: 60000,
      retryAttempts: 3,
      defaultModels: {
        chat: 'llama3.2:3b-instruct-q4_K_M',
        code: 'qwen2.5-coder:1.5b',
        analysis: 'llama3.2:1b',
        reasoning: 'deepseek-coder:33b'
      }
    }
  },
  costLimits: {
    dailyLimit: 100,
    monthlyLimit: 3000,
    perRequestLimit: 10
  },
  routingStrategy: 'best-performance',
  fallbackEnabled: true
};

/**
 * 测试Ollama提供器
 */
async function testOllamaProvider(): Promise<void> {
  console.log('\n🤖 开始测试Ollama本地模型集成...\n');

  try {
    // 1. 初始化提供器
    console.log('1️⃣ 初始化AI提供器管理器...');
    const providerManager = new RealAIProvidersManager(testConfig);
    await providerManager.waitForInitialization();

    // 2. 测试基本对话功能
    console.log('\n2️⃣ 测试基本对话功能...');
    await testBasicChat(providerManager);

    // 3. 测试代码生成
    console.log('\n3️⃣ 测试代码生成功能...');
    await testCodeGeneration(providerManager);

    // 4. 测试分析能力
    console.log('\n4️⃣ 测试分析能力...');
    await testAnalysis(providerManager);

    // 5. 测试复杂推理
    console.log('\n5️⃣ 测试复杂推理能力...');
    await testComplexReasoning(providerManager);

    // 6. 性能测试
    console.log('\n6️⃣ 执行性能测试...');
    await performanceTest(providerManager);

    // 7. 获取使用统计
    console.log('\n7️⃣ 生成使用统计报告...');
    const stats = providerManager.getUsageStats();
    console.log('📊 使用统计:', stats);

    const costAnalysis = providerManager.getCostAnalysis();
    console.log('💰 成本分析:', costAnalysis);

    console.log('\n✅ Ollama本地模型集成测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

/**
 * 测试基本对话功能
 */
async function testBasicChat(providerManager: RealAIProvidersManager): Promise<void> {
  const requests = [
    {
      name: '简单问候',
      request: {
        content: '你好！请简单介绍一下你自己。',
        scenario: 'greeting',
        costBudget: 'low'
      }
    },
    {
      name: '企业场景咨询',
      request: {
        content: '我想了解如何提高团队的工作效率，有什么建议吗？',
        scenario: 'consultation',
        costBudget: 'medium'
      }
    },
    {
      name: '快速问答',
      request: {
        content: '什么是人工智能？',
        scenario: 'qa',
        costBudget: 'low'
      }
    }
  ];

  for (const { name, request } of requests) {
    console.log(`\n🗣️  ${name}:`);
    console.log(`📝 问题: ${request.content}`);

    try {
      const startTime = Date.now();
      const response = await providerManager.chat(request);
      const duration = Date.now() - startTime;

      console.log(`💬 回答: ${response.content.substring(0, 150)}${response.content.length > 150 ? '...' : ''}`);
      console.log(`⏱️  响应时间: ${duration}ms`);
      console.log(`🎯 置信度: ${response.confidence || 'N/A'}`);
      console.log(`🔧 使用模型: ${response.model}`);

      if (response.usage) {
        console.log(`📊 Token使用: ${response.usage.totalTokens} (输入: ${response.usage.promptTokens}, 输出: ${response.usage.completionTokens})`);
      }

    } catch (error) {
      console.error(`❌ ${name} 失败:`, error.message);
    }
  }
}

/**
 * 测试代码生成功能
 */
async function testCodeGeneration(providerManager: RealAIProvidersManager): Promise<void> {
  const codeRequests = [
    {
      name: 'Python函数',
      request: {
        content: '请写一个Python函数，计算斐波那契数列的第n项。',
        scenario: 'code-generation',
        requiresReasoning: true,
        costBudget: 'low'
      }
    },
    {
      name: 'JavaScript类',
      request: {
        content: '创建一个JavaScript类，表示一个简单的银行账户，包含存款和取款方法。',
        scenario: 'code-generation',
        costBudget: 'low'
      }
    },
    {
      name: 'API设计',
      request: {
        content: '设计一个RESTful API来管理用户数据，包括增删改查操作。',
        scenario: 'api-design',
        requiresReasoning: true,
        costBudget: 'medium'
      }
    }
  ];

  for (const { name, request } of codeRequests) {
    console.log(`\n💻 ${name}:`);
    console.log(`📝 需求: ${request.content}`);

    try {
      const startTime = Date.now();
      const response = await providerManager.chat(request);
      const duration = Date.now() - startTime;

      console.log(`🔧 生成的代码:\n${response.content}`);
      console.log(`⏱️  生成时间: ${duration}ms`);
      console.log(`🤖 使用模型: ${response.model}`);

    } catch (error) {
      console.error(`❌ ${name} 失败:`, error.message);
    }
  }
}

/**
 * 测试分析能力
 */
async function testAnalysis(providerManager: RealAIProvidersManager): Promise<void> {
  const analysisRequests = [
    {
      name: '业务数据分析',
      request: {
        content: '分析以下销售数据：Q1:100万, Q2:120万, Q3:90万, Q4:150万。请给出趋势分析和建议。',
        scenario: 'data-analysis',
        requiresDataAnalysis: true,
        costBudget: 'low'
      }
    },
    {
      name: '用户行为分析',
      request: {
        content: '分析电商网站用户行为数据：页面浏览量10000，独立访客3000，转化率2.5%，平均停留时间3分钟。',
        scenario: 'user-analysis',
        costBudget: 'low'
      }
    }
  ];

  for (const { name, request } of analysisRequests) {
    console.log(`\n📊 ${name}:`);
    console.log(`📈 分析内容: ${request.content}`);

    try {
      const startTime = Date.now();
      const response = await providerManager.chat(request);
      const duration = Date.now() - startTime;

      console.log(`🔍 分析结果:\n${response.content}`);
      console.log(`⏱️  分析时间: ${duration}ms`);
      console.log(`🤖 使用模型: ${response.model}`);

    } catch (error) {
      console.error(`❌ ${name} 失败:`, error.message);
    }
  }
}

/**
 * 测试复杂推理能力
 */
async function testComplexReasoning(providerManager: RealAIProvidersManager): Promise<void> {
  const reasoningRequests = [
    {
      name: '战略规划',
      request: {
        content: '为一个50人规模的软件开发公司制定未来一年的技术发展策略，考虑市场趋势和团队能力。',
        scenario: 'strategy-planning',
        requiresReasoning: true,
        priority: 'high',
        costBudget: 'high'
      }
    },
    {
      name: '问题解决',
      request: {
        content: '团队面临技术债务严重、交付周期长的问题，请分析根本原因并提供解决方案。',
        scenario: 'problem-solving',
        requiresReasoning: true,
        costBudget: 'high'
      }
    }
  ];

  for (const { name, request } of reasoningRequests) {
    console.log(`\n🧠 ${name}:`);
    console.log(`🤔 问题: ${request.content}`);

    try {
      const startTime = Date.now();
      const response = await providerManager.chat(request);
      const duration = Date.now() - startTime;

      console.log(`💡 推理结果:\n${response.content}`);
      console.log(`⏱️  推理时间: ${duration}ms`);
      console.log(`🎯 置信度: ${response.confidence || 'N/A'}`);
      console.log(`🤖 使用模型: ${response.model}`);

    } catch (error) {
      console.error(`❌ ${name} 失败:`, error.message);
    }
  }
}

/**
 * 性能测试
 */
async function performanceTest(providerManager: RealAIProvidersManager): Promise<void> {
  console.log('\n⚡ 执行并发性能测试...');

  const concurrentRequests = 5;
  const testPrompt = '请简单总结一下人工智能的发展历史。';

  const requests = Array.from({ length: concurrentRequests }, (_, i) =>
    providerManager.chat({
      content: testPrompt,
      scenario: 'performance-test',
      costBudget: 'low'
    }).then(response => ({
      requestId: i + 1,
      duration: Date.now(),
      model: response.model,
      contentLength: response.content.length,
      usage: response.usage
    }))
  );

  const startTime = Date.now();

  try {
    const results = await Promise.all(requests);
    const totalDuration = Date.now() - startTime;

    console.log(`\n📈 性能测试结果:`);
    console.log(`🔄 并发请求数: ${concurrentRequests}`);
    console.log(`⏱️  总耗时: ${totalDuration}ms`);
    console.log(`⚡ 平均延迟: ${Math.round(totalDuration / concurrentRequests)}ms`);
    console.log(`📊 吞吐量: ${Math.round(concurrentRequests * 1000 / totalDuration)} 请求/秒`);

    results.forEach(result => {
      console.log(`   请求${result.requestId}: ${result.model}, 内容长度: ${result.contentLength}`);
    });

  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
  }
}

/**
 * 模型能力矩阵测试
 */
async function testModelCapabilities(): Promise<void> {
  console.log('\n🎯 测试不同模型的能力矩阵...');

  const provider = new OllamaProvider();
  await provider.initialize();

  const models = provider.getAvailableModels();

  console.log('\n📋 可用模型列表:');
  models.forEach(model => {
    console.log(`• ${model.name} (${model.id})`);
    console.log(`  能力: ${model.capabilities.join(', ')}`);
    console.log(`  上下文窗口: ${model.contextWindow} tokens`);
    console.log(`  参数规模: ${model.metadata?.parameterSize || 'N/A'}`);
    console.log(`  量化级别: ${model.metadata?.quantization || 'N/A'}`);
    console.log('');
  });

  await provider.cleanup();
}

// 主函数
async function main(): Promise<void> {
  console.log('🚀 YYC³ AI引擎 - Ollama本地模型集成测试');
  console.log('=' .repeat(50));

  try {
    // 首先测试模型能力
    await testModelCapabilities();

    // 然后进行集成测试
    await testOllamaProvider();

    console.log('\n🎉 所有测试完成！');
    console.log('✅ Ollama本地模型已成功集成到YYC³ AI引擎中');

  } catch (error) {
    console.error('\n💥 测试过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行测试
if (import.meta.main) {
  main().catch(error => {
    console.error('💥 未捕获的错误:', error);
    process.exit(1);
  });
}