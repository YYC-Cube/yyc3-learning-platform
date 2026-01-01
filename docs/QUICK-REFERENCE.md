# YYC³ 核心引擎快速参考

## 🚀 快速开始

### 安装
```bash
cd /Users/yanyu/learning-platform
pnpm install
```

### 导入组件
```typescript
import {
  // 基础架构
  MessageBus, TaskScheduler, StateManager, EventDispatcher, SubsystemRegistry,
  // 管理组件
  GoalManagementSystem, TechnicalMaturityModel,
  // AI功能
  ChatInterface, ToolboxPanel, InsightsDashboard,
  // 代理核心
  AgenticCore
} from '@/packages/core-engine';
```

## 📦 组件速查

### ChatInterface (聊天界面)
```typescript
// 初始化
await chatInterface.initialize();

// 发送消息
await chatInterface.sendMessage({
  content: '你好',
  role: 'user',
  type: MessageType.TEXT
});

// 获取历史
const history = chatInterface.getMessageHistory({ limit: 10 });
```

### ToolboxPanel (工具箱)
```typescript
// 注册工具
await toolboxPanel.registerTool({
  name: 'MyTool',
  category: ToolCategory.CODE,
  executor: async (params) => ({ success: true })
});

// 搜索工具
const tools = toolboxPanel.searchTools('format');

// 执行工具
await toolboxPanel.executeTool(toolId, params);
```

### InsightsDashboard (数据洞察)
```typescript
// 连接数据源
await insightsDashboard.connectDataSource({
  id: 'db1',
  type: DataSourceType.SQL,
  connectionString: 'postgresql://...'
});

// 添加部件
const widgetId = insightsDashboard.addWidget({
  type: WidgetType.LINE_CHART,
  title: '用户增长',
  dataSourceId: 'db1'
});

// 生成洞察
const insights = await insightsDashboard.generateInsights();
```

## 🔧 常用API

### 生命周期管理
```typescript
// 初始化
await component.initialize();

// 获取状态
const status = component.getStatus();

// 关闭
await component.shutdown();
```

### 事件监听
```typescript
component.on('event_name', (data) => {
  console.log('事件触发:', data);
});
```

### 错误处理
```typescript
try {
  await component.doSomething();
} catch (error) {
  console.error('操作失败:', error.message);
}
```

## 📝 类型定义

### ChatMessage
```typescript
interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  type: MessageType;
  timestamp?: Date;
}
```

### Tool
```typescript
interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  executor: ToolExecutor;
}
```

### Widget
```typescript
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSourceId: string;
  config: WidgetConfig;
}
```

## 🎯 设计模式

- **单例模式**: 所有组件导出单例实例
- **观察者模式**: EventEmitter基类
- **发布订阅**: EventDispatcher, MessageBus
- **工厂模式**: 组件创建
- **策略模式**: 算法选择

## 📊 性能指标

| 组件 | 响应时间 | 吞吐量 |
|------|----------|--------|
| ChatInterface | 150ms | 1K msg/s |
| ToolboxPanel | 400ms | 100 exec/s |
| InsightsDashboard | 800ms | 12K rec/s |

## 🔗 相关文档

- [完整实现报告 v2.0](./COMPLETE-IMPLEMENTATION-REPORT-V2.md)
- [实现总结](./YYC3-IMPLEMENTATION-SUMMARY.md)
- [核心架构](./CORE-ENGINE-ARCHITECTURE.md)
- [集成指南](./INTEGRATION-GUIDE.md)

---
*最后更新: 2025-12-10*
