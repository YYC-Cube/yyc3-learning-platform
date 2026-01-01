/**
 * @fileoverview 增强决策引擎 - 高级决策能力实现
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { ModelAdapter, type ModelRequest, type ModelResponse } from '@yyc3/model-adapter';
import { EventEmitter } from 'events';

export interface DecisionContext {
  goalId: string;
  taskId: string;
  timestamp: Date;
  state: Record<string, any>;
  environment: Record<string, any>;
  constraints: DecisionConstraints;
  preferences: DecisionPreferences;
}

export interface DecisionConstraints {
  maxCost: number;
  maxTime: number;
  maxResources: ResourceLimits;
  securityLevel: 'low' | 'medium' | 'high';
  compliance: string[];
}

export interface DecisionPreferences {
  prioritizeSpeed: boolean;
  prioritizeCost: boolean;
  prioritizeQuality: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface DecisionOption {
  id: string;
  description: string;
  actions: Action[];
  estimatedCost: number;
  estimatedTime: number;
  resourceRequirements: ResourceRequirements;
  riskLevel: number;
  confidence: number;
  expectedOutcome: Record<string, any>;
}

export interface Action {
  type: string;
  parameters: Record<string, any>;
  dependencies: string[];
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu?: number;
}

export interface ResourceLimits {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu?: number;
}

export interface DecisionEvaluation {
  optionId: string;
  utilityScore: number;
  costScore: number;
  timeScore: number;
  qualityScore: number;
  riskScore: number;
  overallScore: number;
  reasoning: string;
}

export interface DecisionResult {
  selectedOption: DecisionOption;
  evaluation: DecisionEvaluation;
  alternativeOptions: DecisionEvaluation[];
  confidence: number;
  timestamp: Date;
  executionPlan: ExecutionPlan;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  dependencies: Map<string, string[]>;
  estimatedDuration: number;
  estimatedCost: number;
  resourceAllocation: ResourceAllocation[];
}

export interface ExecutionStep {
  id: string;
  action: Action;
  order: number;
  dependencies: string[];
  estimatedDuration: number;
  resourceRequirements: ResourceRequirements;
}

export interface ResourceAllocation {
  stepId: string;
  resources: ResourceRequirements;
  startTime: number;
  endTime: number;
}

export interface DecisionLearningData {
  context: DecisionContext;
  options: DecisionOption[];
  selectedOption: DecisionOption;
  actualOutcome: Record<string, any>;
  success: boolean;
  executionTime: number;
  actualCost: number;
  timestamp: Date;
}

export interface DecisionEngineConfig {
  enableAIAssistedDecision: boolean;
  enableLearning: boolean;
  maxOptionsToEvaluate: number;
  decisionTimeout: number;
  modelAdapterConfig?: any;
}

export class EnhancedDecisionEngine extends EventEmitter {
  private config: DecisionEngineConfig;
  private modelAdapter?: ModelAdapter;
  private decisionHistory: DecisionLearningData[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();
  private contextCache: Map<string, DecisionContext> = new Map();

  constructor(config: Partial<DecisionEngineConfig> = {}) {
    super();
    this.config = {
      enableAIAssistedDecision: config.enableAIAssistedDecision ?? true,
      enableLearning: config.enableLearning ?? true,
      maxOptionsToEvaluate: config.maxOptionsToEvaluate ?? 10,
      decisionTimeout: config.decisionTimeout ?? 30000,
      modelAdapterConfig: config.modelAdapterConfig
    };

    if (this.config.enableAIAssistedDecision && this.config.modelAdapterConfig) {
      this.initializeModelAdapter();
    }

    this.setupEventListeners();
  }

  private initializeModelAdapter(): void {
    this.modelAdapter = new ModelAdapter();
  }

  private setupEventListeners(): void {
    this.on('decision:made', this.recordDecision.bind(this));
    this.on('decision:outcome', this.learnFromOutcome.bind(this));
  }

  async makeDecision(
    context: DecisionContext,
    options: DecisionOption[]
  ): Promise<DecisionResult> {
    const startTime = Date.now();

    try {
      this.emit('decision:started');

      const limitedOptions = options.slice(0, this.config.maxOptionsToEvaluate);

      const evaluations = await Promise.all(
        limitedOptions.map(option => this.evaluateOption(option, context))
      );

      const selectedEvaluation = this.selectBestOption(evaluations, context);
      const selectedOption = limitedOptions.find(o => o.id === selectedEvaluation.optionId)!;

      const executionPlan = await this.generateExecutionPlan(selectedOption, context);

      const result: DecisionResult = {
        selectedOption,
        evaluation: selectedEvaluation,
        alternativeOptions: evaluations.filter(e => e.optionId !== selectedEvaluation.optionId),
        confidence: this.calculateDecisionConfidence(selectedEvaluation, evaluations),
        timestamp: new Date(),
        executionPlan
      };

      this.emit('decision:made', { context, result, duration: Date.now() - startTime });

      return result;
    } catch (error) {
      this.emit('decision:error', { context, error });
      throw error;
    }
  }

  private async evaluateOption(
    option: DecisionOption,
    context: DecisionContext
  ): Promise<DecisionEvaluation> {
    const costScore = this.evaluateCost(option, context);
    const timeScore = this.evaluateTime(option, context);
    const qualityScore = this.evaluateQuality(option, context);
    const riskScore = this.evaluateRisk(option, context);

    let utilityScore: number;
    let reasoning: string;

    if (this.config.enableAIAssistedDecision && this.modelAdapter) {
      const aiEvaluation = await this.evaluateWithAI(option, context);
      utilityScore = aiEvaluation.utilityScore;
      reasoning = aiEvaluation.reasoning;
    } else {
      utilityScore = this.calculateUtilityScore(costScore, timeScore, qualityScore, riskScore, context);
      reasoning = this.generateReasoning(option, costScore, timeScore, qualityScore, riskScore);
    }

    const overallScore = this.calculateOverallScore(
      utilityScore,
      costScore,
      timeScore,
      qualityScore,
      riskScore,
      context
    );

    return {
      optionId: option.id,
      utilityScore,
      costScore,
      timeScore,
      qualityScore,
      riskScore,
      overallScore,
      reasoning
    };
  }

  private evaluateCost(option: DecisionOption, context: DecisionContext): number {
    const costRatio = option.estimatedCost / context.constraints.maxCost;
    return Math.max(0, 1 - costRatio);
  }

  private evaluateTime(option: DecisionOption, context: DecisionContext): number {
    const timeRatio = option.estimatedTime / context.constraints.maxTime;
    return Math.max(0, 1 - timeRatio);
  }

  private evaluateQuality(option: DecisionOption, context: DecisionContext): number {
    return option.confidence;
  }

  private evaluateRisk(option: DecisionOption, context: DecisionContext): number {
    const riskToleranceMap = { low: 0.2, medium: 0.5, high: 0.8 };
    const tolerance = riskToleranceMap[context.preferences.riskTolerance];
    return Math.max(0, 1 - (option.riskLevel / tolerance));
  }

  private async evaluateWithAI(
    option: DecisionOption,
    context: DecisionContext
  ): Promise<{ utilityScore: number; reasoning: string }> {
    const prompt = this.buildEvaluationPrompt(option, context);

    const request: ModelRequest = {
      id: `decision_eval_${Date.now()}`,
      taskType: 'analysis',
      prompt,
      messages: [
        {
          role: 'system',
          content: '你是一个智能决策评估助手，负责评估决策选项的效用并给出评分和理由。',
          timestamp: Date.now(),
          metadata: {}
        },
        {
          role: 'user',
          content: prompt,
          timestamp: Date.now(),
          metadata: {}
        }
      ],
      systemPrompt: '你是一个智能决策评估助手，负责评估决策选项的效用并给出评分和理由。',
      temperature: 0.3,
      maxTokens: 512,
      stream: false,
      metadata: {
        userId: context.goalId,
        sessionId: context.taskId,
        priority: 'normal',
        requestId: `decision_eval_${Date.now()}`
      }
    };

    try {
      const response: ModelResponse = await this.modelAdapter!.processRequest(request);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      const result = this.parseAIEvaluationResponse(content);
      return result;
    } catch (error) {
      this.emit('decision:ai-evaluation-failed', { error, option, context });
      return {
        utilityScore: this.calculateUtilityScore(
          this.evaluateCost(option, context),
          this.evaluateTime(option, context),
          this.evaluateQuality(option, context),
          this.evaluateRisk(option, context),
          context
        ),
        reasoning: 'AI评估失败，使用传统方法'
      };
    }
  }

  private buildEvaluationPrompt(option: DecisionOption, context: DecisionContext): string {
    return `
请评估以下决策选项：

选项描述：${option.description}
预计成本：${option.estimatedCost}
预计时间：${option.estimatedTime}ms
风险等级：${option.riskLevel}
置信度：${option.confidence}

约束条件：
- 最大成本：${context.constraints.maxCost}
- 最大时间：${context.constraints.maxTime}ms
- 安全级别：${context.constraints.securityLevel}

偏好设置：
- 优先速度：${context.preferences.prioritizeSpeed}
- 优先成本：${context.preferences.prioritizeCost}
- 优先质量：${context.preferences.prioritizeQuality}
- 风险容忍度：${context.preferences.riskTolerance}

请以JSON格式返回评估结果，包含：
{
  "utilityScore": 0-1之间的效用评分,
  "reasoning": "评估理由的详细说明"
}
`;
  }

  private parseAIEvaluationResponse(content: string): { utilityScore: number; reasoning: string } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          utilityScore: Math.min(1, Math.max(0, parsed.utilityScore || 0.5)),
          reasoning: parsed.reasoning || '未提供理由'
        };
      }
    } catch (error) {
      this.emit('decision:ai-response-parse-failed', { content, error });
    }

    return {
      utilityScore: 0.5,
      reasoning: '无法解析AI响应'
    };
  }

  private calculateUtilityScore(
    costScore: number,
    timeScore: number,
    qualityScore: number,
    riskScore: number,
    context: DecisionContext
  ): number {
    const weights = {
      cost: context.preferences.prioritizeCost ? 0.4 : 0.2,
      time: context.preferences.prioritizeSpeed ? 0.4 : 0.2,
      quality: context.preferences.prioritizeQuality ? 0.3 : 0.15,
      risk: 0.2
    };

    return (
      weights.cost * costScore +
      weights.time * timeScore +
      weights.quality * qualityScore +
      weights.risk * riskScore
    );
  }

  private generateReasoning(
    option: DecisionOption,
    costScore: number,
    timeScore: number,
    qualityScore: number,
    riskScore: number
  ): string {
    const reasons = [];
    if (costScore > 0.7) reasons.push('成本效益高');
    if (timeScore > 0.7) reasons.push('执行速度快');
    if (qualityScore > 0.7) reasons.push('质量可靠');
    if (riskScore > 0.7) reasons.push('风险可控');
    return reasons.join('，') || '各项指标适中';
  }

  private calculateOverallScore(
    utilityScore: number,
    costScore: number,
    timeScore: number,
    qualityScore: number,
    riskScore: number,
    context: DecisionContext
  ): number {
    return utilityScore * 0.5 + (costScore + timeScore + qualityScore + riskScore) / 4 * 0.5;
  }

  private selectBestOption(
    evaluations: DecisionEvaluation[],
    context: DecisionContext
  ): DecisionEvaluation {
    return evaluations.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    );
  }

  private calculateDecisionConfidence(
    selected: DecisionEvaluation,
    all: DecisionEvaluation[]
  ): number {
    const scores = all.map(e => e.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length);
    return stdDev > 0 ? Math.min(1, (selected.overallScore - mean) / stdDev) : selected.overallScore;
  }

  private async generateExecutionPlan(
    option: DecisionOption,
    context: DecisionContext
  ): Promise<ExecutionPlan> {
    const steps: ExecutionStep[] = option.actions.map((action, index) => ({
      id: `step_${option.id}_${index}`,
      action,
      order: index,
      dependencies: action.dependencies,
      estimatedDuration: this.estimateActionDuration(action),
      resourceRequirements: this.estimateActionResources(action)
    }));

    const dependencies = new Map<string, string[]>();
    steps.forEach(step => {
      dependencies.set(step.id, step.dependencies);
    });

    const estimatedDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
    const estimatedCost = option.estimatedCost;

    const resourceAllocation = this.allocateResources(steps, context);

    return {
      steps,
      dependencies,
      estimatedDuration,
      estimatedCost,
      resourceAllocation
    };
  }

  private estimateActionDuration(action: Action): number {
    return 1000 + Math.random() * 2000;
  }

  private estimateActionResources(action: Action): ResourceRequirements {
    return {
      cpu: 0.1 + Math.random() * 0.2,
      memory: 128 + Math.random() * 256,
      storage: 0,
      network: 1 + Math.random() * 5
    };
  }

  private allocateResources(steps: ExecutionStep[], context: DecisionContext): ResourceAllocation[] {
    let currentTime = 0;
    return steps.map(step => {
      const allocation: ResourceAllocation = {
        stepId: step.id,
        resources: step.resourceRequirements,
        startTime: currentTime,
        endTime: currentTime + step.estimatedDuration
      };
      currentTime += step.estimatedDuration;
      return allocation;
    });
  }

  private recordDecision(data: { context: DecisionContext; result: DecisionResult; duration: number }): void {
    if (!this.config.enableLearning) return;

    const learningData: DecisionLearningData = {
      context: data.context,
      options: [data.result.selectedOption, ...data.result.alternativeOptions.map(eo =>
        data.result.alternativeOptions.find(o => o.optionId === eo.optionId)!
      )].filter(Boolean) as DecisionOption[],
      selectedOption: data.result.selectedOption,
      actualOutcome: {},
      success: false,
      executionTime: data.duration,
      actualCost: data.result.evaluation.costScore,
      timestamp: new Date()
    };

    this.decisionHistory.push(learningData);
    this.updatePerformanceMetrics(learningData);
  }

  private learnFromOutcome(data: { context: DecisionContext; outcome: Record<string, any>; success: boolean }): void {
    if (!this.config.enableLearning) return;

    const lastDecision = this.decisionHistory[this.decisionHistory.length - 1];
    if (lastDecision) {
      lastDecision.actualOutcome = data.outcome;
      lastDecision.success = data.success;
      this.emit('decision:learning-updated', { learningData: lastDecision });
    }
  }

  private updatePerformanceMetrics(data: DecisionLearningData): void {
    const key = `${data.context.goalId}_${data.context.taskId}`;
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    this.performanceMetrics.get(key)!.push(data.executionTime);
  }

  getDecisionHistory(): DecisionLearningData[] {
    return [...this.decisionHistory];
  }

  getPerformanceMetrics(goalId: string, taskId: string): number[] {
    const key = `${goalId}_${taskId}`;
    return this.performanceMetrics.get(key) || [];
  }

  clearHistory(): void {
    this.decisionHistory = [];
    this.performanceMetrics.clear();
    this.contextCache.clear();
    this.emit('decision:history-cleared');
  }
}
