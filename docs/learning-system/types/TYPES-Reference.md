# YYC³ Learning System - 类型定义文档

> **文档类型**: 类型定义
> **版本**: v1.0.0
> **创建日期**: 2026-01-03
> **最后更新**: 2026-01-03
> **维护者**: YYC³ AI Team
> **状态**: 已发布

---

## 📋 目录

- [类型系统概述](#类型系统概述)
- [公共类型 (Common Types)](#公共类型-common-types)
- [接口类型 (Interface Types)](#接口类型)
- [枚举类型 (Enum Types)](#枚举类型-enum-types)
- [类型工具 (Type Utilities)](#类型工具-type-utilities)

---

## 📄 类型系统概述

YYC³ Learning System 使用完整的 TypeScript 类型系统，提供类型安全和智能提示。

### 类型层次

```
@yyc3/learning-system
├── src/types/common.types.ts (公共类型)
│   ├── 基础类型 (Basic Types)
│   ├── 数据类型 (Data Types)
│   ├── 结果类型 (Result Types)
│   └── 内容类型 (Content Types)
│
├── src/ILearningSystem.ts (接口类型)
│   ├── 行为层接口 (Behavioral Layer)
│   ├── 策略层接口 (Strategic Layer)
│   └── 知识层接口 (Knowledge Layer)
│
└── src/index.ts (导出类型)
    └── 统一导出所有类型
```

### 导入类型

```typescript
// 导入所有类型
import type {
  // 公共类型
  ConfigObject,
  Content,
  NodeData,
  Pattern,
  Recommendation,

  // 接口类型
  LearningExperience,
  BehaviorContext,
  BehaviorPrediction,
  StrategicGoal,
  KnowledgeItem,

  // 工厂函数
  createLearningExperience,
  createBehaviorRecord,
  createStrategicGoal,
  createKnowledgeItem
} from '@yyc3/learning-system';
```

---

## 🔤 公共类型 (Common Types)

### 基础类型

#### EntityId
实体唯一标识符类型

```typescript
export type EntityId = string;
```

**使用场景**: 所有实体的唯一标识

**示例**:
```typescript
const userId: EntityId = 'user_123';
const knowledgeId: EntityId = 'know_456';
```

---

#### Timestamp
时间戳类型（毫秒）

```typescript
export type Timestamp = number;
```

**使用场景**: 所有时间相关字段

**示例**:
```typescript
const now: Timestamp = Date.now();
const createdAt: Timestamp = 1704230400000;
```

---

#### Confidence
置信度分数类型（0-1）

```typescript
export type Confidence = number;
```

**使用场景**: 预测置信度、知识可信度

**示例**:
```typescript
const confidence: Confidence = 0.95; // 95% 置信度
```

---

#### Priority
优先级级别

```typescript
export type Priority = 'low' | 'medium' | 'high' | 'critical';
```

**使用场景**: 任务优先级、目标优先级

**示例**:
```typescript
const priority: Priority = 'high';
```

---

#### Status
状态类型

```typescript
export type Status = 'pending' | 'in_progress' | 'completed' | 'failed';
```

**使用场景**: 任务状态、系统状态

**示例**:
```typescript
const status: Status = 'in_progress';
```

---

### 数据类型

#### FeatureVector
特征向量

```typescript
export interface FeatureVector {
  values: number[];
  metadata: FeatureMetadata;
}

export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
}
```

**使用场景**: 机器学习特征

**示例**:
```typescript
const feature: FeatureVector = {
  values: [0.5, 0.8, 0.3],
  metadata: {
    id: 'feat_001',
    name: 'User Engagement',
    description: 'User engagement metrics',
    type: 'numeric',
    version: '1.0'
  }
};
```

---

#### TrainingData
训练数据

```typescript
export interface TrainingData {
  features: FeatureVector[];
  labels: Label[];
  timestamps: number[];
}

export interface Label {
  value: unknown;
  confidence: number;
}
```

**使用场景**: 模型训练

**示例**:
```typescript
const trainingData: TrainingData = {
  features: [feature1, feature2],
  labels: [{ value: 'class_a', confidence: 0.9 }],
  timestamps: [Date.now()]
};
```

---

#### TimeRange
时间范围

```typescript
export interface TimeRange {
  start: number;
  end: number;
}
```

**使用场景**: 查询时间范围、分析周期

**示例**:
```typescript
const range: TimeRange = {
  start: Date.now() - 86400000, // 24小时前
  end: Date.now()
};
```

---

### 结果类型

#### Result
通用结果包装器

```typescript
export interface Result<T = unknown, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  timestamp: number;
}
```

**使用场景**: API 响应、操作结果

**示例**:
```typescript
const result: Result<string> = {
  success: true,
  data: 'Operation completed',
  timestamp: Date.now()
};
```

---

#### ValidationResult
验证结果

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Timestamp;
}
```

**使用场景**: 数据验证

**示例**:
```typescript
const validation: ValidationResult = {
  isValid: false,
  errors: ['Missing required field: id'],
  warnings: ['Deprecated property used'],
  timestamp: Date.now()
};
```

---

#### PaginatedResponse
分页响应

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

**使用场景**: 列表查询

**示例**:
```typescript
const response: PaginatedResponse<BehaviorPattern> = {
  items: [pattern1, pattern2],
  total: 100,
  page: 1,
  pageSize: 10,
  hasMore: true
};
```

---

### 内容类型

#### Content
通用内容类型

```typescript
export interface Content {
  type: string;
  data: Record<string, unknown>;
  text?: string;
  format?: 'text' | 'json' | 'xml' | 'binary';
}
```

**使用场景**: 知识内容、消息内容

**示例**:
```typescript
const content: Content = {
  type: 'rule',
  data: { condition: 'x > 10', action: 'trigger_alert' },
  text: 'If x > 10, trigger alert',
  format: 'text'
};
```

---

#### NodeData
节点数据结构

```typescript
export interface NodeData {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  content?: Content;
}
```

**使用场景**: 知识图谱节点

**示例**:
```typescript
const node: NodeData = {
  id: 'node_001',
  type: 'concept',
  properties: { category: 'AI', importance: 'high' },
  content: content
};
```

---

#### Pattern
模式数据结构

```typescript
export interface Pattern {
  id: string;
  type: string;
  description: string;
  confidence: number;
  metadata: Record<string, unknown>;
}
```

**使用场景**: 行为模式、知识模式

**示例**:
```typescript
const pattern: Pattern = {
  id: 'pattern_001',
  type: 'behavioral',
  description: 'Users who click X often also click Y',
  confidence: 0.85,
  metadata: { frequency: 100, support: 0.3 }
};
```

---

#### Recommendation
推荐数据结构

```typescript
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
```

**使用场景**: 系统推荐、优化建议

**示例**:
```typescript
const recommendation: Recommendation = {
  id: 'rec_001',
  type: 'optimization',
  priority: 'high',
  title: 'Increase model accuracy',
  description: 'Add more training data',
  rationale: 'Current accuracy is below threshold',
  expectedImpact: 0.15,
  effort: 0.5,
  timestamp: Date.now()
};
```

---

### 配置类型

#### ConfigObject
通用配置对象

```typescript
export interface ConfigObject {
  [key: string]: ConfigValue;
}

export type ConfigValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | ConfigObject
  | null;
```

**使用场景**: 动态配置、选项参数

**示例**:
```typescript
const config: ConfigObject = {
  enabled: true,
  threshold: 0.8,
  tags: ['important', 'production'],
  nested: { key: 'value' }
};
```

---

## 🔌 接口类型 (Interface Types)

### 行为层类型

#### BehaviorRecord
行为记录

```typescript
export interface BehaviorRecord {
  id: string;
  timestamp: number;
  actor: Actor;
  action: Action;
  context: BehaviorContext;
  outcome: ActionResult;
  metadata: BehaviorMetadata;
}
```

**字段说明**:
- `id`: 行为唯一标识
- `timestamp`: 时间戳
- `actor`: 行为主体信息
- `action`: 执行的动作
- `context`: 行为上下文
- `outcome`: 行为结果
- `metadata`: 元数据

---

#### BehaviorPattern
行为模式

```typescript
export interface BehaviorPattern {
  id: string;
  type: string;
  description: string;
  frequency: number;
  confidence: number;
  conditions: PatternCondition[];
  actions: PatternAction[];
  timestamp: number;
}
```

**字段说明**:
- `frequency`: 模式出现频率
- `conditions`: 模式条件列表
- `actions`: 模式动作列表

---

#### BehaviorPrediction
行为预测

```typescript
export interface BehaviorPrediction {
  id: string;
  predictedBehavior: PredictedBehavior;
  confidence: number;
  reasoning: PredictionReasoning;
  alternatives: AlternativePrediction[];
  timestamp: number;
}
```

**字段说明**:
- `predictedBehavior`: 预测的行为
- `reasoning`: 预测推理过程
- `alternatives`: 备选预测

---

### 策略层类型

#### StrategicGoal
战略目标

```typescript
export interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  targetValue: TargetValue;
  currentValue: number;
  deadline: number;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metrics: GoalMetrics;
  dependencies: string[];
  constraints: Constraint[];
  resources: Resource[];
  timeline: PlanTimeline;
  owner: string;
  stakeholders: string[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
```

**字段说明**:
- `targetValue`: 目标值
- `currentValue`: 当前值
- `progress`: 进度（0-1）
- `metrics`: 目标指标
- `timeline`: 时间线

---

#### StrategicDecision
战略决策

```typescript
export interface StrategicDecision {
  id: string;
  context: DecisionContext;
  options: DecisionOption[];
  selectedOption: DecisionOption;
  reasoning: DecisionReasoning;
  expectedOutcomes: ExpectedOutcome[];
  risks: DecisionRisk[];
  timestamp: number;
}
```

**字段说明**:
- `options`: 可选方案列表
- `selectedOption`: 选定方案
- `reasoning`: 决策推理
- `risks`: 关联风险

---

### 知识层类型

#### KnowledgeItem
知识项

```typescript
export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  content: KnowledgeContent;
  source: KnowledgeSource;
  confidence: number;
  validity: ValidityPeriod;
  relationships: KnowledgeRelationship[];
  metadata: KnowledgeMetadata;
}
```

**字段说明**:
- `type`: 知识类型（fact, rule, concept等）
- `content`: 知识内容
- `validity`: 有效期
- `relationships`: 知识关系

---

#### ReasoningResult
推理结果

```typescript
export interface ReasoningResult {
  id: string;
  query: ReasoningQuery;
  conclusion: string;
  reasoning: ReasoningPath[];
  confidence: number;
  evidence: Evidence[];
  timestamp: number;
}
```

**字段说明**:
- `query`: 推理查询
- `conclusion`: 推理结论
- `reasoning`: 推理路径
- `evidence`: 支持证据

---

## 🎨 枚举类型 (Enum Types)

### LayerStatus
层状态

```typescript
export type LayerStatus =
  | 'initializing'  // 初始化中
  | 'active'        // 活跃
  | 'suspended'     // 暂停
  | 'error';        // 错误
```

---

### ModelType
模型类型

```typescript
export type ModelType =
  | 'classification'  // 分类
  | 'regression'     // 回归
  | 'clustering'     // 聚类
  | 'anomaly_detection'; // 异常检测
```

---

### KnowledgeType
知识类型

```typescript
export type KnowledgeType =
  | 'fact'      // 事实
  | 'rule'      // 规则
  | 'concept'   // 概念
  | 'pattern'   // 模式
  | 'procedure';// 流程
```

---

## 🛠️ 类型工具 (Type Utilities)

### 工厂函数类型

```typescript
// @ts-ignore - Factory function accepts flexible input
declare function createLearningExperience(data: any): LearningExperience;

// @ts-ignore - Factory function accepts flexible input
declare function createBehaviorRecord(data: any): BehaviorRecord;

// @ts-ignore - Factory function accepts flexible input
declare function createStrategicGoal(data: any): StrategicGoal;

// @ts-ignore - Factory function accepts flexible input
declare function createKnowledgeItem(data: any): KnowledgeItem;
```

**使用说明**: 工厂函数接受灵活输入，返回类型安全的对象

---

### 类型守卫

```typescript
// 检查是否为有效的置信度
function isValidConfidence(value: number): value is Confidence {
  return value >= 0 && value <= 1;
}

// 检查是否为有效的时间戳
function isValidTimestamp(value: number): value is Timestamp {
  return value > 0 && value <= Date.now();
}
```

---

### 类型断言

```typescript
// 断言为 ConfigObject
function asConfigObject(value: unknown): ConfigObject {
  return value as ConfigObject;
}

// 断言为 NodeData
function asNodeData(value: unknown): NodeData {
  return value as NodeData;
}
```

---

## 📚 类型导出索引

### 完整导出列表

```typescript
// src/index.ts
export type {
  // 基础类型
  EntityId,
  Timestamp,
  Confidence,
  Priority,
  Status,

  // 数据类型
  FeatureVector,
  TrainingData,
  TimeRange,

  // 结果类型
  Result,
  ValidationResult,
  PaginatedResponse,

  // 内容类型
  Content,
  NodeData,
  Pattern,
  Recommendation,

  // 配置类型
  ConfigObject,

  // 行为层类型
  BehaviorRecord,
  BehaviorPattern,
  BehaviorPrediction,
  BehaviorContext,

  // 策略层类型
  StrategicGoal,
  StrategicDecision,
  DecisionContext,

  // 知识层类型
  KnowledgeItem,
  KnowledgeGraph,
  ReasoningResult,
  ReasoningQuery,

  // 系统类型
  LearningSystemConfig,
  LearningSystemMetrics,
  LearningExperience,
  LearningResult
};

// 导出工厂函数
export {
  createLearningExperience,
  createBehaviorRecord,
  createStrategicGoal,
  createKnowledgeItem
};
```

---

## 💡 类型使用最佳实践

### 1. 类型导入

```typescript
// ✅ 推荐：使用 type 导入
import type { BehaviorRecord, BehaviorContext } from '@yyc3/learning-system';

// ❌ 避免：使用 value 导入（除非需要运行时）
import { LearningSystem } from '@yyc3/learning-system';
```

### 2. 类型断言

```typescript
// ✅ 推荐：使用类型守卫
function isBehaviorRecord(value: unknown): value is BehaviorRecord {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// ❌ 避免：直接断言
const record = value as BehaviorRecord;
```

### 3. 可选属性

```typescript
// ✅ 推荐：明确检查可选属性
if (data.metadata) {
  console.log(data.metadata.source);
}

// ❌ 避免：直接访问可选属性
console.log(data.metadata.source);
```

### 4. 联合类型

```typescript
// ✅ 推荐：使用类型收窄
function handleStatus(status: Status) {
  if (status === 'completed') {
    // TypeScript 知道这里是 'completed'
  }
}

// ❌ 避免：忽略类型收窄
function handleStatus(status: Status) {
  // TypeScript 无法优化
}
```

---

## 📖 相关文档

- [API 文档](./API-LearningSystem.md) - 完整 API 参考
- [架构文档](./architecture/ARCH-LearningSystem-Overview.md) - 系统架构
- [快速开始](./GUIDE-QuickStart.md) - 使用指南

---

## 📞 技术支持

- **邮箱**: ai-team@yyc3.com
- **Issues**: [GitHub Issues](https://github.com/YYC-Cube/learning-platform/issues)

---

**文档结束**
