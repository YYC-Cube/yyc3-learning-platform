/**
 * 动态工具注册与发现系统
 * 支持工具的自描述、自验证和自动编排
 */
import { EventEmitter } from 'events';
import { z } from 'zod';

// 接口定义
export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string[];
  tags: string[];
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  permissions: string[];
  rateLimit?: number;
  timeout?: number;
  cacheable: boolean;
  requiresAuth: boolean;
  icon?: string;
  documentation?: string;
  examples?: ToolExample[];
}

export interface ToolExample {
  input: unknown;
  output: unknown;
  description: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime: number;
  cached: boolean;
  metadata: ExecutionMetadata;
}

export interface ExecutionMetadata {
  toolId: string;
  executionTime: number;
  cached: boolean;
  cacheHit?: boolean;
  error?: string;
}

export interface ToolDefinition {
  id: string;
  metadata: ToolMetadata;
  execute: (input: unknown, context: ExecutionContext) => Promise<unknown>;
  validate?: (input: unknown) => boolean;
}

export interface RegisteredTool extends ToolDefinition {
  metadata: ToolMetadata & {
    registeredAt: Date;
    lastUpdated: Date;
  };
}

export interface ExecutionContext {
  userId: string;
  sessionId: string;
  permissions: string[];
  environment: 'web' | 'mobile' | 'desktop';
  workspaceId?: string;
  timestamp: number;
}

export interface ToolFilters {
  category?: string[];
  permissions?: string[];
  tags?: string[];
  requiresAuth?: boolean;
  cacheable?: boolean;
}

export interface ToolDiscoveryResult {
  query: string;
  total: number;
  tools: RegisteredTool[];
  categories: Record<string, RegisteredTool[]>;
  suggestions: string[];
  executionPlan?: ExecutionPlan;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedTime: number;
  confidence: number;
  dependencies: string[];
}

export interface ExecutionStep {
  toolId: string;
  input: unknown;
  outputType: string;
  dependencies: string[];
}

export interface ToolOrchestrationPlan {
  goal: string;
  subtasks: OrchestrationSubtask[];
  toolAssignments: ToolAssignment[];
  executionPlan: ExecutionPlan;
  estimatedTime: number;
  confidence: number;
  alternatives: AlternativePlan[];
  fallbackStrategies: FallbackStrategy[];
}

export interface OrchestrationSubtask {
  id: string;
  description: string;
  type: string;
  priority: number;
  constraints: Record<string, unknown>;
}

export interface ToolAssignment {
  subtaskId: string;
  candidates: string[];
  selected: string;
  confidence: number;
}

export interface AlternativePlan {
  description: string;
  executionPlan: ExecutionPlan;
  confidence: number;
}

export interface FallbackStrategy {
  condition: string;
  action: string;
  recoveryPlan: ExecutionPlan;
}

export interface RecommendationContext {
  userId: string;
  sessionId: string;
  currentTask?: string;
  recentTools?: string[];
  limit?: number;
}

export interface ToolRecommendation {
  toolId: string;
  confidence: number;
  reason: string;
  category: string;
  estimatedTime: number;
  examples?: ToolExample[];
}

export interface ToolHealthReport {
  toolId: string;
  status: 'healthy' | 'degraded' | 'error' | 'not_found';
  checks: HealthCheckResult[];
  overallScore: number;
  recommendations: string[];
  lastChecked: Date;
}

export interface HealthCheckResult {
  name: string;
  passed: boolean;
  score: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface RegistrationResult {
  success: boolean;
  toolId?: string;
  message: string;
  warnings?: string[];
}

export interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export interface ToolUsageStats {
  usageCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  successCount: number;
  errorCount: number;
  lastUsed: Date;
  cacheHitRate: number;
}

export interface RegistryConfig {
  maxResults: number;
  defaultCacheTTL: number;
  maxCacheSize: number;
  enableMetrics: boolean;
  enableHealthCheck: boolean;
  healthCheckInterval: number;
}

// 错误类
export class ToolRegistrationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ToolRegistrationError';
  }
}

export class ToolNotFoundError extends Error {
  constructor(toolId: string) {
    super(`工具 ${toolId} 未找到`);
    this.name = 'ToolNotFoundError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class OrchestrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

// 主要的ToolRegistry类
export class ToolRegistry extends EventEmitter {
  private tools: Map<string, RegisteredTool> = new Map();
  private categories: Map<string, Set<string>> = new Map();
  private usageStats: Map<string, ToolUsageStats> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private dependencies: Map<string, Set<string>> = new Map();

  constructor(private config: RegistryConfig) {
    super();
    this.loadBuiltinTools();

    if (this.config.enableHealthCheck) {
      this.startHealthCheck();
    }
  }

  /**
   * 注册新工具
   */
  async registerTool(toolDef: ToolDefinition): Promise<RegistrationResult> {
    try {
      // 1. 验证工具定义
      await this.validateToolDefinition(toolDef);

      // 2. 检查依赖
      await this.checkDependencies(toolDef);

      // 3. 生成工具ID
      const toolId = this.generateToolId(toolDef);

      // 4. 创建工具包装器
      const tool = this.createToolWrapper(toolDef, toolId);

      // 5. 存储到注册表
      this.tools.set(toolId, {
        ...tool,
        metadata: {
          ...tool.metadata,
          id: toolId,
          registeredAt: new Date(),
          lastUpdated: new Date()
        }
      });

      // 6. 更新分类索引
      this.updateCategoryIndex(toolId, tool.metadata.category);

      // 7. 初始化使用统计
      this.usageStats.set(toolId, {
        usageCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        successCount: 0,
        errorCount: 0,
        lastUsed: new Date(),
        cacheHitRate: 0
      });

      // 8. 发布事件
      this.emit('toolRegistered', {
        toolId,
        metadata: tool.metadata,
        timestamp: new Date()
      });

      return {
        success: true,
        toolId,
        message: '工具注册成功',
        warnings: this.collectWarnings(toolDef)
      };

    } catch (error) {
      this.emit('toolRegistrationFailed', {
        toolDef,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });

      throw new ToolRegistrationError(
        `工具注册失败: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 发现工具（基于语义搜索）
   */
  async discoverTools(query: string, filters?: ToolFilters): Promise<ToolDiscoveryResult> {
    // 1. 关键词搜索（简化实现）
    const searchResults = this.keywordSearch(query, filters);

    // 2. 过滤
    const filtered = this.applyFilters(searchResults, filters);

    // 3. 排序（基于相关性和使用频率）
    const sorted = this.sortTools(filtered, query);

    // 4. 分组（按类别）
    const grouped = this.groupByCategory(sorted);

    return {
      query,
      total: sorted.length,
      tools: sorted.slice(0, this.config.maxResults),
      categories: grouped,
      suggestions: this.generateSuggestions(query, sorted),
      executionPlan: await this.generateExecutionPlan(query, sorted)
    };
  }

  /**
   * 执行工具
   */
  async executeTool(toolId: string, input: unknown, context: ExecutionContext): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new ToolNotFoundError(`工具 ${toolId} 未找到`);
    }

    // 检查权限
    if (!this.checkPermissions(tool, context)) {
      throw new PermissionError(`无权访问工具 ${toolId}`);
    }

    // 检查速率限制
    if (!this.checkRateLimit(toolId)) {
      throw new RateLimitError(`工具 ${toolId} 速率限制`);
    }

    // 验证输入
    const validatedInput = await this.validateInput(tool, input);

    // 检查缓存
    const cacheKey = this.generateCacheKey(toolId, validatedInput);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isCacheExpired(cached)) {
      this.updateUsageStats(toolId, 0, true);
      return {
        success: true,
        data: cached.data,
        executionTime: 0,
        cached: true,
        metadata: {
          toolId,
          executionTime: 0,
          cached: true,
          cacheHit: true
        }
      };
    }

    // 执行工具
    const startTime = Date.now();

    try {
      const result = await tool.execute(validatedInput, context);

      const executionTime = Date.now() - startTime;

      // 验证输出
      const validatedOutput = await this.validateOutput(tool, result);

      // 更新使用统计
      this.updateUsageStats(toolId, executionTime, true);

      // 缓存结果
      if (tool.metadata.cacheable) {
        this.cache.set(cacheKey, {
          data: validatedOutput,
          timestamp: Date.now(),
          ttl: tool.metadata.timeout || this.config.defaultCacheTTL
        });

        // 清理过期缓存
        this.cleanExpiredCache();
      }

      return {
        success: true,
        data: validatedOutput,
        executionTime,
        cached: false,
        metadata: {
          toolId,
          executionTime,
          cached: false,
          cacheHit: false
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // 更新使用统计
      this.updateUsageStats(toolId, executionTime, false);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
        cached: false,
        metadata: {
          toolId,
          executionTime,
          error: error instanceof Error ? error.message : String(error),
          cached: false
        }
      };
    }
  }

  /**
   * 自动编排工具链
   */
  async autoOrchestrate(goal: string, constraints: unknown): Promise<ToolOrchestrationPlan> {
    // 1. 分解目标为子任务
    const subtasks = await this.decomposeGoal(goal);

    // 2. 为每个子任务寻找工具
    const toolAssignments = await Promise.all(
      subtasks.map(async subtask => ({
        subtask,
        candidates: await this.findToolsForSubtask(subtask),
        constraints: this.extractConstraints(subtask, constraints)
      }))
    );

    // 3. 生成执行计划
    const executionPlan = await this.generateExecutionPlan(goal, []);

    // 4. 优化计划
    const optimizedPlan = await this.optimizePlan(executionPlan);

    // 5. 验证可行性
    const validation = await this.validatePlan(optimizedPlan);

    if (!validation.valid) {
      throw new OrchestrationError(`编排计划不可行: ${validation.reasons.join(', ')}`);
    }

    return {
      goal,
      subtasks,
      toolAssignments: toolAssignments.map(ta => ({
        subtaskId: ta.subtask.id,
        candidates: ta.candidates,
        selected: ta.candidates[0] || '',
        confidence: 0.8
      })),
      executionPlan: optimizedPlan,
      estimatedTime: this.estimateTime(optimizedPlan),
      confidence: this.calculateConfidence(optimizedPlan),
      alternatives: [],
      fallbackStrategies: []
    };
  }

  /**
   * 工具推荐系统
   */
  async recommendTools(context: RecommendationContext): Promise<ToolRecommendation[]> {
    const allTools = Array.from(this.tools.values());

    // 基于多种策略的推荐
    const recommendations = allTools.map(tool => ({
      toolId: tool.metadata.id,
      confidence: this.calculateRecommendationScore(tool, context),
      reason: this.generateRecommendationReason(tool, context),
      category: tool.metadata.category[0] || 'general',
      estimatedTime: tool.metadata.timeout || 5000,
      examples: tool.metadata.examples
    }));

    // 排序并返回推荐
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, context.limit || 10);
  }

  /**
   * 工具健康检查
   */
  async checkToolHealth(toolId: string): Promise<ToolHealthReport> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return {
        toolId,
        status: 'not_found',
        checks: [],
        overallScore: 0,
        recommendations: ['工具未注册'],
        lastChecked: new Date()
      };
    }

    const checks = [
      this.checkToolAvailability,
      this.checkToolPerformance,
      this.checkToolDependencies
    ];

    const results = await Promise.all(
      checks.map(check => check.call(this, tool))
    );

    const allPassed = results.every(r => r.passed);
    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      toolId,
      status: allPassed ? 'healthy' : 'degraded',
      checks: results,
      overallScore,
      recommendations: this.generateHealthRecommendations(results),
      lastChecked: new Date()
    };
  }

  // 私有辅助方法
  private loadBuiltinTools(): void {
    // 注册内置工具
    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    // 这里可以注册一些基础工具
    // 例如：chat, analysis, search, creation 等
  }

  private async validateToolDefinition(toolDef: ToolDefinition): Promise<void> {
    if (!toolDef.id || !toolDef.metadata || !toolDef.execute) {
      throw new Error('工具定义不完整');
    }

    if (!toolDef.metadata.name || !toolDef.metadata.description) {
      throw new Error('工具元数据不完整');
    }
  }

  private async checkDependencies(_toolDef: ToolDefinition): Promise<void> {
    // 检查工具依赖
  }

  private generateToolId(toolDef: ToolDefinition): string {
    return toolDef.id || `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createToolWrapper(toolDef: ToolDefinition, toolId: string): RegisteredTool {
    return {
      ...toolDef,
      metadata: {
        ...toolDef.metadata,
        id: toolId,
        registeredAt: new Date(),
        lastUpdated: new Date()
      }
    };
  }

  private updateCategoryIndex(toolId: string, categories: string[]): void {
    categories.forEach(category => {
      if (!this.categories.has(category)) {
        this.categories.set(category, new Set());
      }
      this.categories.get(category)!.add(toolId);
    });
  }

  private collectWarnings(toolDef: ToolDefinition): string[] {
    const warnings: string[] = [];

    if (!toolDef.metadata.examples || toolDef.metadata.examples.length === 0) {
      warnings.push('缺少使用示例');
    }

    if (!toolDef.metadata.documentation) {
      warnings.push('缺少文档说明');
    }

    return warnings;
  }

  private keywordSearch(query: string, filters?: ToolFilters): RegisteredTool[] {
    const allTools = Array.from(this.tools.values());
    const lowerQuery = query.toLowerCase();

    return allTools.filter(tool => {
      const matchQuery =
        tool.metadata.name.toLowerCase().includes(lowerQuery) ||
        tool.metadata.description.toLowerCase().includes(lowerQuery) ||
        tool.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

      return matchQuery && this.matchesFilters(tool, filters);
    });
  }

  private applyFilters(tools: RegisteredTool[], filters?: ToolFilters): RegisteredTool[] {
    if (!filters) return tools;

    return tools.filter(tool => this.matchesFilters(tool, filters));
  }

  private matchesFilters(tool: RegisteredTool, filters?: ToolFilters): boolean {
    if (!filters) return true;

    if (filters.category && !filters.category.some(cat => tool.metadata.category.includes(cat))) {
      return false;
    }

    if (filters.requiresAuth !== undefined && tool.metadata.requiresAuth !== filters.requiresAuth) {
      return false;
    }

    if (filters.cacheable !== undefined && tool.metadata.cacheable !== filters.cacheable) {
      return false;
    }

    return true;
  }

  private sortTools(tools: RegisteredTool[], query: string): RegisteredTool[] {
    return tools.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query);
      const bScore = this.calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(tool: RegisteredTool, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    if (tool.metadata.name.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }

    if (tool.metadata.description.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    tool.metadata.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }
    });

    // 添加使用频率权重
    const stats = this.usageStats.get(tool.metadata.id);
    if (stats) {
      score += Math.log(stats.usageCount + 1);
    }

    return score;
  }

  private groupByCategory(tools: RegisteredTool[]): Record<string, RegisteredTool[]> {
    const grouped: Record<string, RegisteredTool[]> = {};

    tools.forEach(tool => {
      tool.metadata.category.forEach(category => {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(tool);
      });
    });

    return grouped;
  }

  private generateSuggestions(_query: string, _tools: RegisteredTool[]): string[] {
    // 简化的建议生成
    return [
      '尝试使用更具体的关键词',
      '查看相关分类',
      '检查工具标签'
    ];
  }

  private async generateExecutionPlan(_query: string, tools: RegisteredTool[]): Promise<ExecutionPlan> {
    return {
      steps: tools.slice(0, 3).map(tool => ({
        toolId: tool.metadata.id,
        input: {},
        outputType: 'any',
        dependencies: []
      })),
      estimatedTime: tools.slice(0, 3).reduce((sum, tool) => sum + (tool.metadata.timeout || 5000), 0),
      confidence: 0.8,
      dependencies: []
    };
  }

  private checkPermissions(tool: RegisteredTool, context: ExecutionContext): boolean {
    if (tool.metadata.requiresAuth) {
      return tool.metadata.permissions.every(perm => context.permissions.includes(perm));
    }
    return true;
  }



  private checkRateLimit(_toolId: string): boolean {
    // 简化的速率限制检查
    return true;
  }

  private async validateInput(tool: RegisteredTool, input: unknown): Promise<unknown> {
    try {
      return tool.metadata.inputSchema.parse(input);
    } catch (error) {
      throw new Error(`输入验证失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async validateOutput(tool: RegisteredTool, output: unknown): Promise<unknown> {
    try {
      return tool.metadata.outputSchema.parse(output);
    } catch (error) {
      // 输出验证失败不应该阻止执行
      console.warn('输出验证失败:', error);
      return output;
    }
  }

  private generateCacheKey(toolId: string, input: unknown): string {
    return `${toolId}_${JSON.stringify(input)}`;
  }

  private isCacheExpired(cacheEntry: CacheEntry): boolean {
    return Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
  }

  private updateUsageStats(toolId: string, executionTime: number, success: boolean): void {
    const stats = this.usageStats.get(toolId);
    if (stats) {
      stats.usageCount++;
      stats.totalExecutionTime += executionTime;
      stats.averageExecutionTime = stats.totalExecutionTime / stats.usageCount;

      if (success) {
        stats.successCount++;
      } else {
        stats.errorCount++;
      }

      stats.lastUsed = new Date();
    }
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private async decomposeGoal(goal: string): Promise<OrchestrationSubtask[]> {
    // 简化的目标分解
    return [
      {
        id: `subtask_${Date.now()}_1`,
        description: `分析目标: ${goal}`,
        type: 'analysis',
        priority: 1,
        constraints: {}
      }
    ];
  }

  private async findToolsForSubtask(_subtask: OrchestrationSubtask): Promise<string[]> {
    const allTools = Array.from(this.tools.keys());
    return allTools.slice(0, 3); // 简化实现
  }

  private extractConstraints(_subtask: OrchestrationSubtask, constraints: unknown): unknown {
    return { ...(_subtask.constraints || {}), ...(constraints as Record<string, unknown>) };
  }

  private async optimizePlan(plan: ExecutionPlan): Promise<ExecutionPlan> {
    return plan; // 简化实现
  }

  private async validatePlan(_plan: ExecutionPlan): Promise<{ valid: boolean; reasons: string[] }> {
    return { valid: true, reasons: [] }; // 简化实现
  }

  private estimateTime(plan: ExecutionPlan): number {
    return plan.estimatedTime;
  }

  private calculateConfidence(plan: ExecutionPlan): number {
    return plan.confidence;
  }

  private calculateRecommendationScore(tool: RegisteredTool, context: RecommendationContext): number {
    let score = 0.5; // 基础分数

    // 基于使用频率
    const stats = this.usageStats.get(tool.metadata.id);
    if (stats) {
      score += Math.min(stats.usageCount / 100, 0.3);
    }

    // 基于成功率
    if (stats && stats.usageCount > 0) {
      score += (stats.successCount / stats.usageCount) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  private generateRecommendationReason(_tool: RegisteredTool, _context: RecommendationContext): string {
    const reasons = [];

    const stats = this.usageStats.get(_tool.metadata.id);
    if (stats && stats.usageCount > 10) {
      reasons.push('使用频率高');
    }

    if (_tool.metadata.category.includes('analysis')) {
      reasons.push('适合分析任务');
    }

    return reasons.join(', ') || '推荐使用';
  }

  private async checkToolAvailability(_tool: RegisteredTool): Promise<HealthCheckResult> {
    // 简化的可用性检查
    return {
      name: 'availability',
      passed: true,
      score: 1.0,
      message: '工具可用'
    };
  }

  private async checkToolPerformance(tool: RegisteredTool): Promise<HealthCheckResult> {
    const stats = this.usageStats.get(tool.metadata.id);

    if (!stats || stats.usageCount === 0) {
      return {
        name: 'performance',
        passed: true,
        score: 0.8,
        message: '暂无性能数据'
      };
    }

    const successRate = stats.successCount / stats.usageCount;
    const passed = successRate > 0.8;

    return {
      name: 'performance',
      passed,
      score: successRate,
      message: `成功率: ${(successRate * 100).toFixed(1)}%`
    };
  }

  private async checkToolDependencies(_tool: RegisteredTool): Promise<HealthCheckResult> {
    // 简化的依赖检查
    return {
      name: 'dependencies',
      passed: true,
      score: 1.0,
      message: '依赖正常'
    };
  }

  private generateHealthRecommendations(_results: HealthCheckResult[]): string[] {
    const recommendations: string[] = [];
    _results.forEach(result => {
      if (!result.passed) {
        recommendations.push(`修复 ${result.name} 问题: ${result.message}`);
      }
    });
    return recommendations;
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      const toolIds = Array.from(this.tools.keys());

      for (const toolId of toolIds) {
        try {
          const health = await this.checkToolHealth(toolId);
          this.emit('healthCheck', { toolId, health });
        } catch (error) {
          console.error(`健康检查失败 ${toolId}:`, error);
        }
      }
    }, this.config.healthCheckInterval);
  }

  // 公共方法
  getTools(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 搜索工具
   */
  searchTools(query: string): RegisteredTool[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tools.values())
      .filter(tool => 
        tool.metadata.name.toLowerCase().includes(lowercaseQuery) ||
        tool.metadata.description.toLowerCase().includes(lowercaseQuery) ||
        tool.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
  }

  /**
   * 执行工具
   */
  async execute(toolId: string, input: unknown, context: ExecutionContext): Promise<ToolExecutionResult> {
    const tool = this.getToolById(toolId);
    if (!tool) {
      throw new ToolNotFoundError(toolId);
    }

    try {
      // 更新使用统计
      this.updateUsageStats(toolId, 0, true);
      
      // 执行工具
      const result = await tool.execute(input, context);
      return {
        success: true,
        data: result,
        executionTime: 0,
        cached: false,
        metadata: {
          toolId,
          executionTime: 0,
          cached: false
        }
      };
    } catch (error) {
      this.updateErrorStats(toolId);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
        cached: false,
        metadata: {
          toolId,
          executionTime: 0,
          error: error instanceof Error ? error.message : String(error),
          cached: false
        }
      };
    }
  }

  /**
   * 获取工具统计信息
   */
  getToolStats(toolId: string): ToolUsageStats | undefined {
    return this.usageStats.get(toolId);
  }

  /**
   * 获取系统统计信息
   */
  getSystemStats(): {
    totalTools: number;
    totalExecutions: number;
    totalErrors: number;
    avgSuccessRate: number;
  } {
    return {
      totalTools: this.tools.size,
      totalExecutions: Array.from(this.usageStats.values())
        .reduce((sum, stats) => sum + stats.usageCount, 0),
      totalErrors: Array.from(this.usageStats.values())
        .reduce((sum, stats) => sum + stats.errorCount, 0),
      avgSuccessRate: this.calculateOverallSuccessRate()
    };
  }

  getToolById(toolId: string): RegisteredTool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * 更新错误统计信息
   */
  updateErrorStats(toolId: string): void {
    const stats = this.usageStats.get(toolId);
    if (stats) {
      stats.errorCount++;
    }
  }

  /**
   * 计算整体成功率
   */
  calculateOverallSuccessRate(): number {
    let totalExecutions = 0;
    let totalSuccessCount = 0;

    for (const stats of this.usageStats.values()) {
      totalExecutions += stats.usageCount;
      totalSuccessCount += stats.successCount;
    }

    return totalExecutions > 0 ? totalSuccessCount / totalExecutions : 0;
  }

  getToolsByCategory(category: string): RegisteredTool[] {
    const toolIds = this.categories.get(category);
    if (!toolIds) return [];

    return Array.from(toolIds)
      .map(id => this.tools.get(id))
      .filter((tool): tool is RegisteredTool => tool !== undefined);
  }

  getUsageStats(toolId: string): ToolUsageStats | undefined {
    return this.usageStats.get(toolId);
  }

  unregisterTool(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) return false;

    this.tools.delete(toolId);
    this.usageStats.delete(toolId);

    // 更新分类索引
    tool.metadata.category.forEach(category => {
      const categorySet = this.categories.get(category);
      if (categorySet) {
        categorySet.delete(toolId);
        if (categorySet.size === 0) {
          this.categories.delete(category);
        }
      }
    });

    this.emit('toolUnregistered', { toolId, timestamp: new Date() });
    return true;
  }
}
