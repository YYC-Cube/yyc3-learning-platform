/**
 * YYC³ Learning System Common Type Definitions
 * 统一的公共类型定义
 *
 * This file contains common type definitions used across the learning system
 * to avoid naming conflicts and ensure consistency
 */

/**
 * Feature vector for machine learning operations
 * 机器学习特征向量
 */
export interface FeatureVector {
  values: number[];
  metadata: FeatureMetadata;
}

/**
 * Feature metadata
 * 特征元数据
 */
export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
}

/**
 * Training data interface
 * 训练数据接口
 */
export interface TrainingData {
  features: FeatureVector[];
  labels: Label[];
  timestamps: number[];
}

/**
 * Label interface
 * 标签接口
 */
export interface Label {
  value: unknown;
  confidence: number;
}

/**
 * Time range interface
 * 时间范围接口
 */
export interface TimeRange {
  start: number;
  end: number;
}

/**
 * Entity ID type (UUID or custom string)
 * 实体ID类型
 */
export type EntityId = string;

/**
 * Timestamp type (milliseconds since epoch)
 * 时间戳类型
 */
export type Timestamp = number;

/**
 * Confidence score (0-1)
 * 置信度分数
 */
export type Confidence = number;

/**
 * Priority levels
 * 优先级级别
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Status types
 * 状态类型
 */
export type Status = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Generic result wrapper
 * 通用结果包装器
 */
export interface Result<T = unknown, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  timestamp: number;
}

/**
 * Generic pagination parameters
 * 通用分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic paginated response
 * 通用分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Query filter interface
 * 查询过滤器接口
 */
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  value: unknown;
}

/**
 * Generic data record
 * 通用数据记录
 */
export interface DataRecord {
  id: EntityId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, unknown>;
}

/**
 * Validation result
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Timestamp;
}

/**
 * Progress indicator
 * 进度指示器
 */
export interface Progress {
  current: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

/**
 * Statistical metrics
 * 统计指标
 */
export interface Statistics {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Generic configuration object
 * 通用配置对象
 */
export interface ConfigObject {
  [key: string]: ConfigValue;
}

/**
 * Configuration value type
 * 配置值类型
 */
export type ConfigValue = string | number | boolean | string[] | number[] | ConfigObject | null;

/**
 * Generic content type for knowledge and other data
 * 通用内容类型
 */
export interface Content {
  type: string;
  data: Record<string, unknown>;
  text?: string;
  format?: 'text' | 'json' | 'xml' | 'binary';
  confidence?: number;
  keywords?: string[];
}

/**
 * Node data structure for knowledge graphs
 * 节点数据结构
 */
export interface NodeData {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  content?: Content;
}

/**
 * Pattern data structure
 * 模式数据结构
 */
export interface Pattern {
  id: string;
  type: string;
  description: string;
  confidence: number;
  metadata: Record<string, unknown>;
}

/**
 * Recommendation data structure
 * 推荐数据结构
 */
export interface Recommendation {
  id: string;
  type: string;
  priority: Priority;
  title: string;
  description: string;
  rationale: string;
  expectedImpact: number;
  effort: number;
  timestamp: number;
}

/**
 * Risk assessment data structure
 * 风险评估数据结构
 */
export interface RiskAssessment {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  mitigation: string;
  timestamp: number;
}

/**
 * Strategy efficiency data
 * 策略效率数据
 */
export interface StrategyEfficiency {
  id: string;
  resourceUtilization: number;
  timeEfficiency: number;
  costEfficiency: number;
  overall: number;
  timestamp: number;
}

/**
 * Plan effectiveness data
 * 计划效果数据
 */
export interface PlanEffectiveness {
  id: string;
  goalAchievement: number;
  timelineAdherence: number;
  resourceUsage: number;
  qualityScore: number;
  overall: number;
  timestamp: number;
}

/**
 * Generalization data
 * 泛化数据
 */
export interface Generalization {
  id: string;
  pattern: string;
  scope: string[];
  confidence: number;
  examples: string[];
  timestamp: number;
}

/**
 * Learning insight data
 * 学习洞察数据
 */
export interface LearningInsight {
  id: string;
  type: string;
  content: string;
  confidence: number;
  applicability: string[];
  timestamp: number;
}

/**
 * Knowledge content wrapper
 * 知识内容包装器
 */
export interface KnowledgeContent {
  id: string;
  type: string;
  primary: string;
  secondary?: string[];
  metadata: Record<string, unknown>;
}

/**
 * Validation rule data
 * 验证规则数据
 */
export interface ValidationRuleData {
  id: string;
  name: string;
  type: string;
  condition: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Event listener type
 * 事件监听器类型
 */
export type EventListener = (...args: unknown[]) => void;

/**
 * Event map type
 * 事件映射类型
 */
export interface EventMap {
  [eventName: string]: EventListener[];
}

/**
 * Generic function result
 * 通用函数结果
 */
export type FunctionResult<T = unknown> = Promise<T>;

/**
 * Async operation status
 * 异步操作状态
 */
export interface AsyncOperation {
  id: string;
  status: Status;
  progress: number;
  result?: unknown;
  error?: Error;
  startedAt: number;
  completedAt?: number;
}
