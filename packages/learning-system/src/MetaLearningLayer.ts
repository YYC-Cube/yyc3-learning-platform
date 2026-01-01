/**
 * 元学习层 - 持续优化系统
 * 基于强化学习和迁移学习的自我优化
 */

// ==================== 类型定义 ====================

export interface Experience {
  id: string;
  state: State;
  action: Action;
  reward: number;
  nextState: State;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface State {
  userId: string;
  context: string;
  environment: Record<string, any>;
  features: number[];
}

export interface Action {
  type: string;
  parameters: Record<string, any>;
  toolId?: string;
}

export interface Policy {
  id: string;
  name: string;
  version: string;
  weights: Map<string, number>;
  performance: PerformanceMetrics;
  createdAt: number;
  updatedAt: number;
}

export interface PerformanceMetrics {
  totalReward: number;
  averageReward: number;
  successRate: number;
  totalExecutions: number;
  improvementRate: number;
}

export interface LearningConfig {
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
  batchSize: number;
  bufferSize: number;
  updateFrequency: number;
}

export interface ModelTransfer {
  sourceTask: string;
  targetTask: string;
  transferredWeights: Map<string, number>;
  adaptationRate: number;
}

// ==================== 元学习层 ====================

export class MetaLearningLayer {
  private experienceBuffer: Experience[] = [];
  private policies: Map<string, Policy> = new Map();
  private currentPolicy: Policy | null = null;
  private config: LearningConfig;
  private episodeCount: number = 0;
  private totalReward: number = 0;

  constructor(config?: Partial<LearningConfig>) {
    this.config = {
      learningRate: 0.001,
      discountFactor: 0.99,
      explorationRate: 0.1,
      batchSize: 32,
      bufferSize: 10000,
      updateFrequency: 10,
      ...config
    };

    this.initializeDefaultPolicy();
  }

  // ==================== 核心学习功能 ====================

  /**
   * 记录经验
   */
  public recordExperience(experience: Experience): void {
    this.experienceBuffer.push(experience);

    // 限制缓冲区大小
    if (this.experienceBuffer.length > this.config.bufferSize) {
      this.experienceBuffer.shift();
    }

    this.totalReward += experience.reward;

    // 定期更新策略
    if (this.experienceBuffer.length % this.config.updateFrequency === 0) {
      this.updatePolicy();
    }
  }

  /**
   * 批量记录经验
   */
  public recordExperiencesBatch(experiences: Experience[]): void {
    experiences.forEach(exp => this.recordExperience(exp));
  }

  /**
   * 选择动作（ε-贪婪策略）
   */
  public selectAction(state: State): Action {
    // ε-贪婪探索
    if (Math.random() < this.config.explorationRate) {
      return this.exploreAction(state);
    }

    // 利用当前策略
    return this.exploitAction(state);
  }

  /**
   * 更新策略
   */
  private async updatePolicy(): Promise<void> {
    if (!this.currentPolicy || this.experienceBuffer.length < this.config.batchSize) {
      return;
    }

    // 采样批次
    const batch = this.sampleBatch();

    // 计算TD误差和梯度
    const gradients = this.computeGradients(batch);

    // 更新权重
    this.applyGradients(gradients);

    // 更新性能指标
    this.updatePerformanceMetrics();

    // 衰减探索率
    this.config.explorationRate *= 0.995;
    this.config.explorationRate = Math.max(0.01, this.config.explorationRate);

    this.episodeCount++;
  }

  /**
   * 评估状态价值
   */
  public evaluateState(state: State): number {
    if (!this.currentPolicy) return 0;

    // 使用当前策略的权重计算状态价值
    const features = this.extractFeatures(state);
    let value = 0;

    for (const [key, weight] of this.currentPolicy.weights) {
      const featureIndex = parseInt(key.split('_')[1]);
      if (featureIndex < features.length) {
        value += weight * features[featureIndex];
      }
    }

    return value;
  }

  /**
   * 预测动作价值
   */
  public predictActionValue(state: State, action: Action): number {
    const stateValue = this.evaluateState(state);
    const actionBonus = this.getActionBonus(action);
    return stateValue + actionBonus;
  }

  // ==================== 迁移学习 ====================

  /**
   * 迁移知识到新任务
   */
  public async transferKnowledge(
    sourceTask: string,
    targetTask: string,
    adaptationRate: number = 0.5
  ): Promise<ModelTransfer> {
    const sourcePolicy = this.policies.get(sourceTask);
    
    if (!sourcePolicy) {
      throw new Error(`Source policy "${sourceTask}" not found`);
    }

    // 创建新策略并迁移权重
    const transferredWeights = new Map<string, number>();
    
    for (const [key, weight] of sourcePolicy.weights) {
      // 应用适应率
      transferredWeights.set(key, weight * adaptationRate);
    }

    const newPolicy: Policy = {
      id: `policy_${targetTask}_${Date.now()}`,
      name: targetTask,
      version: '1.0.0',
      weights: transferredWeights,
      performance: {
        totalReward: 0,
        averageReward: 0,
        successRate: 0,
        totalExecutions: 0,
        improvementRate: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.policies.set(targetTask, newPolicy);

    return {
      sourceTask,
      targetTask,
      transferredWeights,
      adaptationRate
    };
  }

  /**
   * 微调策略
   */
  public async fineTunePolicy(
    policyId: string,
    experiences: Experience[],
    epochs: number = 10
  ): Promise<void> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy "${policyId}" not found`);
    }

    this.currentPolicy = policy;

    for (let epoch = 0; epoch < epochs; epoch++) {
      // 打乱经验
      const shuffled = [...experiences].sort(() => Math.random() - 0.5);

      // 批次训练
      for (let i = 0; i < shuffled.length; i += this.config.batchSize) {
        const batch = shuffled.slice(i, i + this.config.batchSize);
        const gradients = this.computeGradients(batch);
        this.applyGradients(gradients);
      }
    }

    this.updatePerformanceMetrics();
  }

  // ==================== 策略管理 ====================

  /**
   * 创建新策略
   */
  public createPolicy(name: string): Policy {
    const policy: Policy = {
      id: `policy_${Date.now()}`,
      name,
      version: '1.0.0',
      weights: new Map(),
      performance: {
        totalReward: 0,
        averageReward: 0,
        successRate: 0,
        totalExecutions: 0,
        improvementRate: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // 初始化随机权重
    for (let i = 0; i < 100; i++) {
      policy.weights.set(`feature_${i}`, Math.random() * 0.01);
    }

    this.policies.set(policy.id, policy);

    return policy;
  }

  /**
   * 切换策略
   */
  public switchPolicy(policyId: string): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) {
      console.error(`[MetaLearningLayer] Policy "${policyId}" not found`);
      return false;
    }

    this.currentPolicy = policy;
    return true;
  }

  /**
   * 获取最佳策略
   */
  public getBestPolicy(): Policy | null {
    let best: Policy | null = null;
    let bestScore = -Infinity;

    for (const policy of this.policies.values()) {
      const score = policy.performance.averageReward * policy.performance.successRate;
      if (score > bestScore) {
        bestScore = score;
        best = policy;
      }
    }

    return best;
  }

  /**
   * 比较策略
   */
  public comparePolicies(policyId1: string, policyId2: string): {
    winner: string;
    comparison: Record<string, any>;
  } {
    const policy1 = this.policies.get(policyId1);
    const policy2 = this.policies.get(policyId2);

    if (!policy1 || !policy2) {
      throw new Error('One or both policies not found');
    }

    const comparison = {
      averageReward: {
        policy1: policy1.performance.averageReward,
        policy2: policy2.performance.averageReward,
        winner: policy1.performance.averageReward > policy2.performance.averageReward ? policyId1 : policyId2
      },
      successRate: {
        policy1: policy1.performance.successRate,
        policy2: policy2.performance.successRate,
        winner: policy1.performance.successRate > policy2.performance.successRate ? policyId1 : policyId2
      },
      totalExecutions: {
        policy1: policy1.performance.totalExecutions,
        policy2: policy2.performance.totalExecutions
      }
    };

    const winner = 
      policy1.performance.averageReward * policy1.performance.successRate >
      policy2.performance.averageReward * policy2.performance.successRate
        ? policyId1
        : policyId2;

    return { winner, comparison };
  }

  // ==================== 私有方法 ====================

  private initializeDefaultPolicy(): void {
    const defaultPolicy = this.createPolicy('default');
    this.currentPolicy = defaultPolicy;
  }

  private exploreAction(state: State): Action {
    // 随机探索
    const actionTypes = ['search', 'analyze', 'generate', 'transform'];
    const randomType = actionTypes[Math.floor(Math.random() * actionTypes.length)];

    return {
      type: randomType,
      parameters: {}
    };
  }

  private exploitAction(state: State): Action {
    // 使用当前策略选择最优动作
    const features = this.extractFeatures(state);
    const actionTypes = ['search', 'analyze', 'generate', 'transform'];

    let bestAction: Action | null = null;
    let bestValue = -Infinity;

    for (const type of actionTypes) {
      const action: Action = { type, parameters: {} };
      const value = this.predictActionValue(state, action);
      
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    return bestAction || this.exploreAction(state);
  }

  private sampleBatch(): Experience[] {
    const batch: Experience[] = [];
    const bufferSize = this.experienceBuffer.length;

    for (let i = 0; i < Math.min(this.config.batchSize, bufferSize); i++) {
      const index = Math.floor(Math.random() * bufferSize);
      batch.push(this.experienceBuffer[index]);
    }

    return batch;
  }

  private computeGradients(batch: Experience[]): Map<string, number> {
    const gradients = new Map<string, number>();

    for (const exp of batch) {
      const features = this.extractFeatures(exp.state);
      const nextFeatures = this.extractFeatures(exp.nextState);

      // TD 误差
      const currentValue = this.evaluateState(exp.state);
      const nextValue = this.evaluateState(exp.nextState);
      const tdError = exp.reward + this.config.discountFactor * nextValue - currentValue;

      // 计算梯度
      features.forEach((feature, index) => {
        const key = `feature_${index}`;
        const currentGradient = gradients.get(key) || 0;
        gradients.set(key, currentGradient + this.config.learningRate * tdError * feature);
      });
    }

    return gradients;
  }

  private applyGradients(gradients: Map<string, number>): void {
    if (!this.currentPolicy) return;

    for (const [key, gradient] of gradients) {
      const currentWeight = this.currentPolicy.weights.get(key) || 0;
      this.currentPolicy.weights.set(key, currentWeight + gradient);
    }

    this.currentPolicy.updatedAt = Date.now();
  }

  private extractFeatures(state: State): number[] {
    // 如果状态已经有特征向量，直接使用
    if (state.features && state.features.length > 0) {
      return state.features;
    }

    // 否则从状态中提取特征
    const features: number[] = [];
    
    // 添加上下文长度特征
    features.push(state.context.length / 1000);

    // 添加环境特征
    Object.values(state.environment).forEach(value => {
      if (typeof value === 'number') {
        features.push(value);
      } else if (typeof value === 'boolean') {
        features.push(value ? 1 : 0);
      }
    });

    // 填充到固定长度
    while (features.length < 100) {
      features.push(0);
    }

    return features.slice(0, 100);
  }

  private getActionBonus(action: Action): number {
    // 根据动作类型给予不同的奖励偏置
    const bonuses: Record<string, number> = {
      search: 0.1,
      analyze: 0.15,
      generate: 0.2,
      transform: 0.1
    };

    return bonuses[action.type] || 0;
  }

  private updatePerformanceMetrics(): void {
    if (!this.currentPolicy) return;

    const recentExperiences = this.experienceBuffer.slice(-100);
    const successfulExperiences = recentExperiences.filter(exp => exp.reward > 0);

    const metrics = this.currentPolicy.performance;
    metrics.totalExecutions = this.experienceBuffer.length;
    metrics.totalReward = this.totalReward;
    metrics.averageReward = this.totalReward / Math.max(1, metrics.totalExecutions);
    metrics.successRate = successfulExperiences.length / Math.max(1, recentExperiences.length);

    // 计算改进率
    if (this.episodeCount > 10) {
      const oldAvg = metrics.averageReward;
      const newAvg = recentExperiences.reduce((sum, exp) => sum + exp.reward, 0) / recentExperiences.length;
      metrics.improvementRate = ((newAvg - oldAvg) / Math.abs(oldAvg)) * 100;
    }
  }

  // ==================== 导出和统计 ====================

  /**
   * 获取学习统计
   */
  public getStatistics() {
    return {
      episodeCount: this.episodeCount,
      totalReward: this.totalReward,
      bufferSize: this.experienceBuffer.length,
      policiesCount: this.policies.size,
      explorationRate: this.config.explorationRate,
      currentPolicy: this.currentPolicy
        ? {
            id: this.currentPolicy.id,
            name: this.currentPolicy.name,
            performance: this.currentPolicy.performance
          }
        : null
    };
  }

  /**
   * 导出策略
   */
  public exportPolicy(policyId: string): Policy | null {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    return {
      ...policy,
      weights: new Map(policy.weights)
    };
  }

  /**
   * 导入策略
   */
  public importPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * 清空经验缓冲
   */
  public clearExperienceBuffer(): void {
    this.experienceBuffer = [];
  }

  /**
   * 重置学习系统
   */
  public reset(): void {
    this.experienceBuffer = [];
    this.policies.clear();
    this.episodeCount = 0;
    this.totalReward = 0;
    this.initializeDefaultPolicy();
  }
}

// ==================== 单例导出 ====================

export const metaLearningLayer = new MetaLearningLayer();
