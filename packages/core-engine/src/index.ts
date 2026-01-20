/**
 * YYC³核心引擎入口文件
 */

// ==================== 基础架构组件 ====================

// 消息总线
export {
  MessageBus, messageBus, MessagePriority, type MessageBusConfig,
  type MessageBusMetrics, type MessageEnvelope,
  type MessageHandler,
  type RetryPolicy
} from './MessageBus';

// 任务调度器
export {
  TaskPriority, TaskScheduler, taskScheduler, TaskStatus, type ActiveTask,
  type SchedulerConfig,
  type SchedulerMetrics, type Task, type TaskExecutionContext, type TaskExecutor, type TaskRetryPolicy
} from './TaskScheduler';

// 状态管理器
export {
  LocalStoragePersistenceAdapter, MemoryPersistenceAdapter, StateManager, type PersistenceAdapter, type SnapshotMetadata, type StateDiff, type StateHistory, type StateManagerConfig, type StateSnapshot
} from './StateManager';

// 事件分发器
export {
  EventDispatcher, eventDispatcher, EventPriority, type Event, type EventDispatcherConfig, type EventFilter, type EventHandler, type EventMetadata, type EventMetrics, type EventMiddleware, type EventSubscription, type EventTransformer
} from './EventDispatcher';

// 子系统注册表
export {
  SubsystemCategory, SubsystemRegistry, subsystemRegistry, SubsystemStatus, type HealthCheckResult, type RegisteredSubsystem,
  type RegistryConfig,
  type RegistryMetrics, type Subsystem,
  type SubsystemConfig,
  type SubsystemLifecycle, type SubsystemMetadata
} from './SubsystemRegistry';

// ==================== 高级管理组件 ====================

// 目标管理系统
export {
  GoalManagementSystem, goalManagementSystem, GoalPriority, GoalStatus, type Blocker, type GoalInput,
  type GoalLifecycle, type ImpactAssessment, type Goal as ManagementGoal, type Milestone, type SMARTCriteria, type ValueMetrics
} from './GoalManagementSystem';

// 技术成熟度模型
export {
  MaturityLevel, TechnicalMaturityModel, technicalMaturityModel, type BenchmarkingResult, type DimensionScore,
  type GapAnalysis, type ImprovementRoadmap, type MaturityAssessment, type MaturityDimension, type Recommendation, type TrendAnalysis
} from './TechnicalMaturityModel';

// ==================== 闭环优化系统 ====================

// 数据优化循环
export {
  DataOptimizationLoop,
  dataOptimizationLoop, type DataOptimizationLoopConfig, type DataQualityMetrics, type FeatureEngineeringResult, type FeedbackData, type ModelDeployment,
  type ModelPerformanceMonitoring, type ModelTrainingResult, type OptimizationCycleResult, type TrainingDataset
} from './DataOptimizationLoop';

// 用户体验优化循环
export {
  UXOptimizationLoop,
  uxOptimizationLoop, type DesignIteration, type ExtractedLearnings, type ImplementationResult, type UsabilityTestResults, type UserResearchInsights, type UXImpactMeasurement, type UXOptimizationCycleResult,
  type UXOptimizationLoopConfig, type ValidatedDesign
} from './UXOptimizationLoop';

// 业务价值框架
export {
  BusinessValueFramework,
  businessValueFramework, type BusinessValueCycleResult,
  type BusinessValueFrameworkConfig, type ROIAnalysis, type ScalingStrategy, type ValueMeasurement, type ValueOptimizationPlan, type ValueProposition,
  type ValueStream
} from './BusinessValueFramework';

// 用户反馈循环
export {
  BidirectionalFeedbackLoop, bidirectionalFeedbackLoop, FeedbackActionType, FeedbackInteractionMode, type BidirectionalFeedbackConfig, type BidirectionalLoopResult, type CollaborativePlan, type DeepUnderstanding, type EmotionAnalysis, type EmpatheticResponse, type IntentDecoding, type RealtimeValidation, type RelationshipEvolution, type TransparentExecution, type UserFeedback
} from './UserFeedbackLoop';

// 持续学习系统
export {
  AdaptiveContinuousLearning, adaptiveContinuousLearning, AdaptationStrategy, InnovationLevel, type AdaptiveLearningConfig, type ExperimentResult, type HyperparameterSet, type KnowledgeDistillation, type LearningCycle, type MetaLearningExperience, type ModelArchitecture, type SelfReflection
} from './ContinuousLearning';

// 智能缓存层
export {
  IntelligentCacheLayer, intelligentCacheLayer, CacheLevel, CacheStrategy, type CacheConfig as IntelligentCacheConfig, type CacheEntry as IntelligentCacheEntry, type CacheGetOptions, type CacheMetadata, type CachePerformanceReport, type CacheResult as IntelligentCacheResult, type CacheSetOptions, type ConsistencyCheck, type ConsistencyResult, type EvictionResult, type WarmupPattern, type WarmupReport
} from './IntelligentCacheLayer';

// ==================== AI功能组件 ====================

// 聊天界面组件
export {
  ChatInterface, chatInterface, ChatLayout, ChatTheme, ExportFormat, MessageStatus, MessageType, type Attachment, type ChatMessage,
  type ChatSession, type ChatSettings, type ExportedConversation,
  type IChatInterface, type ReplyContext, type SessionTemplate, type SuggestedReply
} from './ChatInterface';

// 工具箱面板组件
export {
  ToolboxPanel, toolboxPanel, ToolCategory,
  ViewMode, type IToolboxPanel, type Tool, type ToolChain, type ToolDefinition, type ToolExecutionResult, type ToolExecutor, type ToolFilter, type ToolGroup, type ToolRegistrationResult, type ToolSearchResult
} from './ToolboxPanel';

// 数据洞察仪表板组件
export {
  AggregationType, DataSourceType, FilterOperator, InsightsDashboard, insightsDashboard, InsightType, WidgetType, type AnomalyReport, type Insight as DashboardInsight, type TrendAnalysis as DashboardTrendAnalysis, type DataSource, type DataSummary, type IInsightsDashboard, type Widget, type WidgetConfig, type WidgetDefinition
} from './InsightsDashboard';

// ==================== 交互功能组件 ====================

// 拖拽管理器
export {
  DragManager, dragManager, DragState,
  DragTrigger, type ConstraintFunction, type DragConstraints, type DragManagerConfig, type DragOptions, type Rect as DragRect, type DragSession,
  type DragSource,
  type DropTarget, type Position,
  type Velocity
} from './DragManager';

// 位置优化器
export {
  PositionOptimizer,
  positionOptimizer, type CandidatePosition, type DeviceType, type InteractionRecord, type MultiScreenPosition, type OptimizationContext, type PositionConstraints, type PositionMemory, type PositionOptimizerConfig, type RecommendedPosition, type ScoreBreakdown,
  type ScoredCandidate,
  type ScreenInfo, type UIComponent
} from './PositionOptimizer';

// 调整大小控制器
export {
  ResizeController, resizeController, ResizeState, type HandlePosition, type ResizeConfig,
  type ResizeConstraintsType, type ResizeHandle, type Position as ResizePosition, type Rect as ResizeRect, type ResizeResult, type ResizeSession, type Size
} from './ResizeController';

// 主题管理器
export {
  ThemeManager,
  themeManager, type ApplyThemeOptions, type BorderRadiusScheme, type ColorScheme, type ColorValue, type FontScheme,
  type SpacingScheme, type Theme, type ThemeConfig, type ThemeMode, type TransitionScheme
} from './ThemeManager';

// 通知中心
export {
  NotificationCenter,
  notificationCenter, type Notification, type NotificationAction, type NotificationAnimation, type NotificationCenterConfig, type NotificationOptions, type NotificationPosition, type NotificationPriority, type NotificationStats, type NotificationType
} from './NotificationCenter';

// ==================== 代理核心 ====================

export { AgenticCore, AgentState } from './AgenticCore';
export type {
  AgentConfig, AgentContext, AgentResponse, AgentTask, AnalyzedIntent, ContextConfig, Goal, GoalConfig, KeyResult, KnowledgeConfig, Message, PerformanceMetrics, PlanningConfig, ReflectionConfig, Subtask, SystemStatus, TaskMetrics, ToolConfig, UserInput
} from './AgenticCore';

// 导出子系统
export { ActionPlanner, ContextManager, GoalManager, KnowledgeConnector, ReflectionEngine, ToolOrchestrator } from './AgenticCore';

// ==================== 基础支撑功能组件 ====================

// 用户行为分析追踪器
export {
  EventPriority as AnalyticsEventPriority, EventType as AnalyticsEventType, AnalyticsTracker,
  analyticsTracker, AnonymizationLevel, type AnalysisResult, type AnalyticsConfig, type Insight as AnalyticsInsight,
  type BatchQuery, type BatchReport, type DeliveryConfig, type EventContext,
  type GeoLocation, type JourneyEvent, type RawEvent, type RealtimeAnalysis, type RealtimeQuery, type ReportData, type Timeframe, type TrackingOptions,
  type TrackingResult, type UserBehaviorAnalysis,
  type UserJourney, type Visualization
} from './AnalyticsTracker';

// 安全管理组件
export {
  SecurityManager,
  securityManager
} from './SecurityManager';

// 离线支持系统
export {
  ConflictStrategy, ConnectionType,
  EffectiveConnectionType, OfflineSupportSystem,
  offlineSupportSystem, OperationPriority, OperationType, PreloadStrategy, SyncStrategy, type ConflictResolution, type NetworkStatus, type OfflineConfig, type OfflineOperation,
  type OfflineOperationResult, type RetryPolicy as OfflineRetryPolicy, type VerificationResult as OfflineVerificationResult, type OptimizationDetail, type PreloadItem, type PreloadResult, type QueuedOperation, type StorageOptimizationReport, type SyncError, type SyncProgress, type SyncResult
} from './OfflineSupport';

// ==================== 分布式系统组件 ====================

// 服务发现
export {
  ServiceDiscovery, ServiceStatus, ServiceType, type HealthCheckConfig, type ServiceDiscoveryConfig,
  type ServiceDiscoveryMetrics, type ServiceInstance,
  type ServiceMetadata, type ServiceQuery
} from './ServiceDiscovery';

// 增强消息总线
export {
  EnhancedMessageBus, MessagePriority as EnhancedMessagePriority, MessageType as EnhancedMessageType, type MessageBusConfig as EnhancedMessageBusConfig,
  type MessageBusMetrics as EnhancedMessageBusMetrics, type MessageEnvelope as EnhancedMessageEnvelope, type MessageHandler as EnhancedMessageHandler, type RetryPolicy as EnhancedRetryPolicy, type MessageMetadata, type MessagePersistence, type MessageRouter, type MessageTrace, type Subscription
} from './EnhancedMessageBus';

// 智能负载均衡器
export {
  IntelligentLoadBalancer,
  LoadBalancingStrategy, type CircuitBreakerState, type LoadBalancerConfig, type LoadBalancerEvent, type LoadBalancerMetrics, type ServiceLoadMetrics
} from './IntelligentLoadBalancer';

// ==================== 容灾备份系统 ====================

// 容灾备份系统
export {
  BackupStatus, BackupType, DisasterLevel, DisasterRecoverySystem, RestoreStatus, type BackupConfig, type BackupFile, type BackupMetadata, type DisasterRecoveryEvent, type DisasterRecoveryMetrics, type DisasterRecoveryPlan,
  type RecoveryStep, type RestoreConfig,
  type RestoreMetadata, type TestResult, type VerificationResult
} from './DisasterRecoverySystem';

// ==================== 性能优化组件 ====================

// 资源监控器
export {
  ResourceMonitor, type CPUMetrics, type DiskMetrics, type MemoryMetrics, type NetworkMetrics, type ResourceAlert, type ResourceMetrics, type ResourceMonitorConfig,
  type ResourceStatistics, type SystemMetrics
} from './utils/ResourceMonitor';

// 缓存管理器
export {
  CacheManager, type CacheConfig, type CacheEntry, type CacheManagerConfig, type CacheResult, type CacheStatistics, type EvictionPolicy
} from './cache/CacheManager';

// ==================== 安全工具组件 ====================

// 速率限制器
export {
  RateLimiter, RateLimitStrategy, type RateLimitConfig, type RateLimitEntry, type RateLimitResult, type RateLimitStats
} from './security/RateLimiter';

// 验证工具
export {
  ValidationUtility, type Schema, type ValidationResult, type ValidationRule
} from './utils/ValidationUtility';

// 加密工具
export {
  EncryptionUtility, type EncryptionConfig, type EncryptedData, type HashedData
} from './utils/EncryptionUtility';

