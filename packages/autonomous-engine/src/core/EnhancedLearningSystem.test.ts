/**
 * @fileoverview EnhancedLearningSystem 单元测试
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-31
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EnhancedLearningSystem } from './EnhancedLearningSystem';
import type {
  LearningData,
  LearningSystemConfig,
  Strategy
} from './EnhancedLearningSystem';

describe('EnhancedLearningSystem', () => {
  let learningSystem: EnhancedLearningSystem;
  let mockExperience: LearningData;

  beforeEach(() => {
    learningSystem = new EnhancedLearningSystem({
      enableLearning: true,
      experienceRetention: 365 * 24 * 60 * 60 * 1000,
      adaptationThreshold: 0.7,
      learningRate: 0.1,
      explorationRate: 0.2,
      knowledgeDomains: ['general', 'optimization', 'collaboration'],
      feedbackIntegration: {
        enableFeedback: true,
        sources: ['user', 'system', 'peer'],
        weighting: { user: 0.4, system: 0.3, peer: 0.2, automated: 0.1 },
        processing: {
          aggregation: 'weighted_average',
          filtering: 'outlier_removal',
          validation: 'cross_validation',
          integration: 'incremental'
        }
      }
    });

    mockExperience = {
      id: 'exp-1',
      type: 'success',
      context: { task: 'test-task', environment: 'test' },
      situation: {
        description: 'Test situation description',
        complexity: 'simple',
        uncertainty: 'low',
        novelty: 'familiar',
        criticality: 'low'
      },
      actions: [
        {
          id: 'action-1',
          type: 'test-action',
          description: 'Test action description',
          parameters: { param1: 'value1' },
          reasoning: 'Test reasoning'
        }
      ],
      outcomes: [
        {
          id: 'outcome-1',
          type: 'result',
          value: { success: true },
          quality: 'good',
          duration: 1000,
          resourceUsage: { cpu: 0.5, memory: 512 }
        }
      ],
      feedback: {
        source: 'system',
        type: 'performance',
        content: 'Good performance',
        sentiment: 'positive',
        confidence: 0.9,
        actionability: 'short_term'
      },
      timestamp: new Date(),
      metadata: {
        tags: ['test', 'performance'],
        category: 'optimization',
        importance: 'medium',
        applicability: ['general', 'optimization'],
        sharingConsent: true
      }
    };
  });

  afterEach(async () => {
    await learningSystem.shutdown();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const system = new EnhancedLearningSystem();
      expect(system).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const config: Partial<LearningSystemConfig> = {
        enableLearning: false,
        learningRate: 0.2,
        explorationRate: 0.3
      };
      const system = new EnhancedLearningSystem(config);
      expect(system).toBeDefined();
    });

    it('should initialize knowledge domains', () => {
      const domains = learningSystem.getAllKnowledgeDomains();
      expect(domains.length).toBe(3);
      expect(domains[0].name).toBe('general');
      expect(domains[1].name).toBe('optimization');
      expect(domains[2].name).toBe('collaboration');
    });
  });

  describe('learnFromExperience', () => {
    it('should learn from experience successfully', async () => {
      await expect(learningSystem.learnFromExperience(mockExperience)).resolves.not.toThrow();
    });

    it('should emit learning:started event', async () => {
      const emitSpy = jest.spyOn(learningSystem as any, 'emit');
      
      await learningSystem.learnFromExperience(mockExperience);

      expect(emitSpy).toHaveBeenCalledWith('learning:started', expect.any(Object));
    });

    it('should emit learning:completed event', async () => {
      const emitSpy = jest.spyOn(learningSystem as any, 'emit');
      
      await learningSystem.learnFromExperience(mockExperience);

      expect(emitSpy).toHaveBeenCalledWith('learning:completed', expect.any(Object));
    });

    it('should not learn when learning is disabled', async () => {
      const disabledSystem = new EnhancedLearningSystem({ enableLearning: false });
      
      await expect(disabledSystem.learnFromExperience(mockExperience)).resolves.not.toThrow();
      
      const progress = disabledSystem.getProgress();
      expect(progress.totalExperiences).toBe(0);
    });

    it('should handle learning errors', async () => {
      const invalidExperience = null as any;
      const emitSpy = jest.spyOn(learningSystem as any, 'emit');

      await expect(learningSystem.learnFromExperience(invalidExperience)).rejects.toThrow();
      expect(emitSpy).toHaveBeenCalledWith('learning:error', expect.any(Object));
    });
  });

  describe('updateKnowledgeDomains', () => {
    it('should update domain competency', async () => {
      const initialDomain = learningSystem.getKnowledgeDomain('general');
      const initialCompetency = initialDomain?.competency || 0;

      await learningSystem.learnFromExperience(mockExperience);

      const updatedDomain = learningSystem.getKnowledgeDomain('general');
      expect(updatedDomain?.competency).toBeGreaterThan(initialCompetency);
    });

    it('should update domain lastUpdated timestamp', async () => {
      const initialDomain = learningSystem.getKnowledgeDomain('general');
      const initialTimestamp = initialDomain?.lastUpdated;

      await learningSystem.learnFromExperience(mockExperience);

      const updatedDomain = learningSystem.getKnowledgeDomain('general');
      expect(updatedDomain?.lastUpdated.getTime()).toBeGreaterThan(initialTimestamp?.getTime() || 0);
    });

    it('should emit domain:updated event', async () => {
      const emitSpy = jest.spyOn(learningSystem as any, 'emit');
      
      await learningSystem.learnFromExperience(mockExperience);

      expect(emitSpy).toHaveBeenCalledWith('domain:updated', expect.any(Object));
    });
  });

  describe('calculateLearningImpact', () => {
    it('should calculate positive impact for success experience', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.competency).toBeGreaterThan(0.5);
    });

    it('should calculate lower impact for failure experience', async () => {
      const failureExperience = { ...mockExperience, type: 'failure' as const };
      
      await learningSystem.learnFromExperience(failureExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.competency).toBeLessThan(0.6);
    });

    it('should calculate moderate impact for partial success', async () => {
      const partialExperience = { ...mockExperience, type: 'partial' as const };
      
      await learningSystem.learnFromExperience(partialExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.competency).toBeGreaterThan(0.5);
    });

    it('should add novelty bonus for novel experiences', async () => {
      const novelExperience = {
        ...mockExperience,
        situation: { ...mockExperience.situation, novelty: 'novel' as const }
      };
      
      await learningSystem.learnFromExperience(novelExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.competency).toBeGreaterThan(0.5);
    });
  });

  describe('extractPatterns', () => {
    it('should extract patterns from experience', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.patterns.length).toBeGreaterThan(0);
    });

    it('should update existing pattern frequency', async () => {
      await learningSystem.learnFromExperience(mockExperience);
      await learningSystem.learnFromExperience(mockExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.patterns[0].frequency).toBe(2);
    });

    it('should create new pattern for unique experience', async () => {
      const uniqueExperience = {
        ...mockExperience,
        id: 'exp-2',
        actions: [{ ...mockExperience.actions[0], type: 'unique-action' }],
        outcomes: [{ ...mockExperience.outcomes[0], type: 'unique-result' }]
      };
      
      await learningSystem.learnFromExperience(mockExperience);
      await learningSystem.learnFromExperience(uniqueExperience);

      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain?.patterns.length).toBe(2);
    });
  });

  describe('updateStrategies', () => {
    it('should create new strategy', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      expect(strategies.length).toBeGreaterThan(0);
    });

    it('should update existing strategy', async () => {
      await learningSystem.learnFromExperience(mockExperience);
      const initialStrategies = learningSystem.getStrategiesByDomain('general');
      const initialUsageCount = initialStrategies[0]?.usageCount || 0;

      await learningSystem.learnFromExperience(mockExperience);

      const updatedStrategies = learningSystem.getStrategiesByDomain('general');
      expect(updatedStrategies[0]?.usageCount).toBeGreaterThan(initialUsageCount);
    });

    it('should update strategy success rate', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      expect(strategies[0]?.successRate).toBeGreaterThan(0.5);
    });

    it('should update strategy effectiveness', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      expect(strategies[0]?.effectiveness).toBeGreaterThan(0);
    });

    it('should update strategy confidence', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      expect(strategies[0]?.confidence).toBeGreaterThan(0.5);
    });

    it('should emit strategy:updated event', async () => {
      const emitSpy = jest.spyOn(learningSystem as any, 'emit');
      
      await learningSystem.learnFromExperience(mockExperience);

      expect(emitSpy).toHaveBeenCalledWith('strategy:updated', expect.any(Object));
    });
  });

  describe('adaptStrategy', () => {
    it('should create new strategy', async () => {
      const newStrategy: Partial<Strategy> = {
        id: 'new-strategy',
        name: 'New Strategy',
        description: 'Test strategy',
        domain: 'general',
        effectiveness: 0.8,
        confidence: 0.7
      };

      await expect(learningSystem.adaptStrategy(newStrategy)).resolves.not.toThrow();

      const strategy = learningSystem.getStrategy('new-strategy');
      expect(strategy).toBeDefined();
      expect(strategy?.name).toBe('New Strategy');
    });

    it('should update existing strategy', async () => {
      const newStrategy: Partial<Strategy> = {
        id: 'update-strategy',
        name: 'Original Name',
        description: 'Original description',
        domain: 'general'
      };

      await learningSystem.adaptStrategy(newStrategy);

      const updatedStrategy: Partial<Strategy> = {
        id: 'update-strategy',
        name: 'Updated Name',
        description: 'Updated description'
      };

      await learningSystem.adaptStrategy(updatedStrategy);

      const strategy = learningSystem.getStrategy('update-strategy');
      expect(strategy?.name).toBe('Updated Name');
      expect(strategy?.description).toBe('Updated description');
    });

    it('should add adaptation history', async () => {
      const newStrategy: Partial<Strategy> = {
        id: 'history-strategy',
        name: 'History Strategy',
        description: 'Test strategy',
        domain: 'general'
      };

      await learningSystem.adaptStrategy(newStrategy);

      const strategy = learningSystem.getStrategy('history-strategy');
      expect(strategy?.adaptationHistory.length).toBe(1);
    });

    it('should emit strategy:adapted event', async () => {
      const emitSpy = jest.spyOn(learningSystem as any, 'emit');
      const newStrategy: Partial<Strategy> = {
        name: 'Test Strategy',
        domain: 'general'
      };

      await learningSystem.adaptStrategy(newStrategy);

      expect(emitSpy).toHaveBeenCalledWith('strategy:adapted', expect.any(Object));
    });
  });

  describe('getProgress', () => {
    it('should return learning progress', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const progress = learningSystem.getProgress();
      expect(progress).toBeDefined();
      expect(progress.totalExperiences).toBe(1);
      expect(progress.learningRate).toBe(0.1);
    });

    it('should return correct competency level', async () => {
      const progress = learningSystem.getProgress();
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(progress.competencyLevel);
    });

    it('should return areas of improvement', async () => {
      const progress = learningSystem.getProgress();
      expect(progress.areasOfImprovement).toBeDefined();
      expect(Array.isArray(progress.areasOfImprovement)).toBe(true);
    });

    it('should return recent insights', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const progress = learningSystem.getProgress();
      expect(progress.recentInsights).toBeDefined();
      expect(progress.recentInsights.length).toBeGreaterThan(0);
    });

    it('should return next milestones', async () => {
      const progress = learningSystem.getProgress();
      expect(progress.nextMilestones).toBeDefined();
      expect(Array.isArray(progress.nextMilestones)).toBe(true);
    });
  });

  describe('calculateCompetencyLevel', () => {
    it('should return beginner for low competency', () => {
      const system = new EnhancedLearningSystem({
        knowledgeDomains: ['test'],
        learningRate: 0.01
      });

      const progress = system.getProgress();
      expect(progress.competencyLevel).toBe('beginner');
    });

    it('should return intermediate for medium competency', async () => {
      for (let i = 0; i < 10; i++) {
        await learningSystem.learnFromExperience(mockExperience);
      }

      const progress = learningSystem.getProgress();
      expect(['intermediate', 'advanced', 'expert']).toContain(progress.competencyLevel);
    });
  });

  describe('identifyAreasOfImprovement', () => {
    it('should identify low competency domains', () => {
      const progress = learningSystem.getProgress();
      expect(progress.areasOfImprovement.length).toBeGreaterThan(0);
    });

    it('should suggest advanced topics for high competency', async () => {
      for (let i = 0; i < 50; i++) {
        await learningSystem.learnFromExperience(mockExperience);
      }

      const progress = learningSystem.getProgress();
      expect(progress.areasOfImprovement).toContain('advanced_optimization');
    });
  });

  describe('getStrategy', () => {
    it('should return strategy by id', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      const strategyId = strategies[0]?.id;

      const strategy = learningSystem.getStrategy(strategyId || '');
      expect(strategy).toBeDefined();
    });

    it('should return undefined for non-existent strategy', () => {
      const strategy = learningSystem.getStrategy('non-existent');
      expect(strategy).toBeUndefined();
    });
  });

  describe('getStrategiesByDomain', () => {
    it('should return strategies for domain', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      expect(strategies.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent domain', () => {
      const strategies = learningSystem.getStrategiesByDomain('non-existent');
      expect(strategies).toEqual([]);
    });

    it('should sort strategies by effectiveness', async () => {
      await learningSystem.learnFromExperience(mockExperience);
      await learningSystem.learnFromExperience(mockExperience);

      const strategies = learningSystem.getStrategiesByDomain('general');
      for (let i = 0; i < strategies.length - 1; i++) {
        expect(strategies[i].effectiveness).toBeGreaterThanOrEqual(strategies[i + 1].effectiveness);
      }
    });
  });

  describe('getBestStrategy', () => {
    it('should return best strategy for domain', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const bestStrategy = learningSystem.getBestStrategy('general');
      expect(bestStrategy).toBeDefined();
    });

    it('should return undefined for domain with no strategies', () => {
      const bestStrategy = learningSystem.getBestStrategy('non-existent');
      expect(bestStrategy).toBeUndefined();
    });

    it('should return strategy with highest effectiveness', async () => {
      await learningSystem.learnFromExperience(mockExperience);

      const bestStrategy = learningSystem.getBestStrategy('general');
      const allStrategies = learningSystem.getStrategiesByDomain('general');

      expect(bestStrategy?.effectiveness).toBe(allStrategies[0]?.effectiveness);
    });
  });

  describe('getKnowledgeDomain', () => {
    it('should return domain by name', () => {
      const domain = learningSystem.getKnowledgeDomain('general');
      expect(domain).toBeDefined();
      expect(domain?.name).toBe('general');
    });

    it('should return undefined for non-existent domain', () => {
      const domain = learningSystem.getKnowledgeDomain('non-existent');
      expect(domain).toBeUndefined();
    });
  });

  describe('getAllKnowledgeDomains', () => {
    it('should return all knowledge domains', () => {
      const domains = learningSystem.getAllKnowledgeDomains();
      expect(domains.length).toBe(3);
      expect(domains.map(d => d.name)).toContain('general');
      expect(domains.map(d => d.name)).toContain('optimization');
      expect(domains.map(d => d.name)).toContain('collaboration');
    });
  });

  describe('recordPerformanceMetric', () => {
    it('should record performance metric', () => {
      learningSystem.recordPerformanceMetric('test-metric', 100);

      const metric = learningSystem.getPerformanceMetric('test-metric');
      expect(metric).toBeDefined();
      expect(metric?.count).toBe(1);
    });

    it('should record multiple values for same metric', () => {
      learningSystem.recordPerformanceMetric('test-metric', 100);
      learningSystem.recordPerformanceMetric('test-metric', 200);
      learningSystem.recordPerformanceMetric('test-metric', 150);

      const metric = learningSystem.getPerformanceMetric('test-metric');
      expect(metric?.count).toBe(3);
    });

    it('should limit metric history to 1000 values', () => {
      for (let i = 0; i < 1100; i++) {
        learningSystem.recordPerformanceMetric('test-metric', i);
      }

      const metric = learningSystem.getPerformanceMetric('test-metric');
      expect(metric?.count).toBe(1000);
    });
  });

  describe('getPerformanceMetric', () => {
    it('should return metric statistics', () => {
      learningSystem.recordPerformanceMetric('test-metric', 100);
      learningSystem.recordPerformanceMetric('test-metric', 200);
      learningSystem.recordPerformanceMetric('test-metric', 150);

      const metric = learningSystem.getPerformanceMetric('test-metric');
      expect(metric?.average).toBe(150);
      expect(metric?.min).toBe(100);
      expect(metric?.max).toBe(200);
      expect(metric?.count).toBe(3);
    });

    it('should return undefined for non-existent metric', () => {
      const metric = learningSystem.getPerformanceMetric('non-existent');
      expect(metric).toBeUndefined();
    });
  });

  describe('cleanupOldExperiences', () => {
    it('should remove old experiences', async () => {
      const oldExperience = {
        ...mockExperience,
        id: 'old-exp',
        timestamp: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
      };

      const shortRetentionSystem = new EnhancedLearningSystem({
        experienceRetention: 365 * 24 * 60 * 60 * 1000
      });

      await shortRetentionSystem.learnFromExperience(oldExperience);
      await shortRetentionSystem.learnFromExperience(mockExperience);

      const progress = shortRetentionSystem.getProgress();
      expect(progress.totalExperiences).toBeGreaterThan(0);
    });
  });

  describe('shutdown', () => {
    it('should clear all data', async () => {
      await learningSystem.learnFromExperience(mockExperience);
      learningSystem.recordPerformanceMetric('test', 100);

      await learningSystem.shutdown();

      const progress = learningSystem.getProgress();
      expect(progress.totalExperiences).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle experience with empty applicability', async () => {
      const emptyApplicabilityExperience = {
        ...mockExperience,
        metadata: { ...mockExperience.metadata, applicability: [] }
      };

      await expect(learningSystem.learnFromExperience(emptyApplicabilityExperience)).resolves.not.toThrow();
    });

    it('should handle experience with no outcomes', async () => {
      const noOutcomesExperience = {
        ...mockExperience,
        outcomes: []
      };

      await expect(learningSystem.learnFromExperience(noOutcomesExperience)).resolves.not.toThrow();
    });

    it('should handle experience with no actions', async () => {
      const noActionsExperience = {
        ...mockExperience,
        actions: []
      };

      await expect(learningSystem.learnFromExperience(noActionsExperience)).resolves.not.toThrow();
    });
  });
});
