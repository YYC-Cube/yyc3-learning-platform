/**
 * ResizeController - 窗口大小调整控制器
 * 
 * 提供自然、灵活的窗口大小调整体验
 * 支持多种调整模式和约束
 * 
 * 特性:
 * - 多种调整手柄
 * - 最小/最大限制
 * - 比例保持
 * - 智能吸附
 * - 多点触控
 * - 惯性效果
 * 
 * @module ResizeController
 */

import { EventEmitter } from 'events';

// ================================================
// 1. 类型定义
// ================================================

/**
 * 调整状态
 */
export enum ResizeState {
  IDLE = 'idle',
  RESIZING = 'resizing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * 手柄位置
 */
export type HandlePosition = 
  | 'top-left' | 'top' | 'top-right'
  | 'right' | 'bottom-right' | 'bottom'
  | 'bottom-left' | 'left';

/**
 * 调整手柄
 */
export interface ResizeHandle {
  position: HandlePosition;
  cursor: string;
  vector: { x: number; y: number };
}

/**
 * 位置信息
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 尺寸信息
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 矩形信息
 */
export interface Rect extends Position, Size {}

/**
 * 调整约束
 */
export interface ResizeConstraintsType {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  snapToGrid?: boolean;
  gridSize?: number;
  boundary?: Rect;
}

/**
 * 调整会话
 */
export interface ResizeSession {
  id: string;
  element: HTMLElement;
  handle: ResizeHandle;
  startRect: Rect;
  startPosition: Position;
  currentRect: Rect;
  startTime: Date;
  lastUpdate: Date;
  state: ResizeState;
  constraints: Partial<ResizeConstraintsType>;
  aspectRatio: number | null;
  metadata?: Record<string, any>;
}

/**
 * 调整结果
 */
export interface ResizeResult {
  sessionId: string;
  finalRect: Rect;
  startRect: Rect;
  duration: number;
  success: boolean;
}

/**
 * 调整配置
 */
export interface ResizeConfig {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  keepAspectRatio: boolean;
  snapThreshold: number;
  snapToGrid: boolean;
  gridSize: number;
  enableInertia: boolean;
  inertiaDecay: number;
  handleSize: number;
  enableVisualFeedback: boolean;
}

// ================================================
// 2. 约束系统
// ================================================

/**
 * 调整约束系统
 */
class ResizeConstraints {
  private config: ResizeConfig;
  
  constructor(config: ResizeConfig) {
    this.config = config;
  }
  
  /**
   * 应用约束到矩形
   */
  apply(rect: Rect, constraints?: Partial<ResizeConstraintsType>): Rect {
    let result = { ...rect };
    
    const minWidth = constraints?.minWidth ?? this.config.minWidth;
    const minHeight = constraints?.minHeight ?? this.config.minHeight;
    const maxWidth = constraints?.maxWidth ?? this.config.maxWidth;
    const maxHeight = constraints?.maxHeight ?? this.config.maxHeight;
    
    // 应用最小值约束
    result.width = Math.max(minWidth, result.width);
    result.height = Math.max(minHeight, result.height);
    
    // 应用最大值约束
    if (maxWidth) result.width = Math.min(maxWidth, result.width);
    if (maxHeight) result.height = Math.min(maxHeight, result.height);
    
    // 应用边界约束
    if (constraints?.boundary) {
      result = this.applyBoundary(result, constraints.boundary);
    }
    
    // 应用网格约束
    if (constraints?.snapToGrid || this.config.snapToGrid) {
      const gridSize = constraints?.gridSize ?? this.config.gridSize;
      result = this.snapToGrid(result, gridSize);
    }
    
    // 应用宽高比约束
    if (constraints?.aspectRatio) {
      result = this.maintainAspectRatio(result, constraints.aspectRatio);
    }
    
    return result;
  }
  
  /**
   * 应用边界约束
   */
  private applyBoundary(rect: Rect, boundary: Rect): Rect {
    const result = { ...rect };
    
    // 确保不超出边界
    if (result.x < boundary.x) {
      result.x = boundary.x;
    }
    if (result.y < boundary.y) {
      result.y = boundary.y;
    }
    if (result.x + result.width > boundary.x + boundary.width) {
      result.width = boundary.x + boundary.width - result.x;
    }
    if (result.y + result.height > boundary.y + boundary.height) {
      result.height = boundary.y + boundary.height - result.y;
    }
    
    return result;
  }
  
  /**
   * 网格吸附
   */
  private snapToGrid(rect: Rect, gridSize: number): Rect {
    return {
      x: Math.round(rect.x / gridSize) * gridSize,
      y: Math.round(rect.y / gridSize) * gridSize,
      width: Math.round(rect.width / gridSize) * gridSize,
      height: Math.round(rect.height / gridSize) * gridSize
    };
  }
  
  /**
   * 保持宽高比
   */
  private maintainAspectRatio(rect: Rect, aspectRatio: number): Rect {
    const result = { ...rect };
    
    // 以宽度为准调整高度
    result.height = result.width / aspectRatio;
    
    return result;
  }
  
  /**
   * 获取元素约束
   */
  getForElement(element: HTMLElement): Partial<ResizeConstraintsType> {
    const computed = window.getComputedStyle(element);
    
    return {
      minWidth: parseFloat(computed.minWidth) || this.config.minWidth,
      minHeight: parseFloat(computed.minHeight) || this.config.minHeight,
      maxWidth: parseFloat(computed.maxWidth) || undefined,
      maxHeight: parseFloat(computed.maxHeight) || undefined
    };
  }
}

// ================================================
// 3. 手势检测器
// ================================================

/**
 * 手势检测器
 */
class GestureDetector {
  /**
   * 检测缩放手势（双指缩放）
   */
  detectPinch(touches: TouchList): { scale: number; center: Position } | null {
    if (touches.length !== 2) return null;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const center = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
    
    return { scale: distance, center };
  }
  
  /**
   * 检测旋转手势
   */
  detectRotation(touches: TouchList): number | null {
    if (touches.length !== 2) return null;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const angle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );
    
    return angle * (180 / Math.PI);
  }
}

// ================================================
// 4. 动画控制器
// ================================================

/**
 * 动画控制器
 */
class AnimationController {
  private animationId: number | null = null;
  
  /**
   * 启动惯性动画
   */
  startInertia(
    startRect: Rect,
    velocity: { width: number; height: number },
    decay: number,
    onUpdate: (rect: Rect) => void,
    onComplete: () => void
  ): void {
    this.stop();
    
    let vw = velocity.width;
    let vh = velocity.height;
    let rect = { ...startRect };
    
    const animate = () => {
      // 应用减速
      vw *= decay;
      vh *= decay;
      
      // 更新尺寸
      rect.width += vw;
      rect.height += vh;
      
      // 速度足够小时停止
      if (Math.abs(vw) < 0.1 && Math.abs(vh) < 0.1) {
        this.stop();
        onComplete();
        return;
      }
      
      onUpdate(rect);
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * 停止动画
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// ================================================
// 5. 调整控制器核心
// ================================================

/**
 * 调整控制器
 */
export class ResizeController extends EventEmitter {
  private resizeState: ResizeState = ResizeState.IDLE;
  private currentSession: ResizeSession | null = null;
  private config: ResizeConfig;
  private constraints: ResizeConstraints;
  private gestureDetector: GestureDetector;
  private animationController: AnimationController;
  
  // 调整手柄定义
  private handles: Map<HandlePosition, ResizeHandle> = new Map([
    ['top-left', { position: 'top-left', cursor: 'nw-resize', vector: { x: -1, y: -1 } }],
    ['top', { position: 'top', cursor: 'n-resize', vector: { x: 0, y: -1 } }],
    ['top-right', { position: 'top-right', cursor: 'ne-resize', vector: { x: 1, y: -1 } }],
    ['right', { position: 'right', cursor: 'e-resize', vector: { x: 1, y: 0 } }],
    ['bottom-right', { position: 'bottom-right', cursor: 'se-resize', vector: { x: 1, y: 1 } }],
    ['bottom', { position: 'bottom', cursor: 's-resize', vector: { x: 0, y: 1 } }],
    ['bottom-left', { position: 'bottom-left', cursor: 'sw-resize', vector: { x: -1, y: 1 } }],
    ['left', { position: 'left', cursor: 'w-resize', vector: { x: -1, y: 0 } }]
  ]);
  
  // 会话ID计数器
  private sessionIdCounter: number = 0;
  
  // 初始缩放状态（用于多点触控）
  private initialPinchScale: number | null = null;
  private initialRect: Rect | null = null;
  
  constructor(config: Partial<ResizeConfig> = {}) {
    super();
    
    this.config = {
      minWidth: 100,
      minHeight: 100,
      maxWidth: 2000,
      maxHeight: 2000,
      keepAspectRatio: false,
      snapThreshold: 10,
      snapToGrid: false,
      gridSize: 10,
      enableInertia: true,
      inertiaDecay: 0.95,
      handleSize: 8,
      enableVisualFeedback: true,
      ...config
    };
    
    this.constraints = new ResizeConstraints(this.config);
    this.gestureDetector = new GestureDetector();
    this.animationController = new AnimationController();
  }
  
  /**
   * 开始调整大小
   */
  startResize(
    element: HTMLElement,
    handlePosition: HandlePosition,
    startEvent: MouseEvent | TouchEvent
  ): ResizeSession {
    if (this.currentSession) {
      this.endResize();
    }
    
    const handle = this.handles.get(handlePosition);
    if (!handle) {
      throw new Error(`Invalid handle position: ${handlePosition}`);
    }
    
    const rect = element.getBoundingClientRect();
    const startRect: Rect = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
    
    const session: ResizeSession = {
      id: this.generateSessionId(),
      element,
      handle,
      startRect,
      startPosition: this.getEventPosition(startEvent),
      currentRect: { ...startRect },
      startTime: new Date(),
      lastUpdate: new Date(),
      state: ResizeState.RESIZING,
      constraints: this.constraints.getForElement(element),
      aspectRatio: this.config.keepAspectRatio ? rect.width / rect.height : null
    };
    
    this.currentSession = session;
    this.resizeState = ResizeState.RESIZING;
    
    // 添加视觉反馈
    if (this.config.enableVisualFeedback) {
      this.addResizingStyles(element);
    }
    
    // 触发开始事件
    this.emit('resizeStart', { session });
    
    return session;
  }
  
  /**
   * 更新调整大小
   */
  updateResize(currentEvent: MouseEvent | TouchEvent): void {
    if (!this.currentSession || this.resizeState !== ResizeState.RESIZING) {
      return;
    }
    
    const session = this.currentSession;
    const currentPosition = this.getEventPosition(currentEvent);
    
    // 计算移动距离
    const deltaX = currentPosition.x - session.startPosition.x;
    const deltaY = currentPosition.y - session.startPosition.y;
    
    // 根据手柄方向计算新尺寸
    const newRect = this.calculateNewRect(
      session.startRect,
      session.handle.vector,
      deltaX,
      deltaY,
      session.aspectRatio
    );
    
    // 应用约束
    const constrainedRect = this.constraints.apply(newRect, session.constraints);
    
    // 应用智能吸附
    const snappedRect = this.applySnapping(constrainedRect);
    
    // 更新会话状态
    session.currentRect = snappedRect;
    session.lastUpdate = new Date();
    
    // 更新元素尺寸
    this.updateElementSize(session.element, snappedRect);
    
    // 触发更新事件
    this.emit('resizeUpdate', { session, rect: snappedRect });
  }
  
  /**
   * 结束调整大小
   */
  endResize(endEvent?: MouseEvent | TouchEvent): ResizeResult {
    if (!this.currentSession) {
      throw new Error('No active resize session');
    }
    
    const session = this.currentSession;
    
    // 如果有结束事件，最后一次更新
    if (endEvent) {
      this.updateResize(endEvent);
    }
    
    const result: ResizeResult = {
      sessionId: session.id,
      finalRect: session.currentRect,
      startRect: session.startRect,
      duration: new Date().getTime() - session.startTime.getTime(),
      success: true
    };
    
    // 清理
    this.finalizeResize(session);
    this.cleanupSession(session);
    this.currentSession = null;
    this.resizeState = ResizeState.IDLE;
    
    // 触发结束事件
    this.emit('resizeEnd', { result });
    
    return result;
  }
  
  /**
   * 取消调整
   */
  cancelResize(): void {
    if (!this.currentSession) return;
    
    const session = this.currentSession;
    
    // 恢复原始尺寸
    this.updateElementSize(session.element, session.startRect);
    
    // 清理
    this.cleanupSession(session);
    this.currentSession = null;
    this.resizeState = ResizeState.CANCELLED;
    
    // 触发取消事件
    this.emit('resizeCancel', { session });
  }
  
  /**
   * 处理多点触控
   */
  handleMultiTouch(touches: TouchList): void {
    if (!this.currentSession) return;
    
    if (touches.length === 2) {
      this.handlePinchZoom(touches);
    }
  }
  
  /**
   * 双指缩放
   */
  private handlePinchZoom(touches: TouchList): void {
    if (!this.currentSession) return;
    
    const pinch = this.gestureDetector.detectPinch(touches);
    if (!pinch) return;
    
    // 初始化缩放状态
    if (this.initialPinchScale === null) {
      this.initialPinchScale = pinch.scale;
      this.initialRect = { ...this.currentSession.currentRect };
      return;
    }
    
    if (!this.initialRect) return;
    
    // 计算缩放比例
    const scaleRatio = pinch.scale / this.initialPinchScale;
    
    // 应用缩放
    const newRect: Rect = {
      x: this.initialRect.x,
      y: this.initialRect.y,
      width: this.initialRect.width * scaleRatio,
      height: this.initialRect.height * scaleRatio
    };
    
    // 应用约束
    const constrainedRect = this.constraints.apply(newRect, this.currentSession.constraints);
    
    // 更新
    this.currentSession.currentRect = constrainedRect;
    this.updateElementSize(this.currentSession.element, constrainedRect);
    this.emit('resizeUpdate', { session: this.currentSession, rect: constrainedRect });
  }
  
  /**
   * 计算新矩形
   */
  private calculateNewRect(
    startRect: Rect,
    vector: { x: number; y: number },
    deltaX: number,
    deltaY: number,
    aspectRatio: number | null
  ): Rect {
    const newRect = { ...startRect };
    
    // 根据手柄方向调整
    if (vector.x === -1) {
      // 左侧调整
      newRect.x = startRect.x + deltaX;
      newRect.width = startRect.width - deltaX;
    } else if (vector.x === 1) {
      // 右侧调整
      newRect.width = startRect.width + deltaX;
    }
    
    if (vector.y === -1) {
      // 顶部调整
      newRect.y = startRect.y + deltaY;
      newRect.height = startRect.height - deltaY;
    } else if (vector.y === 1) {
      // 底部调整
      newRect.height = startRect.height + deltaY;
    }
    
    // 保持宽高比
    if (aspectRatio) {
      return this.maintainAspectRatio(newRect, vector, aspectRatio, startRect);
    }
    
    return newRect;
  }
  
  /**
   * 保持宽高比
   */
  private maintainAspectRatio(
    rect: Rect,
    vector: { x: number; y: number },
    aspectRatio: number,
    startRect: Rect
  ): Rect {
    const newRect = { ...rect };
    
    // 根据调整方向决定保持哪条边
    if (vector.x !== 0 && vector.y !== 0) {
      // 角落调整：同时调整宽高
      newRect.height = newRect.width / aspectRatio;
      
      // 根据手柄方向调整位置
      if (vector.y === -1) {
        newRect.y = startRect.y + startRect.height - newRect.height;
      }
      if (vector.x === -1) {
        newRect.x = startRect.x + startRect.width - newRect.width;
      }
    } else if (vector.x !== 0) {
      // 水平调整：调整高度以保持比例
      newRect.height = newRect.width / aspectRatio;
    } else if (vector.y !== 0) {
      // 垂直调整：调整宽度以保持比例
      newRect.width = newRect.height * aspectRatio;
    }
    
    return newRect;
  }
  
  /**
   * 应用智能吸附
   */
  private applySnapping(rect: Rect): Rect {
    let snapped = { ...rect };
    
    // 吸附到屏幕边缘
    snapped = this.snapToScreenEdges(snapped);
    
    // 吸附到其他元素（简化实现）
    // snapped = this.snapToElements(snapped);
    
    return snapped;
  }
  
  /**
   * 吸附到屏幕边缘
   */
  private snapToScreenEdges(rect: Rect): Rect {
    const result = { ...rect };
    const threshold = this.config.snapThreshold;
    
    // 左边缘
    if (Math.abs(result.x) < threshold) {
      result.x = 0;
    }
    
    // 上边缘
    if (Math.abs(result.y) < threshold) {
      result.y = 0;
    }
    
    // 右边缘
    if (Math.abs(result.x + result.width - window.innerWidth) < threshold) {
      result.x = window.innerWidth - result.width;
    }
    
    // 下边缘
    if (Math.abs(result.y + result.height - window.innerHeight) < threshold) {
      result.y = window.innerHeight - result.height;
    }
    
    return result;
  }
  
  /**
   * 更新元素尺寸
   */
  private updateElementSize(element: HTMLElement, rect: Rect): void {
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.left = `${rect.x}px`;
    element.style.top = `${rect.y}px`;
  }
  
  /**
   * 完成调整
   */
  private finalizeResize(session: ResizeSession): void {
    // 移除临时样式
    if (this.config.enableVisualFeedback) {
      this.removeResizingStyles(session.element);
    }
    
    // 重置多点触控状态
    this.initialPinchScale = null;
    this.initialRect = null;
  }
  
  /**
   * 清理会话
   */
  private cleanupSession(session: ResizeSession): void {
    this.removeResizingStyles(session.element);
    this.animationController.stop();
  }
  
  /**
   * 添加调整样式
   */
  private addResizingStyles(element: HTMLElement): void {
    element.classList.add('resizing');
    element.style.transition = 'none';
    element.style.userSelect = 'none';
  }
  
  /**
   * 移除调整样式
   */
  private removeResizingStyles(element: HTMLElement): void {
    element.classList.remove('resizing');
    element.style.transition = '';
    element.style.userSelect = '';
  }
  
  /**
   * 获取事件位置
   */
  private getEventPosition(event: MouseEvent | TouchEvent): Position {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else {
      const touch = event.touches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
  }
  
  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `resize-session-${++this.sessionIdCounter}-${Date.now()}`;
  }
  
  /**
   * 获取手柄元素
   */
  getHandleElements(): HTMLElement[] {
    // 返回手柄元素（需要在UI中创建）
    return [];
  }
  
  /**
   * 销毁控制器
   */
  destroy(): void {
    if (this.currentSession) {
      this.cancelResize();
    }
    
    this.removeAllListeners();
    this.animationController.stop();
  }
}

// ================================================
// 6. 导出单例
// ================================================

/**
 * 默认调整控制器实例
 */
export const resizeController = new ResizeController();
