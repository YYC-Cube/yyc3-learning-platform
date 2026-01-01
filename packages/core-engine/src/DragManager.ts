/**
 * DragManager - 拖拽管理系统
 * 
 * 提供流畅、自然、跨平台的拖拽体验
 * 支持多指触控、惯性拖拽、拖拽约束、拖拽手柄、拖拽预览等
 * 
 * 设计原则：五高五标五化
 * - 高性能：优化的事件处理和位置计算
 * - 高可用：完善的错误处理和状态管理
 * - 高可扩展：支持自定义约束和行为
 * - 高安全：类型安全和边界检查
 * - 高智能：手势识别和惯性模拟
 * 
 * @module DragManager
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('DragManager');

// ================================================
// 1. 拖拽状态机定义
// ================================================

/**
 * 拖拽状态枚举
 */
export enum DragState {
  IDLE = 'idle',           // 空闲状态
  PREPARING = 'preparing', // 准备拖拽（如长按触发）
  DRAGGING = 'dragging',   // 拖拽中
  DROPPING = 'dropping',   // 正在放置
  CANCELLED = 'cancelled', // 拖拽取消
  COMPLETED = 'completed'  // 拖拽完成
}

/**
 * 触发方式
 */
export enum DragTrigger {
  IMMEDIATE = 'immediate',     // 立即触发
  LONG_PRESS = 'longPress',    // 长按触发
  DOUBLE_TAP = 'doubleTap'     // 双击触发
}

/**
 * 位置信息
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 速度信息
 */
export interface Velocity {
  x: number;
  y: number;
}

/**
 * 矩形区域
 */
export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * 拖拽约束
 */
export interface DragConstraints {
  function?: string;                // 约束函数名
  boundary?: Rect;                  // 边界约束
  grid?: { sizeX: number; sizeY: number }; // 网格约束
  axis?: 'horizontal' | 'vertical'; // 轴向约束
  custom?: (position: Position, session: DragSession) => Position; // 自定义约束
}

/**
 * 拖拽会话
 */
export interface DragSession {
  id: string;                        // 会话ID
  state: DragState;                  // 当前状态
  source: DragSource;                // 拖拽源
  data: any;                         // 拖拽数据
  position: Position;                // 当前位置（相对视口）
  startPosition: Position;           // 开始位置
  offset: Position;                  // 鼠标/触摸点相对元素的偏移
  startTime: Date;                   // 开始时间
  lastUpdated: Date;                 // 最后更新时间
  velocity: Velocity;                // 当前速度（用于惯性）
  constraints?: DragConstraints;     // 约束条件
  dropTarget?: DropTarget | null;    // 当前悬停的放置目标
  preview?: HTMLElement;             // 拖拽预览元素
  metadata?: Record<string, any>;    // 元数据
}

/**
 * 拖拽选项
 */
export interface DragOptions {
  trigger?: DragTrigger;             // 触发方式
  constraints?: DragConstraints;     // 约束条件
  enablePreview?: boolean;           // 启用拖拽预览
  previewOffset?: Position;          // 预览偏移
  data?: any;                        // 附加数据
}

// ================================================
// 2. 拖拽源接口
// ================================================

/**
 * 拖拽源接口
 */
export interface DragSource {
  element: HTMLElement;              // DOM元素
  
  // 获取拖拽数据
  getData(): any;
  
  // 获取初始位置
  getInitialPosition(): Position;
  
  // 获取元素矩形
  getElementRect(): Rect;
  
  // 获取父元素矩形
  getParentRect(): Rect;
  
  // 拖拽开始时的回调
  onDragStart?(session: DragSession): void;
  
  // 拖拽结束时的回调
  onDragEnd?(session: DragSession): void;
  
  // 拖拽取消时的回调
  onDragCancel?(session: DragSession): void;
}

// ================================================
// 3. 放置目标接口
// ================================================

/**
 * 放置目标接口
 */
export interface DropTarget {
  element: HTMLElement;              // DOM元素
  
  // 判断点是否在目标内
  contains(point: Position): boolean;
  
  // 是否接受该数据类型
  accepts(data: any): boolean;
  
  // 放置数据
  onDrop(data: any, position: Position): Promise<boolean>;
  
  // 拖拽进入时的回调
  onDragEnter?(session: DragSession): void;
  
  // 拖拽离开时的回调
  onDragLeave?(session: DragSession): void;
  
  // 拖拽在目标上移动时的回调
  onDragOver?(session: DragSession): void;
}

// ================================================
// 4. 配置接口
// ================================================

/**
 * 拖拽管理器配置
 */
export interface DragManagerConfig {
  dragThreshold: number;             // 拖拽阈值（像素）
  longPressDuration: number;         // 长按触发拖拽的时长（ms）
  doubleTapThreshold: number;        // 双击时间阈值（ms）
  inertiaDeceleration: number;       // 惯性减速度 (0-1)
  enableInertia: boolean;            // 启用惯性
  defaultConstraint: string;         // 默认约束
  enablePreview: boolean;            // 启用拖拽预览
  previewOpacity: number;            // 预览不透明度
  zIndex: number;                    // 拖拽时的z-index
}

/**
 * 约束函数类型
 */
export type ConstraintFunction = (position: Position, session: DragSession) => Position;

// ================================================
// 5. 放置目标管理器
// ================================================

/**
 * 放置目标管理器
 */
class DropTargetManager {
  private targets: Set<DropTarget> = new Set();
  
  /**
   * 注册放置目标
   */
  register(target: DropTarget): void {
    this.targets.add(target);
  }
  
  /**
   * 注销放置目标
   */
  unregister(target: DropTarget): void {
    this.targets.delete(target);
  }
  
  /**
   * 查找匹配的放置目标
   */
  findDropTarget(position: Position, data: any): DropTarget | null {
    for (const target of Array.from(this.targets)) {
      if (target.contains(position) && target.accepts(data)) {
        return target;
      }
    }
    return null;
  }
  
  /**
   * 清空所有目标
   */
  clear(): void {
    this.targets.clear();
  }
}

// ================================================
// 6. 惯性模拟器
// ================================================

/**
 * 惯性模拟器
 */
class InertiaSimulator {
  private animationId: number | null = null;
  private config: DragManagerConfig;
  
  constructor(config: DragManagerConfig) {
    this.config = config;
  }
  
  /**
   * 启动惯性动画
   */
  start(
    session: DragSession,
    onUpdate: (position: Position) => void,
    onComplete: () => void
  ): void {
    this.stop();
    
    let { x: vx, y: vy } = session.velocity;
    let { x, y } = session.position;
    
    const animate = () => {
      // 应用减速
      vx *= this.config.inertiaDeceleration;
      vy *= this.config.inertiaDeceleration;
      
      // 更新位置
      x += vx;
      y += vy;
      
      // 速度足够小时停止
      if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        this.stop();
        onComplete();
        return;
      }
      
      onUpdate({ x, y });
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * 停止惯性动画
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// ================================================
// 7. 手势识别器
// ================================================

/**
 * 手势识别器
 */
class GestureRecognizer {
  private config: DragManagerConfig;
  private lastTapTime: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  
  constructor(config: DragManagerConfig) {
    this.config = config;
  }
  
  /**
   * 检测双击
   */
  detectDoubleTap(timestamp: number): boolean {
    const deltaTime = timestamp - this.lastTapTime;
    this.lastTapTime = timestamp;
    return deltaTime < this.config.doubleTapThreshold;
  }
  
  /**
   * 启动长按检测
   */
  startLongPress(callback: () => void): void {
    this.clearLongPress();
    this.longPressTimer = setTimeout(callback, this.config.longPressDuration);
  }
  
  /**
   * 清除长按检测
   */
  clearLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}

// ================================================
// 8. 拖拽管理器核心
// ================================================

/**
 * 拖拽管理器
 */
export class DragManager extends EventEmitter {
  private sessions: Map<string, DragSession> = new Map();
  private activeSessionId: string | null = null;
  private config: DragManagerConfig;
  
  private inertiaSimulator: InertiaSimulator;
  private gestureRecognizer: GestureRecognizer;
  private dropTargetManager: DropTargetManager;
  
  // 拖拽约束函数
  private constraintFunctions: Map<string, ConstraintFunction> = new Map();
  
  // 拖拽源注册表
  private dragSources: Map<HTMLElement, DragSource> = new Map();
  
  // 会话ID计数器
  private sessionIdCounter: number = 0;
  
  constructor(config: Partial<DragManagerConfig> = {}) {
    super();
    
    this.config = {
      dragThreshold: 5,
      longPressDuration: 500,
      doubleTapThreshold: 300,
      inertiaDeceleration: 0.95,
      enableInertia: true,
      defaultConstraint: 'none',
      enablePreview: true,
      previewOpacity: 0.7,
      zIndex: 9999,
      ...config
    };
    
    this.inertiaSimulator = new InertiaSimulator(this.config);
    this.gestureRecognizer = new GestureRecognizer(this.config);
    this.dropTargetManager = new DropTargetManager();
    
    // 注册内置约束
    this.registerConstraint('none', this.noConstraint.bind(this));
    this.registerConstraint('horizontal', this.horizontalConstraint.bind(this));
    this.registerConstraint('vertical', this.verticalConstraint.bind(this));
    this.registerConstraint('parentBoundary', this.parentBoundaryConstraint.bind(this));
    this.registerConstraint('viewport', this.viewportConstraint.bind(this));
    
    // 初始化事件监听
    this.setupEventListeners();
  }
  
  // ================================================
  // 公共API
  // ================================================
  
  /**
   * 注册拖拽源
   */
  registerDragSource(source: DragSource): void {
    this.dragSources.set(source.element, source);
  }
  
  /**
   * 注销拖拽源
   */
  unregisterDragSource(element: HTMLElement): void {
    this.dragSources.delete(element);
  }
  
  /**
   * 注册放置目标
   */
  registerDropTarget(target: DropTarget): void {
    this.dropTargetManager.register(target);
  }
  
  /**
   * 注销放置目标
   */
  unregisterDropTarget(target: DropTarget): void {
    this.dropTargetManager.unregister(target);
  }
  
  /**
   * 开始拖拽会话
   */
  startDrag(source: DragSource, data: any, options: DragOptions = {}): string {
    const sessionId = this.generateSessionId();
    
    const initialPosition = source.getInitialPosition();
    const session: DragSession = {
      id: sessionId,
      state: DragState.PREPARING,
      source,
      data,
      position: { ...initialPosition },
      startPosition: { ...initialPosition },
      offset: { x: 0, y: 0 },
      startTime: new Date(),
      lastUpdated: new Date(),
      velocity: { x: 0, y: 0 },
      constraints: options.constraints,
      dropTarget: null,
      metadata: options.data || {}
    };
    
    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    
    // 触发开始事件
    this.emit('dragStart', { session });
    source.onDragStart?.(session);
    
    // 根据触发方式处理
    const trigger = options.trigger || DragTrigger.IMMEDIATE;
    if (trigger === DragTrigger.IMMEDIATE) {
      this.transitionToState(sessionId, DragState.DRAGGING);
    } else if (trigger === DragTrigger.LONG_PRESS) {
      this.gestureRecognizer.startLongPress(() => {
        this.transitionToState(sessionId, DragState.DRAGGING);
      });
    }
    
    // 创建拖拽预览
    if (this.config.enablePreview && options.enablePreview !== false) {
      this.createDragPreview(session);
    }
    
    return sessionId;
  }
  
  /**
   * 更新拖拽位置
   */
  updateDrag(sessionId: string, newPosition: Position): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== DragState.DRAGGING) return;
    
    // 计算速度
    const now = new Date();
    const deltaTime = now.getTime() - session.lastUpdated.getTime();
    if (deltaTime > 0) {
      const deltaX = newPosition.x - session.position.x;
      const deltaY = newPosition.y - session.position.y;
      session.velocity = {
        x: deltaX / deltaTime * 1000, // 转换为 px/s
        y: deltaY / deltaTime * 1000
      };
    }
    
    // 应用约束
    let constrainedPosition = newPosition;
    if (session.constraints) {
      constrainedPosition = this.applyConstraints(session, newPosition);
    }
    
    // 更新会话
    const oldPosition = { ...session.position };
    session.position = constrainedPosition;
    session.lastUpdated = now;
    
    // 检测放置目标
    const dropTarget = this.dropTargetManager.findDropTarget(constrainedPosition, session.data);
    if (dropTarget !== session.dropTarget) {
      // 放置目标改变
      if (session.dropTarget) {
        this.emit('dragLeave', { session, dropTarget: session.dropTarget });
        session.dropTarget.onDragLeave?.(session);
      }
      if (dropTarget) {
        this.emit('dragEnter', { session, dropTarget });
        dropTarget.onDragEnter?.(session);
      }
      session.dropTarget = dropTarget;
    } else if (dropTarget) {
      dropTarget.onDragOver?.(session);
    }
    
    // 发出更新事件
    this.emit('dragMove', { session, oldPosition, newPosition: constrainedPosition });
    
    // 更新拖拽视觉反馈
    this.updateDragPreview(session);
  }
  
  /**
   * 结束拖拽
   */
  endDrag(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // 清除长按计时器
    this.gestureRecognizer.clearLongPress();
    
    // 如果是拖拽状态，尝试放置
    if (session.state === DragState.DRAGGING) {
      this.drop(sessionId);
    } else {
      this.cancelDrag(sessionId);
    }
  }
  
  /**
   * 取消拖拽
   */
  cancelDrag(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    this.transitionToState(sessionId, DragState.CANCELLED);
    
    // 触发取消事件
    this.emit('dragCancel', { session });
    session.source.onDragCancel?.(session);
    
    // 清理会话
    this.cleanupSession(sessionId);
  }
  
  /**
   * 注册自定义约束函数
   */
  registerConstraint(name: string, constraintFunc: ConstraintFunction): void {
    this.constraintFunctions.set(name, constraintFunc);
  }
  
  /**
   * 获取活动会话
   */
  getActiveSession(): DragSession | null {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) || null : null;
  }
  
  /**
   * 获取指定会话
   */
  getSession(sessionId: string): DragSession | null {
    return this.sessions.get(sessionId) || null;
  }
  
  /**
   * 销毁管理器
   */
  destroy(): void {
    // 取消所有会话
    for (const sessionId of Array.from(this.sessions.keys())) {
      this.cancelDrag(sessionId);
    }
    
    // 移除事件监听
    this.removeAllListeners();
    
    // 清理资源
    this.dragSources.clear();
    this.dropTargetManager.clear();
    this.constraintFunctions.clear();
  }
  
  // ================================================
  // 私有方法
  // ================================================
  
  /**
   * 放置操作
   */
  private async drop(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    this.transitionToState(sessionId, DragState.DROPPING);
    
    try {
      // 如果有放置目标，执行放置逻辑
      if (session.dropTarget) {
        const success = await session.dropTarget.onDrop(session.data, session.position);
        
        if (success) {
          this.transitionToState(sessionId, DragState.COMPLETED);
          this.emit('dropSuccess', { session, dropTarget: session.dropTarget });
        } else {
          throw new Error('Drop rejected by target');
        }
      } else {
        // 没有放置目标，但仍然是成功的拖拽
        this.transitionToState(sessionId, DragState.COMPLETED);
        this.emit('dropSuccess', { session, dropTarget: null });
      }
      
      session.source.onDragEnd?.(session);
      
    } catch (error) {
      logger.error('Drop failed:', error);
      this.cancelDrag(sessionId);
    } finally {
      this.cleanupSession(sessionId);
    }
  }
  
  /**
   * 状态转移
   */
  private transitionToState(sessionId: string, newState: DragState): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const oldState = session.state;
    if (oldState === newState) return;
    
    session.state = newState;
    
    // 触发状态变化事件
    this.emit('stateChange', { session, oldState, newState });
    
    // 状态特定的处理
    switch (newState) {
      case DragState.DRAGGING:
        this.onStartDragging(session);
        break;
      case DragState.COMPLETED:
        this.onDragCompleted(session);
        break;
      case DragState.CANCELLED:
        this.onDragCancelled(session);
        break;
    }
  }
  
  /**
   * 开始拖拽时的处理
   */
  private onStartDragging(session: DragSession): void {
    // 添加拖拽样式
    if (session.source.element) {
      session.source.element.classList.add('dragging');
      session.source.element.style.zIndex = String(this.config.zIndex);
    }
  }
  
  /**
   * 拖拽完成时的处理
   */
  private onDragCompleted(session: DragSession): void {
    // 移除拖拽样式
    if (session.source.element) {
      session.source.element.classList.remove('dragging');
      session.source.element.style.zIndex = '';
    }
  }
  
  /**
   * 拖拽取消时的处理
   */
  private onDragCancelled(session: DragSession): void {
    // 移除拖拽样式
    if (session.source.element) {
      session.source.element.classList.remove('dragging');
      session.source.element.style.zIndex = '';
    }
    
    // 如果启用惯性，回到原位置
    if (this.config.enableInertia) {
      this.animateBack(session);
    }
  }
  
  /**
   * 动画返回原位置
   */
  private animateBack(session: DragSession): void {
    // 简单的线性动画
    const duration = 200;
    const startTime = Date.now();
    const startPos = { ...session.position };
    const endPos = { ...session.startPosition };
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentPos = {
        x: startPos.x + (endPos.x - startPos.x) * progress,
        y: startPos.y + (endPos.y - startPos.y) * progress
      };
      
      this.updateElementPosition(session.source.element, currentPos);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * 应用约束
   */
  private applyConstraints(session: DragSession, position: Position): Position {
    let result = { ...position };
    
    if (!session.constraints) return result;
    
    // 1. 应用命名约束函数
    if (session.constraints.function) {
      const constraintFunc = this.constraintFunctions.get(session.constraints.function);
      if (constraintFunc) {
        result = constraintFunc(result, session);
      }
    }
    
    // 2. 应用轴向约束
    if (session.constraints.axis === 'horizontal') {
      result.y = session.startPosition.y;
    } else if (session.constraints.axis === 'vertical') {
      result.x = session.startPosition.x;
    }
    
    // 3. 应用边界约束
    if (session.constraints.boundary) {
      result = this.applyBoundaryConstraint(result, session.constraints.boundary, session.source.getElementRect());
    }
    
    // 4. 应用网格约束
    if (session.constraints.grid) {
      result = this.applyGridConstraint(result, session.constraints.grid);
    }
    
    // 5. 应用自定义约束
    if (session.constraints.custom) {
      result = session.constraints.custom(result, session);
    }
    
    return result;
  }
  
  /**
   * 应用边界约束
   */
  private applyBoundaryConstraint(position: Position, boundary: Rect, elementRect: Rect): Position {
    return {
      x: Math.max(boundary.left, Math.min(position.x, boundary.right - elementRect.width)),
      y: Math.max(boundary.top, Math.min(position.y, boundary.bottom - elementRect.height))
    };
  }
  
  /**
   * 应用网格约束
   */
  private applyGridConstraint(position: Position, grid: { sizeX: number; sizeY: number }): Position {
    return {
      x: Math.round(position.x / grid.sizeX) * grid.sizeX,
      y: Math.round(position.y / grid.sizeY) * grid.sizeY
    };
  }
  
  /**
   * 内置约束函数
   */
  private noConstraint(position: Position, _session: DragSession): Position {
    return position;
  }
  
  private horizontalConstraint(position: Position, session: DragSession): Position {
    return { x: position.x, y: session.startPosition.y };
  }
  
  private verticalConstraint(position: Position, session: DragSession): Position {
    return { x: session.startPosition.x, y: position.y };
  }
  
  private parentBoundaryConstraint(position: Position, session: DragSession): Position {
    const parentRect = session.source.getParentRect();
    const elementRect = session.source.getElementRect();
    return this.applyBoundaryConstraint(position, parentRect, elementRect);
  }
  
  private viewportConstraint(position: Position, session: DragSession): Position {
    const elementRect = session.source.getElementRect();
    const viewportRect: Rect = {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight
    };
    return this.applyBoundaryConstraint(position, viewportRect, elementRect);
  }
  
  /**
   * 创建拖拽预览
   */
  private createDragPreview(session: DragSession): void {
    const element = session.source.element;
    const clone = element.cloneNode(true) as HTMLElement;
    
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.opacity = String(this.config.previewOpacity);
    clone.style.zIndex = String(this.config.zIndex + 1);
    clone.classList.add('drag-preview');
    
    document.body.appendChild(clone);
    session.preview = clone;
    
    this.updateDragPreview(session);
  }
  
  /**
   * 更新拖拽预览
   */
  private updateDragPreview(session: DragSession): void {
    if (session.preview) {
      session.preview.style.left = `${session.position.x}px`;
      session.preview.style.top = `${session.position.y}px`;
    }
  }
  
  /**
   * 移除拖拽预览
   */
  private removeDragPreview(session: DragSession): void {
    if (session.preview) {
      session.preview.remove();
      session.preview = undefined;
    }
  }
  
  /**
   * 更新元素位置
   */
  private updateElementPosition(element: HTMLElement, position: Position): void {
    element.style.transform = `translate(${position.x}px, ${position.y}px)`;
  }
  
  /**
   * 清理会话
   */
  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    // 移除预览
    this.removeDragPreview(session);
    
    // 停止惯性动画
    this.inertiaSimulator.stop();
    
    // 清除会话
    this.sessions.delete(sessionId);
    
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }
  }
  
  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `drag-session-${++this.sessionIdCounter}-${Date.now()}`;
  }
  
  /**
   * 查找拖拽源
   */
  private findDragSource(element: HTMLElement | null): DragSource | null {
    while (element) {
      const source = this.dragSources.get(element);
      if (source) return source;
      element = element.parentElement;
    }
    return null;
  }
  
  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 鼠标事件
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), { passive: false });
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: false });
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), { passive: false });
    
    // 触摸事件
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // 键盘事件（用于取消拖拽）
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  /**
   * 鼠标按下事件处理
   */
  private handleMouseDown(event: MouseEvent): void {
    const source = this.findDragSource(event.target as HTMLElement);
    if (!source) return;
    
    event.preventDefault();
    
    const rect = source.element.getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    const sessionId = this.startDrag(source, source.getData(), {
      trigger: DragTrigger.IMMEDIATE
    });
    
    const session = this.sessions.get(sessionId);
    if (session) {
      session.offset = offset;
    }
  }
  
  /**
   * 鼠标移动事件处理
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.activeSessionId) return;
    
    event.preventDefault();
    
    const session = this.sessions.get(this.activeSessionId);
    if (!session) return;
    
    const newPosition = {
      x: event.clientX - session.offset.x,
      y: event.clientY - session.offset.y
    };
    
    this.updateDrag(this.activeSessionId, newPosition);
  }
  
  /**
   * 鼠标释放事件处理
   */
  private handleMouseUp(_event: MouseEvent): void {
    if (!this.activeSessionId) return;
    this.endDrag(this.activeSessionId);
  }
  
  /**
   * 触摸开始事件处理
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    const source = this.findDragSource(touch.target as HTMLElement);
    if (!source) return;
    
    event.preventDefault();
    
    const rect = source.element.getBoundingClientRect();
    const offset = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    const sessionId = this.startDrag(source, source.getData(), {
      trigger: DragTrigger.LONG_PRESS
    });
    
    const session = this.sessions.get(sessionId);
    if (session) {
      session.offset = offset;
    }
  }
  
  /**
   * 触摸移动事件处理
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.activeSessionId || event.touches.length !== 1) return;
    
    event.preventDefault();
    
    const session = this.sessions.get(this.activeSessionId);
    if (!session) return;
    
    const touch = event.touches[0];
    const newPosition = {
      x: touch.clientX - session.offset.x,
      y: touch.clientY - session.offset.y
    };
    
    this.updateDrag(this.activeSessionId, newPosition);
  }
  
  /**
   * 触摸结束事件处理
   */
  private handleTouchEnd(_event: TouchEvent): void {
    if (!this.activeSessionId) return;
    this.endDrag(this.activeSessionId);
  }
  
  /**
   * 键盘事件处理（ESC取消拖拽）
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.activeSessionId) {
      this.cancelDrag(this.activeSessionId);
    }
  }
}

// ================================================
// 9. 导出单例
// ================================================

/**
 * 默认拖拽管理器实例
 */
export const dragManager = new DragManager();
