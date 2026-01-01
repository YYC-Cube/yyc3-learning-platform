/**
 * @fileoverview EnhancedDecisionEngine 单元测试
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { EnhancedDecisionEngine } from './EnhancedDecisionEngine';
import type {
  DecisionContext,
  DecisionOption,
  DecisionConstraints,
  DecisionPreferences
} from './EnhancedDecisionEngine';

describe('EnhancedDecisionEngine', () => {
  let decisionEngine: EnhancedDecisionEngine;
  let mockContext: DecisionContext;
  let mockOptions: DecisionOption[];

  beforeEach(() => {
    decisionEngine = new EnhancedDecisionEngine({
      enableAIAssistedDecision: false,
      enableLearning: true,
      maxOptionsToEvaluate: 10,
      decisionTimeout: 30000
    });

    mockContext = {
      goalId: 'test-goal-1',
      taskId: 'test-task-1',
      timestamp: new Date(),
      state: { status: 'active' },
      environment: { platform: 'test', version: '1.0.0' },
      constraints: {
        maxCost: 1000,
        maxTime: 5000,
        maxResources: { cpu: 4, memory: 8192, storage: 100, network: 1000 },
        securityLevel: 'medium',
        compliance: ['GDPR']
      },
      preferences: {
        prioritizeSpeed: false,
        prioritizeCost: true,
        prioritizeQuality: false,
        riskTolerance: 'medium'
      }
    };

    mockOptions = [
      {
        id: 'option-1',
        description: '低成本选项',
        actions: [
          { type: 'action1', parameters: {}, dependencies: [] },
          { type: 'action2', parameters: {}, dependencies: ['action1'] }
        ],
        estimatedCost: 200,
        estimatedTime: 1000,
        resourceRequirements: { cpu: 1, memory: 512, storage: 10, network: 100 },
        riskLevel: 0.2,
        confidence: 0.8,
        expectedOutcome: { success: true }
      },
      {
        id: 'option-2',
        description: '高质量选项',
        actions: [
          { type: 'action1', parameters: {}, dependencies: [] }
        ],
        estimatedCost: 800,
        estimatedTime: 3000,
        resourceRequirements: { cpu: 2, memory: 1024, storage: 20, network: 200 },
        riskLevel: 0.3,
        confidence: 0.9,
        expectedOutcome: { success: true, quality: 'high' }
      },
      {
        id: 'option-3',
        description: '高风险选项',
        actions: [
          { type: 'action1', parameters: {}, dependencies: [] }
        ],
        estimatedCost: 500,
        estimatedTime: 2000,
        resourceRequirements: { cpu: 1.5, memory: 768, storage: 15, network: 150 },
        riskLevel: 0.7,
        confidence: 0.6,
        expectedOutcome: { success: true }
      }
    ];
  });

  afterEach(() => {
    decisionEngine.clearHistory();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const engine = new EnhancedDecisionEngine();
      expect(engine).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const engine = new EnhancedDecisionEngine({
        enableAIAssistedDecision: false,
        enableLearning: false,
        maxOptionsToEvaluate: 5,
        decisionTimeout: 10000
      });
      expect(engine).toBeDefined();
    });

    it('should initialize with AI assisted decision enabled', () => {
      const engine = new EnhancedDecisionEngine({
        enableAIAssistedDecision: true,
        modelAdapterConfig: { defaultModel: 'gpt-4' }
      });
      expect(engine).toBeDefined();
    });
  });

  describe('makeDecision', () => {
    it('should make a decision successfully', async () => {
      const result = await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(result).toBeDefined();
      expect(result.selectedOption).toBeDefined();
      expect(result.evaluation).toBeDefined();
      expect(result.alternativeOptions).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.executionPlan).toBeDefined();
    });

    it('should select best option based on preferences', async () => {
      const result = await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(result.selectedOption).toBeDefined();
      expect(result.evaluation.overallScore).toBeGreaterThan(0);
    });

    it('should limit options to maxOptionsToEvaluate', async () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        id: `option-${i}`,
        description: `Option ${i}`,
        actions: [{ type: 'action1', parameters: {}, dependencies: [] }],
        estimatedCost: 100 + i * 10,
        estimatedTime: 1000 + i * 100,
        resourceRequirements: { cpu: 1, memory: 512, storage: 10, network: 100 },
        riskLevel: 0.3,
        confidence: 0.8,
        expectedOutcome: { success: true }
      }));

      const result = await decisionEngine.makeDecision(mockContext, manyOptions);

      expect(result.alternativeOptions.length).toBeLessThanOrEqual(9);
    });

    it('should generate execution plan', async () => {
      const result = await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(result.executionPlan).toBeDefined();
      expect(result.executionPlan.steps).toBeDefined();
      expect(result.executionPlan.steps.length).toBeGreaterThan(0);
      expect(result.executionPlan.dependencies).toBeDefined();
      expect(result.executionPlan.estimatedDuration).toBeGreaterThan(0);
      expect(result.executionPlan.estimatedCost).toBeGreaterThan(0);
      expect(result.executionPlan.resourceAllocation).toBeDefined();
    });

    it('should emit decision:started event', async () => {
      const emitSpy = jest.spyOn(decisionEngine as any, 'emit');
      
      await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(emitSpy).toHaveBeenCalledWith('decision:started');
    });

    it('should emit decision:made event', async () => {
      const emitSpy = jest.spyOn(decisionEngine as any, 'emit');
      
      await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(emitSpy).toHaveBeenCalledWith('decision:made', expect.any(Object));
    });

    it('should handle errors and emit decision:error event', async () => {
      const invalidContext = null as any;
      const emitSpy = jest.spyOn(decisionEngine as any, 'emit');

      await expect(decisionEngine.makeDecision(invalidContext, mockOptions)).rejects.toThrow();
      expect(emitSpy).toHaveBeenCalledWith('decision:error', expect.any(Object));
    });
  });

  describe('evaluateOption', () => {
    it('should evaluate cost score correctly', async () => {
      const option = mockOptions[0];
      const evaluation = await decisionEngine.makeDecision(mockContext, [option]);

      expect(evaluation.evaluation.costScore).toBeGreaterThan(0);
      expect(evaluation.evaluation.costScore).toBeLessThanOrEqual(1);
    });

    it('should evaluate time score correctly', async () => {
      const option = mockOptions[0];
      const evaluation = await decisionEngine.makeDecision(mockContext, [option]);

      expect(evaluation.evaluation.timeScore).toBeGreaterThan(0);
      expect(evaluation.evaluation.timeScore).toBeLessThanOrEqual(1);
    });

    it('should evaluate quality score correctly', async () => {
      const option = mockOptions[0];
      const evaluation = await decisionEngine.makeDecision(mockContext, [option]);

      expect(evaluation.evaluation.qualityScore).toBeGreaterThan(0);
      expect(evaluation.evaluation.qualityScore).toBeLessThanOrEqual(1);
    });

    it('should evaluate risk score correctly', async () => {
      const option = mockOptions[0];
      const evaluation = await decisionEngine.makeDecision(mockContext, [option]);

      expect(evaluation.evaluation.riskScore).toBeGreaterThan(0);
      expect(evaluation.evaluation.riskScore).toBeLessThanOrEqual(1);
    });

    it('should generate reasoning', async () => {
      const option = mockOptions[0];
      const evaluation = await decisionEngine.makeDecision(mockContext, [option]);

      expect(evaluation.evaluation.reasoning).toBeDefined();
      expect(typeof evaluation.evaluation.reasoning).toBe('string');
    });
  });

  describe('evaluateCost', () => {
    it('should return high score for low cost option', async () => {
      const lowCostOption = { ...mockOptions[0], estimatedCost: 100 };
      const result = await decisionEngine.makeDecision(mockContext, [lowCostOption]);

      expect(result.evaluation.costScore).toBeGreaterThan(0.8);
    });

    it('should return low score for high cost option', async () => {
      const highCostOption = { ...mockOptions[0], estimatedCost: 900 };
      const result = await decisionEngine.makeDecision(mockContext, [highCostOption]);

      expect(result.evaluation.costScore).toBeLessThan(0.2);
    });

    it('should return zero for cost exceeding max', async () => {
      const exceedCostOption = { ...mockOptions[0], estimatedCost: 1500 };
      const result = await decisionEngine.makeDecision(mockContext, [exceedCostOption]);

      expect(result.evaluation.costScore).toBe(0);
    });
  });

  describe('evaluateTime', () => {
    it('should return high score for fast option', async () => {
      const fastOption = { ...mockOptions[0], estimatedTime: 500 };
      const result = await decisionEngine.makeDecision(mockContext, [fastOption]);

      expect(result.evaluation.timeScore).toBeGreaterThan(0.8);
    });

    it('should return low score for slow option', async () => {
      const slowOption = { ...mockOptions[0], estimatedTime: 4500 };
      const result = await decisionEngine.makeDecision(mockContext, [slowOption]);

      expect(result.evaluation.timeScore).toBeLessThan(0.2);
    });

    it('should return zero for time exceeding max', async () => {
      const exceedTimeOption = { ...mockOptions[0], estimatedTime: 6000 };
      const result = await decisionEngine.makeDecision(mockContext, [exceedTimeOption]);

      expect(result.evaluation.timeScore).toBe(0);
    });
  });

  describe('evaluateRisk', () => {
    it('should return high score for low risk option', async () => {
      const lowRiskOption = { ...mockOptions[0], riskLevel: 0.1 };
      const result = await decisionEngine.makeDecision(mockContext, [lowRiskOption]);

      expect(result.evaluation.riskScore).toBeGreaterThan(0.8);
    });

    it('should return low score for high risk option', async () => {
      const highRiskOption = { ...mockOptions[0], riskLevel: 0.8 };
      const result = await decisionEngine.makeDecision(mockContext, [highRiskOption]);

      expect(result.evaluation.riskScore).toBeLessThan(0.5);
    });

    it('should consider risk tolerance', async () => {
      const highRiskContext = {
        ...mockContext,
        preferences: { ...mockContext.preferences, riskTolerance: 'high' as const }
      };
      const highRiskOption = { ...mockOptions[0], riskLevel: 0.7 };
      
      const result = await decisionEngine.makeDecision(highRiskContext, [highRiskOption]);

      expect(result.evaluation.riskScore).toBeGreaterThan(0);
    });
  });

  describe('calculateUtilityScore', () => {
    it('should prioritize cost when prioritizeCost is true', async () => {
      const costPriorityContext = {
        ...mockContext,
        preferences: { ...mockContext.preferences, prioritizeCost: true }
      };
      const result = await decisionEngine.makeDecision(costPriorityContext, mockOptions);

      expect(result.selectedOption.id).toBe('option-1');
    });

    it('should prioritize speed when prioritizeSpeed is true', async () => {
      const speedPriorityContext = {
        ...mockContext,
        preferences: { ...mockContext.preferences, prioritizeSpeed: true }
      };
      const result = await decisionEngine.makeDecision(speedPriorityContext, mockOptions);

      expect(result.selectedOption.id).toBe('option-1');
    });

    it('should prioritize quality when prioritizeQuality is true', async () => {
      const qualityPriorityContext = {
        ...mockContext,
        preferences: { ...mockContext.preferences, prioritizeQuality: true }
      };
      const result = await decisionEngine.makeDecision(qualityPriorityContext, mockOptions);

      expect(result.selectedOption.id).toBe('option-2');
    });
  });

  describe('generateExecutionPlan', () => {
    it('should generate execution steps', async () => {
      const result = await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(result.executionPlan.steps).toBeDefined();
      expect(result.executionPlan.steps.length).toBeGreaterThan(0);
      expect(result.executionPlan.steps[0].id).toBeDefined();
      expect(result.executionPlan.steps[0].action).toBeDefined();
      expect(result.executionPlan.steps[0].order).toBeGreaterThanOrEqual(0);
    });

    it('should handle action dependencies', async () => {
      const optionWithDependencies = {
        ...mockOptions[0],
        actions: [
          { type: 'action1', parameters: {}, dependencies: [] },
          { type: 'action2', parameters: {}, dependencies: ['action1'] },
          { type: 'action3', parameters: {}, dependencies: ['action2'] }
        ]
      };

      const result = await decisionEngine.makeDecision(mockContext, [optionWithDependencies]);

      expect(result.executionPlan.steps.length).toBe(3);
      expect(result.executionPlan.steps[1].dependencies).toContain('action1');
      expect(result.executionPlan.steps[2].dependencies).toContain('action2');
    });

    it('should allocate resources', async () => {
      const result = await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(result.executionPlan.resourceAllocation).toBeDefined();
      expect(result.executionPlan.resourceAllocation.length).toBeGreaterThan(0);
      expect(result.executionPlan.resourceAllocation[0].stepId).toBeDefined();
      expect(result.executionPlan.resourceAllocation[0].resources).toBeDefined();
      expect(result.executionPlan.resourceAllocation[0].startTime).toBeGreaterThanOrEqual(0);
      expect(result.executionPlan.resourceAllocation[0].endTime).toBeGreaterThan(
        result.executionPlan.resourceAllocation[0].startTime
      );
    });
  });

  describe('calculateDecisionConfidence', () => {
    it('should return confidence score', async () => {
      const result = await decisionEngine.makeDecision(mockContext, mockOptions);

      expect(result.confidence).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return high confidence for clear best option', async () => {
      const clearBestOptions = [
        { ...mockOptions[0], estimatedCost: 100, confidence: 0.95 },
        { ...mockOptions[1], estimatedCost: 900, confidence: 0.5 },
        { ...mockOptions[2], estimatedCost: 800, confidence: 0.5 }
      ];

      const result = await decisionEngine.makeDecision(mockContext, clearBestOptions);

      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('recordDecision', () => {
    it('should record decision when learning is enabled', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);

      const history = decisionEngine.getDecisionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].context).toEqual(mockContext);
      expect(history[0].selectedOption).toBeDefined();
    });

    it('should not record decision when learning is disabled', async () => {
      const noLearningEngine = new EnhancedDecisionEngine({
        enableLearning: false
      });

      await noLearningEngine.makeDecision(mockContext, mockOptions);

      const history = noLearningEngine.getDecisionHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('learnFromOutcome', () => {
    it('should learn from outcome', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);

      const outcome = { success: true, metrics: { accuracy: 0.95 } };
      (decisionEngine as any).learnFromOutcome({
        context: mockContext,
        outcome,
        success: true
      });

      const history = decisionEngine.getDecisionHistory();
      expect(history[0].actualOutcome).toEqual(outcome);
      expect(history[0].success).toBe(true);
    });
  });

  describe('getDecisionHistory', () => {
    it('should return decision history', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);
      await decisionEngine.makeDecision(mockContext, mockOptions);

      const history = decisionEngine.getDecisionHistory();
      expect(history.length).toBe(2);
    });

    it('should return empty history initially', () => {
      const history = decisionEngine.getDecisionHistory();
      expect(history).toEqual([]);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics for goal and task', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);

      const metrics = decisionEngine.getPerformanceMetrics('test-goal-1', 'test-task-1');
      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent metrics', () => {
      const metrics = decisionEngine.getPerformanceMetrics('non-existent', 'non-existent');
      expect(metrics).toEqual([]);
    });
  });

  describe('clearHistory', () => {
    it('should clear decision history', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);

      decisionEngine.clearHistory();

      const history = decisionEngine.getDecisionHistory();
      expect(history).toEqual([]);
    });

    it('should clear performance metrics', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);

      decisionEngine.clearHistory();

      const metrics = decisionEngine.getPerformanceMetrics('test-goal-1', 'test-task-1');
      expect(metrics).toEqual([]);
    });

    it('should emit decision:history-cleared event', async () => {
      await decisionEngine.makeDecision(mockContext, mockOptions);
      const emitSpy = jest.spyOn(decisionEngine as any, 'emit');

      decisionEngine.clearHistory();

      expect(emitSpy).toHaveBeenCalledWith('decision:history-cleared');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', async () => {
      const result = await decisionEngine.makeDecision(mockContext, []);

      expect(result).toBeDefined();
      expect(result.selectedOption).toBeUndefined();
    });

    it('should handle single option', async () => {
      const result = await decisionEngine.makeDecision(mockContext, [mockOptions[0]]);

      expect(result).toBeDefined();
      expect(result.selectedOption.id).toBe('option-1');
      expect(result.alternativeOptions).toEqual([]);
    });

    it('should handle options with same scores', async () => {
      const sameScoreOptions = [
        { ...mockOptions[0], estimatedCost: 500, estimatedTime: 2500, confidence: 0.8 },
        { ...mockOptions[1], estimatedCost: 500, estimatedTime: 2500, confidence: 0.8 }
      ];

      const result = await decisionEngine.makeDecision(mockContext, sameScoreOptions);

      expect(result).toBeDefined();
      expect(result.selectedOption).toBeDefined();
    });
  });
});
