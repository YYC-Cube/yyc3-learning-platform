#!/usr/bin/env bun

/**
 * YYC³ AI智能协作平台 - 简化性能测试
 * Week 5 Day 1: 基础性能验证
 * 目标: 验证基本并发能力，收集性能基线数据
 */

import { OllamaProvider } from './src/ai-providers/OllamaProvider';

// 简化测试配置
const simpleTestConfig = {
  baseUrl: 'http://localhost:11434',
  timeout: 30000, // 减少超时时间
  retryAttempts: 1  // 减少重试次数
};

interface SimpleTestResult {
  testName: string;
  concurrency: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  testDuration: number;
}

/**
 * 简化性能测试器
 */
class SimplePerformanceTester {
  private provider: OllamaProvider;
  private results: SimpleTestResult[] = [];

  constructor() {
    this.provider = new OllamaProvider(simpleTestConfig);
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化简化性能测试...');
    await this.provider.initialize();
    console.log('✅ Ollama提供器初始化完成');
  }

  /**
   * 执行单个并发测试
   */
  async runConcurrentTest(
    testName: string,
    concurrency: number,
    requestsPerWorker: number,
    testPrompt: string
  ): Promise<SimpleTestResult> {
    console.log(`\n🧪 开始测试: ${testName}`);
    console.log(`📊 并发数: ${concurrency}, 每个工作线程请求: ${requestsPerWorker}`);

    const startTime = Date.now();
    const responseTimes: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // 创建并发工作线程
    const promises: Promise<void>[] = [];
    for (let i = 0; i < concurrency; i++) {
      const workerPromise = this.runWorker(
        requestsPerWorker,
        testPrompt,
        responseTimes,
        () => { failedRequests++; },
        () => { successfulRequests++; }
      );
      promises.push(workerPromise);
    }

    // 等待所有请求完成
    await Promise.all(promises);

    const endTime = Date.now();
    const testDuration = endTime - startTime;

    const result: SimpleTestResult = {
      testName,
      concurrency,
      totalRequests: successfulRequests + failedRequests,
      successfulRequests,
      failedRequests,
      avgResponseTime: this.calculateAverage(responseTimes),
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      testDuration
    };

    console.log(`✅ 测试完成: ${testName}`);
    this.printResults(result);

    return result;
  }

  /**
   * 工作线程
   */
  private async runWorker(
    requestCount: number,
    testPrompt: string,
    responseTimes: number[],
    onError: () => void,
    onSuccess: () => void
  ): Promise<void> {
    for (let i = 0; i < requestCount; i++) {
      try {
        const startTime = Date.now();

        await this.provider.chat({
          messages: [{ role: 'user', content: testPrompt }],
          temperature: 0.7,
          maxTokens: 200
        });

        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        onSuccess();

        // 添加小延迟避免过度负载
        await this.sleep(100);

      } catch (error) {
        console.warn(`请求失败: ${error.message}`);
        onError();
      }
    }
  }

  /**
   * 执行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🎯 开始YYC³简化性能测试\n');

    const testScenarios = [
      {
        name: '基础并发测试',
        concurrency: 5,
        requestsPerWorker: 3,
        prompt: '你好，请简单介绍一下自己。'
      },
      {
        name: '中等负载测试',
        concurrency: 10,
        requestsPerWorker: 5,
        prompt: '请分析一下人工智能在企业中的应用前景。'
      },
      {
        name: '代码生成测试',
        concurrency: 5,
        requestsPerWorker: 3,
        prompt: '请写一个Python函数实现斐波那契数列。'
      }
    ];

    for (const scenario of testScenarios) {
      try {
        const result = await this.runConcurrentTest(
          scenario.name,
          scenario.concurrency,
          scenario.requestsPerWorker,
          scenario.prompt
        );
        this.results.push(result);

        // 测试间隔
        await this.sleep(2000);

      } catch (error) {
        console.error(`❌ 测试失败: ${scenario.name}`, error);
      }
    }

    this.generateSummaryReport();
  }

  /**
   * 生成总结报告
   */
  private generateSummaryReport(): void {
    console.log('\n📊 =============== YYC³性能测试总结报告 ===============');

    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalResponseTime = 0;

    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testName}`);
      console.log(`   并发数: ${result.concurrency}`);
      console.log(`   总请求: ${result.totalRequests}`);
      console.log(`   成功: ${result.successfulRequests}, 失败: ${result.failedRequests}`);
      console.log(`   成功率: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%`);
      console.log(`   平均响应时间: ${result.avgResponseTime.toFixed(0)}ms`);
      console.log(`   响应时间范围: ${result.minResponseTime}ms - ${result.maxResponseTime}ms`);
      console.log(`   测试耗时: ${(result.testDuration / 1000).toFixed(1)}s`);

      totalRequests += result.totalRequests;
      totalSuccessful += result.successfulRequests;
      totalFailed += result.failedRequests;
      totalResponseTime += result.avgResponseTime * result.totalRequests;
    });

    console.log('\n🎯 =============== 总体统计 ===============');
    console.log(`总请求数: ${totalRequests}`);
    console.log(`总成功数: ${totalSuccessful}`);
    console.log(`总失败数: ${totalFailed}`);
    console.log(`总体成功率: ${((totalSuccessful / totalRequests) * 100).toFixed(1)}%`);
    console.log(`总体平均响应时间: ${(totalResponseTime / totalRequests).toFixed(0)}ms`);

    this.evaluateResults();
  }

  /**
   * 评估结果
   */
  private evaluateResults(): void {
    console.log('\n🎯 =============== 性能评估 ===============');

    // 基本性能要求
    const basicRequirements = {
      minSuccessRate: 80, // 80%成功率
      maxAvgResponseTime: 10000 // 10秒平均响应时间
    };

    const overallSuccessRate = this.results.reduce(
      (sum, r) => sum + (r.successfulRequests / r.totalRequests) * 100, 0) / this.results.length;
    const overallAvgResponseTime = this.results.reduce(
      (sum, r) => sum + r.avgResponseTime, 0) / this.results.length;

    console.log(`总体成功率: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`总体平均响应时间: ${overallAvgResponseTime.toFixed(0)}ms`);

    const successRatePass = overallSuccessRate >= basicRequirements.minSuccessRate;
    const responseTimePass = overallAvgResponseTime <= basicRequirements.maxAvgResponseTime;

    console.log(`✅ 成功率要求: ${successRatePass ? '通过' : '失败'} (目标: ≥${basicRequirements.minSuccessRate}%)`);
    console.log(`✅ 响应时间要求: ${responseTimePass ? '通过' : '失败'} (目标: ≤${basicRequirements.maxAvgResponseTime}ms)`);

    const allPassed = successRatePass && responseTimePass;
    console.log(`\n🏆 基础性能测试: ${allPassed ? '✅ 通过' : '❌ 需要优化'}`);

    if (allPassed) {
      console.log('🎉 YYC³基础性能验证通过，可以继续企业级压力测试！');
    } else {
      console.log('⚠️  需要进行性能优化后继续测试');
    }
  }

  /**
   * 打印单个测试结果
   */
  private printResults(result: SimpleTestResult): void {
    console.log(`📈 ${result.testName} 结果:`);
    console.log(`   🔄 总请求数: ${result.totalRequests}`);
    console.log(`   ✅ 成功请求: ${result.successfulRequests}`);
    console.log(`   ❌ 失败请求: ${result.failedRequests}`);
    console.log(`   📊 成功率: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%`);
    console.log(`   ⚡ 平均响应时间: ${result.avgResponseTime.toFixed(0)}ms`);
    console.log(`   📏 响应时间范围: ${result.minResponseTime}ms - ${result.maxResponseTime}ms`);
  }

  /**
   * 工具方法
   */
  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('\n🧹 清理测试环境...');
    await this.provider.cleanup();
    console.log('✅ 测试环境清理完成');
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 YYC³ AI智能协作平台 - 简化性能测试');
  console.log('=' .repeat(50));
  console.log('测试目标: 基础并发性能验证');
  console.log('测试场景: 轻量级并发测试');
  console.log('=' .repeat(50));

  const tester = new SimplePerformanceTester();

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