# 📋 YYC³ 学习平台 — 下一阶段规划设计文档

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**

## 📋 文档信息

| 属性         | 内容                                        |
| ------------ | ------------------------------------------- |
| **文档标题** | YYC³ 学习平台 — 下一阶段规划设计文档        |
| **文档版本** | v1.0.0                                      |
| **创建时间** | 2026-05-19                                  |
| **前置文档** | `docs/YYC3-AILP-知识库检索-质变分析报告.md` |
| **评估基准** | 知识库 YYC3-AI-Skill-KB v4.8.0              |

---

## 📊 当前状态快照（2026-05-19）

### 编译与测试

| 指标                  | 值                    | 状态 |
| --------------------- | --------------------- | ---- |
| TypeScript 编译       | 0 errors              | ✅   |
| ESLint                | 0 errors, 47 warnings | ✅   |
| Test Files            | 33/33 passed          | ✅   |
| Test Cases            | 593/593 passed        | ✅   |
| Coverage (Statements) | 92.67%                | ✅   |
| Coverage (Branches)   | 82.22%                | ⚠️   |
| Coverage (Functions)  | 94.52%                | ✅   |
| Coverage (Lines)      | 92.72%                | ✅   |

### 知识库对齐度（实际完成比率）

| 维度                      | 当前值    | 基准       | 完成率   | 评级 |
| ------------------------- | --------- | ---------- | -------- | ---- |
| **CI/CD pnpm 统一**       | 9/9 jobs  | 100%       | **100%** | ✅ S |
| **Node.js 版本**          | CI: 20    | 20         | **100%** | ✅ S |
| **测试覆盖率**            | 92.72%    | 60%        | **154%** | ✅ S |
| **TypeScript 零错误**     | 0         | 0          | **100%** | ✅ S |
| **ESLint 零错误**         | 0         | 0          | **100%** | ✅ S |
| **LICENSE**               | MIT       | MIT        | **100%** | ✅ S |
| **端口规范**              | 3491      | 3200-3500  | **100%** | ✅ S |
| **核心 UI 升级**          | 57/57     | 57         | **100%** | ✅ S |
| **data-slot 覆盖**        | 51/57     | 57         | **89%**  | ✅ S |
| **forwardRef 清理**       | 57/57     | 57         | **100%** | ✅ S |
| **代码分割 (React.lazy)** | 1/24 页面 | 24         | **4%**   | ❌ D |
| **状态管理 (zustand)**    | 0/2       | 2          | **0%**   | ❌ D |
| **骨架屏**                | 0         | 全页面     | **0%**   | ❌ D |
| **Command Palette**       | 无        | 知识库标准 | **0%**   | ❌ D |
| **i18n 国际化**           | 无        | 知识库标准 | **0%**   | ❌ D |

### 综合完成率

```
已完成（S 级）: 10/15 = 66.7%
进行中（A 级）: 0/15  = 0%
已升级（A 级）: 0/15  = 0%
待改进（D 级）: 5/15  = 33.3%
─────────────────────────────────
总体对齐度:       66.7% → Phase 6 完成后 93.3%
```

---

## 🎯 下一阶段规划

### Phase 6: UI 组件全面升级（优先级 P0）

**目标**: 将所有 57 个 UI 组件升级至知识库最新 shadcn/ui 标准

**范围**:

| #   | 任务                | 文件数       | 说明                                                         |
| --- | ------------------- | ------------ | ------------------------------------------------------------ |
| 6.1 | 清除 `forwardRef`   | 37 个        | 替换为函数式声明（React 19+ 不再需要）                       |
| 6.2 | 添加 `data-slot`    | 45 个        | 为每个子组件添加语义化标识                                   |
| 6.3 | 升级 CSS 类         | 37 个        | 对齐最新 CSS 变量 (`bg-input-background`, `ring-ring/50` 等) |
| 6.4 | 添加 `aria-invalid` | ~10 个       | 表单类组件增加无障碍验证状态                                 |
| 6.5 | 更新 `h3` → `div`   | CardTitle 等 | 知识库已统一使用 `div` 语义元素                              |

**执行策略**: 按组件类型分批处理

- 批次 1: 表单组件 (input, textarea, select, checkbox, radio, switch, slider)
- 批次 2: 展示组件 (card, table, badge, avatar, separator, skeleton)
- 批次 3: 反馈组件 (dialog, alert, toast, tooltip, popover, sheet)
- 批次 4: 导航组件 (tabs, menubar, navigation-menu, breadcrumb, pagination)
- 批次 5: 剩余组件

**验收标准**:

- `forwardRef` 残留 = 0
- `data-slot` 覆盖 = 100%
- tsc 零错误 + 593 测试不退化

### Phase 7: 代码分割与性能优化（优先级 P1）

**目标**: 对齐知识库 `React.lazy` + `Suspense` 模式

**范围**:

| #   | 任务                          | 说明                           |
| --- | ----------------------------- | ------------------------------ |
| 7.1 | 创建 `LoadingSkeleton` 组件   | 知识库 `PanelSkeleton` 模式    |
| 7.2 | 创建 `ErrorBoundary` 全局组件 | 知识库 `ErrorBoundary` 模式    |
| 7.3 | 页面级 `dynamic()`            | 24 个 page.tsx 按需加载        |
| 7.4 | 智能浮窗 `React.lazy`         | `IntelligentAIWidget` 动态导入 |
| 7.5 | 添加 `Suspense` 包裹          | 每个动态导入处添加 fallback    |

**验收标准**:

- 首屏 JS bundle 减少 30%+
- Lighthouse Performance > 90
- 所有页面正常渲染无闪烁

### Phase 8: 状态管理现代化（优先级 P2）

**目标**: 引入 zustand 替代 useReducer

**范围**:

| #   | 任务                             | 说明                       |
| --- | -------------------------------- | -------------------------- |
| 8.1 | 安装 zustand                     | `pnpm add zustand`         |
| 8.2 | 迁移 `intelligent-ai-widget.tsx` | useReducer → zustand store |
| 8.3 | 迁移 `EnterpriseAIWidget.tsx`    | useReducer → zustand store |
| 8.4 | 创建 `useThemeStore`             | 对齐知识库主题管理         |
| 8.5 | 创建 `useShortcutStore`          | 对齐知识库快捷键管理       |

**验收标准**:

- useReducer 使用 = 0
- 组件状态逻辑与 UI 解耦
- 测试不退化

### Phase 9: 用户体验增强（优先级 P3）

**目标**: 对齐知识库高级交互模式

**范围**:

| #   | 任务            | 说明                           |
| --- | --------------- | ------------------------------ |
| 9.1 | Command Palette | 全局命令面板（知识库核心功能） |
| 9.2 | 键盘快捷键系统  | `useKeyboardShortcuts` Hook    |
| 9.3 | i18n 国际化框架 | `I18nProvider` + `useI18n`     |
| 9.4 | 全局搜索        | `GlobalSearch` 组件            |
| 9.5 | 通知中心        | `NotificationCenter` 组件      |

### Phase 10: 质量与运维（持续）

| #    | 任务                        | 说明                                |
| ---- | --------------------------- | ----------------------------------- |
| 10.1 | 清理 47 个 ESLint warnings  | `@typescript-eslint/no-unused-vars` |
| 10.2 | 重写 ai-assistant 集成测试  | 组件 UI 与测试假设不匹配            |
| 10.3 | 本地 Node.js 升级到 20      | 与 CI 保持一致                      |
| 10.4 | Branch coverage 提升到 90%+ | 当前 82.22%                         |
| 10.5 | Playwright E2E 测试框架搭建 | 对齐 CI/CD e2e job                  |

---

## 📅 建议实施时间线

```
Phase 6 (UI 升级)     ████████████░░░░  预计 3-4 天
Phase 7 (代码分割)    ░░░░████████░░░░  预计 2-3 天
Phase 8 (状态管理)    ░░░░░░░░████░░░░  预计 1-2 天
Phase 9 (用户体验)    ░░░░░░░░░░░░████  预计 3-5 天
Phase 10 (质量运维)   ░░░░░░░░░░░░░░░░  持续进行
```

---

## 🏗️ 五高五标五化对齐目标

| 维度         | 当前 | Phase 6 后 | Phase 10 后 |
| ------------ | ---- | ---------- | ----------- |
| **高可用**   | 70%  | 75%        | 95%         |
| **高性能**   | 75%  | 80%        | 90%         |
| **高安全**   | 85%  | 85%        | 95%         |
| **高扩展**   | 80%  | 85%        | 90%         |
| **高可维护** | 85%  | 92%        | 95%         |

---

## 📌 决策点

以下决策需要确认后才能推进：

| #   | 决策项       | 选项                            | 建议               |
| --- | ------------ | ------------------------------- | ------------------ |
| 1   | UI 升级范围  | A) 全部 57 个 / B) 仅核心 20 个 | **B（核心优先）**  |
| 2   | zustand 引入 | A) 立即 / B) Phase 8            | **B（先完成 UI）** |
| 3   | 代码分割策略 | A) 全页面 / B) 仅重型组件       | **B（渐进式）**    |
| 4   | i18n 范围    | A) 全站 / B) 仅核心页面         | **B（渐进式）**    |

---

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
