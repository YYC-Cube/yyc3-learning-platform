# YYC³ Learning System - API 文档

> **文档类型**: API 文档
> **版本**: v1.0.0
> **创建日期**: 2026-01-03
> **最后更新**: 2026-01-03
> **维护者**: YYC³ AI Team
> **状态**: 已发布

---

## 📋 目录

- [API 概述](#api-概述)
- [LearningSystem API](#learningsystem-api)
- [BehavioralLearningLayer API](#behaviorallearninglayer-api)
- [StrategicLearningLayer API]([strategiclearninglayer-api)
- [KnowledgeLearningLayer API](#knowledgelearninglayer-api)
- [工厂函数](#工厂函数)
- [类型定义](#类型定义)

---

## 📄 API 概述

YYC³ Learning System 提供完整的 TypeScript API，支持行为学习、策略学习和知识学习三大核心功能。

### 导入方式

```typescript
// 导入主系统
import { LearningSystem } from '@yyc3/learning-system';

// 导入类型
import type {
  LearningExperience,
  BehaviorContext,
  BehaviorPrediction,
  StrategicGoal,
  KnowledgeItem
} from '@yyc3/learning-system';

// 导入各层
import {
  BehavioralLearningLayer,
  StrategicLearningLayer,
  KnowledgeLearningLayer
} from '@yyc3/learning-system';
```

---

## 🧩 LearningSystem API

### 类定义

```typescript
class LearningSystem extends EventEmitter implements ILearningSystem
```

### 只读属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `status` | `LayerStatus` | 系统状态 |
| `config` | `LearningSystemConfig` | 系统配置 |
| `metrics` | `LearningSystemMetrics` | 系统指标 |
| `behavioralLayer` | `IBehavioralLearningLayer` | 行为学习层 |
| `strategicLayer` | `IStrategicLearningLayer` | 策略学习层 |
| `knowledgeLayer` | `IKnowledgeLearningLayer` | 知识学习层 |

### 生命周期方法

#### initialize()

初始化学习系统

**签名**:
```typescript
initialize(config: LearningSystemConfig): Promise<void>
```

**参数**:
- `config`: 系统配置对象

**返回**: `Promise<void>`

**示例**:
```typescript
const system = new LearningSystem();
await system.initialize({
  behavioral: { enabled: true, modelType: 'classification' },
  strategic: { enabled: true, planningHorizon: 90 },
  knowledge: { enabled: true, graphSize: 100000 }
});
```

---

#### start()

启动学习系统

**签名**:
```typescript
start(): Promise<void>
```

**返回**: `Promise<void>`

**示例**:
```typescript
await system.start();
console.log('System started:', system.status); // 'active'
```

---

#### stop()

停止学习系统

**签名**:
```typescript
stop(): Promise<void>
```

**返回**: `Promise<void>`

**示例**:
```typescript
await system.stop();
console.log('System stopped:', system.status); // 'suspended'
```

---

### 核心学习方法

#### learn()

从经验中学习

**签名**:
```typescript
learn(experience: LearningExperience): Promise<LearningResult>
```

**参数**:
- `experience`: 学习经验对象

**返回**: `Promise<LearningResult>`

**LearningExperience 结构**:
```typescript
interface LearningExperience {
  id: string;
  timestamp: number;
  context: {
    situation: SituationDescription;
    environment: EnvironmentState;
    objectives: Objective[];
    constraints: Constraint[];
    availableResources: Resource[];
  };
  actions: ExperienceAction[];
  outcomes: ExperienceOutcome[];
  feedback: ExperienceFeedback;
  metadata: ExperienceMetadata;
}
```

**示例**:
```typescript
const experience: LearningExperience = {
  id: 'exp_001',
  timestamp: Date.now(),
  context: {
    situation: { type: 'user_request', severity: 'normal' },
    environment: { conditions: 'stable', resources: ['cpu', 'memory'] },
    objectives: [{ id: 'obj_1', description: 'Optimize response time' }],
    constraints: [],
    availableResources: []
  },
  actions: [{ type: 'adjust_model', parameters: { learningRate: 0.01 } }],
  outcomes: [{ success: true, effectiveness: 0.85 }],
  feedback: { satisfaction: 0.9, effectiveness: 0.85 },
  metadata: { source: 'production', version: '1.0' }
};

const result = await system.learn(experience);
console.log('Learning completed:', result.success);
```

---

#### predict()

预测行为

**签名**:
```typescript
predict(context: BehaviorContext): Promise<BehaviorPrediction>
```

**参数**:
- `context`: 行为上下文

**返回**: `Promise<BehaviorPrediction>`

**BehaviorPrediction 结构**:
```typescript
interface BehaviorPrediction {
  id: string;
  predictedBehavior: PredictedBehavior;
  confidence: number;
  reasoning: PredictionReasoning;
  alternatives: AlternativePrediction[];
  timestamp: number;
}
```

**示例**:
```typescript
const context: BehaviorContext = {
  situation: { type: 'system', description: 'High load' },
  environment: { state: 'production' },
  actor: { id: 'user_001', type: 'human' }
};

const prediction = await system.predict(context);
console.log('Predicted behavior:', prediction.predictedBehavior.type);
console.log('Confidence:', prediction.confidence);
```

---

#### optimize()

系统性能优化

**签名**:
```typescript
optimize(): Promise<PerformanceOptimizationResult>
```

**返回**: `Promise<PerformanceOptimizationResult>`

**示例**:
```typescript
const optimization = await system.optimize();
console.log('Optimizations applied:', optimization.optimizations.length);
console.log('Performance improvement:', optimization.performanceGain);
```

---

### 事件监听

#### on()

监听系统事件

**签名**:
```typescript
on(event: string, listener: (...args: any[]) => void): this
```

**可用事件**:
- `'initialized'`: 系统初始化完成
- `'started'`: 系统启动
- `'stopped'`: 系统停止
- `'error'`: 错误发生
- `'learned'`: 学习完成
- `'pattern_discovered'`: 模式发现
- `'optimized'`: 优化完成

**示例**:
```typescript
system.on('pattern_discovered', (pattern) => {
  console.log('New pattern discovered:', pattern.id);
});

system.on('error', (error) => {
  console.error('System error:', error.message);
});
```

---

## 🧠 BehavioralLearningLayer API

### 类定义

```typescript
class BehavioralLearningLayer extends EventEmitter implements IBehavioralLearningLayer
```

### 核心方法

#### recordBehavior()

记录行为

**签名**:
```typescript
recordBehavior(record: BehaviorRecord): Promise<void>
```

**参数**:
- `record`: 行为记录对象

**示例**:
```typescript
await system.behavioralLayer.recordBehavior({
  id: 'beh_001',
  timestamp: Date.now(),
  actor: { id: 'user_001', type: 'human', properties: {} },
  action: { type: 'click', parameters: { target: 'button' } },
  context: { situation: {}, environment: {} },
  outcome: { result: { success: true }, effectiveness: 1.0 },
  metadata: { source: 'web' }
});
```

---

#### analyzePatterns()

分析行为模式

**签名**:
```typescript
analyzePatterns(timeRange: TimeRange): Promise<BehaviorPattern[]>
```

**参数**:
- `timeRange`: 时间范围

**返回**: `Promise<BehaviorPattern[]>`

**示例**:
```typescript
const patterns = await system.behavioralLayer.analyzePatterns({
  start: Date.now() - 86400000, // 24小时前
  end: Date.now()
});

patterns.forEach(pattern => {
  console.log(`Pattern: ${pattern.id}, Frequency: ${pattern.frequency}`);
});
```

---

#### predictBehavior()

预测行为

**签名**:
```typescript
predictBehavior(context: BehaviorContext): Promise<BehaviorPrediction>
```

**参数**:
- `context`: 行为上下文

**返回**: `Promise<BehaviorPrediction>`

**示例**:
```typescript
const prediction = await system.behavioralLayer.predictBehavior({
  situation: { type: 'user_session' },
  environment: { state: 'active' },
  actor: { id: 'user_001', type: 'human' }
});

console.log('Next behavior:', prediction.predictedBehavior.type);
```

---

## 🎯 StrategicLearningLayer API

### 类定义

```typescript
class StrategicLearningLayer extends EventEmitter implements IStrategicLearningLayer
```

### 核心方法

#### setGoals()

设定战略目标

**签名**:
```typescript
setGoals(goals: StrategicGoal[]): Promise<void>
```

**参数**:
- `goals`: 战略目标数组

**示例**:
```typescript
await system.strategicLayer.setGoals([
  {
    id: 'goal_001',
    name: 'Improve User Satisfaction',
    description: 'Increase user satisfaction to 90%',
    priority: 'high',
    targetValue: 0.9,
    currentValue: 0.75,
    deadline: Date.now() + 90 * 86400000,
    status: 'pending'
  }
]);
```

---

#### makeDecision()

制定战略决策

**签名**:
```typescript
makeDecision(context: DecisionContext): Promise<StrategicDecision>
```

**参数**:
- `context`: 决策上下文

**返回**: `Promise<StrategicDecision>`

**示例**:
```typescript
const decision = await system.strategicLayer.makeDecision({
  situation: { type: 'resource_allocation', priority: 'high' },
  objectives: ['maximize_efficiency', 'minimize_cost'],
  constraints: ['budget_limit'],
  availableOptions: [
    { id: 'opt_1', description: 'Scale up', cost: 1000 },
    { id: 'opt_2', description: 'Optimize', cost: 500 }
  ]
});

console.log('Selected option:', decision.selectedOption);
```

---

#### assessPerformance()

评估性能

**签名**:
```typescript
assessPerformance(plan: StrategicPlan): Promise<PlanEvaluation>
```

**参数**:
- `plan`: 战略计划

**返回**: `Promise<PlanEvaluation>`

**示例**:
```typescript
const evaluation = await system.strategicLayer.assessPerformance(plan);
console.log('Goal achievement:', evaluation.goalAchievement);
console.log('Timeline adherence:', evaluation.timelineAdherence);
```

---

## 📚 KnowledgeLearningLayer API

### 类定义

```typescript
class KnowledgeLearningLayer extends EventEmitter implements IKnowledgeLearningLayer
```

### 核心方法

#### acquireKnowledge()

获取知识

**签名**:
```typescript
acquireKnowledge(knowledge: KnowledgeItem): Promise<void>
```

**参数**:
- `knowledge`: 知识项对象

**示例**:
```typescript
await system.knowledgeLayer.acquireKnowledge({
  id: 'know_001',
  type: 'rule',
  content: {
    id: 'rule_001',
    type: 'rule',
    content: 'If user satisfaction drops below 0.7, trigger alert',
    format: 'text'
  },
  source: { id: 'manual', type: 'human', name: 'Expert', reliability: 0.9 },
  confidence: 0.95,
  validity: { start: Date.now(), end: null, confidence: 0.9 },
  relationships: [],
  metadata: { tags: ['user_satisfaction'], source: 'expert', version: '1.0' }
});
```

---

#### reason()

推理知识

**签名**:
```typescript
reason(query: ReasoningQuery): Promise<ReasoningResult>
```

**参数**:
- `query`: 推理查询

**返回**: `Promise<ReasoningResult>`

**示例**:
```typescript
const result = await system.knowledgeLayer.reason({
  id: 'query_001',
  type: 'inference',
  query: 'What actions improve user satisfaction?',
  context: { domain: 'user_experience' },
  constraints: { maxResults: 5, confidence: 0.8 }
});

console.log('Inference result:', result.conclusion);
console.log('Confidence:', result.confidence);
```

---

#### generalizeKnowledge()

泛化知识

**签名**:
```typescript
generalizeKnowledge(criteria: PruningCriteria): Promise<GeneralizationResult>
```

**参数**:
- `criteria`: 泛化标准

**返回**: `Promise<GeneralizationResult>`

**示例**:
```typescript
const generalization = await system.knowledgeLayer.generalizeKnowledge({
  minConfidence: 0.8,
  minSupport: 10,
  timeRange: { start: Date.now() - 30 * 86400000, end: Date.now() }
});

console.log('Generalized patterns:', generalization.generalizations.length);
```

---

## 🏭 工厂函数

### createLearningExperience()

创建学习经验对象

**签名**:
```typescript
// @ts-ignore - Factory function accepts flexible input
createLearningExperience(data: any): LearningExperience
```

**示例**:
```typescript
import { createLearningExperience } from '@yyc3/learning-system';

const experience = createLearningExperience({
  situation: { type: 'test' },
  environment: { state: 'stable' },
  objectives: [{ id: 'obj_1', description: 'Test objective' }],
  actions: [{ type: 'test_action' }],
  outcomes: [{ success: true }]
});
```

---

### createBehaviorRecord()

创建行为记录对象

**签名**:
```typescript
// @ts-ignore - Factory function accepts flexible input
createBehaviorRecord(data: any): BehaviorRecord
```

**示例**:
```typescript
const record = createBehaviorRecord({
  actor: { id: 'user_001', type: 'human' },
  action: { type: 'click', parameters: { target: 'submit' } },
  outcome: { result: { success: true }, effectiveness: 1.0 }
});
```

---

### createStrategicGoal()

创建战略目标对象

**签名**:
```typescript
// @ts-ignore - Factory function accepts flexible input
createStrategicGoal(data: any): StrategicGoal
```

**示例**:
```typescript
const goal = createStrategicGoal({
  name: 'Increase Conversion Rate',
  description: 'Achieve 5% conversion rate',
  priority: 'high',
  targetValue: 0.05,
  currentValue: 0.03
});
```

---

### createKnowledgeItem()

创建知识项对象

**签名**:
```typescript
// @ts-ignore - Factory function accepts flexible input
createKnowledgeItem(data: any): KnowledgeItem
```

**示例**:
```typescript
const knowledge = createKnowledgeItem({
  type: 'fact',
  content: 'Users prefer shorter forms',
  confidence: 0.9
});
```

---

## 📋 类型定义

### 核心类型

#### LayerStatus
```typescript
type LayerStatus = 'initializing' | 'active' | 'suspended' | 'error';
```

#### Priority
```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

#### TimeRange
```typescript
interface TimeRange {
  start: number;
  end: number;
}
```

---

### 结果类型

#### Result
```typescript
interface Result<T = unknown, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  timestamp: number;
}
```

#### LearningResult
```typescript
interface LearningResult {
  id: string;
  success: boolean;
  timestamp: number;
  behavioral?: BehavioralLearning;
  strategic?: StrategicLearning;
  knowledge?: KnowledgeLearning;
  crossLayerInsights?: CrossLayerInsight[];
  metadata?: Record<string, unknown>;
}
```

---

### 行为类型

#### BehaviorRecord
```typescript
interface BehaviorRecord {
  id: string;
  timestamp: number;
  actor: Actor;
  action: Action;
  context: BehaviorContext;
  outcome: ActionResult;
  metadata: BehaviorMetadata;
}
```

#### BehaviorPattern
```typescript
interface BehaviorPattern {
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

---

### 策略类型

#### StrategicGoal
```typescript
interface StrategicGoal {
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

#### StrategicDecision
```typescript
interface StrategicDecision {
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

---

### 知识类型

#### KnowledgeItem
```typescript
interface KnowledgeItem {
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

#### ReasoningResult
```typescript
interface ReasoningResult {
  id: string;
  query: ReasoningQuery;
  conclusion: string;
  reasoning: ReasoningPath[];
  confidence: number;
  evidence: Evidence[];
  timestamp: number;
}
```

---

## 📚 完整 API 索引

- [LearningSystem API](#learningsystem-api)
  - [生命周期方法](#生命周期方法)
  - [核心学习方法](#核心学习方法)
  - [事件监听](#事件监听)
- [BehavioralLearningLayer API](#behaviorallearninglayer-api)
  - [recordBehavior](#recordbehavior)
  - [analyzePatterns](#analyzepatterns)
  - [predictBehavior](#predictbehavior)
- [StrategicLearningLayer API](#strategiclearninglayer-api)
  - [setGoals](#setgoals)
  - [makeDecision](#makedecision)
  - [assessPerformance](#assessperformance)
- [KnowledgeLearningLayer API](#knowledgelearninglayer-api)
  - [acquireKnowledge](#acquireknowledge)
  - [reason](#reason)
  - [generalizeKnowledge](#generalizeknowledge)
- [工厂函数](#工厂函数)
  - [createLearningExperience](#createlearningexperience)
  - [createBehaviorRecord](#createbehaviorrecord)
  - [createStrategicGoal](#createstrategicgoal)
  - [createKnowledgeItem](#createknowledgeitem)

---

## 📞 支持与反馈

- **文档**: [https://yyc3.0379.email/docs](https://yyc3.0379.email/docs)
- **Issues**: [GitHub Issues](https://github.com/YYC-Cube/learning-platform/issues)
- **邮箱**: ai-team@yyc3.com

---

**文档结束**
