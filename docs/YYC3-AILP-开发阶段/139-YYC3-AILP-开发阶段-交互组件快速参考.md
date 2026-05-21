# 交互功能组件快速参考

**快速查找**: 日常开发必备速查表  
**更新日期**: 2025年12月10日

---

## 🎯 组件速览

| 组件               | 用途     | 核心功能                   | 代码量  |
| ------------------ | -------- | -------------------------- | ------- |
| DragManager        | 拖拽管理 | 边界/吸附/惯性/多点触控    | 1,600行 |
| PositionOptimizer  | 位置优化 | 智能算法/碰撞检测/内容感知 | 1,500行 |
| GestureRecognizer  | 手势识别 | 基础/高级/自定义手势       | 1,400行 |
| ThemeManager       | 主题管理 | 浅色/深色/自动切换         | 1,350行 |
| NotificationCenter | 通知中心 | 队列/分组/历史/统计        | 1,350行 |

---

## 🚀 快速上手

### 1. DragManager - 5行启动拖拽

```typescript
import { DragManager } from '@/packages/core-engine';

const dragManager = new DragManager({
  enableSnapping: true,
  snapThreshold: 20,
});

dragManager.on('drag:end', (data) => {
  console.log('拖拽结束:', data.finalPosition);
});
```

### 2. PositionOptimizer - 3行优化位置

```typescript
import { PositionOptimizer } from '@/packages/core-engine';

const optimizer = new PositionOptimizer();

const result = await optimizer.optimizePosition({
  id: 'widget',
  currentPosition: { x: 100, y: 100 },
  size: { width: 300, height: 400 },
  constraints: {},
  priority: 1,
});

console.log('优化后位置:', result.optimizedPosition);
console.log('可见性评分:', result.score);
```

### 3. GestureRecognizer - 自动识别手势

```typescript
import { GestureRecognizer } from '@/packages/core-engine';

const recognizer = new GestureRecognizer();

recognizer.on('swipe', (data) => {
  console.log('滑动方向:', data.direction);
  if (data.direction === 'down') {
    dismissWidget();
  }
});

recognizer.on('pinch', (data) => {
  console.log('缩放比例:', data.scale);
  scaleWidget(data.scale);
});
```

### 4. ThemeManager - 主题切换

```typescript
import { ThemeManager } from '@/packages/core-engine';

const themeManager = new ThemeManager({
  defaultTheme: 'light',
  enableSystemTheme: true,
  enableAutoSwitch: true,
});

// 切换主题
themeManager.setTheme('dark');

// 创建自定义主题
const myTheme = themeManager.createCustomTheme({
  name: '我的主题',
  colors: {
    primary: themeManager.generateColorScale('#6366f1'),
  },
});
```

### 5. NotificationCenter - 发送通知

```typescript
import { NotificationCenter } from '@/packages/core-engine';

const notificationCenter = new NotificationCenter({
  position: 'top-right',
  maxVisible: 3,
});

// 成功通知
notificationCenter.success('保存成功', '您的更改已保存');

// 错误通知（带操作按钮）
notificationCenter.error('操作失败', '无法连接到服务器', {
  actions: [
    {
      id: 'retry',
      label: '重试',
      type: 'primary',
      handler: () => retryOperation(),
    },
  ],
});
```

---

## 🎯 常见场景速查

### 场景1: 实现可拖拽浮窗

```typescript
const dragManager = new DragManager({
  enableSnapping: true,
  snapThreshold: 20,
  enableInertia: true,
});

// 添加吸附点（屏幕四角）
dragManager.addSnapPoint({
  id: 'top-right',
  position: { x: window.innerWidth - 50, y: 50 },
  threshold: 30,
  priority: 1,
  enabled: true,
});

// 监听拖拽事件
dragManager.on('drag:start', (data) => {
  console.log('开始拖拽');
});

dragManager.on('drag:end', async (data) => {
  // 拖拽结束后优化位置
  const optimizer = new PositionOptimizer();
  const result = await optimizer.optimizePosition({
    id: 'widget',
    currentPosition: data.finalPosition,
    size: { width: 300, height: 400 },
    constraints: {},
    priority: 1,
  });

  // 应用优化后的位置
  applyPosition(result.optimizedPosition);
});
```

### 场景2: 手势控制浮窗

```typescript
const recognizer = new GestureRecognizer({
  swipe: { enabled: true, minVelocity: 300 },
  pinch: { enabled: true },
  doubleTap: { enabled: true },
});

// 下滑关闭
recognizer.on('swipe', (data) => {
  if (data.direction === 'down' && data.velocity.vy > 500) {
    closeWidget();
  }
});

// 捏合缩放
recognizer.on('pinch', (data) => {
  scaleWidget(data.scale);
});

// 双击切换主题
recognizer.on('doubleTap', () => {
  themeManager.toggleTheme();
});
```

### 场景3: 智能通知系统

```typescript
const notificationCenter = new NotificationCenter({
  position: 'top-right',
  maxVisible: 3,
  deduplication: { enabled: true, window: 5000 },
});

// 分组通知
const groupId = notificationCenter.createGroup('系统通知');

notificationCenter.warning('磁盘空间不足', '可用空间低于10%', {
  groupId,
  duration: 0,
  actions: [
    {
      id: 'cleanup',
      label: '清理',
      type: 'primary',
      handler: () => cleanupDisk(),
    },
  ],
});

// 查询未读通知
const unreadCount = notificationCenter.getUnreadCount();
console.log('未读通知:', unreadCount);
```

### 场景4: 主题自动切换

```typescript
const themeManager = new ThemeManager({
  enableAutoSwitch: true,
  enableSystemTheme: true,
});

// 设置自动切换时间
themeManager.setAutoSwitchSchedule({
  lightTheme: { hour: 7, minute: 0 }, // 早上7点切换到浅色
  darkTheme: { hour: 19, minute: 0 }, // 晚上7点切换到深色
});

// 监听主题变化
themeManager.on('theme:changed', (data) => {
  console.log('主题已切换:', data.newTheme.name);
  updateUITheme(data.newTheme);
});
```

---

## ⚙️ 配置速查表

### DragManager 配置

```typescript
{
  enableSnapping: true,              // 启用吸附
  snapThreshold: 20,                 // 吸附阈值(px)
  enableInertia: true,               // 启用惯性
  inertiaDamping: 0.95,             // 惯性阻尼
  bounceEnabled: true,               // 启用边界弹性
  multiTouchEnabled: true,           // 启用多点触控
  throttleDelay: 16                  // 节流延迟(ms) ~60fps
}
```

### PositionOptimizer 配置

```typescript
{
  optimizationStrategy: 'hybrid',    // 优化策略
  maxIterations: 100,                // 最大迭代次数
  enableCollisionAvoidance: true,    // 启用碰撞避免
  enableContentAwareness: true,      // 启用内容感知
  minVisibilityScore: 70,           // 最小可见性分数
  performanceMode: 'balanced'        // 性能模式
}
```

### GestureRecognizer 配置

```typescript
{
  tap: { enabled: true, maxDuration: 250 },
  doubleTap: { enabled: true, maxInterval: 300 },
  longPress: { enabled: true, duration: 500 },
  swipe: { enabled: true, minVelocity: 300 },
  pinch: { enabled: true, threshold: 0.05 },
  rotate: { enabled: true, minRotation: 5 }
}
```

### ThemeManager 配置

```typescript
{
  defaultTheme: 'light',             // 默认主题
  enableSystemTheme: true,           // 跟随系统
  enableAutoSwitch: true,            // 自动切换
  transition: {
    enabled: true,
    duration: 300,                   // 过渡时长(ms)
    easing: 'ease-in-out'
  },
  accessibility: {
    enforceContrast: true,           // 强制对比度
    minContrastRatio: 4.5            // WCAG AA
  }
}
```

### NotificationCenter 配置

```typescript
{
  position: 'top-right',             // 位置
  maxVisible: 3,                     // 最大显示数
  defaultDuration: 3000,             // 默认时长(ms)
  pauseOnHover: true,                // 悬停暂停
  closeOnClick: true,                // 点击关闭
  swipeToDismiss: true,             // 滑动关闭
  deduplication: {
    enabled: true,
    window: 5000                     // 去重窗口(ms)
  }
}
```

---

## 🎨 事件速查表

### DragManager 事件

```typescript
dragManager.on('drag:start', (data) => {}); // 开始拖拽
dragManager.on('drag:move', (data) => {}); // 拖拽中
dragManager.on('drag:end', (data) => {}); // 拖拽结束
dragManager.on('snap:triggered', (data) => {}); // 触发吸附
dragManager.on('boundary:hit', (data) => {}); // 触碰边界
dragManager.on('gesture:recognized', (data) => {}); // 识别手势
```

### PositionOptimizer 事件

```typescript
optimizer.on('optimization:start', (data) => {}); // 开始优化
optimizer.on('optimization:complete', (data) => {}); // 优化完成
optimizer.on('collision:detected', (data) => {}); // 检测碰撞
optimizer.on('position:changed', (data) => {}); // 位置改变
```

### GestureRecognizer 事件

```typescript
recognizer.on('gesture:recognized', (gesture) => {}); // 识别手势
recognizer.on('tap', (data) => {}); // 点击
recognizer.on('swipe', (data) => {}); // 滑动
recognizer.on('pinch', (data) => {}); // 捏合
recognizer.on('rotate', (data) => {}); // 旋转
recognizer.on('longPress', (data) => {}); // 长按
```

### ThemeManager 事件

```typescript
themeManager.on('theme:changed', (data) => {}); // 主题变化
themeManager.on('theme:registered', (data) => {}); // 主题注册
themeManager.on('system-theme:detected', (data) => {}); // 系统主题
themeManager.on('auto-switch:triggered', (data) => {}); // 自动切换
```

### NotificationCenter 事件

```typescript
notificationCenter.on('notification:shown', (data) => {}); // 显示
notificationCenter.on('notification:dismissed', (data) => {}); // 关闭
notificationCenter.on('notification:clicked', (data) => {}); // 点击
notificationCenter.on('notification:action', (data) => {}); // 操作
notificationCenter.on('queue:overflow', (data) => {}); // 溢出
```

---

## 🔧 调试技巧

### 1. 查看拖拽状态

```typescript
console.log('当前拖拽状态:', dragManager.getState());
console.log('拖拽历史:', dragManager.getHistory());
```

### 2. 分析位置优化

```typescript
const result = await optimizer.optimizePosition(target);
console.log('优化评分:', result.score);
console.log('优化原因:', result.reasoning);
console.log('备选位置:', result.alternatives);
```

### 3. 调试手势识别

```typescript
recognizer.on('gesture:recognized', (gesture) => {
  console.log('手势类型:', gesture.type);
  console.log('手势数据:', gesture);
  console.log('触点数量:', gesture.touches.length);
});
```

### 4. 检查主题对比度

```typescript
const contrast = themeManager.calculateContrast('#000', '#fff');
console.log('对比度:', contrast); // 21:1

const accessible = contrast >= 4.5; // WCAG AA
console.log('符合无障碍标准:', accessible);
```

### 5. 监控通知统计

```typescript
const stats = notificationCenter.getStatistics();
console.log('总通知数:', stats.total);
console.log('类型分布:', stats.byType);
console.log('平均响应时间:', stats.averageResponseTime);
```

---

## 📦 导入路径

```typescript
// 单独导入
import { DragManager } from '@/packages/core-engine/src/DragManager';
import { PositionOptimizer } from '@/packages/core-engine/src/PositionOptimizer';
import { GestureRecognizer } from '@/packages/core-engine/src/GestureRecognizer';
import { ThemeManager } from '@/packages/core-engine/src/ThemeManager';
import { NotificationCenter } from '@/packages/core-engine/src/NotificationCenter';

// 统一导入
import {
  DragManager,
  PositionOptimizer,
  GestureRecognizer,
  ThemeManager,
  NotificationCenter,
} from '@/packages/core-engine';

// 类型导入
import type { DragPosition, GestureEvent, Theme, Notification } from '@/packages/core-engine';
```

---

## 🎯 性能优化建议

### 1. 拖拽性能

```typescript
// ✅ 推荐：使用节流
const dragManager = new DragManager({
  throttleDelay: 16, // 60fps
});

// ❌ 避免：频繁更新DOM
dragManager.on('drag:move', (data) => {
  element.style.transform = `translate(${data.x}px, ${data.y}px)`;
});
```

### 2. 位置优化性能

```typescript
// ✅ 推荐：使用快速策略
const optimizer = new PositionOptimizer({
  optimizationStrategy: 'greedy', // 贪心算法最快
  performanceMode: 'fast',
});

// ❌ 避免：过度优化
// optimizationStrategy: 'genetic'  // 遗传算法较慢
```

### 3. 手势识别性能

```typescript
// ✅ 推荐：禁用不需要的手势
const recognizer = new GestureRecognizer({
  tap: { enabled: true },
  swipe: { enabled: true },
  pinch: { enabled: false }, // 不需要就禁用
  rotate: { enabled: false },
});
```

### 4. 主题切换性能

```typescript
// ✅ 推荐：使用CSS变量
const themeManager = new ThemeManager({
  transition: {
    enabled: true,
    duration: 200, // 较短的过渡时间
    properties: ['background-color', 'color'], // 只过渡必要属性
  },
});
```

### 5. 通知性能

```typescript
// ✅ 推荐：限制显示数量
const notificationCenter = new NotificationCenter({
  maxVisible: 3, // 最多显示3个
  maxQueue: 50, // 限制队列长度
  deduplication: { enabled: true }, // 启用去重
});
```

---

## 🐛 常见问题

### Q1: 拖拽不流畅？

**A**: 启用性能优化模式

```typescript
dragManager.enablePerformanceMode();
dragManager.throttleDragEvents(16); // 60fps
```

### Q2: 手势识别不准确？

**A**: 调整识别阈值

```typescript
const recognizer = new GestureRecognizer({
  swipe: {
    minVelocity: 500, // 提高速度阈值
    minDistance: 80, // 提高距离阈值
  },
});
```

### Q3: 主题切换有闪烁？

**A**: 使用CSS变量和过渡

```typescript
const themeManager = new ThemeManager({
  transition: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
  },
});
```

### Q4: 通知太多？

**A**: 启用去重和分组

```typescript
const notificationCenter = new NotificationCenter({
  deduplication: {
    enabled: true,
    window: 5000,
    strategy: 'message',
  },
  grouping: {
    enabled: true,
    autoGroup: true,
  },
});
```

### Q5: 位置优化太慢？

**A**: 使用快速算法

```typescript
const optimizer = new PositionOptimizer({
  optimizationStrategy: 'greedy', // 贪心算法
  performanceMode: 'fast',
  maxIterations: 50, // 减少迭代次数
});
```

---

## 📚 完整文档链接

- **详细实施报告**: `/docs/INTERACTION-COMPONENTS-IMPLEMENTATION.md`
- **架构设计文档**: `/docs/AI智能浮窗系统/04-智能移动AI交互功能组件深度设计.md`
- **API文档**: 待生成
- **示例代码**: `/examples/interaction-components/`

---

**快速参考卡片版本**: v1.0  
**更新日期**: 2025年12月10日  
**维护团队**: YYC³ AI Team

💡 **小贴士**: 将此文档加入书签，开发时随时查阅！
