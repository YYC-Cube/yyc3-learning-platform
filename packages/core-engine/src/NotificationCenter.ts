/**
 * NotificationCenter - 通知中心组件
 * 
 * 提供完整的通知管理和显示系统
 * 支持多种通知类型、优先级、位置、动画
 * 
 * 特性:
 * - 多种通知类型（success/warning/error/info）
 * - 通知优先级和队列管理
 * - 可定制的位置和动画
 * - 自动关闭和手动关闭
 * - 通知历史记录
 * - 通知分组
 * - 进度通知
 * 
 * @module NotificationCenter
 */

import { EventEmitter } from 'events';

// ================================================
// 1. 类型定义
// ================================================

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'loading';

/**
 * 通知优先级
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * 通知位置
 */
export type NotificationPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * 通知动画
 */
export type NotificationAnimation = 'fade' | 'slide' | 'bounce' | 'zoom';

/**
 * 通知操作按钮
 */
export interface NotificationAction {
  label: string;
  onClick: (notification: Notification) => void;
  style?: 'primary' | 'secondary' | 'danger';
}

/**
 * 通知选项
 */
export interface NotificationOptions {
  type?: NotificationType;
  priority?: NotificationPriority;
  position?: NotificationPosition;
  duration?: number;  // 0表示不自动关闭
  closable?: boolean;
  icon?: string;
  animation?: NotificationAnimation;
  actions?: NotificationAction[];
  groupKey?: string;  // 分组键
  progress?: number;  // 0-100的进度值
  metadata?: Record<string, any>;
}

/**
 * 通知对象
 */
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message?: string;
  position: NotificationPosition;
  duration: number;
  closable: boolean;
  icon?: string;
  animation: NotificationAnimation;
  actions: NotificationAction[];
  groupKey?: string;
  progress?: number;
  metadata?: Record<string, any>;
  
  // 状态
  createdAt: Date;
  displayedAt?: Date;
  closedAt?: Date;
  isVisible: boolean;
  
  // DOM元素
  element?: HTMLElement;
  
  // 定时器
  autoCloseTimer?: NodeJS.Timeout;
}

/**
 * 通知配置
 */
export interface NotificationCenterConfig {
  maxNotifications: number;
  defaultDuration: number;
  defaultPosition: NotificationPosition;
  defaultAnimation: NotificationAnimation;
  enableSound: boolean;
  enableHistory: boolean;
  historySize: number;
  groupingEnabled: boolean;
  groupingDelay: number;
  stackingEnabled: boolean;
  maxStack: number;
}

/**
 * 通知统计
 */
export interface NotificationStats {
  total: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  active: number;
  closed: number;
}

// ================================================
// 2. 通知队列管理器
// ================================================

/**
 * 通知队列
 */
class NotificationQueue {
  private queues: Map<NotificationPriority, Notification[]> = new Map();
  private maxSize: number;
  
  private priorityOrder: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    
    // 初始化队列
    for (const priority of this.priorityOrder) {
      this.queues.set(priority, []);
    }
  }
  
  /**
   * 入队
   */
  enqueue(notification: Notification): void {
    const queue = this.queues.get(notification.priority);
    if (!queue) return;
    
    queue.push(notification);
    
    // 限制队列大小
    if (queue.length > this.maxSize) {
      queue.shift();
    }
  }
  
  /**
   * 出队（按优先级）
   */
  dequeue(): Notification | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift() || null;
      }
    }
    return null;
  }
  
  /**
   * 移除特定通知
   */
  remove(notificationId: string): boolean {
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        queue.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  
  /**
   * 获取队列大小
   */
  size(): number {
    let total = 0;
    for (const queue of Array.from(this.queues.values())) {
      total += queue.length;
    }
    return total;
  }
  
  /**
   * 清空队列
   */
  clear(): void {
    for (const queue of Array.from(this.queues.values())) {
      queue.length = 0;
    }
  }
}

// ================================================
// 3. 通知分组管理器
// ================================================

/**
 * 通知分组管理器
 */
class NotificationGroupManager {
  private groups: Map<string, Notification[]> = new Map();
  private groupTimers: Map<string, NodeJS.Timeout> = new Map();
  private groupingDelay: number;
  
  constructor(groupingDelay: number = 1000) {
    this.groupingDelay = groupingDelay;
  }
  
  /**
   * 添加到分组
   */
  addToGroup(notification: Notification): boolean {
    if (!notification.groupKey) return false;
    
    const group = this.groups.get(notification.groupKey) || [];
    group.push(notification);
    this.groups.set(notification.groupKey, group);
    
    // 清除旧定时器
    const oldTimer = this.groupTimers.get(notification.groupKey);
    if (oldTimer) {
      clearTimeout(oldTimer);
    }
    
    // 设置新定时器
    const timer = setTimeout(() => {
      this.flushGroup(notification.groupKey!);
    }, this.groupingDelay);
    
    this.groupTimers.set(notification.groupKey, timer);
    
    return true;
  }
  
  /**
   * 刷新分组
   */
  flushGroup(groupKey: string): Notification[] {
    const group = this.groups.get(groupKey);
    if (!group || group.length === 0) return [];
    
    // 清除定时器
    const timer = this.groupTimers.get(groupKey);
    if (timer) {
      clearTimeout(timer);
      this.groupTimers.delete(groupKey);
    }
    
    // 清空分组
    this.groups.delete(groupKey);
    
    return group;
  }
  
  /**
   * 获取分组大小
   */
  getGroupSize(groupKey: string): number {
    return this.groups.get(groupKey)?.length || 0;
  }
  
  /**
   * 清空所有分组
   */
  clear(): void {
    // 清除所有定时器
    for (const timer of Array.from(this.groupTimers.values())) {
      clearTimeout(timer);
    }
    
    this.groups.clear();
    this.groupTimers.clear();
  }
}

// ================================================
// 4. 通知中心核心
// ================================================

/**
 * 通知中心
 */
export class NotificationCenter extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private queue: NotificationQueue;
  private groupManager: NotificationGroupManager;
  private config: NotificationCenterConfig;
  private history: Notification[] = [];
  private notificationIdCounter: number = 0;
  
  // 容器元素
  private containers: Map<NotificationPosition, HTMLElement> = new Map();
  
  // 统计
  private stats: NotificationStats = {
    total: 0,
    byType: {
      success: 0,
      warning: 0,
      error: 0,
      info: 0,
      loading: 0
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    active: 0,
    closed: 0
  };
  
  constructor(config: Partial<NotificationCenterConfig> = {}) {
    super();
    
    this.config = {
      maxNotifications: 5,
      defaultDuration: 5000,
      defaultPosition: 'top-right',
      defaultAnimation: 'slide',
      enableSound: false,
      enableHistory: true,
      historySize: 100,
      groupingEnabled: true,
      groupingDelay: 1000,
      stackingEnabled: true,
      maxStack: 3,
      ...config
    };
    
    this.queue = new NotificationQueue();
    this.groupManager = new NotificationGroupManager(this.config.groupingDelay);
    
    // 初始化容器
    this.initializeContainers();
  }
  
  /**
   * 显示通知（主方法）
   */
  notify(title: string, message?: string, options: NotificationOptions = {}): string {
    const notification = this.createNotification(title, message, options);
    
    // 如果启用分组且有分组键，添加到分组
    if (this.config.groupingEnabled && notification.groupKey) {
      this.groupManager.addToGroup(notification);
      return notification.id;
    }
    
    // 否则直接显示
    this.showNotification(notification);
    return notification.id;
  }
  
  /**
   * 快捷方法：成功通知
   */
  success(title: string, message?: string, options: NotificationOptions = {}): string {
    return this.notify(title, message, { ...options, type: 'success' });
  }
  
  /**
   * 快捷方法：警告通知
   */
  warning(title: string, message?: string, options: NotificationOptions = {}): string {
    return this.notify(title, message, { ...options, type: 'warning' });
  }
  
  /**
   * 快捷方法：错误通知
   */
  error(title: string, message?: string, options: NotificationOptions = {}): string {
    return this.notify(title, message, { ...options, type: 'error', duration: 0 });
  }
  
  /**
   * 快捷方法：信息通知
   */
  info(title: string, message?: string, options: NotificationOptions = {}): string {
    return this.notify(title, message, { ...options, type: 'info' });
  }
  
  /**
   * 快捷方法：加载通知
   */
  loading(title: string, message?: string, options: NotificationOptions = {}): string {
    return this.notify(title, message, { ...options, type: 'loading', duration: 0, closable: false });
  }
  
  /**
   * 更新通知
   */
  update(id: string, updates: Partial<NotificationOptions> & { title?: string; message?: string }): void {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    // 更新属性
    if (updates.title) notification.title = updates.title;
    if (updates.message !== undefined) notification.message = updates.message;
    if (updates.type) notification.type = updates.type;
    if (updates.progress !== undefined) notification.progress = updates.progress;
    
    // 重新渲染
    if (notification.element) {
      this.renderNotification(notification);
    }
    
    this.emit('notificationUpdated', { notification });
  }
  
  /**
   * 关闭通知
   */
  close(id: string): void {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    this.closeNotification(notification);
  }
  
  /**
   * 关闭所有通知
   */
  closeAll(): void {
    for (const notification of Array.from(this.notifications.values())) {
      this.closeNotification(notification);
    }
  }
  
  /**
   * 获取活动通知
   */
  getActiveNotifications(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.isVisible);
  }
  
  /**
   * 获取历史记录
   */
  getHistory(): Notification[] {
    return [...this.history];
  }
  
  /**
   * 获取统计信息
   */
  getStats(): NotificationStats {
    return { ...this.stats };
  }
  
  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.emit('historyCleared');
  }
  
  /**
   * 创建通知对象
   */
  private createNotification(
    title: string,
    message?: string,
    options: NotificationOptions = {}
  ): Notification {
    const id = this.generateId();
    
    const notification: Notification = {
      id,
      type: options.type || 'info',
      priority: options.priority || 'medium',
      title,
      message,
      position: options.position || this.config.defaultPosition,
      duration: options.duration !== undefined ? options.duration : this.config.defaultDuration,
      closable: options.closable !== undefined ? options.closable : true,
      icon: options.icon,
      animation: options.animation || this.config.defaultAnimation,
      actions: options.actions || [],
      groupKey: options.groupKey,
      progress: options.progress,
      metadata: options.metadata,
      createdAt: new Date(),
      isVisible: false
    };
    
    return notification;
  }
  
  /**
   * 显示通知
   */
  private showNotification(notification: Notification): void {
    // 检查是否达到最大数量
    if (this.getActiveNotifications().length >= this.config.maxNotifications) {
      // 入队等待
      this.queue.enqueue(notification);
      return;
    }
    
    // 添加到活动通知
    this.notifications.set(notification.id, notification);
    notification.isVisible = true;
    notification.displayedAt = new Date();
    
    // 渲染通知
    this.renderNotification(notification);
    
    // 设置自动关闭
    if (notification.duration > 0) {
      notification.autoCloseTimer = setTimeout(() => {
        this.closeNotification(notification);
      }, notification.duration);
    }
    
    // 更新统计
    this.updateStats(notification, 'add');
    
    // 添加到历史
    if (this.config.enableHistory) {
      this.addToHistory(notification);
    }
    
    // 播放声音
    if (this.config.enableSound) {
      this.playSound(notification.type);
    }
    
    // 触发事件
    this.emit('notificationShown', { notification });
  }
  
  /**
   * 关闭通知
   */
  private closeNotification(notification: Notification): void {
    // 清除自动关闭定时器
    if (notification.autoCloseTimer) {
      clearTimeout(notification.autoCloseTimer);
      notification.autoCloseTimer = undefined;
    }
    
    // 移除DOM元素
    if (notification.element) {
      this.animateOut(notification.element, notification.animation, () => {
        notification.element?.remove();
        notification.element = undefined;
      });
    }
    
    // 更新状态
    notification.isVisible = false;
    notification.closedAt = new Date();
    
    // 从活动列表移除
    this.notifications.delete(notification.id);
    
    // 更新统计
    this.updateStats(notification, 'remove');
    
    // 触发事件
    this.emit('notificationClosed', { notification });
    
    // 从队列中显示下一个通知
    this.showNextFromQueue();
  }
  
  /**
   * 从队列显示下一个通知
   */
  private showNextFromQueue(): void {
    const next = this.queue.dequeue();
    if (next) {
      this.showNotification(next);
    }
  }
  
  /**
   * 渲染通知
   */
  private renderNotification(notification: Notification): void {
    const container = this.getContainer(notification.position);
    
    // 如果已存在元素，更新内容
    if (notification.element) {
      this.updateNotificationElement(notification);
      return;
    }
    
    // 创建新元素
    const element = this.createNotificationElement(notification);
    notification.element = element;
    
    // 添加到容器
    if (this.config.stackingEnabled) {
      container.appendChild(element);
    } else {
      container.insertBefore(element, container.firstChild);
    }
    
    // 动画进入
    this.animateIn(element, notification.animation);
  }
  
  /**
   * 创建通知元素
   */
  private createNotificationElement(notification: Notification): HTMLElement {
    const element = document.createElement('div');
    element.className = `notification notification-${notification.type} notification-${notification.priority}`;
    element.setAttribute('data-notification-id', notification.id);
    
    // 图标
    if (notification.icon || this.getDefaultIcon(notification.type)) {
      const icon = document.createElement('span');
      icon.className = 'notification-icon';
      icon.textContent = notification.icon || this.getDefaultIcon(notification.type);
      element.appendChild(icon);
    }
    
    // 内容
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = notification.title;
    content.appendChild(title);
    
    if (notification.message) {
      const message = document.createElement('div');
      message.className = 'notification-message';
      message.textContent = notification.message;
      content.appendChild(message);
    }
    
    // 进度条
    if (notification.progress !== undefined) {
      const progress = document.createElement('div');
      progress.className = 'notification-progress';
      const progressBar = document.createElement('div');
      progressBar.className = 'notification-progress-bar';
      progressBar.style.width = `${notification.progress}%`;
      progress.appendChild(progressBar);
      content.appendChild(progress);
    }
    
    element.appendChild(content);
    
    // 操作按钮
    if (notification.actions.length > 0) {
      const actions = document.createElement('div');
      actions.className = 'notification-actions';
      
      for (const action of notification.actions) {
        const button = document.createElement('button');
        button.className = `notification-action notification-action-${action.style || 'secondary'}`;
        button.textContent = action.label;
        button.onclick = () => action.onClick(notification);
        actions.appendChild(button);
      }
      
      element.appendChild(actions);
    }
    
    // 关闭按钮
    if (notification.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notification-close';
      closeBtn.textContent = '×';
      closeBtn.onclick = () => this.closeNotification(notification);
      element.appendChild(closeBtn);
    }
    
    return element;
  }
  
  /**
   * 更新通知元素
   */
  private updateNotificationElement(notification: Notification): void {
    if (!notification.element) return;
    
    const titleEl = notification.element.querySelector('.notification-title');
    if (titleEl) titleEl.textContent = notification.title;
    
    const messageEl = notification.element.querySelector('.notification-message');
    if (messageEl && notification.message) {
      messageEl.textContent = notification.message;
    }
    
    const progressBar = notification.element.querySelector('.notification-progress-bar') as HTMLElement;
    if (progressBar && notification.progress !== undefined) {
      progressBar.style.width = `${notification.progress}%`;
    }
    
    // 更新类型样式
    notification.element.className = `notification notification-${notification.type} notification-${notification.priority}`;
  }
  
  /**
   * 获取默认图标
   */
  private getDefaultIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ',
      loading: '⟳'
    };
    return icons[type];
  }
  
  /**
   * 获取或创建容器
   */
  private getContainer(position: NotificationPosition): HTMLElement {
    let container = this.containers.get(position);
    
    if (!container) {
      container = document.createElement('div');
      container.className = `notification-container notification-container-${position}`;
      document.body.appendChild(container);
      this.containers.set(position, container);
    }
    
    return container;
  }
  
  /**
   * 初始化所有容器
   */
  private initializeContainers(): void {
    const positions: NotificationPosition[] = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ];
    
    for (const position of positions) {
      this.getContainer(position);
    }
  }
  
  /**
   * 动画进入
   */
  private animateIn(element: HTMLElement, animation: NotificationAnimation): void {
    element.classList.add(`notification-enter-${animation}`);
    
    setTimeout(() => {
      element.classList.remove(`notification-enter-${animation}`);
      element.classList.add('notification-visible');
    }, 300);
  }
  
  /**
   * 动画退出
   */
  private animateOut(element: HTMLElement, animation: NotificationAnimation, onComplete: () => void): void {
    element.classList.add(`notification-exit-${animation}`);
    
    setTimeout(() => {
      onComplete();
    }, 300);
  }
  
  /**
   * 播放声音
   */
  private playSound(type: NotificationType): void {
    // 简化实现：使用浏览器默认提示音
    // 实际应用可以使用Audio API播放自定义声音
    if (type === 'error' || type === 'warning') {
      // 播放警告音
    }
  }
  
  /**
   * 更新统计
   */
  private updateStats(notification: Notification, action: 'add' | 'remove'): void {
    if (action === 'add') {
      this.stats.total++;
      this.stats.byType[notification.type]++;
      this.stats.byPriority[notification.priority]++;
      this.stats.active++;
    } else {
      this.stats.active--;
      this.stats.closed++;
    }
  }
  
  /**
   * 添加到历史
   */
  private addToHistory(notification: Notification): void {
    this.history.push(notification);
    
    // 限制历史大小
    if (this.history.length > this.config.historySize) {
      this.history.shift();
    }
  }
  
  /**
   * 生成ID
   */
  private generateId(): string {
    return `notification-${++this.notificationIdCounter}-${Date.now()}`;
  }
  
  /**
   * 销毁通知中心
   */
  destroy(): void {
    // 关闭所有通知
    this.closeAll();
    
    // 清空队列和分组
    this.queue.clear();
    this.groupManager.clear();
    
    // 移除容器
    for (const container of Array.from(this.containers.values())) {
      container.remove();
    }
    this.containers.clear();
    
    // 清除监听器
    this.removeAllListeners();
  }
}

// ================================================
// 5. 导出单例
// ================================================

/**
 * 默认通知中心实例
 */
export const notificationCenter = new NotificationCenter();
