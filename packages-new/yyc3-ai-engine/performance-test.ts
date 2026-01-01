#!/usr/bin/env bun

/**
 * YYC³ AI智能协作平台 - 性能压力测试
 * Week 5 Day 1: 企业级并发性能验证
 * 目标: 支持100+并发用户，P95响应时间<2秒
 */

import { OllamaProvider } from './src/ai-providers/OllamaProvider';
import { RealAIProvidersManager, type AIProviderConfig } from './src/ai-providers/RealAIProviders';

// 测试配置
const testConfig: AIProviderConfig = {
  providers: {
    ollama: {
      baseURL: 'http://localhost:11434',
      models: ['llama3.2:3b-instruct-q4_K_M', 'qwen2.5-coder:1.5b', 'llama3.2:1b', 'deepseek-coder:33b']
    }
  },
  costLimits: {
    dailyLimit: 1000,
    monthlyLimit: 30000,
    perRequestLimit: 10
  },
  routingStrategy: 'best-performance',
  fallbackEnabled: true
};

// 性能测试结果接口
interface PerformanceResult {
  testName: string;
  concurrency: number;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

// 测试场景定义
const testScenarios = [
  {
    name: '轻量级对话测试',
    concurrency: 50,
    duration: 30000, // 30秒
    requests: [
      { content: '你好', scenario: 'greeting', costBudget: 'low' },
      { content: '今天天气如何？', scenario: 'qa', costBudget: 'low' },
      { content: '简单介绍一下你的功能', scenario: 'introduction', costBudget: 'low' }
    ]
  },
  {
    name: '中等负载对话测试',
    concurrency: 80,
    duration: 45000, // 45秒
    requests: [
      { content: '请分析一下当前的技术发展趋势', scenario: 'analysis', costBudget: 'medium' },
      { content: '如何提高团队协作效率？', scenario: 'consultation', costBudget: 'medium' },
      { content: '解释一下人工智能在企业中的应用', scenario: 'education', costBudget: 'medium' }
    ]
  },
  {
    name: '高负载压力测试',
    concurrency: 100,
    duration: 60000, // 60秒
    requests: [
      { content: '为一家软件开发公司制定技术发展策略', scenario: 'strategy', costBudget: 'high', requiresReasoning: true },
      { content: '设计一个完整的电商系统架构', scenario: 'design', costBudget: 'high', requiresReasoning: true },
      { content: '分析并优化现有业务流程，提出改进建议', scenario: 'optimization', costBudget: 'high', requiresReasoning: true }
    ]
  },
  {
    name: '代码生成压力测试',
    concurrency: 30,
    duration: 30000, // 30秒
    requests: [
      { content: '请写一个Python函数实现快速排序算法', scenario: 'code', costBudget: 'low' },
      { content: '创建一个React组件，实现用户登录表单', scenario: 'code', costBudget: 'medium' },
      { content: '设计一个RESTful API来管理用户数据', scenario: 'code', costBudget: 'high' }
    ]
  }
];

/**
 * 性能压力测试执行器
 */
class PerformanceTester {
  private providerManager: RealAIProvidersManager;
  private results: PerformanceResult[] = [];

  constructor(config: AIProviderConfig) {
    this.providerManager = new RealAIProvidersManager(config);
  }

  /**
   * 初始化测试环境
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化YYC³性能测试环境...');
    await this.providerManager.waitForInitialization();
    console.log('✅ AI提供器初始化完成');

    // 预热模型
    console.log('🔥 预热模型...');
    await this.warmUpModels();
    console.log('✅ 模型预热完成');
  }

  /**
   * 预热模型
   */
  private async warmUpModels(): Promise<void> {
    const warmUpRequests = [
      { content: '你好', scenario: 'greeting', costBudget: 'low' },
      { content: '测试', scenario: 'test', costBudget: 'low' }
    ];

    for (const request of warmUpRequests) {
      try {
        await this.providerManager.chat(request);
      } catch (error) {
        console.warn('预热请求失败:', error.message);
      }
    }
  }

  /**
   * 执行单个测试场景
   */
  async runScenario(scenario: any): Promise<PerformanceResult> {
    console.log(`\n🧪 开始测试: ${scenario.name}`);
    console.log(`📊 并发数: ${scenario.concurrency}, 持续时间: ${scenario.duration/1000}秒`);

    const startTime = Date.now();
    const responseTimes: number[] = [];
    const errors: string[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // 记录初始资源使用
    const initialMemory = this.getMemoryUsage();
    const initialCPU = this.getCPUUsage();

    // 创建并发请求
    const promises: Promise<void>[] = [];
    const requestsPerWorker = Math.ceil(scenario.duration / (scenario.concurrency * 100));

    for (let i = 0; i < scenario.concurrency; i++) {
      const workerPromise = this.runWorker(
        i,
        requestsPerWorker,
        scenario.requests,
        responseTimes,
        errors,
        () => { failedRequests++; },
        () => { successfulRequests++; }
      );
      promises.push(workerPromise);
    }

    // 等待所有请求完成
    await Promise.all(promises);

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // 记录结束资源使用
    const finalMemory = this.getMemoryUsage();
    const finalCPU = this.getCPUUsage();

    // 计算性能指标
    const totalRequests = successfulRequests + failedRequests;
    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);

    const result: PerformanceResult = {
      testName: scenario.name,
      concurrency: scenario.concurrency,
      duration: totalDuration,
      totalRequests,
      successfulRequests,
      failedRequests,
      avgResponseTime: this.calculateAverage(responseTimes),
      minResponseTime: Math.min(...responseTimes) || 0,
      maxResponseTime: Math.max(...responseTimes) || 0,
      p50ResponseTime: this.calculatePercentile(sortedResponseTimes, 50),
      p95ResponseTime: this.calculatePercentile(sortedResponseTimes, 95),
      p99ResponseTime: this.calculatePercentile(sortedResponseTimes, 99),
      requestsPerSecond: (totalRequests / totalDuration) * 1000,
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0,
      memoryUsage: finalMemory - initialMemory,
      cpuUsage: finalCPU - initialCPU
    };

    console.log(`✅ 测试完成: ${scenario.name}`);
    this.printResults(result);

    return result;
  }

  /**
   * 工作线程执行请求
   */
  private async runWorker(
    workerId: number,
    requestCount: number,
    requests: any[],
    responseTimes: number[],
    errors: string[],
    onError: () => void,
    onSuccess: () => void
  ): Promise<void> {
    for (let i = 0; i < requestCount; i++) {
      try {
        const request = requests[i % requests.length];
        const startTime = Date.now();

        await this.providerManager.chat(request);

        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        onSuccess();

      } catch (error) {
        errors.push(error.message);
        onError();
      }
    }
  }

  /**
   * 执行所有测试场景
   */
  async runAllTests(): Promise<void> {
    console.log('🎯 开始YYC³性能压力测试\n');

    for (const scenario of testScenarios) {
      try {
        const result = await this.runScenario(scenario);
        this.results.push(result);

        // 测试间隔，让系统恢复
        await this.sleep(5000);

      } catch (error) {
        console.error(`❌ 测试失败: ${scenario.name}`, error);
      }
    }

    this.generateReport();
  }

  /**
   * 生成测试报告
   */
  private generateReport(): void {
    console.log('\n📊 =============== YYC³性能测试报告 ===============');

    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testName}`);
      console.log(`   并发数: ${result.concurrency}`);
      console.log(`   总请求数: ${result.totalRequests}`);
      console.log(`   成功请求: ${result.successfulRequests}`);
      console.log(`   失败请求: ${result.failedRequests}`);
      console.log(`   成功率: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
      console.log(`   平均响应时间: ${result.avgResponseTime.toFixed(2)}ms`);
      console.log(`   P50响应时间: ${result.p50ResponseTime.toFixed(2)}ms`);
      console.log(`   P95响应时间: ${result.p95ResponseTime.toFixed(2)}ms`);
      console.log(`   P99响应时间: ${result.p99ResponseTime.toFixed(2)}ms`);
      console.log(`   吞吐量: ${result.requestsPerSecond.toFixed(2)} 请求/秒`);
      console.log(`   错误率: ${result.errorRate.toFixed(2)}%`);
      console.log(`   内存使用: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    });

    this.evaluateResults();
  }

  /**
   * 评估测试结果
   */
  private evaluateResults(): void {
    console.log('\n🎯 =============== 测试结果评估 ===============');

    const targets = {
      maxErrorRate: 1, // 1%
      maxP95ResponseTime: 2000, // 2秒
      minRequestsPerSecond: 50 // 50请求/秒
    };

    let allPassed = true;

    this.results.forEach((result) => {
      console.log(`\n📋 ${result.testName}:`);

      const errorRatePassed = result.errorRate <= targets.maxErrorRate;
      const p95Passed = result.p95ResponseTime <= targets.maxP95ResponseTime;
      const throughputPassed = result.requestsPerSecond >= targets.minRequestsPerSecond;

      console.log(`   ✅ 错误率 ${result.errorRate.toFixed(2)}% ${errorRatePassed ? '通过' : '失败'} (目标: ≤${targets.maxErrorRate}%)`);
      console.log(`   ✅ P95响应时间 ${result.p95ResponseTime.toFixed(2)}ms ${p95Passed ? '通过' : '失败'} (目标: ≤${targets.maxP95ResponseTime}ms)`);
      console.log(`   ✅ 吞吐量 ${result.requestsPerSecond.toFixed(2)} req/s ${throughputPassed ? '通过' : '失败'} (目标: ≥${targets.minRequestsPerSecond} req/s)`);

      const testPassed = errorRatePassed && p95Passed && throughputPassed;
      console.log(`   🎯 测试结果: ${testPassed ? '✅ 通过' : '❌ 失败'}`);

      if (!testPassed) {
        allPassed = false;
      }
    });

    console.log(`\n🏆 总体评估: ${allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败'}`);

    if (allPassed) {
      console.log('🎉 YYC³已达到企业级性能要求，可以进入下一阶段！');
    } else {
      console.log('⚠️  需要进行性能优化后重新测试');
    }
  }

  /**
   * 打印测试结果
   */
  private printResults(result: PerformanceResult): void {
    console.log(`📈 测试结果统计:`);
    console.log(`   🔄 总请求数: ${result.totalRequests}`);
    console.log(`   ✅ 成功请求: ${result.successfulRequests}`);
    console.log(`   ❌ 失败请求: ${result.failedRequests}`);
    console.log(`   📊 成功率: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
    console.log(`   ⚡ 平均响应时间: ${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`   🎯 P95响应时间: ${result.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   🚀 吞吐量: ${result.requestsPerSecond.toFixed(2)} 请求/秒`);
  }

  /**
   * 工具方法
   */
  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }

  private calculatePercentile(sortedNumbers: number[], percentile: number): number {
    if (sortedNumbers.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.max(0, index)];
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private getCPUUsage(): number {
    // 简化的CPU使用率估算
    return Math.random() * 20; // 模拟CPU使用
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('\n🧹 清理测试环境...');
    // 这里可以添加清理逻辑
    console.log('✅ 测试环境清理完成');
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 YYC³ AI智能协作平台 - 性能压力测试');
  console.log('=' .repeat(50));
  console.log('测试目标: 企业级并发性能验证');
  console.log('性能要求: P95响应时间<2秒，错误率<1%');
  console.log('测试范围: 50-100并发用户场景');
  console.log('=' .repeat(50));

  const tester = new PerformanceTester(testConfig);

  try {
    // 初始化测试环境
    await tester.initialize();

    // 执行性能测试
    await tester.runAllTests();

  } catch (error) {
    console.error('💥 测试执行失败:', error);
  } finally {
    // 清理资源
    await tester.cleanup();
  }
}

// 运行测试
if (import.meta.main) {
  main().catch(error => {
    console.error('💥 未捕获的错误:', error);
    process.exit(1);
  });
}