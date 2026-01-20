import { createLogger } from '../lib/logger';

const logger = createLogger('PositionOptimizer');

export interface ViewportInfo {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export class PositionOptimizer {
  private static readonly DEFAULT_WIDTH = 350;
  private static readonly DEFAULT_HEIGHT = 450;
  private static readonly MIN_WIDTH = 280;
  private static readonly MIN_HEIGHT = 320;
  private static readonly MAX_WIDTH = 800;
  private static readonly MAX_HEIGHT = 700;
  private static readonly MARGIN = 20;

  /**
   * 获取初始位置
   */
  public getInitialPosition(position: string): WidgetPosition {
    // 默认位置，用于服务器端渲染
    const basePosition: WidgetPosition = {
      x: 20,
      y: 100,
      width: PositionOptimizer.DEFAULT_WIDTH,
      height: PositionOptimizer.DEFAULT_HEIGHT,
      zIndex: 1000
    };
    
    // 仅在客户端获取视口信息
    let viewport: ViewportInfo = { width: 1024, height: 768, scrollX: 0, scrollY: 0 };
    if (typeof window !== 'undefined') {
      viewport = this.getViewportInfo();
    }

    switch (position.toLowerCase()) {
      case 'top-left':
        basePosition.x = PositionOptimizer.MARGIN;
        basePosition.y = PositionOptimizer.MARGIN;
        break;
      case 'top-right':
        basePosition.x = viewport.width - PositionOptimizer.DEFAULT_WIDTH - PositionOptimizer.MARGIN;
        basePosition.y = PositionOptimizer.MARGIN;
        break;
      case 'bottom-left':
        basePosition.x = PositionOptimizer.MARGIN;
        basePosition.y = viewport.height - PositionOptimizer.DEFAULT_HEIGHT - PositionOptimizer.MARGIN;
        break;
      case 'bottom-right':
      default:
        basePosition.x = viewport.width - PositionOptimizer.DEFAULT_WIDTH - PositionOptimizer.MARGIN;
        basePosition.y = viewport.height - PositionOptimizer.DEFAULT_HEIGHT - PositionOptimizer.MARGIN;
        break;
    }

    return this.optimize(basePosition, viewport);
  }

  /**
   * 优化位置，确保不超出视口
   */
  public optimize(position: WidgetPosition, viewport: ViewportInfo): WidgetPosition {
    const optimized = { ...position };

    // 确保宽度在合理范围内
    optimized.width = Math.max(
      PositionOptimizer.MIN_WIDTH,
      Math.min(PositionOptimizer.MAX_WIDTH, optimized.width)
    );

    // 确保高度在合理范围内
    optimized.height = Math.max(
      PositionOptimizer.MIN_HEIGHT,
      Math.min(PositionOptimizer.MAX_HEIGHT, optimized.height)
    );

    // 确保不超出视口右边界
    if (optimized.x + optimized.width > viewport.width) {
      optimized.x = viewport.width - optimized.width - PositionOptimizer.MARGIN;
    }

    // 确保不超出视口左边界
    if (optimized.x < PositionOptimizer.MARGIN) {
      optimized.x = PositionOptimizer.MARGIN;
    }

    // 确保不超出视口下边界
    if (optimized.y + optimized.height > viewport.height) {
      optimized.y = viewport.height - optimized.height - PositionOptimizer.MARGIN;
    }

    // 确保不超出视口上边界
    if (optimized.y < PositionOptimizer.MARGIN) {
      optimized.y = PositionOptimizer.MARGIN;
    }

    return optimized;
  }

  /**
   * 获取视口信息
   */
  public getViewportInfo(): ViewportInfo {
    // 确保只在客户端调用此方法
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768, scrollX: 0, scrollY: 0 };
    }
    
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX || window.pageXOffset,
      scrollY: window.scrollY || window.pageYOffset
    };
  }

  /**
   * 保存用户位置偏好
   */
  public async savePreference(userId: string, position: WidgetPosition): Promise<void> {
    try {
      // 确保只在客户端使用localStorage
      if (typeof window !== 'undefined' && localStorage) {
        const key = `yyc3_widget_position_${userId}`;
        localStorage.setItem(key, JSON.stringify(position));
      }
    } catch (error) {
      logger.error('保存位置偏好失败', error);
    }
  }

  /**
   * 加载用户位置偏好
   */
  public async loadUserPreference(userId: string): Promise<WidgetPosition | null> {
    try {
      // 确保只在客户端使用localStorage
      if (typeof window !== 'undefined' && localStorage) {
        const key = `yyc3_widget_position_${userId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (error) {
      logger.error('加载位置偏好失败', error);
    }
    return null;
  }
}
