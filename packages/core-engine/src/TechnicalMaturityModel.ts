/**
 * 技术成熟度模型 - 五级能力评估系统
 */

import { EventEmitter } from 'events';

// ==================== 类型定义 ====================

export enum MaturityLevel {
  INITIAL = 1,      // 初始级：基本功能
  REPEATABLE = 2,   // 可重复级：过程规范
  DEFINED = 3,      // 已定义级：标准过程
  MANAGED = 4,      // 已管理级：量化管理
  OPTIMIZING = 5    // 优化级：持续改进
}

export interface MaturityDimension {
  name: string;
  weight: number;
  score?: number;
  level?: MaturityLevel;
  evidence?: string[];
  gaps?: string[];
}

export interface MaturityAssessment {
  timestamp: Date;
  overallScore: number;
  maturityLevel: MaturityLevel;
  dimensionScores: DimensionScore[];
  gapAnalysis: GapAnalysis;
  recommendations: Recommendation[];
  roadmap: ImprovementRoadmap;
  benchmarking: BenchmarkingResult;
  trends: TrendAnalysis;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  level: MaturityLevel;
  weight: number;
  details: ScoreDetail[];
}

export interface ScoreDetail {
  criterion: string;
  score: number;
  maxScore: number;
  evidence: string;
}

export interface GapAnalysis {
  currentLevel: MaturityLevel;
  targetLevel: MaturityLevel;
  gaps: Gap[];
  prioritizedGaps: Gap[];
}

export interface Gap {
  dimension: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  effort: string;
  impact: string;
  timeframe: string;
  dependencies: string[];
}

export interface ImprovementRoadmap {
  phases: RoadmapPhase[];
  totalDuration: number;
  estimatedCost: number;
  expectedBenefits: string[];
}

export interface RoadmapPhase {
  name: string;
  duration: number;
  startDate: number;
  endDate: number;
  objectives: string[];
  initiatives: Initiative[];
  milestones: Milestone[];
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: 'planned' | 'in_progress' | 'completed';
  progress: number;
}

export interface Milestone {
  name: string;
  date: number;
  criteria: string[];
  completed: boolean;
}

export interface BenchmarkingResult {
  industryAverage: number;
  topPerformers: number;
  yourPosition: number;
  percentile: number;
  comparison: Comparison[];
}

export interface Comparison {
  dimension: string;
  yourScore: number;
  industryAverage: number;
  topPerformer: number;
  gap: number;
}

export interface TrendAnalysis {
  historical: HistoricalData[];
  trend: 'improving' | 'stable' | 'declining';
  velocity: number;
  projection: Projection;
}

export interface HistoricalData {
  timestamp: number;
  overallScore: number;
  level: MaturityLevel;
}

export interface Projection {
  nextLevel: MaturityLevel;
  estimatedTime: number;
  confidence: number;
}

export interface AssessmentCriteria {
  level: MaturityLevel;
  criteria: LevelCriteria[];
}

export interface LevelCriteria {
  dimension: string;
  requirements: string[];
  examples: string[];
}

// ==================== 技术成熟度模型实现 ====================

export class TechnicalMaturityModel extends EventEmitter {
  private dimensions: MaturityDimension[] = [
    { name: '架构设计', weight: 0.2 },
    { name: '代码质量', weight: 0.15 },
    { name: '测试覆盖', weight: 0.15 },
    { name: '部署运维', weight: 0.15 },
    { name: '监控告警', weight: 0.1 },
    { name: '安全合规', weight: 0.1 },
    { name: '文档完整', weight: 0.05 },
    { name: '团队能力', weight: 0.1 }
  ];

  private assessmentHistory: MaturityAssessment[] = [];

  private levelCriteria: Map<MaturityLevel, AssessmentCriteria> = new Map([
    [MaturityLevel.INITIAL, {
      level: MaturityLevel.INITIAL,
      criteria: [
        {
          dimension: '架构设计',
          requirements: ['存在基本架构', '功能可运行'],
          examples: ['单体应用', '基本MVC']
        },
        {
          dimension: '代码质量',
          requirements: ['代码可读', '基本规范'],
          examples: ['变量命名规范', '基本注释']
        }
      ]
    }],
    [MaturityLevel.REPEATABLE, {
      level: MaturityLevel.REPEATABLE,
      criteria: [
        {
          dimension: '架构设计',
          requirements: ['分层架构', '模块化设计'],
          examples: ['三层架构', '模块边界清晰']
        },
        {
          dimension: '代码质量',
          requirements: ['编码规范', '代码审查'],
          examples: ['ESLint配置', 'PR Review流程']
        }
      ]
    }],
    [MaturityLevel.DEFINED, {
      level: MaturityLevel.DEFINED,
      criteria: [
        {
          dimension: '架构设计',
          requirements: ['微服务架构', '事件驱动'],
          examples: ['服务拆分', '消息队列']
        },
        {
          dimension: '测试覆盖',
          requirements: ['单元测试', '集成测试'],
          examples: ['覆盖率>70%', 'CI/CD集成']
        }
      ]
    }],
    [MaturityLevel.MANAGED, {
      level: MaturityLevel.MANAGED,
      criteria: [
        {
          dimension: '监控告警',
          requirements: ['全链路监控', 'SLO/SLA'],
          examples: ['分布式追踪', '指标大盘']
        },
        {
          dimension: '部署运维',
          requirements: ['自动化运维', '灰度发布'],
          examples: ['K8s部署', '金丝雀发布']
        }
      ]
    }],
    [MaturityLevel.OPTIMIZING, {
      level: MaturityLevel.OPTIMIZING,
      criteria: [
        {
          dimension: '架构设计',
          requirements: ['自适应架构', 'AI驱动优化'],
          examples: ['自动扩缩容', '智能路由']
        },
        {
          dimension: '团队能力',
          requirements: ['持续学习', '创新文化'],
          examples: ['定期技术分享', '创新激励']
        }
      ]
    }]
  ]);

  constructor() {
    super();
  }

  /**
   * 完整成熟度评估流程
   */
  async assessMaturity(): Promise<MaturityAssessment> {
    // 1. 数据收集
    const data = await this.collectAssessmentData();
    
    // 2. 维度评分
    const dimensionScores = await this.scoreDimensions(data);
    
    // 3. 总体评分
    const overallScore = this.calculateOverallScore(dimensionScores);
    
    // 4. 成熟度定级
    const maturityLevel = this.determineMaturityLevel(overallScore);
    
    // 5. 差距分析
    const gapAnalysis = await this.analyzeGaps(maturityLevel, dimensionScores);
    
    // 6. 改进建议
    const recommendations = await this.generateRecommendations(gapAnalysis);
    
    // 7. 路线图规划
    const roadmap = await this.createImprovementRoadmap(recommendations);
    
    // 8. 基准比较
    const benchmarking = await this.benchmarkAgainstIndustry(maturityLevel);

    // 9. 趋势分析
    const trends = await this.analyzeTrends();

    const assessment: MaturityAssessment = {
      timestamp: new Date(),
      overallScore,
      maturityLevel,
      dimensionScores,
      gapAnalysis,
      recommendations,
      roadmap,
      benchmarking,
      trends
    };

    this.assessmentHistory.push(assessment);
    this.emit('assessment:completed', assessment);

    return assessment;
  }

  /**
   * 1. 收集评估数据
   */
  private async collectAssessmentData(): Promise<any> {
    return {
      codeMetrics: await this.collectCodeMetrics(),
      testMetrics: await this.collectTestMetrics(),
      deploymentMetrics: await this.collectDeploymentMetrics(),
      documentationMetrics: await this.collectDocumentationMetrics(),
      teamMetrics: await this.collectTeamMetrics()
    };
  }

  /**
   * 2. 维度评分
   */
  private async scoreDimensions(data: any): Promise<DimensionScore[]> {
    return this.dimensions.map(dimension => ({
      dimension: dimension.name,
      score: this.scoreDimension(dimension.name, data),
      level: this.determineDimensionLevel(this.scoreDimension(dimension.name, data)),
      weight: dimension.weight,
      details: this.getScoreDetails(dimension.name, data)
    }));
  }

  /**
   * 3. 计算总体评分
   */
  private calculateOverallScore(dimensionScores: DimensionScore[]): number {
    let totalScore = 0;
    dimensionScores.forEach(ds => {
      totalScore += ds.score * ds.weight;
    });
    return Math.round(totalScore);
  }

  /**
   * 4. 确定成熟度等级
   */
  private determineMaturityLevel(overallScore: number): MaturityLevel {
    if (overallScore >= 90) return MaturityLevel.OPTIMIZING;
    if (overallScore >= 75) return MaturityLevel.MANAGED;
    if (overallScore >= 60) return MaturityLevel.DEFINED;
    if (overallScore >= 40) return MaturityLevel.REPEATABLE;
    return MaturityLevel.INITIAL;
  }

  /**
   * 5. 差距分析
   */
  private async analyzeGaps(
    currentLevel: MaturityLevel,
    dimensionScores: DimensionScore[]
  ): Promise<GapAnalysis> {
    const targetLevel = currentLevel < MaturityLevel.OPTIMIZING 
      ? currentLevel + 1 
      : MaturityLevel.OPTIMIZING;

    const gaps: Gap[] = dimensionScores.map(ds => {
      const targetScore = this.getTargetScore(ds.dimension, targetLevel);
      return {
        dimension: ds.dimension,
        currentScore: ds.score,
        targetScore,
        gap: targetScore - ds.score,
        priority: this.calculateGapPriority(ds),
        effort: this.estimateEffort(ds.score, targetScore),
        impact: this.estimateImpact(ds.dimension)
      };
    });

    // 按优先级排序
    const prioritizedGaps = gaps
      .filter(g => g.gap > 0)
      .sort((a, b) => b.priority - a.priority);

    return {
      currentLevel,
      targetLevel,
      gaps,
      prioritizedGaps
    };
  }

  /**
   * 6. 生成改进建议
   */
  private async generateRecommendations(gapAnalysis: GapAnalysis): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    gapAnalysis.prioritizedGaps.forEach((gap, index) => {
      recommendations.push({
        id: `rec_${index + 1}`,
        title: `提升${gap.dimension}`,
        description: `当前得分${gap.currentScore}，目标${gap.targetScore}，差距${gap.gap}分`,
        category: gap.dimension,
        priority: gap.priority,
        effort: gap.effort,
        impact: gap.impact,
        timeframe: this.estimateTimeframe(gap.effort),
        dependencies: []
      });
    });

    return recommendations;
  }

  /**
   * 7. 创建改进路线图
   */
  private async createImprovementRoadmap(
    recommendations: Recommendation[]
  ): Promise<ImprovementRoadmap> {
    const phases: RoadmapPhase[] = [
      {
        name: '快速改进期',
        duration: 30,
        startDate: Date.now(),
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        objectives: ['解决高优先级问题', '快速提升关键指标'],
        initiatives: [],
        milestones: []
      },
      {
        name: '系统优化期',
        duration: 60,
        startDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
        objectives: ['建立标准流程', '完善基础设施'],
        initiatives: [],
        milestones: []
      },
      {
        name: '持续改进期',
        duration: 90,
        startDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
        endDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
        objectives: ['自动化优化', '创新实践'],
        initiatives: [],
        milestones: []
      }
    ];

    return {
      phases,
      totalDuration: 180,
      estimatedCost: 100000,
      expectedBenefits: [
        '开发效率提升30%',
        '质量缺陷降低50%',
        '部署频率提升3倍'
      ]
    };
  }

  /**
   * 8. 行业基准比较
   */
  private async benchmarkAgainstIndustry(level: MaturityLevel): Promise<BenchmarkingResult> {
    const industryData = {
      [MaturityLevel.INITIAL]: { avg: 30, top: 50 },
      [MaturityLevel.REPEATABLE]: { avg: 50, top: 70 },
      [MaturityLevel.DEFINED]: { avg: 70, top: 85 },
      [MaturityLevel.MANAGED]: { avg: 85, top: 95 },
      [MaturityLevel.OPTIMIZING]: { avg: 95, top: 100 }
    };

    const yourScore = this.getLevelScore(level);
    const data = industryData[level];

    return {
      industryAverage: data.avg,
      topPerformers: data.top,
      yourPosition: yourScore,
      percentile: this.calculatePercentile(yourScore, data.avg),
      comparison: []
    };
  }

  /**
   * 9. 趋势分析
   */
  private async analyzeTrends(): Promise<TrendAnalysis> {
    if (this.assessmentHistory.length < 2) {
      return {
        historical: [],
        trend: 'stable',
        velocity: 0,
        projection: {
          nextLevel: MaturityLevel.INITIAL,
          estimatedTime: 0,
          confidence: 0
        }
      };
    }

    const historical = this.assessmentHistory.map(a => ({
      timestamp: a.timestamp.getTime(),
      overallScore: a.overallScore,
      level: a.maturityLevel
    }));

    const velocity = this.calculateVelocity(historical);
    const trend = velocity > 0 ? 'improving' : velocity < 0 ? 'declining' : 'stable';

    return {
      historical,
      trend,
      velocity,
      projection: this.projectNextLevel(historical, velocity)
    };
  }

  // ==================== 辅助方法 ====================

  private async collectCodeMetrics(): Promise<any> {
    return {
      linesOfCode: 10000,
      complexity: 15,
      duplication: 3.5,
      coverage: 75
    };
  }

  private async collectTestMetrics(): Promise<any> {
    return {
      unitTests: 500,
      integrationTests: 100,
      coverage: 75,
      passRate: 98
    };
  }

  private async collectDeploymentMetrics(): Promise<any> {
    return {
      deploymentFrequency: 10,
      leadTime: 2,
      mttr: 0.5,
      changeFailureRate: 5
    };
  }

  private async collectDocumentationMetrics(): Promise<any> {
    return {
      apiDocCoverage: 80,
      readmeQuality: 70,
      architectureDocs: true
    };
  }

  private async collectTeamMetrics(): Promise<any> {
    return {
      teamSize: 8,
      seniorityRatio: 0.6,
      trainingHours: 40
    };
  }

  private scoreDimension(dimension: string, data: any): number {
    // 简化评分逻辑
    const baseScore = 60;
    const variance = Math.random() * 30;
    return Math.round(baseScore + variance);
  }

  private determineDimensionLevel(score: number): MaturityLevel {
    return this.determineMaturityLevel(score);
  }

  private getScoreDetails(dimension: string, data: any): ScoreDetail[] {
    return [];
  }

  private getTargetScore(dimension: string, targetLevel: MaturityLevel): number {
    return targetLevel * 20;
  }

  private calculateGapPriority(ds: DimensionScore): number {
    return ds.weight * (100 - ds.score);
  }

  private estimateEffort(current: number, target: number): 'low' | 'medium' | 'high' {
    const gap = target - current;
    if (gap < 10) return 'low';
    if (gap < 25) return 'medium';
    return 'high';
  }

  private estimateImpact(dimension: string): 'low' | 'medium' | 'high' {
    const highImpact = ['架构设计', '代码质量', '测试覆盖'];
    return highImpact.includes(dimension) ? 'high' : 'medium';
  }

  private estimateTimeframe(effort: string): string {
    if (effort === 'low') return '1-2个月';
    if (effort === 'medium') return '3-6个月';
    return '6-12个月';
  }

  private getLevelScore(level: MaturityLevel): number {
    return level * 20;
  }

  private calculatePercentile(score: number, average: number): number {
    return Math.round((score / average) * 50 + 50);
  }

  private calculateVelocity(historical: HistoricalData[]): number {
    if (historical.length < 2) return 0;

    const first = historical[0];
    const last = historical[historical.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / (30 * 24 * 60 * 60 * 1000);

    return (last.overallScore - first.overallScore) / timeDiff;
  }

  private projectNextLevel(historical: HistoricalData[], velocity: number): Projection {
    if (historical.length === 0) {
      return {
        nextLevel: MaturityLevel.INITIAL,
        estimatedTime: 0,
        confidence: 0
      };
    }

    const current = historical[historical.length - 1];
    const nextLevel = current.level < MaturityLevel.OPTIMIZING 
      ? current.level + 1 
      : MaturityLevel.OPTIMIZING;

    const targetScore = nextLevel * 20;
    const gap = targetScore - current.overallScore;
    const estimatedTime = velocity > 0 ? gap / velocity : 0;

    return {
      nextLevel,
      estimatedTime: Math.round(estimatedTime),
      confidence: Math.min(historical.length / 10, 1)
    };
  }

  /**
   * 获取评估历史
   */
  getAssessmentHistory(): MaturityAssessment[] {
    return [...this.assessmentHistory];
  }

  /**
   * 获取最新评估
   */
  getLatestAssessment(): MaturityAssessment | null {
    return this.assessmentHistory.length > 0 
      ? this.assessmentHistory[this.assessmentHistory.length - 1]
      : null;
  }
}

// ==================== 单例导出 ====================

export const technicalMaturityModel = new TechnicalMaturityModel();
