# YYC³ Learning System - 项目结构

> **文档类型**: 项目结构文档
> **版本**: v1.0.0
> **创建日期**: 2026-01-03
> **最后更新**: 2026-01-03
> **维护者**: YYC³ AI Team
> **状态**: 已发布

---

## 📋 目录

- [项目概述](#项目概述)
- [目录结构](#目录结构)
- [源代码组织](#源代码组织)
- [文档结构](#文档结构)
- [配置文件](#配置文件)
- [构建输出](#构建输出)
- [测试结构](#测试结构)
- [依赖关系](#依赖关系)

---

## 📄 项目概述

`@yyc3/learning-system` 是一个基于 TypeScript 的三层学习系统，采用 monorepo 架构。

### 项目基本信息

```yaml
名称: @yyc3/learning-system
版本: 1.0.0
类型: TypeScript/JavaScript Package
运行时: Bun >= 1.0.0, Node >= 18.0.0
语言: TypeScript 5.9+
许可证: MIT
```

### 技术栈

- **语言**: TypeScript 5.9.3
- **运行时**: Bun 1.0+
- **构建工具**: Bun
- **测试框架**: Bun Test
- **代码质量**: ESLint, Prettier
- **类型检查**: TypeScript Strict Mode

---

## 📁 目录结构

### 顶层结构

```
learning-platform/
├── packages/
│   └── learning-system/          # 主包目录
│       ├── src/                   # 源代码
│       ├── tests/                 # 测试文件
│       ├── docs/                  # 生成文档
│       ├── dist/                  # 构建输出
│       ├── package.json           # 包配置
│       ├── tsconfig.json          # TypeScript 配置
│       ├── bun.lock               # 依赖锁定
│       ├── README.md              # 包说明
│       ├── LICENSE                # 许可证
│       └── .gitignore             # Git 忽略规则
│
├── docs/                          # 项目文档
│   └── learning-system/           # 学习系统文档
│       ├── architecture/          # 架构文档
│       ├── api/                   # API 文档
│       ├── guides/                # 指南文档
│       ├── types/                 # 类型文档
│       └── INDEX.md               # 文档索引
│
├── .git/                          # Git 仓库
├── .github/                       # GitHub 配置
├── node_modules/                  # 依赖模块
├── bun.lockb                      # Monorepo 锁定文件
├── package.json                   # Monorepo 配置
├── tsconfig.json                  # Monorepo TypeScript 配置
├── README.md                      # 项目说明
└── LICENSE                        # 许可证
```

---

## 💻 源代码组织

### src/ 目录结构

```
src/
├── index.ts                       # 包入口，导出所有公共 API
├── ILearningSystem.ts             # 核心接口定义
├── LearningSystem.ts              # 主系统实现
├── MetaLearningLayer.ts           # 元学习层
├── types/
│   └── common.types.ts            # 通用类型定义
└── layers/
    ├── BehavioralLearningLayer.ts    # 行为学习层
    ├── StrategicLearningLayer.ts     # 战略学习层
    └── KnowledgeLearningLayer.ts     # 知识学习层
```

### 文件说明

#### 1. index.ts - 包入口

**职责**: 导出所有公共 API

**导出内容**:
```typescript
// 主类
export { LearningSystem } from './LearningSystem';

// 接口
export { ILearningSystem } from './ILearningSystem';

// 各层类
export { BehavioralLearningLayer } from './layers/BehavioralLearningLayer';
export { StrategicLearningLayer } from './layers/StrategicLearningLayer';
export { KnowledgeLearningLayer } from './layers/KnowledgeLearningLayer';
export { MetaLearningLayer } from './MetaLearningLayer';

// 类型
export * from './types/common.types';
```

**依赖**: 无（仅重新导出）

**被依赖**: 所有外部使用者

---

#### 2. ILearningSystem.ts - 核心接口

**职责**: 定义 LearningSystem 的完整接口

**关键接口**:
```typescript
// 主系统接口
interface ILearningSystem extends EventEmitter {
  // 只读属性
  readonly status: LayerStatus;
  readonly config: LearningSystemConfig;
  readonly metrics: LearningSystemMetrics;

  // 生命周期方法
  initialize(config: LearningSystemConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  reset(): Promise<void>;

  // 学习方法
  learn(experience: LearningExperience): Promise<LearningResult>;
  learnBatch(experiences: LearningExperience[]): Promise<LearningResult[]>;

  // 预测方法
  predict(context: BehaviorContext): Promise<BehaviorPrediction>;
  predictBatch(contexts: BehaviorContext[]): Promise<BehaviorPrediction[]>;

  // 优化方法
  optimize(): Promise<PerformanceOptimizationResult>;

  // 状态查询
  getStatus(): SystemStatus;
  getMetrics(): LearningSystemMetrics;
  getConfig(): LearningSystemConfig;
}
```

**依赖**:
- `types/common.types.ts` - 类型定义
- `eventemitter3` - EventEmitter

---

#### 3. LearningSystem.ts - 主系统实现

**职责**: 实现三层学习系统的核心功能

**类结构**:
```typescript
class LearningSystem extends EventEmitter implements ILearningSystem {
  // 私有属性
  private _config: LearningSystemConfig;
  private _status: LayerStatus;
  private _metrics: LearningSystemMetrics;

  // 三层学习系统
  private _behavioralLayer: BehavioralLearningLayer;
  private _strategicLayer: StrategicLearningLayer;
  private _knowledgeLayer: KnowledgeLearningLayer;
  private _metaLayer: MetaLearningLayer;

  // 核心方法
  async initialize(config: LearningSystemConfig): Promise<void>
  async learn(experience: LearningExperience): Promise<LearningResult>
  async predict(context: BehaviorContext): Promise<BehaviorPrediction>
  async optimize(): Promise<PerformanceOptimizationResult>
}
```

**依赖**:
- `ILearningSystem.ts` - 接口定义
- `types/common.types.ts` - 类型定义
- `layers/BehavioralLearningLayer.ts` - 行为层
- `layers/StrategicLearningLayer.ts` - 战略层
- `layers/KnowledgeLearningLayer.ts` - 知识层
- `MetaLearningLayer.ts` - 元学习层
- `eventemitter3` - EventEmitter
- `zod` - 数据验证
- `lodash` - 工具函数
- `uuid` - 唯一标识符

**代码量**: ~2,500 行

---

#### 4. MetaLearningLayer.ts - 元学习层

**职责**: 协调和优化三层学习系统

**关键功能**:
- 跨层协调
- 性能监控
- 自适应优化
- 层间通信

**依赖**:
- `types/common.types.ts` - 类型定义
- `eventemitter3` - EventEmitter

**代码量**: ~1,200 行

---

#### 5. types/common.types.ts - 通用类型

**职责**: 定义系统中使用的所有通用类型

**类型分类**:

```typescript
// === 基础类型 ===
enum LayerStatus
type LayerStatus = 'uninitialized' | 'initializing' | 'ready' | 'running' | 'paused' | 'error' | 'stopped'

// === 行为层类型 ===
interface BehaviorRecord
interface BehaviorPattern
interface BehaviorPrediction
interface BehaviorContext

// === 战略层类型 ===
interface StrategicGoal
interface StrategicDecision
interface DecisionContext
interface ResourceAllocation

// === 知识层类型 ===
interface KnowledgeItem
interface KnowledgeGraph
interface ReasoningQuery
interface ReasoningResult

// === 系统级类型 ===
interface LearningExperience
interface LearningResult
interface SystemStatus
interface SystemMetrics
```

**代码量**: ~1,500 行

---

#### 6. layers/BehavioralLearningLayer.ts - 行为学习层

**职责**: 行为记录、模式分析和预测

**模块结构**:
```typescript
class BehavioralLearningLayer extends EventEmitter implements IBehavioralLearningLayer {
  // 行为记录管理
  private behaviorHistory: BehaviorHistoryManager;
  private behaviorStore: BehaviorStore;

  // 模式分析
  private patternAnalyzer: PatternAnalyzer;
  private patternMiner: PatternMiner;

  // 预测模型
  private predictionEngine: PredictionEngine;
  private modelManager: ModelManager;

  // 优化器
  private optimizer: BehaviorOptimizer;

  // 核心方法
  async recordBehavior(record: BehaviorRecord): Promise<void>
  async analyzePatterns(range?: TimeRange): Promise<BehaviorPattern[]>
  async predict(context: BehaviorContext): Promise<BehaviorPrediction>
  async optimize(): Promise<OptimizationResult>
}
```

**核心模块**:
1. **BehaviorHistoryManager**: 管理行为历史
2. **PatternAnalyzer**: 分析行为模式
3. **PredictionEngine**: 预测行为
4. **ModelManager**: 管理预测模型
5. **BehaviorOptimizer**: 优化行为模型

**依赖**:
- `types/common.types.ts` - 类型定义
- `eventemitter3` - EventEmitter
- `lodash` - 工具函数
- `uuid` - 唯一标识符

**代码量**: ~1,800 行

---

#### 7. layers/StrategicLearningLayer.ts - 战略学习层

**职责**: 目标管理、决策制定和资源分配

**模块结构**:
```typescript
class StrategicLearningLayer extends EventEmitter implements IStrategicLearningLayer {
  // 目标管理
  private goalManager: GoalManager;
  private goalTracker: GoalTracker;

  // 决策制定
  private decisionMaker: DecisionMaker;
  private decisionFramework: DecisionFramework;

  // 资源管理
  private resourceAllocator: ResourceAllocator;
  private resourceOptimizer: ResourceOptimizer;

  // 风险管理
  private riskAssessor: RiskAssessor;

  // 核心方法
  async setGoals(goals: StrategicGoal[]): Promise<void>
  async makeDecision(context: DecisionContext): Promise<StrategicDecision>
  async assessPerformance(plan: StrategicPlan): Promise<PlanEvaluation>
  async allocateResources(request: ResourceAllocationRequest): Promise<ResourceAllocation>
}
```

**核心模块**:
1. **GoalManager**: 管理战略目标
2. **DecisionMaker**: 制定决策
3. **ResourceAllocator**: 分配资源
4. **RiskAssessor**: 评估风险
5. **PerformanceTracker**: 跟踪性能

**依赖**:
- `types/common.types.ts` - 类型定义
- `eventemitter3` - EventEmitter
- `lodash` - 工具函数
- `uuid` - 唯一标识符

**代码量**: ~1,500 行

---

#### 8. layers/KnowledgeLearningLayer.ts - 知识学习层

**职责**: 知识管理、推理和泛化

**模块结构**:
```typescript
class KnowledgeLearningLayer extends EventEmitter implements IKnowledgeLearningLayer {
  // 知识图谱
  private knowledgeGraph: KnowledgeGraph;
  private graphManager: KnowledgeGraphManager;

  // 推理引擎
  private reasoningEngine: ReasoningEngine;

  // 知识泛化
  private generalizer: KnowledgeGeneralizer;

  // 知识验证
  private validator: KnowledgeValidator;

  // 核心方法
  async acquireKnowledge(knowledge: KnowledgeItem): Promise<void>
  async reason(query: ReasoningQuery): Promise<ReasoningResult>
  async generalize(criteria: GeneralizationCriteria): Promise<GeneralizationResult>
  async validateKnowledge(id: string): Promise<ValidationResult>
}
```

**核心模块**:
1. **KnowledgeGraphManager**: 管理知识图谱
2. **ReasoningEngine**: 执行推理
3. **KnowledgeGeneralizer**: 泛化知识
4. **KnowledgeValidator**: 验证知识

**依赖**:
- `types/common.types.ts` - 类型定义
- `eventemitter3` - EventEmitter
- `lodash` - 工具函数
- `uuid` - 唯一标识符

**代码量**: ~1,800 行

---

## 📚 文档结构

### docs/learning-system/ 目录

```
docs/learning-system/
├── INDEX.md                                    # 文档主索引
│
├── architecture/                               # 架构文档
│   ├── ARCH-LearningSystem-Overview.md        # 系统架构概览
│   ├── ARCH-BehavioralLayer.md                # 行为层架构
│   ├── ARCH-StrategicLayer.md                 # 战略层架构
│   └── ARCH-KnowledgeLayer.md                 # 知识层架构
│
├── api/                                       # API 文档
│   ├── API-LearningSystem.md                  # 主系统 API
│   ├── API-BehavioralLayer.md                 # 行为层 API
│   ├── API-StrategicLayer.md                  # 战略层 API
│   └── API-KnowledgeLayer.md                  # 知识层 API
│
├── guides/                                    # 指南文档
│   ├── GUIDE-QuickStart.md                    # 快速入门
│   ├── GUIDE-Installation.md                  # 安装指南
│   ├── GUIDE-Configuration.md                 # 配置指南
│   └── GUIDE-AdvancedUsage.md                 # 高级用法
│
└── types/                                     # 类型文档
    └── TYPES-Reference.md                     # 类型参考
```

### 文档统计

| 类型 | 数量 | 总行数 |
|------|------|--------|
| 架构文档 | 4 | 2,500+ |
| API 文档 | 4 | 3,000+ |
| 指南文档 | 4 | 2,000+ |
| 类型文档 | 1 | 700+ |
| 索引文档 | 1 | 300+ |
| **总计** | **14** | **8,500+** |

---

## ⚙️ 配置文件

### package.json

包配置文件，定义包的元数据和依赖。

**关键字段**:
```json
{
  "name": "@yyc3/learning-system",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "engines": {
    "node": ">=18.0.0",
    "bun": ">=1.0.0"
  }
}
```

### tsconfig.json

TypeScript 配置文件，定义编译选项。

**严格配置**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "skipLibCheck": true
  }
}
```

### .gitignore

Git 忽略规则文件。

```
# Dependencies
node_modules/
bun.lockb

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# Logs
logs/
*.log
npm-debug.log*
bun-debug.log*
```

---

## 🏗️ 构建输出

### dist/ 目录

构建输出目录，包含编译后的 JavaScript 和类型定义文件。

```
dist/
├── index.js                    # ES Module 输出
├── index.d.ts                  # TypeScript 类型定义
├── index.js.map                # Source Map
├── LearningSystem.js
├── LearningSystem.d.ts
├── BehavioralLearningLayer.js
├── BehavioralLearningLayer.d.ts
├── StrategicLearningLayer.js
├── StrategicLearningLayer.d.ts
├── KnowledgeLearningLayer.js
├── KnowledgeLearningLayer.d.ts
├── MetaLearningLayer.js
├── MetaLearningLayer.d.ts
└── types/
    └── common.types.d.ts
```

### 构建产物

| 文件 | 格式 | 用途 |
|------|------|------|
| `*.js` | ES Module | 运行时代码 |
| `*.d.ts` | TypeScript Definitions | 类型检查 |
| `*.js.map` | Source Map | 调试 |

---

## 🧪 测试结构

### tests/ 目录

```
tests/
├── unit/                       # 单元测试
│   ├── LearningSystem.test.ts
│   ├── BehavioralLearningLayer.test.ts
│   ├── StrategicLearningLayer.test.ts
│   ├── KnowledgeLearningLayer.test.ts
│   └── types.test.ts
│
├── integration/                # 集成测试
│   ├── system-integration.test.ts
│   └── cross-layer.test.ts
│
├── e2e/                        # 端到端测试
│   └── workflow.test.ts
│
└── fixtures/                   # 测试固件
    ├── experiences.json
    ├── behaviors.json
    └── knowledge.json
```

### 测试命令

```bash
# 运行所有测试
bun test

# 运行测试并生成覆盖率
bun run test:coverage

# 运行特定测试文件
bun test tests/unit/LearningSystem.test.ts

# 监视模式
bun test --watch
```

---

## 🔗 依赖关系

### 生产依赖

```yaml
zod: ^3.22.4                    # 数据验证
eventemitter3: ^5.0.1           # 事件发射器
lodash: ^4.17.21                # 工具函数
uuid: ^9.0.1                    # 唯一标识符生成
```

### 开发依赖

```yaml
typescript: ^5.9.3              # TypeScript 编译器
bun-types: ^1.0.0               # Bun 类型定义
@types/lodash: ^4.14.202        # Lodash 类型定义
@types/uuid: ^9.0.0             # UUID 类型定义
eslint: ^8.50.0                 # 代码检查
prettier: ^3.0.0                # 代码格式化
```

### 依赖图

```
LearningSystem
├── ILearningSystem (interface)
├── MetaLearningLayer
│   └── EventEmitter
├── BehavioralLearningLayer
│   ├── common.types
│   └── EventEmitter
├── StrategicLearningLayer
│   ├── common.types
│   └── EventEmitter
└── KnowledgeLearningLayer
    ├── common.types
    └── EventEmitter

External Dependencies:
├── zod (数据验证)
├── eventemitter3 (事件系统)
├── lodash (工具函数)
└── uuid (ID 生成)
```

---

## 📊 代码统计

### 源代码统计

| 文件 | 行数 | 类型 |
|------|------|------|
| `index.ts` | ~50 | 导出 |
| `ILearningSystem.ts` | ~300 | 接口定义 |
| `LearningSystem.ts` | ~2,500 | 实现 |
| `MetaLearningLayer.ts` | ~1,200 | 实现 |
| `common.types.ts` | ~1,500 | 类型定义 |
| `BehavioralLearningLayer.ts` | ~1,800 | 实现 |
| `StrategicLearningLayer.ts` | ~1,500 | 实现 |
| `KnowledgeLearningLayer.ts` | ~1,800 | 实现 |
| **总计** | **~10,650** | **TypeScript** |

### TypeScript 严格性

- ✅ `any` 类型: **0**
- ✅ 严格模式: **启用**
- ✅ 空值检查: **启用**
- ✅ 类型覆盖率: **100%**

---

## 📦 包结构总结

### 组织原则

1. **分层架构**: 清晰的三层结构（行为、战略、知识）
2. **接口分离**: 每层都有独立的接口定义
3. **类型安全**: 完全的类型安全，0 `any` 类型
4. **事件驱动**: 基于 EventEmitter 的响应式架构
5. **模块化**: 高度模块化，易于维护和扩展

### 设计模式

- **工厂模式**: LearningSystem 作为各层的工厂
- **观察者模式**: EventEmitter 实现事件驱动
- **策略模式**: 可插拔的层配置
- **适配器模式**: 统一的 API 接口
- **单例模式**: 每层在系统中只有一个实例

---

## 📚 相关文档

### 架构文档
- [ARCH-LearningSystem-Overview.md](./architecture/ARCH-LearningSystem-Overview.md) - 系统架构概览
- [ARCH-BehavioralLayer.md](./architecture/ARCH-BehavioralLayer.md) - 行为层架构
- [ARCH-StrategicLayer.md](./architecture/ARCH-StrategicLayer.md) - 战略层架构
- [ARCH-KnowledgeLayer.md](./architecture/ARCH-KnowledgeLayer.md) - 知识层架构

### API 文档
- [API-LearningSystem.md](./api/API-LearningSystem.md) - 主系统 API
- [API-BehavioralLayer.md](./api/API-BehavioralLayer.md) - 行为层 API
- [API-StrategicLayer.md](./api/API-StrategicLayer.md) - 战略层 API
- [API-KnowledgeLayer.md](./api/API-KnowledgeLayer.md) - 知识层 API

### 指南文档
- [GUIDE-QuickStart.md](./guides/GUIDE-QuickStart.md) - 快速入门
- [GUIDE-Installation.md](./guides/GUIDE-Installation.md) - 安装指南
- [GUIDE-Configuration.md](./guides/GUIDE-Configuration.md) - 配置指南

---

## 📞 联系方式

- **技术团队**: YYC³ AI Team
- **邮箱**: ai-team@yyc3.com
- **问题反馈**: [GitHub Issues](https://github.com/YYC-Cube/learning-platform/issues)

---

**文档结束**
