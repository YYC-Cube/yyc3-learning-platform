/**
 * YYC³ LearningSystem Package Entry Point
 * 三层学习系统包入口文件
 *
 * Exports all LearningSystem interfaces and implementations
 * 导出所有学习系统接口和实现
 */

// Import all interfaces and types
import type {
  ILearningSystem,
  IBehavioralLearningLayer,
  IStrategicLearningLayer,
  IKnowledgeLearningLayer,
  LearningSystemConfig,
  LearningSystemMetrics,
  LearningExperience,
  LearningResult,
  BehaviorRecord,
  AdaptationStrategy,
  KnowledgeUpdate,
  CrossLayerInsight,
  SynchronizationResult,
  PerformanceOptimizationResult,
  LayerMetrics,
  KnowledgeExport,
  LearningError,
  LayerStatus,
  TimeRange,
  BehavioralLayerConfig,
  StrategicLayerConfig,
  KnowledgeLayerConfig,
  IntegrationConfig,
  MonitoringConfig,
  SecurityConfig,
  BehaviorPattern,
  BehaviorPrediction,
  BehaviorContext,
  BehavioralMetrics,
  StrategicGoal,
  StrategicDecision,
  DecisionContext,
  StrategicMetrics,
  KnowledgeItem,
  KnowledgeGraph,
  ReasoningEngine,
  KnowledgeMetrics,
  ReasoningQuery,
  ReasoningResult,
  KnowledgeImport,
  KnowledgeSource,
  ExportFormat,
  KnowledgeGraphConfig,
  ReasoningEngineConfig
} from './ILearningSystem';

// Import main implementations
import { LearningSystem } from './LearningSystem';
import { BehavioralLearningLayer } from './layers/BehavioralLearningLayer';
import { StrategicLearningLayer } from './layers/StrategicLearningLayer';
import { KnowledgeLearningLayer } from './layers/KnowledgeLearningLayer';

// Re-export all types
export type {
  ILearningSystem,
  IBehavioralLearningLayer,
  IStrategicLearningLayer,
  IKnowledgeLearningLayer,
  LearningSystemConfig,
  LearningSystemMetrics,
  LearningExperience,
  LearningResult,
  BehaviorRecord,
  AdaptationStrategy,
  KnowledgeUpdate,
  CrossLayerInsight,
  SynchronizationResult,
  PerformanceOptimizationResult,
  LayerMetrics,
  KnowledgeExport,
  LearningError,
  LayerStatus,
  TimeRange,
  BehavioralLayerConfig,
  StrategicLayerConfig,
  KnowledgeLayerConfig,
  IntegrationConfig,
  MonitoringConfig,
  SecurityConfig,
  BehaviorPattern,
  BehaviorPrediction,
  BehaviorContext,
  BehavioralMetrics,
  StrategicGoal,
  StrategicDecision,
  DecisionContext,
  StrategicMetrics,
  KnowledgeItem,
  KnowledgeGraph,
  ReasoningEngine,
  KnowledgeMetrics,
  ReasoningQuery,
  ReasoningResult,
  KnowledgeImport,
  KnowledgeSource,
  ExportFormat,
  KnowledgeGraphConfig,
  ReasoningEngineConfig
};

// Main implementations
export { LearningSystem };
export { BehavioralLearningLayer };
export { StrategicLearningLayer };
export { KnowledgeLearningLayer };

// Package version
export const VERSION = '1.0.0';

/**
 * Create a new LearningSystem instance
 * 创建新的学习系统实例
 */
export function createLearningSystem(): LearningSystem {
  return new LearningSystem();
}

/**
 * Default configuration for LearningSystem
 * 学习系统默认配置
 */
export const DEFAULT_LEARNING_SYSTEM_CONFIG: LearningSystemConfig = {
  behavioral: {
    enabled: true,
    recordingEnabled: true,
    patternAnalysisEnabled: true,
    predictionEnabled: true,
    models: [
      {
        id: 'behavior-classifier',
        type: 'classification',
        algorithm: 'random_forest',
        parameters: {
          n_estimators: 100,
          max_depth: 10,
          random_state: 42
        },
        training: {
          algorithm: 'cross_validation',
          hyperparameters: {
            cv_folds: 5,
            scoring: 'accuracy'
          },
          validation: {
            method: 'cross_validation',
            parameters: {
              cv_folds: 5,
              scoring: 'accuracy'
            },
            metrics: ['accuracy', 'precision', 'recall', 'f1']
          }
        },
        evaluation: {
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
          thresholds: { accuracy: 0.8, precision: 0.75, recall: 0.8, f1: 0.75 },
          benchmark: 'industry_standard'
        }
      },
      {
        id: 'behavior-predictor',
        type: 'regression',
        algorithm: 'gradient_boosting',
        parameters: {
          n_estimators: 200,
          learning_rate: 0.1,
          max_depth: 6
        },
        training: {
          algorithm: 'time_series_split',
          hyperparameters: {
            test_size: 0.2,
            random_state: 42
          },
          validation: {
            method: 'hold_out',
            parameters: {
              test_size: 0.2
            },
            metrics: ['mae', 'mse', 'r2']
          }
        },
        evaluation: {
          metrics: ['mae', 'mse', 'r2'],
          thresholds: { mae: 0.1, mse: 0.01, r2: 0.8 },
          benchmark: 'historical_performance'
        }
      }
    ],
    dataRetention: {
      retentionPeriod: 365,
      anonymization: true,
      compression: true,
      archival: false
    },
    privacySettings: {
      dataMinimization: true,
      consentManagement: true,
      anonymizationLevel: 'standard',
      accessControl: {
        roles: [
          { id: 'admin', name: 'Administrator', permissions: ['*'] },
          { id: 'analyst', name: 'Data Analyst', permissions: ['read', 'analyze'] },
          { id: 'viewer', name: 'Viewer', permissions: ['read'] }
        ],
        permissions: [
          { id: 'read', resource: 'behavior', action: 'read', condition: null },
          { id: 'analyze', resource: 'behavior', action: 'analyze', condition: null },
          { id: 'write', resource: 'behavior', action: 'write', condition: 'admin_only' }
        ],
        audit: true
      }
    }
  },
  strategic: {
    enabled: true,
    goalManagementEnabled: true,
    strategyOptimizationEnabled: true,
    resourcePlanningEnabled: true,
    planningHorizon: 90,
    evaluationFrequency: 24,
    riskAssessmentEnabled: true
  },
  knowledge: {
    enabled: true,
    reasoningEnabled: true,
    knowledgeValidationEnabled: true,
    generalizationEnabled: true,
    knowledgeGraph: {
      maxNodes: 100000,
      maxDepth: 10,
      updateFrequency: 60,
      consistencyCheck: true,
      indexingStrategy: 'semantic'
    },
    reasoningEngine: {
      algorithm: 'graph_based',
      maxDepth: 5,
      timeout: 30000,
      confidenceThreshold: 0.7,
      evidenceRequirements: {
        minimumReliability: 0.6,
        minimumRelevance: 0.7,
        maximumAge: 365,
        requiredTypes: ['empirical', 'theoretical']
      }
    }
  },
  integration: {
    enabled: true,
    synchronizationFrequency: 60,
    crossLayerLearningEnabled: true,
    insightGenerationEnabled: true,
    optimizationEnabled: true
  },
  monitoring: {
    enabled: true,
    metricsInterval: 5,
    alertThresholds: [
      {
        metric: 'learning_rate',
        operator: 'lt',
        value: 0.1,
        severity: 'warning',
        actions: [{ type: 'log', parameters: { level: 'warning' } }]
      },
      {
        metric: 'prediction_accuracy',
        operator: 'lt',
        value: 0.7,
        severity: 'error',
        actions: [{ type: 'retrain_model', parameters: {} }]
      },
      {
        metric: 'goal_progress',
        operator: 'lt',
        value: 0.5,
        severity: 'warning',
        actions: [{ type: 'notify_stakeholder', parameters: {} }]
      }
    ],
    dataRetention: {
      retentionPeriod: 90,
      anonymization: false,
      compression: true,
      archival: true
    },
    dashboards: [
      {
        id: 'learning_overview',
        name: 'Learning Overview Dashboard',
        widgets: [
          { type: 'metric', title: 'Learning Rate', dataSource: 'learning_rate', visualization: { type: 'gauge', min: 0, max: 1 } },
          { type: 'chart', title: 'Prediction Accuracy', dataSource: 'prediction_accuracy', visualization: { type: 'line', timeRange: '7d' } },
          { type: 'table', title: 'Active Strategies', dataSource: 'active_strategies', visualization: { columns: ['name', 'status', 'effectiveness'] } }
        ],
        refreshInterval: 60,
        filters: [
          { name: 'time_range', type: 'daterange', defaultValue: '7d' },
          { name: 'layer', type: 'select', options: ['behavioral', 'strategic', 'knowledge'], defaultValue: 'all' }
        ]
      }
    ]
  },
  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes_256_gcm',
      keyRotation: {
        frequency: 90,
        automatic: true,
        retention: 365
      },
      dataClassification: {
        levels: ['public', 'internal', 'confidential', 'secret'],
        defaultLevel: 'internal',
        automaticClassification: true
      }
    },
    authentication: {
      method: 'token',
      multiFactor: true,
      sessionTimeout: 480
    },
    authorization: {
      rbac: true,
      abac: false,
      defaultPolicy: {
        action: 'deny',
        exceptions: []
      }
    },
    audit: {
      enabled: true,
      level: 'detailed',
      retention: 2555,
      format: 'json'
    }
  }
};

/**
 * Create a behavioral learning layer instance
 * 创建行为学习层实例
 */
export function createBehavioralLearningLayer(config?: Partial<BehavioralLayerConfig>): BehavioralLearningLayer {
  const layer = new BehavioralLearningLayer();
  if (config) {
    layer.updateConfig(config).catch(console.error);
  }
  return layer;
}

/**
 * Create a strategic learning layer instance
 * 创建策略学习层实例
 */
export function createStrategicLearningLayer(config?: Partial<StrategicLayerConfig>): StrategicLearningLayer {
  const layer = new StrategicLearningLayer();
  if (config) {
    layer.updateConfig(config).catch(console.error);
  }
  return layer;
}

/**
 * Create a knowledge learning layer instance
 * 创建知识学习层实例
 */
export function createKnowledgeLearningLayer(config?: Partial<KnowledgeLayerConfig>): KnowledgeLearningLayer {
  const layer = new KnowledgeLearningLayer();
  if (config) {
    layer.updateConfig(config).catch(console.error);
  }
  return layer;
}

/**
 * Create a learning experience from raw data
 * 从原始数据创建学习经验
 */
export function createLearningExperience(data: any): LearningExperience {
  return {
    id: generateId(),
    timestamp: Date.now(),
    context: {
      situation: data.situation || {},
      environment: data.environment || {},
      objectives: data.objectives || [],
      constraints: data.constraints || [],
      availableResources: data.resources || []
    },
    actions: data.actions || [],
    outcomes: data.outcomes || [],
    feedback: data.feedback || { satisfaction: 0.7, effectiveness: 0.8 },
    metadata: {
      source: data.source || 'manual',
      version: '1.0',
      tags: data.tags || []
    }
  };
}

/**
 * Create a behavioral record
 * 创建行为记录
 */
export function createBehaviorRecord(data: any): BehaviorRecord {
  return {
    id: generateId(),
    timestamp: Date.now(),
    actor: {
      id: data.actor?.id || 'system',
      type: data.actor?.type || 'system',
      properties: data.actor?.properties || {}
    },
    action: {
      type: data.action?.type || 'unknown',
      parameters: data.action?.parameters || {},
      timestamp: Date.now()
    },
    context: {
      situation: data.context?.situation || {},
      environment: data.context?.environment || {},
      history: data.context?.history || [],
      goals: data.context?.goals || []
    },
    outcome: {
      result: data.outcome?.result || { success: false },
      effectiveness: data.outcome?.effectiveness || 0.5,
      sideEffects: data.outcome?.sideEffects || [],
      measurements: data.outcome?.measurements || []
    },
    metadata: {
      duration: data.duration,
      complexity: data.complexity || 'medium',
      tags: data.tags || []
    }
  };
}

/**
 * Create a strategic goal
 * 创建战略目标
 */
export function createStrategicGoal(data: any): StrategicGoal {
  return {
    id: data.id || generateId(),
    name: data.name,
    description: data.description,
    priority: data.priority || 'medium',
    targetValue: data.targetValue,
    currentValue: data.currentValue || 0,
    deadline: data.deadline ? new Date(data.deadline).getTime() : Date.now() + (90 * 24 * 60 * 60 * 1000),
    milestones: data.milestones || [],
    dependencies: data.dependencies || [],
    metrics: {
      progress: data.progress || 0,
      performance: data.performance || 0
    }
  };
}

/**
 * Create a knowledge item
 * 创建知识项
 */
export function createKnowledgeItem(data: any): KnowledgeItem {
  return {
    id: data.id || generateId(),
    type: data.type || 'fact',
    content: data.content,
    source: {
      type: data.source?.type || 'manual',
      url: data.source?.url,
      author: data.source?.author,
      timestamp: data.source?.timestamp || Date.now(),
      reliability: data.source?.reliability || 0.8
    },
    confidence: data.confidence || 0.8,
    validity: {
      start: data.validity?.start || Date.now(),
      end: data.validity?.end || Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
    relationships: data.relationships || [],
    metadata: {
      tags: data.tags || [],
      categories: data.categories || [],
      language: data.language || 'en',
      version: data.version || '1.0'
    }
  };
}

/**
 * Generate a unique ID
 * 生成唯一ID
 */
export function generateId(): string {
  return `ls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utility function to validate learning system configuration
 * 验证学习系统配置的工具函数
 */
export function validateLearningSystemConfig(config: LearningSystemConfig): string[] {
  const errors: string[] = [];

  if (!config.behavioral.enabled && !config.strategic.enabled && !config.knowledge.enabled) {
    errors.push('At least one learning layer must be enabled');
  }

  if (config.behavioral.enabled && !config.behavioral.recordingEnabled) {
    errors.push('Behavioral layer requires recording to be enabled');
  }

  if (config.strategic.enabled && !config.strategic.goalManagementEnabled) {
    errors.push('Strategic layer requires goal management to be enabled');
  }

  if (config.knowledge.enabled && !config.knowledge.reasoningEnabled) {
    errors.push('Knowledge layer requires reasoning to be enabled');
  }

  return errors;
}

/**
 * Utility function to calculate learning performance metrics
 * 计算学习性能指标的工具函数
 */
export function calculateLearningMetrics(results: LearningResult[]): {
  averageConfidence: number;
  learningRate: number;
  effectivenessScore: number;
  qualityScore: number;
} {
  if (results.length === 0) {
    return {
      averageConfidence: 0,
      learningRate: 0,
      effectivenessScore: 0,
      qualityScore: 0
    };
  }

  const averageConfidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
  const learningRate = results.filter(r => r.confidence > 0.7).length / results.length;
  const effectivenessScore = results.reduce((sum, result) => sum + result.applicability.impact, 0) / results.length;
  const qualityScore = (averageConfidence + learningRate + effectivenessScore) / 3;

  return {
    averageConfidence,
    learningRate,
    effectivenessScore,
    qualityScore
  };
}

/**
 * Learning system factory with pre-configured options
 * 学习系统工厂，提供预配置选项
 */
export const LearningSystemFactory = {
  /**
   * Create a lightweight learning system for basic use cases
   * 为基础用例创建轻量级学习系统
   */
  createLightweight: (): LearningSystem => {
    const lightweightConfig: Partial<LearningSystemConfig> = {
      behavioral: {
        enabled: true,
        recordingEnabled: true,
        patternAnalysisEnabled: false,
        predictionEnabled: false,
        models: [],
        dataRetention: {
          retentionPeriod: 30,
          anonymization: false,
          compression: false,
          archival: false
        },
        privacySettings: {
          dataMinimization: false,
          consentManagement: false,
          anonymizationLevel: 'none',
          accessControl: {
            roles: [],
            permissions: [],
            audit: false
          }
        }
      },
      strategic: {
        enabled: false,
        goalManagementEnabled: false,
        strategyOptimizationEnabled: false,
        resourcePlanningEnabled: false,
        planningHorizon: 30,
        evaluationFrequency: 168,
        riskAssessmentEnabled: false
      },
      knowledge: {
        enabled: false,
        reasoningEnabled: false,
        knowledgeValidationEnabled: false,
        generalizationEnabled: false,
        knowledgeGraph: {
          maxNodes: 1000,
          maxDepth: 3,
          updateFrequency: 1440,
          consistencyCheck: false,
          indexingStrategy: 'basic'
        },
        reasoningEngine: {
          algorithm: 'basic',
          maxDepth: 2,
          timeout: 5000,
          confidenceThreshold: 0.5,
          evidenceRequirements: {
            minimumReliability: 0.4,
            minimumRelevance: 0.5,
            maximumAge: 90,
            requiredTypes: ['empirical']
          }
        }
      },
      integration: {
        enabled: true,
        synchronizationFrequency: 1440,
        crossLayerLearningEnabled: false,
        insightGenerationEnabled: false,
        optimizationEnabled: false
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60,
        alertThresholds: [],
        dataRetention: {
          retentionPeriod: 7,
          anonymization: false,
          compression: true,
          archival: false
        },
        dashboards: []
      },
      security: {
        encryption: {
          enabled: false,
          algorithm: 'aes_256_gcm',
          keyRotation: {
            frequency: 365,
            automatic: false,
            retention: 730
          },
          dataClassification: {
            levels: ['public', 'internal'],
            defaultLevel: 'public',
            automaticClassification: false
          }
        },
        authentication: {
          method: 'none',
          multiFactor: false,
          sessionTimeout: 120
        },
        authorization: {
          rbac: false,
          abac: false,
          defaultPolicy: {
            action: 'allow',
            exceptions: []
          }
        },
        audit: {
          enabled: false,
          level: 'basic',
          retention: 7,
          format: 'json'
        }
      }
    };

    const system = new LearningSystem();
    system.initialize({ ...DEFAULT_LEARNING_SYSTEM_CONFIG, ...lightweightConfig }).catch(console.error);
    return system;
  },

  /**
   * Create an enterprise-grade learning system
   * 创建企业级学习系统
   */
  createEnterprise: (): LearningSystem => {
    const enterpriseConfig: Partial<LearningSystemConfig> = {
      behavioral: {
        ...DEFAULT_LEARNING_SYSTEM_CONFIG.behavioral,
        models: [
          ...DEFAULT_LEARNING_SYSTEM_CONFIG.behavioral.models,
          {
            id: 'enterprise-classifier',
            type: 'classification',
            algorithm: 'xgboost',
            parameters: {
              n_estimators: 500,
              max_depth: 15,
              learning_rate: 0.05,
              subsample: 0.8
            },
            training: {
              algorithm: 'cross_validation',
              hyperparameters: {
                cv_folds: 10,
                scoring: 'f1_weighted'
              },
              validation: {
                method: 'cross_validation',
                parameters: {
                  cv_folds: 10,
                  scoring: 'f1_weighted'
                },
                metrics: ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
              }
            },
            evaluation: {
              metrics: ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'],
              thresholds: { accuracy: 0.9, precision: 0.85, recall: 0.9, f1: 0.85, roc_auc: 0.9 },
              benchmark: 'industry_best'
            }
          }
        ]
      },
      strategic: {
        ...DEFAULT_LEARNING_SYSTEM_CONFIG.strategic,
        planningHorizon: 365,
        evaluationFrequency: 12,
        riskAssessmentEnabled: true
      },
      knowledge: {
        ...DEFAULT_LEARNING_SYSTEM_CONFIG.knowledge,
        knowledgeGraph: {
          ...DEFAULT_LEARNING_SYSTEM_CONFIG.knowledge.knowledgeGraph,
          maxNodes: 1000000,
          maxDepth: 20,
          updateFrequency: 15
        },
        reasoningEngine: {
          ...DEFAULT_LEARNING_SYSTEM_CONFIG.knowledge.reasoningEngine,
          algorithm: 'hybrid',
          maxDepth: 10,
          timeout: 120000,
          confidenceThreshold: 0.9
        }
      },
      integration: {
        ...DEFAULT_LEARNING_SYSTEM_CONFIG.integration,
        synchronizationFrequency: 15,
        crossLayerLearningEnabled: true,
        insightGenerationEnabled: true,
        optimizationEnabled: true
      },
      monitoring: {
        ...DEFAULT_LEARNING_SYSTEM_CONFIG.monitoring,
        metricsInterval: 1,
        alertThresholds: [
          {
            metric: 'system_performance',
            operator: 'lt',
            value: 0.8,
            severity: 'critical',
            actions: [
              { type: 'escalate', parameters: { level: 'critical' } },
              { type: 'auto_optimize', parameters: {} }
            ]
          }
        ]
      },
      security: {
        ...DEFAULT_LEARNING_SYSTEM_CONFIG.security,
        encryption: {
          ...DEFAULT_LEARNING_SYSTEM_CONFIG.security.encryption,
          keyRotation: {
            frequency: 30,
            automatic: true,
            retention: 730
          }
        },
        authentication: {
          method: 'certificate',
          multiFactor: true,
          sessionTimeout: 240
        },
        authorization: {
          rbac: true,
          abac: true,
          defaultPolicy: {
            action: 'deny',
            exceptions: [
              { role: 'admin', action: 'allow', condition: null }
            ]
          }
        },
        audit: {
          enabled: true,
          level: 'comprehensive',
          retention: 3650,
          format: 'json'
        }
      }
    };

    const system = new LearningSystem();
    system.initialize({ ...DEFAULT_LEARNING_SYSTEM_CONFIG, ...enterpriseConfig }).catch(console.error);
    return system;
  }
};

// Export all interfaces as namespace for easier import
export * as LearningSystemUtils from './ILearningSystem';