/**
 * YYC³ 自治AI引擎 - 入口文件
 * 基于五高五标五化设计原则的企业级自治AI系统核心实现
 */

export { AutonomousAIEngine } from './AutonomousAIEngine.js';
export type {
  IAutonomousAIEngine,
  EngineCapabilities,
  EngineMetrics,
  EngineConfiguration,
  Goal,
  Task,
  TaskResult,
  DecisionContext,
  DecisionOption,
  Decision,
  Experience,
  Strategy,
  EngineMessage,
  CollaborativeTask,
  CollaborativeResult,
  HealthStatus,
  DiagnosticInfo,
  ResourceRequirements,
  ResourceAllocation,
  DecisionEvaluation,
  LearningProgress
} from './IAutonomousAIEngine.js';

// 重新导出所有类型定义
export * from './IAutonomousAIEngine.js';

// 默认导出AutonomousAIEngine类
export { AutonomousAIEngine as default } from './AutonomousAIEngine.js';