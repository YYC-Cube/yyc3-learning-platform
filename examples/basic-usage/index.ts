/**
 * @fileoverview 基础使用示例 - 演示如何初始化和使用YYC³核心引擎
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { AutonomousAIEngine } from '@yyc3/autonomous-engine';
import { ModelAdapter } from '@yyc3/model-adapter';
import { FiveDimensionalManagement } from '@yyc3/five-dimensional-management';
import { LearningSystem } from '@yyc3/learning-system';

async function basicUsageExample() {
  console.log('=== YYC³ 基础使用示例 ===\n');

  try {
    const apiKey = process.env.YYC3_API_KEY || 'your-api-key';

    const aiEngine = new AutonomousAIEngine({
      maxConcurrentTasks: 10,
      resourceLimits: {
        maxMemory: 1024 * 1024 * 1024,
        maxCPU: 80,
        maxNetwork: 1000,
      },
      learningConfig: {
        enabled: true,
        adaptationRate: 0.1,
        knowledgeRetention: 0.9,
      },
      decisionMakingConfig: {
        timeout: 30000,
        confidenceThreshold: 0.7,
      },
      collaborationConfig: {
        enabled: true,
        maxCollaborators: 5,
      },
      monitoringConfig: {
        enabled: true,
        metricsInterval: 60000,
      },
      securityConfig: {
        level: 'standard',
        accessControl: true,
        encryptionEnabled: true,
        auditLog: true,
      },
      integrationConfig: {
        enabled: true,
        endpoints: [],
      },
      modelAdapterConfig: {
        apiKey,
        model: 'gpt-4',
        provider: 'openai',
      },
    });

    console.log('✅ 自主AI引擎初始化成功');

    const modelAdapter = new ModelAdapter();

    console.log('✅ 模型适配器初始化成功');

    const fiveDimManagement = new FiveDimensionalManagement({
      systemId: 'yyc3-learning-platform',
      organizationId: 'yyc3-org',
      environment: 'development',
      dimensions: {
        goal: { enabled: true, priority: 1 },
        technology: { enabled: true, priority: 2 },
        data: { enabled: true, priority: 3 },
        ux: { enabled: true, priority: 4 },
        value: { enabled: true, priority: 5 },
      },
    });

    console.log('✅ 五维管理系统初始化成功');

    const learningSystem = new LearningSystem({
      behavioralLayer: { enabled: true },
      knowledgeLayer: { enabled: true },
      strategicLayer: { enabled: true },
      metaLayer: { enabled: true },
    });

    console.log('✅ 学习系统初始化成功');

    const response = await aiEngine.reason({
      context: '用户需要优化项目开发流程',
      constraints: ['时间限制', '预算限制'],
      objectives: ['效率提升', '质量保证'],
    });

    console.log('\n📊 AI推理结果:');
    console.log(JSON.stringify(response, null, 2));

    const modelResponse = await modelAdapter.generate({
      prompt: '请简述敏捷开发的核心原则',
      maxTokens: 500,
    });

    console.log('\n🤖 模型生成结果:');
    console.log(modelResponse.text);

    const metrics = fiveDimManagement.getMetrics();
    console.log('\n📈 五维管理指标:');
    console.log(JSON.stringify(metrics, null, 2));

    const learningData = learningSystem.getLearningData();
    console.log('\n🧠 学习系统数据:');
    console.log(JSON.stringify(learningData, null, 2));
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

basicUsageExample();
