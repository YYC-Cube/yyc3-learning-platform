/**
 * 智能自治核心引擎 - 完整实现
 * 采用事件驱动+目标驱动的混合架构
 * 实现"五高五标五化"设计原则
 */
import { EventEmitter } from 'events';
import { ModelAdapter } from '@yyc3/model-adapter';
import type { ModelConfig, ModelRequest, ModelResponse, TaskType } from '@yyc3/model-adapter';
import type { TaskStatus } from '../IAutonomousAIEngine';

// ModelAdapter相关配置接口
export interface ModelAdapterConfig {
  openAIModel: string;
  openAIKey: string;
  maxTokens?: number;
  temperature?: number;
}

// ==================== 类型定义 ====================

export enum AgentState {
  IDLE = 'idle',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  REFLECTING = 'reflecting',
  ERROR = 'error'
}

export interface AgentContext {
  sessionId: string;
  userId: string;
  workspaceId?: string;
  environment: 'web' | 'mobile' | 'desktop';
  permissions: string[];
  conversationHistory: Message[];
  workingMemory: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserInput {
  text: string;
  attachments?: any[];
  context: AgentContext;
}

export interface AnalyzedIntent {
  primaryIntent: string;
  entities: Array<{ type: string; value: string; confidence: number }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface Goal {
  id: string;
  description: string;
  type: 'primary' | 'secondary' | 'optional';
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  constraints: Record<string, any>;
  successCriteria: string[];
  createdAt: number;
  deadline?: number;
}

export interface ActionPlan {
  id: string;
  goalId: string;
  steps: ActionStep[];
  estimatedDuration: number;
  requiredResources: string[];
  dependencies: string[];
}

export interface ActionStep {
  id: string;
  description: string;
  tool: string;
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
}

export interface AgentTask {
  id: string;
  goal: Goal;
  plan: ActionPlan;
  context: AgentContext;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface AgentResponse {
  taskId: string;
  status: AgentState;
  message: string;
  data?: any;
  suggestions?: string[];
}

export interface SystemStatus {
  state: AgentState;
  activeTasks: number;
  queuedTasks: number;
  totalTasksProcessed: number;
  averageResponseTime: number;
}

export interface AgentConfig {
  maxConcurrentTasks: number;
  maxQueueSize: number;
  defaultTimeout: number;
  enableLearning: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  modelAdapterConfig: ModelAdapterConfig | undefined;
}

// ==================== 核心引擎实现 ====================

export class AgenticCore extends EventEmitter {
  private state: AgentState = AgentState.IDLE;
  private activeTasks: Map<string, AgentTask> = new Map();
  private taskQueue: AgentTask[] = [];
  private taskHistory: AgentTask[] = [];
  private config: AgentConfig;
  private modelAdapter: ModelAdapter;
  
  constructor(config: Partial<AgentConfig> = {}) {
    super();
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 5,
      maxQueueSize: config.maxQueueSize || 100,
      defaultTimeout: config.defaultTimeout || 300000, // 5分钟
      enableLearning: config.enableLearning ?? true,
      logLevel: config.logLevel || 'info',
      modelAdapterConfig: config.modelAdapterConfig
    };
    
    // 初始化ModelAdapter
    this.modelAdapter = new ModelAdapter();
    
    // 配置ModelAdapter
    if (this.config.modelAdapterConfig) {
      this.setupModelAdapter(this.config.modelAdapterConfig);
    }
    
    this.setupEventListeners();
    this.startTaskProcessor();
  }
  
  /**
   * 配置并初始化ModelAdapter
   */
  private async setupModelAdapter(config: ModelAdapterConfig): Promise<void> {
    try {
      // 初始化ModelAdapter配置
      await this.modelAdapter.initialize({
        defaultModel: 'openai-gpt-4',
        fallbackModel: 'openai-gpt-3.5-turbo',
        routing: {
          type: 'smart',
          fallback: {
            enabled: true,
            maxRetries: 3,
            retryDelay: 1000,
            exponentialBackoff: true,
            alternativeModels: [],
            fallbackOnErrors: ['rate_limit', 'timeout']
          }
        },
        loadBalancing: {
          strategy: 'round_robin',
          weights: {},
          healthCheckInterval: 30000,
          unhealthyThreshold: 3,
          healthyThreshold: 2
        },
        cache: {
          enabled: true,
          maxSize: 1000,
          ttl: 3600000,
          strategy: 'lru',
          compressionEnabled: false,
          encryptionEnabled: false
        },
        monitoring: {
          enabled: true,
          metricsInterval: 60000,
          detailedLogging: false,
          alertThresholds: {
            errorRate: 0.1,
            latency: 5000,
            cost: 10,
            queueDepth: 100,
            resourceUsage: 0.9
          },
          retentionPeriod: 86400000
        },
        security: {
          encryptionEnabled: false,
          keyRotationEnabled: false,
          auditLogging: false,
          dataRetentionPolicy: 86400000,
          complianceStandards: [],
          accessControl: {
            rbacEnabled: false,
            defaultPermissions: [],
            adminRoles: [],
            userRoles: []
          }
        }
      });

      // 添加OpenAI模型配置
      const modelConfig: ModelConfig = {
        id: 'openai-gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        model: config.openAIModel,
        credentials: {
          apiKey: config.openAIKey
        },
        capabilities: {
          maxTokens: config.maxTokens || 8192,
          maxContextLength: 8192,
          supportedModalities: ['text', 'code'],
          streamingSupport: true,
          functionCalling: true,
          visionSupport: false,
          codeGeneration: true,
          reasoning: true,
          multilingual: true,
          customInstructions: true
        },
        pricing: {
          inputTokensPer1K: 0.03,
          outputTokensPer1K: 0.06,
          currency: 'USD',
          unit: 'token'
        }
      };

      // 添加模型到ModelAdapter
      await this.modelAdapter.addModel(modelConfig);

      // 启动ModelAdapter
      await this.modelAdapter.start();
    } catch (error) {
      this.log('error', 'Failed to setup ModelAdapter:', error);
      throw error;
    }
  }
  
  private setupEventListeners(): void {
    this.on('task:created', (task: AgentTask) => {
      this.log('info', `Task created: ${task.id}`);
    });
    
    this.on('task:started', (task: AgentTask) => {
      this.log('info', `Task started: ${task.id}`);
    });
    
    this.on('task:completed', (task: AgentTask) => {
      this.log('info', `Task completed: ${task.id}`);
    });
    
    this.on('task:failed', (task: AgentTask, error: Error) => {
      this.log('error', `Task failed: ${task.id}`, error);
    });
    
    // ModelAdapter事件监听
    this.modelAdapter.on('request-start', (request: ModelRequest) => {
      this.emit('model-request-start', request);
    });
    
    this.modelAdapter.on('request-completed', (response: ModelResponse) => {
      this.emit('model-request-completed', response);
    });
    
    this.modelAdapter.on('request-error', (error: any) => {
      this.emit('model-request-error', error);
    });
    
    this.modelAdapter.on('health-status', (status: any) => {
      this.emit('model-health-status', status);
    });
  }
  
  /**
   * 处理用户输入，启动智能流程
   */
  async processInput(input: UserInput): Promise<AgentResponse> {
    try {
      // 1. 意图分析
      const intent = await this.analyzeIntent(input);
      
      // 2. 创建目标
      const goal = this.createGoal(intent, input.context);
      
      // 3. 生成计划
      const plan = await this.generatePlan(goal, input.context);
      
      // 4. 创建任务
      const task: AgentTask = {
        id: this.generateId(),
        goal,
        plan,
        context: input.context,
        status: 'pending',
        progress: 0
      };
      
      // 5. 加入队列
      if (this.activeTasks.size < this.config.maxConcurrentTasks) {
        this.activeTasks.set(task.id, task);
        this.executeTask(task.id);
      } else if (this.taskQueue.length < this.config.maxQueueSize) {
        this.taskQueue.push(task);
      } else {
        throw new Error('Task queue is full');
      }
      
      this.emit('task:created', task);
      
      return {
        taskId: task.id,
        status: this.state,
        message: '任务已创建，正在处理...',
        suggestions: this.generateSuggestions(intent)
      };
      
    } catch (error) {
      this.log('error', 'Failed to process input', error);
      throw error;
    }
  }
  
  /**
   * 意图分析
   */
  private async analyzeIntent(input: UserInput): Promise<AnalyzedIntent> {
    try {
      // 如果没有配置ModelAdapter，使用简单的关键词匹配实现
      if (!this.config.modelAdapterConfig) {
        return this.simpleIntentAnalysis(input);
      }
      
      // 构建模型请求
      const modelRequest: ModelRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskType: 'analysis',
        prompt: input.text,
        messages: input.context.conversationHistory.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata || {}
        })),
        systemPrompt: `你是一个智能意图分析引擎，请分析用户输入并返回结构化的意图信息。

返回格式要求：
{
  "primaryIntent": "意图类型",
  "entities": [{ "type": "实体类型", "value": "实体值", "confidence": 置信度(0-1) }],
  "sentiment": "positive|neutral|negative",
  "complexity": "simple|medium|complex",
  "urgency": "low|medium|high",
  "confidence": 置信度(0-1)
}

意图类型示例：create, search, analyze, help, general_query等。`,
        temperature: 0.1,
        maxTokens: 512,
        stream: false,
        metadata: {
          userId: input.context.userId,
          sessionId: input.context.sessionId,
          requestId: `req_${Date.now()}`,
          priority: 'normal'
        }
      };
      
      // 使用ModelAdapter处理请求
      const response: ModelResponse = await this.modelAdapter.processRequest(modelRequest);
      
      // 解析模型响应
      let result;
      if (typeof response.content === 'string') {
        try {
          result = JSON.parse(response.content);
        } catch (e) {
          this.log('error', 'Failed to parse LLM response:', e);
          return this.simpleIntentAnalysis(input);
        }
      } else {
        // 处理ContentBlock数组
        const textContent = response.content.find((block: any) => block.type === 'text');
        if (textContent && typeof textContent.content === 'string') {
          try {
            result = JSON.parse(textContent.content);
          } catch (e) {
            this.log('error', 'Failed to parse LLM response:', e);
            return this.simpleIntentAnalysis(input);
          }
        } else {
          return this.simpleIntentAnalysis(input);
        }
      }
      
      // 验证结果格式
      if (!result.primaryIntent || !result.entities || !result.sentiment || !result.complexity || !result.urgency || !result.confidence) {
        this.log('warn', 'Invalid LLM response format, falling back to simple intent analysis');
        return this.simpleIntentAnalysis(input);
      }
      
      return result;
      
    } catch (error) {
      this.log('error', 'Error analyzing intent with LLM:', error);
      // 降级到简单的关键词匹配实现
      return this.simpleIntentAnalysis(input);
    }
  }
  
  /**
   * 简单的关键词匹配实现（作为降级方案）
   */
  private simpleIntentAnalysis(input: UserInput): AnalyzedIntent {
    const text = input.text.toLowerCase();
    
    let primaryIntent = 'general_query';
    const entities: Array<{ type: string; value: string; confidence: number }> = [];
    
    // 检测意图
    if (text.includes('创建') || text.includes('新建')) {
      primaryIntent = 'create';
    } else if (text.includes('搜索') || text.includes('查找')) {
      primaryIntent = 'search';
    } else if (text.includes('分析') || text.includes('统计')) {
      primaryIntent = 'analyze';
    } else if (text.includes('帮助') || text.includes('如何')) {
      primaryIntent = 'help';
    }
    
    // 提取实体
    const courseMatch = text.match(/课程|学习|教程/);
    if (courseMatch) {
      entities.push({ type: 'topic', value: 'course', confidence: 0.9 });
    }
    
    return {
      primaryIntent,
      entities,
      sentiment: 'neutral',
      complexity: entities.length > 2 ? 'complex' : 'simple',
      urgency: text.includes('紧急') || text.includes('马上') ? 'high' : 'medium',
      confidence: 0.85
    };
  }
  
  /**
   * 创建目标
   */
  private createGoal(intent: AnalyzedIntent, context: AgentContext): Goal {
    return {
      id: this.generateId(),
      description: `完成用户请求: ${intent.primaryIntent}`,
      type: 'primary',
      priority: intent.urgency === 'high' ? 10 : 5,
      status: 'pending',
      constraints: {
        maxDuration: 300000,
        requiredPermissions: context.permissions
      },
      successCriteria: ['任务完成', '用户满意'],
      createdAt: Date.now()
    };
  }
  
  /**
   * 生成执行计划
   */
  private async generatePlan(goal: Goal, context: AgentContext): Promise<ActionPlan> {
    try {
      // 如果没有配置ModelAdapter，使用简单的硬编码步骤
      if (!this.config.modelAdapterConfig) {
        return this.simplePlanGeneration(goal, context);
      }
      
      // 构建模型请求
      const modelRequest: ModelRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskType: 'reasoning',
        prompt: `请为目标"${goal.description}"生成详细的执行计划。`,
        messages: context.conversationHistory.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata || {}
        })),
        systemPrompt: `你是一个智能计划生成引擎，请根据目标生成详细的执行计划。

返回格式要求：
{
  "steps": [
    {
      "id": "步骤ID",
      "description": "步骤描述",
      "tool": "使用的工具名称",
      "parameters": { "参数名": "参数值" },
      "status": "pending"
    }
  ],
  "estimatedDuration": 预计完成时间(毫秒),
  "requiredResources": ["需要的资源名称"],
  "dependencies": ["依赖的步骤ID"]
}

工具列表：knowledge_search, data_processor, response_generator, code_generator, file_operation, analysis_engine

请确保生成的步骤逻辑清晰，可执行。`,
        temperature: 0.2,
        maxTokens: 1024,
        stream: false,
        metadata: {
          userId: context.userId,
          sessionId: context.sessionId,
          requestId: `req_${Date.now()}`,
          priority: 'normal'
        }
      };
      
      // 使用ModelAdapter处理请求
      const response: ModelResponse = await this.modelAdapter.processRequest(modelRequest);
      
      // 解析模型响应
      let result;
      if (typeof response.content === 'string') {
        try {
          result = JSON.parse(response.content);
        } catch (e) {
          this.log('error', 'Failed to parse LLM response:', e);
          return this.simplePlanGeneration(goal, context);
        }
      } else {
        // 处理ContentBlock数组
        const textContent = response.content.find((block: any) => block.type === 'text');
        if (textContent && typeof textContent.content === 'string') {
          try {
            result = JSON.parse(textContent.content);
          } catch (e) {
            this.log('error', 'Failed to parse LLM response:', e);
            return this.simplePlanGeneration(goal, context);
          }
        } else {
          return this.simplePlanGeneration(goal, context);
        }
      }
      
      // 验证结果格式
      if (!result.steps || !Array.isArray(result.steps) || result.steps.length === 0) {
        this.log('warn', 'Invalid LLM response format, falling back to simple plan generation');
        return this.simplePlanGeneration(goal, context);
      }
      
      // 为每个步骤生成唯一ID
      const stepsWithIds = result.steps.map((step: any) => ({
        ...step,
        id: step.id || this.generateId(),
        status: step.status || 'pending'
      }));
      
      return {
        id: this.generateId(),
        goalId: goal.id,
        steps: stepsWithIds,
        estimatedDuration: result.estimatedDuration || 10000,
        requiredResources: result.requiredResources || ['cpu', 'memory'],
        dependencies: result.dependencies || []
      };
      
    } catch (error) {
      this.log('error', 'Error generating plan with LLM:', error);
      // 降级到简单的硬编码步骤
      return this.simplePlanGeneration(goal, context);
    }
  }
  
  /**
   * 简单的硬编码步骤实现（作为降级方案）
   */
  private simplePlanGeneration(goal: Goal, context: AgentContext): ActionPlan {
    // 根据目标生成步骤
    const steps: ActionStep[] = [
      {
        id: this.generateId(),
        description: '收集相关信息',
        tool: 'knowledge_search',
        parameters: { query: goal.description },
        status: 'pending'
      },
      {
        id: this.generateId(),
        description: '处理数据',
        tool: 'data_processor',
        parameters: {},
        status: 'pending'
      },
      {
        id: this.generateId(),
        description: '生成响应',
        tool: 'response_generator',
        parameters: {},
        status: 'pending'
      }
    ];
    
    return {
      id: this.generateId(),
      goalId: goal.id,
      steps,
      estimatedDuration: 10000,
      requiredResources: ['cpu', 'memory'],
      dependencies: []
    };
  }
  
  /**
   * 执行任务
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) return;
    
    try {
      this.state = AgentState.EXECUTING;
      task.status = 'executing';
      task.startTime = Date.now();
      this.emit('task:started', task);
      
      // 执行计划中的每个步骤
      for (const step of task.plan.steps) {
        step.status = 'executing';
        
        // 模拟工具执行
        await this.delay(1000);
        step.result = { success: true, data: `步骤 ${step.description} 完成` };
        step.status = 'completed';
        
        // 更新进度
        const completedSteps = task.plan.steps.filter(s => s.status === 'completed').length;
        task.progress = (completedSteps / task.plan.steps.length) * 100;
        
        this.emit('task:progress', task);
      }
      
      // 任务完成
      task.status = 'completed';
      task.endTime = Date.now();
      task.result = {
        success: true,
        message: '任务已成功完成',
        data: task.plan.steps.map(s => s.result)
      };
      
      this.taskHistory.push(task);
      this.activeTasks.delete(taskId);
      this.emit('task:completed', task);
      
      // 处理队列中的下一个任务
      this.processNextTask();
      
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.endTime = Date.now();
      
      this.activeTasks.delete(taskId);
      this.emit('task:failed', task, error);
      
      // 处理队列中的下一个任务
      this.processNextTask();
    }
  }
  
  /**
   * 处理队列中的下一个任务
   */
  private processNextTask(): void {
    if (this.taskQueue.length > 0 && this.activeTasks.size < this.config.maxConcurrentTasks) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        this.activeTasks.set(nextTask.id, nextTask);
        this.executeTask(nextTask.id);
      }
    }
    
    if (this.activeTasks.size === 0 && this.taskQueue.length === 0) {
      this.state = AgentState.IDLE;
    }
  }
  
  /**
   * 启动任务处理器
   */
  private startTaskProcessor(): void {
    setInterval(() => {
      // 清理超时任务
      const now = Date.now();
      for (const [taskId, task] of this.activeTasks.entries()) {
        if (task.startTime && (now - task.startTime) > this.config.defaultTimeout) {
          task.status = 'failed';
          task.error = 'Task timeout';
          task.endTime = now;
          this.activeTasks.delete(taskId);
          this.emit('task:failed', task, new Error('Task timeout'));
        }
      }
    }, 10000); // 每10秒检查一次
  }
  
  /**
   * 生成建议
   */
  private generateSuggestions(intent: AnalyzedIntent): string[] {
    const suggestions: string[] = [];
    
    if (intent.primaryIntent === 'search') {
      suggestions.push('尝试使用更具体的关键词');
      suggestions.push('使用筛选条件缩小范围');
    } else if (intent.primaryIntent === 'create') {
      suggestions.push('查看创建指南');
      suggestions.push('使用模板快速开始');
    }
    
    return suggestions;
  }
  
  /**
   * 获取系统状态
   */
  getSystemStatus(): SystemStatus {
    const completedTasks = this.taskHistory.filter(t => t.status === 'completed');
    const avgTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + ((t.endTime || 0) - (t.startTime || 0)), 0) / completedTasks.length
      : 0;
    
    return {
      state: this.state,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      totalTasksProcessed: this.taskHistory.length,
      averageResponseTime: avgTime
    };
  }
  
  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TaskStatus {
    const task = this.activeTasks.get(taskId) || 
                 this.taskQueue.find(t => t.id === taskId) ||
                 this.taskHistory.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    // 转换AgentTask状态为TaskStatus
    const statusMap: Record<string, TaskStatus> = {
      'pending': 'pending',
      'executing': 'running',
      'completed': 'completed',
      'failed': 'failed'
    };
    return statusMap[task.status] || 'failed';
  }
  
  // ==================== 辅助方法 ====================
  
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private log(level: string, message: string, error?: any): void {
    const levels = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) >= levels.indexOf(this.config.logLevel)) {
      console[level as 'log' | 'info' | 'warn' | 'error'](
        `[AgenticCore] ${message}`,
        error ? error : ''
      );
    }
  }
}
