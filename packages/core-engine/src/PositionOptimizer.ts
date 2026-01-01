/**
 * PositionOptimizer - 智能位置优化系统
 * 
 * 基于用户行为、屏幕布局和上下文信息，智能推荐组件的最佳位置
 * 核心思想：机器学习 + 启发式规则，平衡可访问性、效率和美观
 * 
 * 特性：
 * - 学习用户偏好
 * - 避让关键区域
 * - 多屏适配
 * - 上下文感知
 * - 热图分析
 * 
 * @module PositionOptimizer
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('PositionOptimizer');

// ================================================
// 1. 类型定义
// ================================================

/**
 * 位置信息
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 矩形区域
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 屏幕信息
 */
export interface ScreenInfo {
  id: string;
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  isPrimary: boolean;
}

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * UI组件
 */
export interface UIComponent {
  id: string;
  type: string;
  element: HTMLElement;
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: number; // 使用频率
  size: { width: number; height: number };
}

/**
 * 位置约束
 */
export interface PositionConstraints {
  boundary?: Rect;                   // 边界约束
  avoidAreas?: Rect[];               // 避让区域
  preferredQuadrant?: 'tl' | 'tr' | 'bl' | 'br'; // 偏好象限
  minDistanceFromEdge?: number;      // 距边缘最小距离
  maxDistanceFromFocus?: number;     // 距焦点最大距离
}

/**
 * 优化上下文
 */
export interface OptimizationContext {
  // 设备信息
  deviceType: DeviceType;
  screen: ScreenInfo;
  
  // 用户状态
  userAttention: Position | null;
  currentTask: string;
  
  // 界面状态
  visibleElements: HTMLElement[];
  focusElement: Element | null;
  interactionZones: Rect[];
  attentionAreas: Rect[];
  
  // 组件特定信息
  componentType: string;
  componentPriority: string;
  componentFrequency: number;
  
  // 时间上下文
  timeOfDay: number;
  interactionHistory: InteractionRecord[];
  
  // 环境因素
  isDistractedEnvironment: boolean;
}

/**
 * 交互记录
 */
export interface InteractionRecord {
  timestamp: Date;
  position: Position;
  componentId: string;
  success: boolean;
  duration: number;
}

/**
 * 候选位置
 */
export interface CandidatePosition {
  position: Position;
  source: 'preference' | 'rule' | 'heatmap' | 'avoidance';
  metadata?: Record<string, any>;
}

/**
 * 评分细节
 */
export interface ScoreBreakdown {
  accessibility: number;   // 可访问性 (0-1)
  efficiency: number;      // 效率 (0-1)
  aesthetics: number;      // 美观性 (0-1)
  stability: number;       // 稳定性 (0-1)
  personalization: number; // 个性化 (0-1)
}

/**
 * 评分后的候选位置
 */
export interface ScoredCandidate {
  position: Position;
  scores: ScoreBreakdown;
  score: number;
  reasons: string[];
}

/**
 * 推荐位置
 */
export interface RecommendedPosition extends Position {
  confidence: number;      // 置信度 (0-1)
  reason: string[];        // 推荐理由
  alternatives: Array<{    // 备选位置
    position: Position;
    score: number;
  }>;
}

/**
 * 位置记忆
 */
export interface PositionMemory {
  componentId: string;
  positions: Position[];
  frequencies: number[];
  contexts: OptimizationContext[];
  lastUsed: Date;
}

/**
 * 多屏位置
 */
export interface MultiScreenPosition {
  primary: RecommendedPosition;
  secondary?: RecommendedPosition[];
  screenId: string;
}

// ================================================
// 2. 热图系统
// ================================================

/**
 * 热图
 */
class Heatmap {
  private data: Map<string, number> = new Map();
  private resolution: number;
  
  constructor(resolution: number = 20) {
    this.resolution = resolution;
  }
  
  /**
   * 记录交互
   */
  recordInteraction(position: Position, weight: number = 1): void {
    const key = this.getGridKey(position);
    const current = this.data.get(key) || 0;
    this.data.set(key, current + weight);
  }
  
  /**
   * 获取位置热度
   */
  getHeat(position: Position): number {
    const key = this.getGridKey(position);
    return this.data.get(key) || 0;
  }
  
  /**
   * 获取热点区域
   */
  getHotZones(threshold: number = 10): Rect[] {
    const hotZones: Rect[] = [];
    
    for (const [key, heat] of Array.from(this.data.entries())) {
      if (heat >= threshold) {
        const [x, y] = this.parseGridKey(key);
        hotZones.push({
          x: x * this.resolution,
          y: y * this.resolution,
          width: this.resolution,
          height: this.resolution
        });
      }
    }
    
    return this.mergeAdjacentZones(hotZones);
  }
  
  /**
   * 获取冷区（低交互区域）
   */
  getColdZones(threshold: number = 2): Rect[] {
    const allZones = this.generateAllZones();
    return allZones.filter(zone => {
      const heat = this.getHeat({ x: zone.x, y: zone.y });
      return heat < threshold;
    });
  }
  
  /**
   * 生成所有网格区域
   */
  private generateAllZones(): Rect[] {
    const zones: Rect[] = [];
    const gridWidth = Math.ceil(window.innerWidth / this.resolution);
    const gridHeight = Math.ceil(window.innerHeight / this.resolution);
    
    for (let i = 0; i < gridWidth; i++) {
      for (let j = 0; j < gridHeight; j++) {
        zones.push({
          x: i * this.resolution,
          y: j * this.resolution,
          width: this.resolution,
          height: this.resolution
        });
      }
    }
    
    return zones;
  }
  
  /**
   * 获取网格键
   */
  private getGridKey(position: Position): string {
    const gridX = Math.floor(position.x / this.resolution);
    const gridY = Math.floor(position.y / this.resolution);
    return `${gridX},${gridY}`;
  }
  
  /**
   * 解析网格键
   */
  private parseGridKey(key: string): [number, number] {
    const [x, y] = key.split(',').map(Number);
    return [x, y];
  }
  
  /**
   * 合并相邻区域
   */
  private mergeAdjacentZones(zones: Rect[]): Rect[] {
    // 简化实现：返回原始区域
    // 完整实现需要区域合并算法
    return zones;
  }
  
  /**
   * 清空热图
   */
  clear(): void {
    this.data.clear();
  }
}

// ================================================
// 3. 偏好学习器
// ================================================

/**
 * 偏好学习器
 */
class PreferenceLearner {
  private learningRate: number;
  private preferences: Map<string, Position[]> = new Map();
  
  constructor(learningRate: number = 0.1) {
    this.learningRate = learningRate;
  }
  
  /**
   * 更新偏好
   */
  async update(componentId: string, position: Position, context: OptimizationContext): Promise<void> {
    const key = this.getContextKey(context);
    const fullKey = `${componentId}:${key}`;
    
    const positions = this.preferences.get(fullKey) || [];
    positions.push(position);
    
    // 保留最近的N个位置
    if (positions.length > 100) {
      positions.shift();
    }
    
    this.preferences.set(fullKey, positions);
  }
  
  /**
   * 获取偏好位置
   */
  getPreferredPositions(componentId: string, context: OptimizationContext): Position[] {
    const key = this.getContextKey(context);
    const fullKey = `${componentId}:${key}`;
    return this.preferences.get(fullKey) || [];
  }
  
  /**
   * 获取上下文键
   */
  private getContextKey(context: OptimizationContext): string {
    return [
      context.deviceType,
      context.screen.orientation,
      context.currentTask,
      Math.floor(context.timeOfDay / 6) // 按时段分组
    ].join(':');
  }
}

// ================================================
// 4. 规则引擎
// ================================================

/**
 * 规则引擎
 */
class RuleEngine {
  private rules: Map<string, number> = new Map(); // 规则权重
  
  constructor(initialRules?: Map<string, number>) {
    this.rules = initialRules || new Map([
      ['avoidCenter', 0.8],
      ['nearEdge', 0.6],
      ['quadrantBalance', 0.7],
      ['avoidFocus', 0.5]
    ]);
  }
  
  /**
   * 生成基于规则的位置
   */
  generatePositions(
    component: UIComponent,
    constraints: PositionConstraints,
    context: OptimizationContext
  ): CandidatePosition[] {
    const candidates: CandidatePosition[] = [];
    
    // 规则1：四个角落
    if (this.rules.get('nearEdge')! > 0.5) {
      candidates.push(
        { position: { x: 20, y: 20 }, source: 'rule', metadata: { rule: 'top-left' } },
        { position: { x: context.screen.width - component.size.width - 20, y: 20 }, source: 'rule', metadata: { rule: 'top-right' } },
        { position: { x: 20, y: context.screen.height - component.size.height - 20 }, source: 'rule', metadata: { rule: 'bottom-left' } },
        { position: { x: context.screen.width - component.size.width - 20, y: context.screen.height - component.size.height - 20 }, source: 'rule', metadata: { rule: 'bottom-right' } }
      );
    }
    
    // 规则2：边缘中点
    candidates.push(
      { position: { x: context.screen.width / 2 - component.size.width / 2, y: 20 }, source: 'rule', metadata: { rule: 'top-center' } },
      { position: { x: context.screen.width / 2 - component.size.width / 2, y: context.screen.height - component.size.height - 20 }, source: 'rule', metadata: { rule: 'bottom-center' } },
      { position: { x: 20, y: context.screen.height / 2 - component.size.height / 2 }, source: 'rule', metadata: { rule: 'left-center' } },
      { position: { x: context.screen.width - component.size.width - 20, y: context.screen.height / 2 - component.size.height / 2 }, source: 'rule', metadata: { rule: 'right-center' } }
    );
    
    // 规则3：避开中心区域
    if (this.rules.get('avoidCenter')! > 0.7) {
      // 已经通过角落和边缘位置实现
    }
    
    return candidates;
  }
  
  /**
   * 调整规则权重
   */
  adjustWeights(success: boolean): void {
    // 简化实现：根据成功与否调整权重
    const factor = success ? 1.05 : 0.95;
    for (const [rule, weight] of this.rules.entries()) {
      this.rules.set(rule, Math.max(0.1, Math.min(1.0, weight * factor)));
    }
  }
}

// ================================================
// 5. 屏幕分析器
// ================================================

/**
 * 屏幕分析器
 */
class ScreenAnalyzer {
  /**
   * 获取屏幕信息
   */
  getScreenInfo(): ScreenInfo {
    return {
      id: 'primary',
      width: window.innerWidth,
      height: window.innerHeight,
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      pixelRatio: window.devicePixelRatio || 1,
      isPrimary: true
    };
  }
  
  /**
   * 检测设备类型
   */
  detectDeviceType(): DeviceType {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

// ================================================
// 6. 位置优化器核心
// ================================================

/**
 * 位置优化器配置
 */
export interface PositionOptimizerConfig {
  heatmapResolution: number;
  learningRate: number;
  rules?: Map<string, number>;
  enableLearning: boolean;
  persistHistory: boolean;
}

/**
 * 位置优化器
 */
export class PositionOptimizer extends EventEmitter {
  private heatmap: Heatmap;
  private preferenceLearner: PreferenceLearner;
  private ruleEngine: RuleEngine;
  private screenAnalyzer: ScreenAnalyzer;
  
  // 位置记忆
  private positionMemory: Map<string, PositionMemory> = new Map();
  
  // 配置
  private config: PositionOptimizerConfig;
  
  constructor(config: Partial<PositionOptimizerConfig> = {}) {
    super();
    
    this.config = {
      heatmapResolution: 20,
      learningRate: 0.1,
      enableLearning: true,
      persistHistory: true,
      ...config
    };
    
    this.heatmap = new Heatmap(this.config.heatmapResolution);
    this.preferenceLearner = new PreferenceLearner(this.config.learningRate);
    this.ruleEngine = new RuleEngine(this.config.rules);
    this.screenAnalyzer = new ScreenAnalyzer();
    
    // 加载历史数据
    if (this.config.persistHistory) {
      this.loadHistoricalData();
    }
  }
  
  /**
   * 为组件推荐最佳位置
   */
  async recommendPosition(
    component: UIComponent,
    constraints: PositionConstraints = {}
  ): Promise<RecommendedPosition> {
    // 1. 收集上下文信息
    const context = await this.collectContext(component);
    
    // 2. 获取候选位置
    const candidates = await this.generateCandidates(component, constraints, context);
    
    // 3. 评估每个候选位置
    const scoredCandidates = await this.scoreCandidates(candidates, context, component);
    
    // 4. 选择最佳位置
    const bestCandidate = this.selectBestCandidate(scoredCandidates);
    
    // 5. 记录决策
    await this.recordDecision(component, bestCandidate, context);
    
    return {
      ...bestCandidate.position,
      confidence: bestCandidate.score,
      reason: bestCandidate.reasons,
      alternatives: scoredCandidates.slice(1, 4).map(c => ({
        position: c.position,
        score: c.score
      }))
    };
  }
  
  /**
   * 学习用户交互
   */
  async learnFromInteraction(
    componentId: string,
    position: Position,
    success: boolean,
    duration: number
  ): Promise<void> {
    if (!this.config.enableLearning) return;
    
    // 1. 记录交互到热图
    const weight = success ? 1 : 0.5;
    this.heatmap.recordInteraction(position, weight);
    
    // 2. 更新偏好学习器
    const context = await this.collectContext({ id: componentId } as UIComponent);
    await this.preferenceLearner.update(componentId, position, context);
    
    // 3. 调整规则权重
    this.ruleEngine.adjustWeights(success);
    
    // 4. 记录到历史
    this.recordInteractionHistory(componentId, position, success, duration);
    
    // 5. 触发学习事件
    this.emit('learned', { componentId, position, success, duration });
  }
  
  /**
   * 生成候选位置
   */
  private async generateCandidates(
    component: UIComponent,
    constraints: PositionConstraints,
    context: OptimizationContext
  ): Promise<CandidatePosition[]> {
    const candidates: CandidatePosition[] = [];
    
    // 1. 用户偏好位置
    const preferred = this.preferenceLearner.getPreferredPositions(component.id, context);
    candidates.push(...preferred.map(p => ({ position: p, source: 'preference' as const })));
    
    // 2. 基于规则的位置
    const ruleBased = this.ruleEngine.generatePositions(component, constraints, context);
    candidates.push(...ruleBased);
    
    // 3. 基于热图的位置（冷区）
    const coldZones = this.heatmap.getColdZones(2);
    candidates.push(...coldZones.slice(0, 5).map(zone => ({
      position: { x: zone.x, y: zone.y },
      source: 'heatmap' as const
    })));
    
    // 4. 避让关键区域的位置
    if (constraints.avoidAreas) {
      const avoidBased = this.generateAvoidancePositions(component, context, constraints.avoidAreas);
      candidates.push(...avoidBased);
    }
    
    // 去重
    return this.deduplicateCandidates(candidates);
  }
  
  /**
   * 生成避让位置
   */
  private generateAvoidancePositions(
    component: UIComponent,
    context: OptimizationContext,
    avoidAreas: Rect[]
  ): CandidatePosition[] {
    const candidates: CandidatePosition[] = [];
    const { width, height } = component.size;
    
    // 在避让区域周围生成位置
    for (const area of avoidAreas) {
      // 上方
      candidates.push({
        position: { x: area.x, y: area.y - height - 10 },
        source: 'avoidance'
      });
      // 下方
      candidates.push({
        position: { x: area.x, y: area.y + area.height + 10 },
        source: 'avoidance'
      });
      // 左侧
      candidates.push({
        position: { x: area.x - width - 10, y: area.y },
        source: 'avoidance'
      });
      // 右侧
      candidates.push({
        position: { x: area.x + area.width + 10, y: area.y },
        source: 'avoidance'
      });
    }
    
    return candidates.filter(c => this.isPositionValid(c.position, context));
  }
  
  /**
   * 评估候选位置
   */
  private async scoreCandidates(
    candidates: CandidatePosition[],
    context: OptimizationContext,
    component: UIComponent
  ): Promise<ScoredCandidate[]> {
    const scored = await Promise.all(
      candidates.map(async candidate => {
        const scores = await this.calculateScores(candidate, context, component);
        const totalScore = this.combineScores(scores);
        
        return {
          position: candidate.position,
          scores,
          score: totalScore,
          reasons: this.generateReasons(scores, candidate)
        };
      })
    );
    
    // 按总分排序
    return scored.sort((a, b) => b.score - a.score);
  }
  
  /**
   * 计算各维度分数
   */
  private async calculateScores(
    candidate: CandidatePosition,
    context: OptimizationContext,
    component: UIComponent
  ): Promise<ScoreBreakdown> {
    return {
      accessibility: await this.scoreAccessibility(candidate, context, component),
      efficiency: await this.scoreEfficiency(candidate, context, component),
      aesthetics: await this.scoreAesthetics(candidate, context, component),
      stability: await this.scoreStability(candidate, context, component),
      personalization: await this.scorePersonalization(candidate, context, component)
    };
  }
  
  /**
   * 可访问性评分
   */
  private async scoreAccessibility(
    candidate: CandidatePosition,
    context: OptimizationContext,
    component: UIComponent
  ): Promise<number> {
    let score = 1.0;
    
    // 距离屏幕边缘
    const edgeDistance = this.calculateEdgeDistance(candidate.position, context.screen);
    if (edgeDistance < 10) score *= 0.7; // 太靠边不好
    
    // 不遮挡焦点元素
    if (context.focusElement) {
      const focusRect = context.focusElement.getBoundingClientRect();
      if (this.rectsOverlap(candidate.position, component.size, focusRect)) {
        score *= 0.5;
      }
    }
    
    // 手势可达性（移动设备）
    if (context.deviceType === 'mobile') {
      const reachable = this.isReachable(candidate.position, context.screen);
      if (!reachable) score *= 0.6;
    }
    
    return score;
  }
  
  /**
   * 效率评分
   */
  private async scoreEfficiency(
    candidate: CandidatePosition,
    context: OptimizationContext,
    component: UIComponent
  ): Promise<number> {
    let score = 1.0;
    
    // 与交互区域的距离
    if (context.interactionZones.length > 0) {
      const minDistance = Math.min(
        ...context.interactionZones.map(zone =>
          this.distance(candidate.position, { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 })
        )
      );
      score *= Math.exp(-minDistance / 500); // 指数衰减
    }
    
    return Math.max(0.2, score);
  }
  
  /**
   * 美观性评分
   */
  private async scoreAesthetics(
    candidate: CandidatePosition,
    context: OptimizationContext,
    component: UIComponent
  ): Promise<number> {
    let score = 1.0;
    
    // 黄金分割位置
    const goldenX = context.screen.width * 0.618;
    const goldenY = context.screen.height * 0.618;
    const distanceToGolden = this.distance(candidate.position, { x: goldenX, y: goldenY });
    score *= Math.exp(-distanceToGolden / 1000);
    
    // 对称性
    const centerX = context.screen.width / 2;
    const distanceToCenter = Math.abs(candidate.position.x - centerX);
    if (distanceToCenter < 50) score *= 1.1; // 接近中心线加分
    
    return Math.max(0.3, score);
  }
  
  /**
   * 稳定性评分
   */
  private async scoreStability(
    candidate: CandidatePosition,
    context: OptimizationContext,
    component: UIComponent
  ): Promise<number> {
    let score = 1.0;
    
    // 检查是否在历史常用位置附近
    const memory = this.positionMemory.get(component.id);
    if (memory) {
      const nearHistorical = memory.positions.some(p =>
        this.distance(candidate.position, p) < 100
      );
      if (nearHistorical) score *= 1.2;
    }
    
    return Math.min(1.0, score);
  }
  
  /**
   * 个性化评分
   */
  private async scorePersonalization(
    candidate: CandidatePosition,
    context: OptimizationContext,
    component: UIComponent
  ): Promise<number> {
    let score = 0.5;
    
    // 如果来自用户偏好，高分
    if (candidate.source === 'preference') {
      score = 0.9;
    }
    
    // 热图热度（越冷越好，因为是放置位置）
    const heat = this.heatmap.getHeat(candidate.position);
    score *= (1 - Math.min(heat / 50, 0.8)); // 热度越高，分数越低
    
    return score;
  }
  
  /**
   * 组合分数
   */
  private combineScores(scores: ScoreBreakdown): number {
    // 加权平均
    const weights = {
      accessibility: 0.3,
      efficiency: 0.25,
      aesthetics: 0.15,
      stability: 0.15,
      personalization: 0.15
    };
    
    return (
      scores.accessibility * weights.accessibility +
      scores.efficiency * weights.efficiency +
      scores.aesthetics * weights.aesthetics +
      scores.stability * weights.stability +
      scores.personalization * weights.personalization
    );
  }
  
  /**
   * 选择最佳候选位置
   */
  private selectBestCandidate(scoredCandidates: ScoredCandidate[]): ScoredCandidate {
    if (scoredCandidates.length === 0) {
      throw new Error('No valid candidates');
    }
    return scoredCandidates[0];
  }
  
  /**
   * 生成推荐理由
   */
  private generateReasons(scores: ScoreBreakdown, candidate: CandidatePosition): string[] {
    const reasons: string[] = [];
    
    if (scores.accessibility > 0.8) reasons.push('易于访问');
    if (scores.efficiency > 0.8) reasons.push('操作高效');
    if (scores.aesthetics > 0.7) reasons.push('布局美观');
    if (scores.stability > 0.8) reasons.push('位置稳定');
    if (scores.personalization > 0.8) reasons.push('符合习惯');
    
    if (candidate.source === 'preference') reasons.push('基于历史偏好');
    if (candidate.source === 'heatmap') reasons.push('低干扰区域');
    if (candidate.source === 'avoidance') reasons.push('避让重要内容');
    
    return reasons.length > 0 ? reasons : ['综合评估推荐'];
  }
  
  /**
   * 收集上下文
   */
  private async collectContext(component: UIComponent): Promise<OptimizationContext> {
    const screenInfo = this.screenAnalyzer.getScreenInfo();
    const deviceType = this.screenAnalyzer.detectDeviceType();
    
    return {
      deviceType,
      screen: screenInfo,
      userAttention: null,
      currentTask: 'default',
      visibleElements: Array.from(document.querySelectorAll('[data-visible="true"]')) as HTMLElement[],
      focusElement: document.activeElement,
      interactionZones: this.heatmap.getHotZones(10),
      attentionAreas: [],
      componentType: component.type || 'unknown',
      componentPriority: component.priority || 'medium',
      componentFrequency: component.frequency || 1,
      timeOfDay: new Date().getHours(),
      interactionHistory: this.getInteractionHistory(component.id),
      isDistractedEnvironment: false
    };
  }
  
  /**
   * 记录决策
   */
  private async recordDecision(
    component: UIComponent,
    candidate: ScoredCandidate,
    context: OptimizationContext
  ): Promise<void> {
    const memory: PositionMemory = this.positionMemory.get(component.id) || {
      componentId: component.id,
      positions: [],
      frequencies: [],
      contexts: [],
      lastUsed: new Date()
    };
    
    memory.positions.push(candidate.position);
    memory.frequencies.push(1);
    memory.contexts.push(context);
    memory.lastUsed = new Date();
    
    // 保留最近100条
    if (memory.positions.length > 100) {
      memory.positions.shift();
      memory.frequencies.shift();
      memory.contexts.shift();
    }
    
    this.positionMemory.set(component.id, memory);
    
    if (this.config.persistHistory) {
      this.saveHistoricalData();
    }
  }
  
  /**
   * 记录交互历史
   */
  private recordInteractionHistory(
    componentId: string,
    position: Position,
    success: boolean,
    duration: number
  ): void {
    // 简化实现：存储在内存中
    // 实际应用应持久化到数据库
  }
  
  /**
   * 获取交互历史
   */
  private getInteractionHistory(componentId: string): InteractionRecord[] {
    // 简化实现
    return [];
  }
  
  /**
   * 去重候选位置
   */
  private deduplicateCandidates(candidates: CandidatePosition[]): CandidatePosition[] {
    const unique = new Map<string, CandidatePosition>();
    
    for (const candidate of candidates) {
      const key = `${Math.round(candidate.position.x / 10)},${Math.round(candidate.position.y / 10)}`;
      if (!unique.has(key)) {
        unique.set(key, candidate);
      }
    }
    
    return Array.from(unique.values());
  }
  
  /**
   * 判断位置是否有效
   */
  private isPositionValid(position: Position, context: OptimizationContext): boolean {
    return (
      position.x >= 0 &&
      position.y >= 0 &&
      position.x <= context.screen.width &&
      position.y <= context.screen.height
    );
  }
  
  /**
   * 计算距离边缘的距离
   */
  private calculateEdgeDistance(position: Position, screen: ScreenInfo): number {
    return Math.min(
      position.x,
      position.y,
      screen.width - position.x,
      screen.height - position.y
    );
  }
  
  /**
   * 计算两点距离
   */
  private distance(p1: Position, p2: Position): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  
  /**
   * 检查矩形是否重叠
   */
  private rectsOverlap(
    pos: Position,
    size: { width: number; height: number },
    rect: DOMRect
  ): boolean {
    return !(
      pos.x + size.width < rect.left ||
      pos.x > rect.right ||
      pos.y + size.height < rect.top ||
      pos.y > rect.bottom
    );
  }
  
  /**
   * 判断是否可触达（移动设备）
   */
  private isReachable(position: Position, screen: ScreenInfo): boolean {
    // 简化：拇指可触达区域
    const thumbZone = {
      x: 0,
      y: screen.height * 0.4,
      width: screen.width,
      height: screen.height * 0.6
    };
    
    return (
      position.x >= thumbZone.x &&
      position.x <= thumbZone.x + thumbZone.width &&
      position.y >= thumbZone.y &&
      position.y <= thumbZone.y + thumbZone.height
    );
  }
  
  /**
   * 加载历史数据
   */
  private loadHistoricalData(): void {
    try {
      const data = localStorage.getItem('position-optimizer-history');
      if (data) {
        const parsed = JSON.parse(data);
        // 恢复位置记忆
        // 简化实现
      }
    } catch (error) {
      logger.warn('Failed to load historical data:', error);
    }
  }
  
  /**
   * 保存历史数据
   */
  private saveHistoricalData(): void {
    try {
      const data = {
        positionMemory: Array.from(this.positionMemory.entries()),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('position-optimizer-history', JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to save historical data:', error);
    }
  }
  
  /**
   * 清空历史数据
   */
  clearHistory(): void {
    this.positionMemory.clear();
    this.heatmap.clear();
    if (this.config.persistHistory) {
      localStorage.removeItem('position-optimizer-history');
    }
    this.emit('historyCleared');
  }
  
  /**
   * 获取热图数据（用于可视化）
   */
  getHeatmapData(): Rect[] {
    return this.heatmap.getHotZones(1);
  }
}

// ================================================
// 7. 导出单例
// ================================================

/**
 * 默认位置优化器实例
 */
export const positionOptimizer = new PositionOptimizer();
