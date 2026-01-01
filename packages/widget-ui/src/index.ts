// 导出主题上下文
import { ThemeProvider, useTheme, Theme } from './contexts/ThemeContext';

// 导出系统组件
import { PositionOptimizer, WidgetPosition } from './systems/PositionOptimizer';

// 导出UI组件
import { IntelligentAIWidget, WidgetState } from './components/IntelligentAIWidget';

// 导出类型定义
export type {
  Theme,
  WidgetPosition,
  WidgetState
};

// 导出核心组件和钩子
export {
  ThemeProvider,
  useTheme,
  PositionOptimizer,
  IntelligentAIWidget
};

// 默认导出主要组件
export default IntelligentAIWidget;
