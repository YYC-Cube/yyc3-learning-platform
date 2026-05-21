# YYC³ Behavioral Learning Layer - API 文档

> **文档类型**: API 文档  
> **版本**: v1.0.0  
> **创建日期**: 2026-01-03  
> **最后更新**: 2026-01-03  
> **维护者**: YYC³ AI Team  
> **状态**: 已发布

---

## 📋 目录

- [API 概述](#api-概述)
- [核心接口](#核心接口)
- [方法参考](#方法参考)
- [事件](#事件)
- [类型定义](#类型定义)

---

## 📄 API 概述

BehavioralLearningLayer 提供行为记录、模式分析和行为预测的完整 API。

### 导入

```typescript
import { BehavioralLearningLayer } from '@yyc3/learning-system';
import type { IBehavioralLearningLayer } from '@yyc3/learning-system';
```

### 实例化

```typescript
const layer = new BehavioralLearningLayer();
await layer.initialize({
  enabled: true,
  modelType: 'classification',
  updateFrequency: 1000,
  maxHistorySize: 10000,
});
```

---

## 🔌 核心接口

```typescript
interface IBehavioralLearningLayer extends EventEmitter {
  readonly status: LayerStatus;
  readonly config: BehavioralLayerConfig;
  readonly metrics: BehavioralMetrics;

  initialize(config: BehavioralLayerConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;

  recordBehavior(record: BehaviorRecord): Promise<void>;
  recordBehaviors(records: BehaviorRecord[]): Promise<void>;
  analyzePatterns(range?: TimeRange): Promise<BehaviorPattern[]>;
  predict(context: BehaviorContext): Promise<BehaviorPrediction>;
  optimize(): Promise<OptimizationResult>;
}
```

---

## 📖 方法参考

### recordBehavior()

记录单个行为

```typescript
recordBehavior(record: BehaviorRecord): Promise<void>
```

**参数**: `BehaviorRecord` - 行为记录对象

**返回**: `Promise<void>`

**示例**:

```typescript
await layer.recordBehavior({
  id: 'beh_001',
  timestamp: Date.now(),
  actor: { id: 'user_001', type: 'human', properties: {} },
  action: { type: 'click', parameters: { target: 'button' } },
  context: { situation: {}, environment: {} },
  outcome: { result: { success: true }, effectiveness: 1.0 },
  metadata: { source: 'web' },
});
```

---

### analyzePatterns()

分析行为模式

```typescript
analyzePatterns(range?: TimeRange): Promise<BehaviorPattern[]>
```

**参数**: `TimeRange` (可选) - 时间范围

**返回**: `Promise<BehaviorPattern[]>`

**示例**:

```typescript
const patterns = await layer.analyzePatterns({
  start: Date.now() - 86400000,
  end: Date.now(),
});
patterns.forEach((p) => console.log(p.description, p.confidence));
```

---

### predict()

预测行为

```typescript
predict(context: BehaviorContext): Promise<BehaviorPrediction>
```

**参数**: `BehaviorContext` - 行为上下文

**返回**: `Promise<BehaviorPrediction>`

**示例**:

```typescript
const prediction = await layer.predict({
  situation: { type: 'user_session' },
  environment: { state: 'active' },
  actor: { id: 'user_001', type: 'human' },
});
console.log('预测:', prediction.predictedBehavior);
console.log('置信度:', prediction.confidence);
```

---

### optimize()

优化模型

```typescript
optimize(): Promise<OptimizationResult>
```

**返回**: `Promise<OptimizationResult>`

**示例**:

```typescript
const result = await layer.optimize();
console.log('优化完成:', result.optimizations.length);
```

---

## 📡 事件

### pattern_discovered

模式发现时触发

```typescript
layer.on('pattern_discovered', (pattern: BehaviorPattern) => {
  console.log('发现新模式:', pattern.id);
});
```

### behavior_predicted

行为预测完成时触发

```typescript
layer.on('behavior_predicted', (prediction: BehaviorPrediction) => {
  console.log('预测完成:', prediction.id);
});
```

### model_updated

模型更新时触发

```typescript
layer.on('model_updated', (update: ModelUpdateResult) => {
  console.log('模型已更新:', update.modelId);
});
```

---

## 📋 类型定义

### BehaviorRecord

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

### BehaviorPattern

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

### BehaviorPrediction

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

---

**文档结束**
