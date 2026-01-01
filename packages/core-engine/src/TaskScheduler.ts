/**
 * 任务调度器 - 智能任务队列与执行管理
 */

import { EventEmitter } from 'events';

// ==================== 类型定义 ====================

export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface Task {
  id: string;
  name: string;
  priority: TaskPriority;
  executor: TaskExecutor;
  dependencies: string[];
  timeout: number;
  retryPolicy: TaskRetryPolicy;
  metadata: Record<string, any>;
}

export interface TaskExecutor {
  (context: TaskExecutionContext): Promise<any>;
}

export interface TaskExecutionContext {
  taskId: string;
  signal: AbortSignal;
  progress: (percentage: number, message?: string) => void;
  metadata: Record<string, any>;
}

export interface TaskRetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffFactor: number;
}

export interface ActiveTask {
  task: Task;
  status: TaskStatus;
  startTime: number;
  endTime?: number;
  retryCount: number;
  result?: any;
  error?: Error;
  progress: number;
  abortController: AbortController;
}

export interface SchedulerConfig {
  maxConcurrentTasks: number;
  timeoutMs: number;
  priorityLevels: number;
  enableTaskPersistence: boolean;
  enableMetrics: boolean;
}

export interface SchedulerMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  cancelledTasks: number;
  activeTasks: number;
  queuedTasks: number;
  averageExecutionTime: number;
  averageWaitTime: number;
  throughput: number;
}

// ==================== 任务调度器实现 ====================

export class TaskScheduler extends EventEmitter {
  private config: SchedulerConfig;
  private taskQueue: Task[] = [];
  private activeTasks: Map<string, ActiveTask> = new Map();
  private completedTasks: Map<string, ActiveTask> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private metrics: SchedulerMetrics;
  private startTime: number;

  constructor(config: Partial<SchedulerConfig> = {}) {
    super();
    
    this.config = {
      maxConcurrentTasks: 10,
      timeoutMs: 30000,
      priorityLevels: 5,
      enableTaskPersistence: false,
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      cancelledTasks: 0,
      activeTasks: 0,
      queuedTasks: 0,
      averageExecutionTime: 0,
      averageWaitTime: 0,
      throughput: 0
    };

    this.startTime = Date.now();
    this.startScheduling();
  }

  /**
   * 提交任务
   */
  async submitTask(
    executor: TaskExecutor,
    options: {
      name?: string;
      priority?: TaskPriority;
      dependencies?: string[];
      timeout?: number;
      retryPolicy?: Partial<TaskRetryPolicy>;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const task: Task = {
      id: this.generateTaskId(),
      name: options.name || 'unnamed_task',
      priority: options.priority || TaskPriority.NORMAL,
      executor,
      dependencies: options.dependencies || [],
      timeout: options.timeout || this.config.timeoutMs,
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000,
        backoffFactor: 2,
        ...options.retryPolicy
      },
      metadata: options.metadata || {}
    };

    // 验证依赖
    await this.validateDependencies(task);

    // 添加到队列
    this.enqueueTask(task);

    this.metrics.totalTasks++;
    this.metrics.queuedTasks = this.taskQueue.length;

    this.emit('task:submitted', task);

    return task.id;
  }

  /**
   * 批量提交任务
   */
  async submitBatch(
    tasks: Array<{
      executor: TaskExecutor;
      options?: {
        name?: string;
        priority?: TaskPriority;
        dependencies?: string[];
        timeout?: number;
        retryPolicy?: Partial<TaskRetryPolicy>;
        metadata?: Record<string, any>;
      };
    }>
  ): Promise<string[]> {
    return Promise.all(
      tasks.map(({ executor, options }) => 
        this.submitTask(executor, options)
      )
    );
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    // 检查活动任务
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) {
      activeTask.abortController.abort();
      activeTask.status = TaskStatus.CANCELLED;
      this.activeTasks.delete(taskId);
      this.metrics.cancelledTasks++;
      this.emit('task:cancelled', activeTask);
      return true;
    }

    // 检查队列中的任务
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (queueIndex > -1) {
      const task = this.taskQueue.splice(queueIndex, 1)[0];
      this.metrics.queuedTasks = this.taskQueue.length;
      this.metrics.cancelledTasks++;
      this.emit('task:cancelled', { task, status: TaskStatus.CANCELLED });
      return true;
    }

    return false;
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TaskStatus | null {
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) return activeTask.status;

    const completedTask = this.completedTasks.get(taskId);
    if (completedTask) return completedTask.status;

    const queuedTask = this.taskQueue.find(t => t.id === taskId);
    if (queuedTask) return TaskStatus.QUEUED;

    return null;
  }

  /**
   * 获取任务进度
   */
  getTaskProgress(taskId: string): number {
    const activeTask = this.activeTasks.get(taskId);
    return activeTask?.progress || 0;
  }

  /**
   * 等待任务完成
   */
  async waitForTask<T = any>(taskId: string, timeoutMs?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = timeoutMs ? setTimeout(() => {
        reject(new Error(`Task wait timeout: ${taskId}`));
      }, timeoutMs) : null;

      const checkCompletion = () => {
        const completedTask = this.completedTasks.get(taskId);
        if (completedTask) {
          if (timeout) clearTimeout(timeout);
          
          if (completedTask.status === TaskStatus.COMPLETED) {
            resolve(completedTask.result);
          } else {
            reject(completedTask.error || new Error('Task failed'));
          }
          return true;
        }
        return false;
      };

      // 立即检查
      if (checkCompletion()) return;

      // 监听完成事件
      const handler = (task: ActiveTask) => {
        if (task.task.id === taskId) {
          if (timeout) clearTimeout(timeout);
          this.off('task:completed', handler);
          this.off('task:failed', handler);
          
          if (task.status === TaskStatus.COMPLETED) {
            resolve(task.result);
          } else {
            reject(task.error || new Error('Task failed'));
          }
        }
      };

      this.on('task:completed', handler);
      this.on('task:failed', handler);
    });
  }

  /**
   * 开始调度循环
   */
  private startScheduling(): void {
    setInterval(() => {
      this.scheduleNextTasks();
    }, 100); // 每100ms调度一次
  }

  /**
   * 调度下一批任务
   */
  private async scheduleNextTasks(): Promise<void> {
    while (
      this.activeTasks.size < this.config.maxConcurrentTasks &&
      this.taskQueue.length > 0
    ) {
      const task = this.dequeueTask();
      if (!task) break;

      // 检查依赖是否满足
      if (!await this.areDependenciesMet(task)) {
        // 重新入队
        this.taskQueue.push(task);
        break;
      }

      // 执行任务
      await this.executeTask(task);
    }
  }

  /**
   * 执行任务
   */
  private async executeTask(task: Task): Promise<void> {
    const abortController = new AbortController();
    
    const activeTask: ActiveTask = {
      task,
      status: TaskStatus.RUNNING,
      startTime: Date.now(),
      retryCount: 0,
      progress: 0,
      abortController
    };

    this.activeTasks.set(task.id, activeTask);
    this.metrics.activeTasks = this.activeTasks.size;

    this.emit('task:started', activeTask);

    try {
      // 设置超时
      const timeoutHandle = setTimeout(() => {
        abortController.abort();
      }, task.timeout);

      // 创建执行上下文
      const context: TaskExecutionContext = {
        taskId: task.id,
        signal: abortController.signal,
        progress: (percentage: number, message?: string) => {
          activeTask.progress = percentage;
          this.emit('task:progress', { taskId: task.id, percentage, message });
        },
        metadata: task.metadata
      };

      // 执行任务
      const result = await task.executor(context);

      clearTimeout(timeoutHandle);

      // 任务完成
      activeTask.status = TaskStatus.COMPLETED;
      activeTask.endTime = Date.now();
      activeTask.result = result;
      activeTask.progress = 100;

      this.completeTask(activeTask);

    } catch (error: any) {
      // 任务失败
      activeTask.error = error;

      if (abortController.signal.aborted) {
        activeTask.status = TaskStatus.TIMEOUT;
      } else {
        activeTask.status = TaskStatus.FAILED;
      }

      activeTask.endTime = Date.now();

      // 检查是否需要重试
      if (
        activeTask.status === TaskStatus.FAILED &&
        activeTask.retryCount < task.retryPolicy.maxRetries
      ) {
        await this.retryTask(task, activeTask);
      } else {
        this.failTask(activeTask);
      }
    }
  }

  /**
   * 完成任务
   */
  private completeTask(activeTask: ActiveTask): void {
    this.activeTasks.delete(activeTask.task.id);
    this.completedTasks.set(activeTask.task.id, activeTask);

    this.metrics.activeTasks = this.activeTasks.size;
    this.metrics.completedTasks++;

    // 更新执行时间
    const executionTime = activeTask.endTime! - activeTask.startTime;
    this.updateAverageExecutionTime(executionTime);

    this.emit('task:completed', activeTask);
  }

  /**
   * 任务失败
   */
  private failTask(activeTask: ActiveTask): void {
    this.activeTasks.delete(activeTask.task.id);
    this.completedTasks.set(activeTask.task.id, activeTask);

    this.metrics.activeTasks = this.activeTasks.size;
    this.metrics.failedTasks++;

    this.emit('task:failed', activeTask);
  }

  /**
   * 重试任务
   */
  private async retryTask(task: Task, activeTask: ActiveTask): Promise<void> {
    activeTask.retryCount++;

    // 计算退避延迟
    const delay = task.retryPolicy.backoffMs * 
      Math.pow(task.retryPolicy.backoffFactor, activeTask.retryCount - 1);

    this.emit('task:retrying', { 
      task, 
      attempt: activeTask.retryCount,
      delay 
    });

    // 延迟后重新入队
    setTimeout(() => {
      this.activeTasks.delete(task.id);
      this.enqueueTask(task);
    }, delay);
  }

  /**
   * 入队任务（按优先级）
   */
  private enqueueTask(task: Task): void {
    let inserted = false;
    
    for (let i = 0; i < this.taskQueue.length; i++) {
      if (task.priority > this.taskQueue[i].priority) {
        this.taskQueue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.taskQueue.push(task);
    }
  }

  /**
   * 出队任务
   */
  private dequeueTask(): Task | undefined {
    const task = this.taskQueue.shift();
    this.metrics.queuedTasks = this.taskQueue.length;
    return task;
  }

  /**
   * 验证依赖
   */
  private async validateDependencies(task: Task): Promise<void> {
    for (const depId of task.dependencies) {
      if (!this.completedTasks.has(depId) && 
          !this.activeTasks.has(depId) &&
          !this.taskQueue.find(t => t.id === depId)) {
        throw new Error(`Dependency not found: ${depId}`);
      }
    }
  }

  /**
   * 检查依赖是否满足
   */
  private async areDependenciesMet(task: Task): Promise<boolean> {
    for (const depId of task.dependencies) {
      const depTask = this.completedTasks.get(depId);
      if (!depTask || depTask.status !== TaskStatus.COMPLETED) {
        return false;
      }
    }
    return true;
  }

  /**
   * 更新平均执行时间
   */
  private updateAverageExecutionTime(executionTime: number): void {
    const total = this.metrics.completedTasks + this.metrics.failedTasks;
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (total - 1) + executionTime) / total;

    // 计算吞吐量
    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.metrics.completedTasks / uptime;
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 获取指标
   */
  getMetrics(): SchedulerMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): {
    queued: number;
    active: number;
    completed: number;
    failed: number;
  } {
    return {
      queued: this.taskQueue.length,
      active: this.activeTasks.size,
      completed: this.metrics.completedTasks,
      failed: this.metrics.failedTasks
    };
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    this.taskQueue = [];
    this.metrics.queuedTasks = 0;
    this.emit('queue:cleared');
  }

  /**
   * 暂停调度
   */
  pause(): void {
    this.emit('scheduler:paused');
  }

  /**
   * 恢复调度
   */
  resume(): void {
    this.emit('scheduler:resumed');
  }
}

// ==================== 单例导出 ====================

export const taskScheduler = new TaskScheduler();
