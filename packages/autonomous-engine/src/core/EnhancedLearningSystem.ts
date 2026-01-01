/**
 * @fileoverview 增强学习系统实现 - 提供自适应学习和策略优化能力
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { EventEmitter } from 'eventemitter3';
import type { ModelAdapter } from '@yyc3/model-adapter';

export interface LearningSystemConfig {
  enableLearning: boolean;
  experienceRetention: number;
  adaptationThreshold: number;
  learningRate: number;
  explorationRate: number;
  knowledgeDomains: string[];
  feedbackIntegration: {
    enableFeedback: boolean;
    sources: string[];
    weighting: Record<string, number>;
    processing: {
      aggregation: string;
      filtering: string;
      validation: string;
      integration: string;
    };
  };
  modelAdapterConfig?: {
    provider: 'openai' | 'google' | 'anthropic';
    apiKey?: string;
    model?: string;
  };
}

export interface LearningProgress {
  totalExperiences: number;
  successfulAdaptations: number;
  failedAdaptations: number;
  learningRate: number;
  competencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  areasOfImprovement: string[];
  recentInsights: string[];
  nextMilestones: string[];
}

export interface LearningData {
  id: string;
  type: 'success' | 'failure' | 'partial';
  context: Record<string, unknown>;
  situation: {
    description: string;
    complexity: 'simple' | 'complicated' | 'complex' | 'chaotic';
    uncertainty: 'low' | 'medium' | 'high';
    novelty: 'familiar' | 'novel' | 'emerging';
    criticality: 'low' | 'medium' | 'high' | 'critical';
  };
  actions: Array<{
    id: string;
    type: string;
    description: string;
    parameters: Record<string, unknown>;
    reasoning: string;
  }>;
  outcomes: Array<{
    id: string;
    type: string;
    value: unknown;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    duration: number;
    resourceUsage: Record<string, number>;
  }>;
  feedback: {
    source: string;
    type: string;
    content: string;
    sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    confidence: number;
    actionability: 'immediate' | 'short_term' | 'long_term' | 'archival';
  };
  timestamp: Date;
  metadata: {
    tags: string[];
    category: string;
    importance: 'low' | 'medium' | 'high';
    applicability: string[];
    sharingConsent: boolean;
  };
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  domain: string;
  effectiveness: number;
  confidence: number;
  lastUsed: Date;
  usageCount: number;
  successRate: number;
  adaptationHistory: Array<{
    timestamp: Date;
    reason: string;
    changes: Record<string, unknown>;
    outcome: string;
  }>;
}

export interface KnowledgeDomain {
  name: string;
  competency: number;
  lastUpdated: Date;
  concepts: Map<string, number>;
  patterns: Array<{
    pattern: string;
    frequency: number;
    effectiveness: number;
  }>;
}

export class EnhancedLearningSystem extends EventEmitter {
  private config: LearningSystemConfig;
  private modelAdapter?: ModelAdapter;
  
  private learningData: Map<string, LearningData> = new Map();
  private strategies: Map<string, Strategy> = new Map();
  private knowledgeDomains: Map<string, KnowledgeDomain> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();
  
  private totalExperiences: number = 0;
  private successfulAdaptations: number = 0;
  private failedAdaptations: number = 0;
  
  constructor(config: Partial<LearningSystemConfig> = {}) {
    super();
    
    this.config = {
      enableLearning: config.enableLearning ?? true,
      experienceRetention: config.experienceRetention ?? 365 * 24 * 60 * 60 * 1000,
      adaptationThreshold: config.adaptationThreshold ?? 0.7,
      learningRate: config.learningRate ?? 0.1,
      explorationRate: config.explorationRate ?? 0.2,
      knowledgeDomains: config.knowledgeDomains ?? ['general', 'optimization', 'collaboration'],
      feedbackIntegration: config.feedbackIntegration ?? {
        enableFeedback: true,
        sources: ['user', 'system', 'peer'],
        weighting: { user: 0.4, system: 0.3, peer: 0.2, automated: 0.1 },
        processing: {
          aggregation: 'weighted_average',
          filtering: 'outlier_removal',
          validation: 'cross_validation',
          integration: 'incremental'
        }
      },
      modelAdapterConfig: config.modelAdapterConfig
    };
    
    if (this.config.modelAdapterConfig) {
      this.initializeModelAdapter();
    }
    
    this.initializeKnowledgeDomains();
    this.setupEventListeners();
    this.startCleanupTask();
  }
  
  private initializeModelAdapter(): void {
    this.modelAdapter = new ModelAdapter();
    
    if (this.config.modelAdapterConfig?.apiKey) {
      this.modelAdapter.configure({
        apiKey: this.config.modelAdapterConfig.apiKey,
        defaultProvider: this.config.modelAdapterConfig.provider,
        defaultModel: this.config.modelAdapterConfig.model
      });
    }
  }
  
  private initializeKnowledgeDomains(): void {
    this.config.knowledgeDomains.forEach(domain => {
      this.knowledgeDomains.set(domain, {
        name: domain,
        competency: 0.5,
        lastUpdated: new Date(),
        concepts: new Map(),
        patterns: []
      });
    });
  }
  
  private setupEventListeners(): void {
    this.on('learning:completed', this.handleLearningCompleted.bind(this));
    this.on('strategy:adapted', this.handleStrategyAdapted.bind(this));
  }
  
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupOldExperiences();
    }, 24 * 60 * 60 * 1000);
  }
  
  private cleanupOldExperiences(): void {
    const now = Date.now();
    const retentionThreshold = now - this.config.experienceRetention;
    
    for (const [id, data] of this.learningData.entries()) {
      if (data.timestamp.getTime() < retentionThreshold) {
        this.learningData.delete(id);
      }
    }
  }
  
  async learnFromExperience(experience: LearningData): Promise<void> {
    if (!this.config.enableLearning) {
      return;
    }
    
    const startTime = Date.now();
    
    try {
      this.emit('learning:started', { experienceId: experience.id });
      
      this.learningData.set(experience.id, experience);
      this.totalExperiences++;
      
      await this.updateKnowledgeDomains(experience);
      await this.extractPatterns(experience);
      await this.updateStrategies(experience);
      
      if (this.modelAdapter) {
        await this.analyzeWithAI(experience);
      }
      
      this.emit('learning:completed', {
        experience,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.emit('learning:error', { experience, error });
      throw error;
    }
  }
  
  private async updateKnowledgeDomains(experience: LearningData): Promise<void> {
    const applicableDomains = experience.metadata.applicability;
    
    for (const domainName of applicableDomains) {
      const domain = this.knowledgeDomains.get(domainName);
      if (!domain) {
        continue;
      }
      
      const learningImpact = this.calculateLearningImpact(experience);
      const newCompetency = domain.competency + (learningImpact * this.config.learningRate);
      domain.competency = Math.min(1.0, Math.max(0.0, newCompetency));
      domain.lastUpdated = new Date();
      
      this.emit('domain:updated', { domain: domainName, competency: domain.competency });
    }
  }
  
  private calculateLearningImpact(experience: LearningData): number {
    let impact = 0;
    
    const successWeight = experience.type === 'success' ? 1 : experience.type === 'partial' ? 0.5 : -0.5;
    const qualityWeight = {
      'excellent': 1.0,
      'good': 0.75,
      'fair': 0.5,
      'poor': 0.25
    }[experience.outcomes[0]?.quality || 'fair'] || 0.5;
    
    const sentimentWeight = {
      'very_positive': 1.0,
      'positive': 0.75,
      'neutral': 0.5,
      'negative': 0.25,
      'very_negative': 0.0
    }[experience.feedback.sentiment] || 0.5;
    
    impact = (successWeight + qualityWeight + sentimentWeight) / 3;
    
    const noveltyBonus = experience.situation.novelty === 'novel' ? 0.2 : 0;
    impact += noveltyBonus;
    
    return impact;
  }
  
  private async extractPatterns(experience: LearningData): Promise<void> {
    const applicableDomains = experience.metadata.applicability;
    
    for (const domainName of applicableDomains) {
      const domain = this.knowledgeDomains.get(domainName);
      if (!domain) {
        continue;
      }
      
      const pattern = this.generatePattern(experience);
      const existingPattern = domain.patterns.find(p => p.pattern === pattern);
      
      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.effectiveness = (existingPattern.effectiveness + this.calculateLearningImpact(experience)) / 2;
      } else {
        domain.patterns.push({
          pattern,
          frequency: 1,
          effectiveness: this.calculateLearningImpact(experience)
        });
      }
    }
  }
  
  private generatePattern(experience: LearningData): string {
    const keyElements = [
      experience.situation.complexity,
      experience.situation.uncertainty,
      experience.situation.novelty,
      experience.actions[0]?.type || 'unknown',
      experience.outcomes[0]?.type || 'unknown'
    ];
    
    return keyElements.join(':');
  }
  
  private async updateStrategies(experience: LearningData): Promise<void> {
    const applicableDomains = experience.metadata.applicability;
    
    for (const domainName of applicableDomains) {
      const domain = this.knowledgeDomains.get(domainName);
      if (!domain) {
        continue;
      }
      
      const strategyId = this.generateStrategyId(experience, domainName);
      let strategy = this.strategies.get(strategyId);
      
      if (!strategy) {
        strategy = {
          id: strategyId,
          name: this.generateStrategyName(experience),
          description: experience.situation.description,
          domain: domainName,
          effectiveness: 0.5,
          confidence: 0.5,
          lastUsed: new Date(),
          usageCount: 0,
          successRate: 0.5,
          adaptationHistory: []
        };
        this.strategies.set(strategyId, strategy);
      }
      
      strategy.usageCount++;
      strategy.lastUsed = new Date();
      
      const success = experience.type === 'success';
      strategy.successRate = ((strategy.successRate * (strategy.usageCount - 1)) + (success ? 1 : 0)) / strategy.usageCount;
      
      strategy.effectiveness = (strategy.effectiveness * (1 - this.config.learningRate)) + 
                               (this.calculateLearningImpact(experience) * this.config.learningRate);
      
      strategy.confidence = Math.min(1.0, strategy.confidence + (this.config.learningRate * 0.1));
      
      if (strategy.successRate >= this.config.adaptationThreshold) {
        this.successfulAdaptations++;
      } else {
        this.failedAdaptations++;
      }
      
      this.emit('strategy:updated', { strategyId, strategy });
    }
  }
  
  private generateStrategyId(experience: LearningData, domain: string): string {
    return `${domain}:${experience.actions[0]?.type || 'unknown'}:${Date.now()}`;
  }
  
  private generateStrategyName(experience: LearningData): string {
    return `${experience.actions[0]?.type || 'Strategy'} for ${experience.situation.complexity} scenarios`;
  }
  
  private async analyzeWithAI(experience: LearningData): Promise<void> {
    if (!this.modelAdapter) {
      return;
    }
    
    try {
      const prompt = this.buildAnalysisPrompt(experience);
      
      const response = await this.modelAdapter.generateText({
        id: `learning_analysis_${Date.now()}`,
        taskType: 'text_generation',
        prompt,
        temperature: 0.3,
        maxTokens: 500,
        metadata: {
          userId: 'system',
          sessionId: 'learning_system',
          requestId: `learning_analysis_${Date.now()}`,
          priority: 'normal',
          tags: ['learning', 'analysis']
        }
      });
      
      const insights = this.extractInsights(response);
      
      this.emit('ai:analysis:completed', {
        experienceId: experience.id,
        insights
      });
      
    } catch (error) {
      this.emit('ai:analysis:error', { experience, error });
    }
  }
  
  private buildAnalysisPrompt(experience: LearningData): string {
    return `Analyze this learning experience and provide insights for improvement:

Situation: ${experience.situation.description}
Complexity: ${experience.situation.complexity}
Uncertainty: ${experience.situation.uncertainty}
Novelty: ${experience.situation.novelty}

Actions taken:
${experience.actions.map(a => `- ${a.description}: ${a.reasoning}`).join('\n')}

Outcomes:
${experience.outcomes.map(o => `- ${o.type} (${o.quality}): ${JSON.stringify(o.value)}`).join('\n')}

Feedback: ${experience.feedback.content} (${experience.feedback.sentiment})

Provide 3-5 actionable insights for improving future performance in similar situations.`;
  }
  
  private extractInsights(response: unknown): string[] {
    if (typeof response === 'string') {
      return response.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  }
  
  async adaptStrategy(newStrategy: Partial<Strategy>): Promise<void> {
    if (!this.config.enableLearning) {
      return;
    }
    
    const strategyId = newStrategy.id || this.generateId('strategy');
    let strategy = this.strategies.get(strategyId);
    
    if (!strategy) {
      strategy = {
        id: strategyId,
        name: newStrategy.name || 'New Strategy',
        description: newStrategy.description || '',
        domain: newStrategy.domain || 'general',
        effectiveness: newStrategy.effectiveness || 0.5,
        confidence: newStrategy.confidence || 0.5,
        lastUsed: new Date(),
        usageCount: 0,
        successRate: 0.5,
        adaptationHistory: []
      };
      this.strategies.set(strategyId, strategy);
    } else {
      if (newStrategy.name) strategy.name = newStrategy.name;
      if (newStrategy.description) strategy.description = newStrategy.description;
      if (newStrategy.effectiveness) strategy.effectiveness = newStrategy.effectiveness;
      if (newStrategy.confidence) strategy.confidence = newStrategy.confidence;
    }
    
    const adaptation = {
      timestamp: new Date(),
      reason: newStrategy.description || 'Manual adaptation',
      changes: newStrategy,
      outcome: 'pending'
    };
    
    strategy.adaptationHistory.push(adaptation);
    
    this.emit('strategy:adapted', { strategyId, strategy, adaptation });
  }
  
  getProgress(): LearningProgress {
    const competencyLevel = this.calculateCompetencyLevel();
    const areasOfImprovement = this.identifyAreasOfImprovement();
    const recentInsights = this.getRecentInsights();
    const nextMilestones = this.getNextMilestones();
    
    return {
      totalExperiences: this.totalExperiences,
      successfulAdaptations: this.successfulAdaptations,
      failedAdaptations: this.failedAdaptations,
      learningRate: this.config.learningRate,
      competencyLevel,
      areasOfImprovement,
      recentInsights,
      nextMilestones
    };
  }
  
  private calculateCompetencyLevel(): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const avgCompetency = Array.from(this.knowledgeDomains.values())
      .reduce((sum, domain) => sum + domain.competency, 0) / this.knowledgeDomains.size;
    
    if (avgCompetency < 0.25) return 'beginner';
    if (avgCompetency < 0.5) return 'intermediate';
    if (avgCompetency < 0.75) return 'advanced';
    return 'expert';
  }
  
  private identifyAreasOfImprovement(): string[] {
    const improvements: string[] = [];
    
    for (const [name, domain] of this.knowledgeDomains.entries()) {
      if (domain.competency < 0.5) {
        improvements.push(name);
      }
    }
    
    if (improvements.length === 0) {
      improvements.push('advanced_optimization', 'cross_domain_integration');
    }
    
    return improvements;
  }
  
  private getRecentInsights(): string[] {
    const recentExperiences = Array.from(this.learningData.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    return recentExperiences.map(exp => exp.feedback.content);
  }
  
  private getNextMilestones(): string[] {
    const competencyLevel = this.calculateCompetencyLevel();
    
    const milestones: Record<string, string[]> = {
      'beginner': ['Achieve 50% competency in all domains', 'Complete 100 successful experiences'],
      'intermediate': ['Achieve 75% competency in all domains', 'Develop 5 effective strategies'],
      'advanced': ['Achieve 90% competency in all domains', 'Master cross-domain integration'],
      'expert': ['Achieve 95%+ competency in all domains', 'Create innovative strategies']
    };
    
    return milestones[competencyLevel] || [];
  }
  
  getStrategy(strategyId: string): Strategy | undefined {
    return this.strategies.get(strategyId);
  }
  
  getStrategiesByDomain(domain: string): Strategy[] {
    return Array.from(this.strategies.values())
      .filter(strategy => strategy.domain === domain)
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }
  
  getBestStrategy(domain: string): Strategy | undefined {
    const strategies = this.getStrategiesByDomain(domain);
    return strategies.length > 0 ? strategies[0] : undefined;
  }
  
  getKnowledgeDomain(domain: string): KnowledgeDomain | undefined {
    return this.knowledgeDomains.get(domain);
  }
  
  getAllKnowledgeDomains(): KnowledgeDomain[] {
    return Array.from(this.knowledgeDomains.values());
  }
  
  recordPerformanceMetric(metricName: string, value: number): void {
    if (!this.performanceMetrics.has(metricName)) {
      this.performanceMetrics.set(metricName, []);
    }
    
    const metrics = this.performanceMetrics.get(metricName)!;
    metrics.push(value);
    
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }
  
  getPerformanceMetric(metricName: string): { average: number; min: number; max: number; count: number } | undefined {
    const metrics = this.performanceMetrics.get(metricName);
    if (!metrics || metrics.length === 0) {
      return undefined;
    }
    
    const sum = metrics.reduce((a, b) => a + b, 0);
    const average = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);
    
    return { average, min, max, count: metrics.length };
  }
  
  private handleLearningCompleted(data: unknown): void {
  }

  private handleStrategyAdapted(data: unknown): void {
  }
  
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async shutdown(): Promise<void> {
    this.removeAllListeners();
    this.learningData.clear();
    this.strategies.clear();
    this.knowledgeDomains.clear();
    this.performanceMetrics.clear();
  }
}
