import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  IDimension,
  DimensionType,
  SystemStatus,
  ManagementConfig,
  StrategicGoal,
  KPI,
  Milestone,
  Risk,
  Recommendation,
  Priority,
  AlertLevel
} from '@/types/IFiveDimensionalManagement';
import { Logger } from '@/utils/Logger';
import { GoalAnalyticsEngine } from '@/core/GoalAnalyticsEngine';
import { GoalValidator } from '@/utils/GoalValidator';

/**
 * Goal Dimension - Manages strategic objectives, KPIs, and milestones
 *
 * This dimension handles:
 * - Strategic goal management and tracking
 * - KPI monitoring and analysis
 * - Milestone progress tracking
 * - Risk assessment and mitigation
 * - Goal optimization and realignment
 */
export class GoalDimension extends EventEmitter implements IDimension {
  private _type: DimensionType = 'goal';
  private _enabled: boolean = false;
  private _status: SystemStatus = 'initializing';
  private _config: ManagementConfig;

  // Data storage
  private _goals: Map<string, StrategicGoal> = new Map();
  private _kpis: Map<string, KPI> = new Map();
  private _milestones: Map<string, Milestone> = new Map();
  private _risks: Map<string, Risk> = new Map();

  // Core components
  private _analytics: GoalAnalyticsEngine;
  private _validator: GoalValidator;
  private _logger: Logger;

  // Monitoring
  private _healthScore: number = 100;
  private _lastHealthCheck: Date = new Date();
  private _monitoringInterval?: NodeJS.Timeout;

  constructor(config: ManagementConfig) {
    super();
    this._config = config;
    this._logger = new Logger('GoalDimension');
    this._analytics = new GoalAnalyticsEngine(config);
    this._validator = new GoalValidator(config);
  }

  // ========================================================================
  // Properties
  // ========================================================================

  get type(): DimensionType {
    return this._type;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get status(): SystemStatus {
    return this._status;
  }

  get metrics(): any {
    return {
      totalGoals: this._goals.size,
      activeGoals: Array.from(this._goals.values()).filter(g => g.status === 'active').length,
      completedGoals: Array.from(this._goals.values()).filter(g => g.status === 'completed').length,
      atRiskGoals: Array.from(this._goals.values()).filter(g => this.isGoalAtRisk(g)).length,
      overallProgress: this.calculateOverallProgress(),
      healthScore: this._healthScore,
      kpiCount: this._kpis.size,
      milestoneCount: this._milestones.size,
      riskCount: this._risks.size
    };
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  async initialize(): Promise<void> {
    this._logger.info('Initializing GoalDimension...');

    try {
      // Initialize core components
      await this._analytics.initialize();
      await this._validator.initialize();

      // Load sample data if needed
      await this.loadInitialData();

      this._status = 'active';
      this._logger.info('GoalDimension initialized successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to initialize GoalDimension', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this._enabled) {
      this._logger.warn('GoalDimension is already enabled');
      return;
    }

    this._logger.info('Starting GoalDimension...');

    try {
      // Start analytics engine
      await this._analytics.start();

      // Start monitoring
      this.startMonitoring();

      // Start goal processing
      this.startGoalProcessing();

      this._enabled = true;
      this._status = 'active';

      this.emit('started', { timestamp: new Date() });
      this._logger.info('GoalDimension started successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to start GoalDimension', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this._enabled) {
      this._logger.warn('GoalDimension is already disabled');
      return;
    }

    this._logger.info('Stopping GoalDimension...');

    try {
      // Stop monitoring
      this.stopMonitoring();

      // Stop analytics engine
      await this._analytics.stop();

      this._enabled = false;
      this._status = 'suspended';

      this.emit('stopped', { timestamp: new Date() });
      this._logger.info('GoalDimension stopped successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to stop GoalDimension', error);
      throw error;
    }
  }

  // ========================================================================
  // Goal Management
  // ========================================================================

  async createGoal(goalData: Omit<StrategicGoal, 'id' | 'createdAt' | 'updatedAt' | 'lastReviewed'>): Promise<StrategicGoal> {
    // Validate goal data
    await this._validator.validateGoal(goalData);

    const goal: StrategicGoal = {
      ...goalData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReviewed: new Date()
    };

    // Store goal
    this._goals.set(goal.id, goal);

    // Store associated KPIs, milestones, and risks
    for (const kpi of goal.kpis) {
      this._kpis.set(kpi.id, kpi);
    }

    for (const milestone of goal.milestones) {
      this._milestones.set(milestone.id, milestone);
    }

    for (const risk of goal.risks) {
      this._risks.set(risk.id, risk);
    }

    this.emit('goal-created', { goal, timestamp: new Date() });
    this._logger.info(`Goal created: ${goal.title}`, { goalId: goal.id });

    return goal;
  }

  async updateGoal(goalId: string, updates: Partial<StrategicGoal>): Promise<StrategicGoal> {
    const goal = this._goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal ${goalId} not found`);
    }

    // Validate updates
    const updatedGoal = { ...goal, ...updates, updatedAt: new Date() };
    await this._validator.validateGoal(updatedGoal);

    this._goals.set(goalId, updatedGoal);

    // Update associated items if provided
    if (updates.kpis) {
      for (const kpi of updates.kpis) {
        this._kpis.set(kpi.id, kpi);
      }
    }

    if (updates.milestones) {
      for (const milestone of updates.milestones) {
        this._milestones.set(milestone.id, milestone);
      }
    }

    if (updates.risks) {
      for (const risk of updates.risks) {
        this._risks.set(risk.id, risk);
      }
    }

    this.emit('goal-updated', { goal: updatedGoal, timestamp: new Date() });
    this._logger.info(`Goal updated: ${updatedGoal.title}`, { goalId });

    return updatedGoal;
  }

  async deleteGoal(goalId: string): Promise<void> {
    const goal = this._goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal ${goalId} not found`);
    }

    // Remove associated items
    for (const kpi of goal.kpis) {
      this._kpis.delete(kpi.id);
    }

    for (const milestone of goal.milestones) {
      this._milestones.delete(milestone.id);
    }

    for (const risk of goal.risks) {
      this._risks.delete(risk.id);
    }

    this._goals.delete(goalId);

    this.emit('goal-deleted', { goalId, timestamp: new Date() });
    this._logger.info(`Goal deleted: ${goal.title}`, { goalId });
  }

  getGoal(goalId: string): StrategicGoal | undefined {
    return this._goals.get(goalId);
  }

  getAllGoals(): StrategicGoal[] {
    return Array.from(this._goals.values());
  }

  getActiveGoals(): StrategicGoal[] {
    return Array.from(this._goals.values()).filter(goal => goal.status === 'active');
  }

  getGoalsByCategory(category: string): StrategicGoal[] {
    return Array.from(this._goals.values()).filter(goal => goal.category === category);
  }

  getGoalsByOwner(owner: string): StrategicGoal[] {
    return Array.from(this._goals.values()).filter(goal => goal.owner === owner);
  }

  // ========================================================================
  // KPI Management
  // ========================================================================

  async updateKPI(kpiId: string, current: number): Promise<KPI> {
    const kpi = this._kpis.get(kpiId);
    if (!kpi) {
      throw new Error(`KPI ${kpiId} not found`);
    }

    const previous = kpi.current;
    kpi.current = current;
    kpi.lastUpdated = new Date();

    // Update trend
    if (current > previous) {
      kpi.trend = 'increasing';
    } else if (current < previous) {
      kpi.trend = 'decreasing';
    } else {
      kpi.trend = 'stable';
    }

    // Update status based on target
    const progress = (current / kpi.target) * 100;
    if (progress >= 100) {
      kpi.status = 'exceeded';
    } else if (progress >= 90) {
      kpi.status = 'on-track';
    } else if (progress >= 70) {
      kpi.status = 'at-risk';
    } else {
      kpi.status = 'off-track';
    }

    this._kpis.set(kpiId, kpi);

    // Update goal progress if needed
    await this.updateGoalProgress(kpiId);

    this.emit('kpi-updated', { kpi, timestamp: new Date() });
    this._logger.debug(`KPI updated: ${kpi.name}`, { kpiId, current, target: kpi.target });

    return kpi;
  }

  getKPI(kpiId: string): KPI | undefined {
    return this._kpis.get(kpiId);
  }

  getAllKPIs(): KPI[] {
    return Array.from(this._kpis.values());
  }

  getKPIsByStatus(status: KPI['status']): KPI[] {
    return Array.from(this._kpis.values()).filter(kpi => kpi.status === status);
  }

  // ========================================================================
  // Milestone Management
  // ========================================================================

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<Milestone> {
    const milestone = this._milestones.get(milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found`);
    }

    const updatedMilestone = { ...milestone, ...updates };

    // Check if milestone is overdue
    if (updatedMilestone.status !== 'completed' && updatedMilestone.dueDate < new Date()) {
      updatedMilestone.status = 'overdue';
    }

    this._milestones.set(milestoneId, updatedMilestone);

    // Update goal progress if needed
    await this.updateGoalProgressFromMilestones(milestoneId);

    this.emit('milestone-updated', { milestone: updatedMilestone, timestamp: new Date() });
    this._logger.debug(`Milestone updated: ${updatedMilestone.title}`, { milestoneId });

    return updatedMilestone;
  }

  getMilestone(milestoneId: string): Milestone | undefined {
    return this._milestones.get(milestoneId);
  }

  getAllMilestones(): Milestone[] {
    return Array.from(this._milestones.values());
  }

  getUpcomingMilestones(days: number = 7): Milestone[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return Array.from(this._milestones.values())
      .filter(milestone =>
        milestone.status !== 'completed' &&
        milestone.dueDate <= cutoffDate
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  // ========================================================================
  // Risk Management
  // ========================================================================

  async createRisk(riskData: Omit<Risk, 'id'>): Promise<Risk> {
    const risk: Risk = {
      ...riskData,
      id: uuidv4()
    };

    this._risks.set(risk.id, risk);

    this.emit('risk-created', { risk, timestamp: new Date() });
    this._logger.info(`Risk created: ${risk.title}`, { riskId: risk.id });

    return risk;
  }

  async updateRisk(riskId: string, updates: Partial<Risk>): Promise<Risk> {
    const risk = this._risks.get(riskId);
    if (!risk) {
      throw new Error(`Risk ${riskId} not found`);
    }

    const updatedRisk = { ...risk, ...updates };
    this._risks.set(riskId, updatedRisk);

    this.emit('risk-updated', { risk: updatedRisk, timestamp: new Date() });
    this._logger.debug(`Risk updated: ${updatedRisk.title}`, { riskId });

    return updatedRisk;
  }

  getRisk(riskId: string): Risk | undefined {
    return this._risks.get(riskId);
  }

  getAllRisks(): Risk[] {
    return Array.from(this._risks.values());
  }

  getHighImpactRisks(): Risk[] {
    return Array.from(this._risks.values())
      .filter(risk =>
        risk.impact === 'high' ||
        risk.impact === 'critical' ||
        (risk.probability === 'high' && risk.impact !== 'low')
      );
  }

  // ========================================================================
  // Metrics and Analytics
  // ========================================================================

  async collectMetrics(): Promise<any> {
    const metrics = this.metrics;

    // Add detailed analytics
    const analytics = await this._analytics.generateAnalytics(
      Array.from(this._goals.values()),
      Array.from(this._kpis.values()),
      Array.from(this._milestones.values()),
      Array.from(this._risks.values())
    );

    return {
      ...metrics,
      analytics,
      timestamp: new Date()
    };
  }

  async getHealthScore(): Promise<number> {
    await this.updateHealthScore();
    return this._healthScore;
  }

  async getRecommendations(): Promise<Recommendation[]> {
    const goals = Array.from(this._goals.values());
    const kpis = Array.from(this._kpis.values());
    const milestones = Array.from(this._milestones.values());
    const risks = Array.from(this._risks.values());

    return await this._analytics.generateRecommendations(goals, kpis, milestones, risks);
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async loadInitialData(): Promise<void> {
    // This could load from database or configuration
    // For now, we'll create some sample data
    if (this._goals.size === 0) {
      await this.createSampleGoals();
    }
  }

  private async createSampleGoals(): Promise<void> {
    // Sample goal for demonstration
    const sampleGoal = await this.createGoal({
      title: 'Increase Customer Satisfaction',
      description: 'Improve overall customer satisfaction score by 15% within Q4',
      category: 'customer',
      priority: 'high',
      status: 'active',
      targetValue: 90,
      currentValue: 78,
      unit: 'score',
      deadline: new Date('2024-12-31'),
      progress: 65,
      owner: 'customer-success-team',
      stakeholders: ['product-team', 'support-team', 'engineering-team'],
      kpis: [{
        id: uuidv4(),
        name: 'CSAT Score',
        description: 'Customer Satisfaction Survey Score',
        target: 90,
        current: 78,
        unit: 'score',
        trend: 'increasing',
        weight: 0.4,
        status: 'on-track',
        lastUpdated: new Date()
      }],
      milestones: [{
        id: uuidv4(),
        title: 'Implement Feedback System',
        description: 'Deploy automated customer feedback collection',
        dueDate: new Date('2024-11-15'),
        status: 'in-progress',
        completionPercentage: 75,
        deliverables: ['Feedback forms', 'Analytics dashboard'],
        assignee: 'product-team'
      }],
      dependencies: [],
      risks: [{
        id: uuidv4(),
        title: 'Low response rate',
        description: 'Customers may not respond to satisfaction surveys',
        probability: 'medium',
        impact: 'medium',
        status: 'identified',
        mitigationPlan: 'Offer incentives for survey completion',
        owner: 'customer-success-team'
      }]
    });

    this._logger.info('Sample goals created for demonstration');
  }

  private startMonitoring(): void {
    this._monitoringInterval = setInterval(async () => {
      try {
        await this.updateHealthScore();
        await this.checkForAlerts();
      } catch (error) {
        this._logger.error('Monitoring cycle failed', error);
      }
    }, 60000); // Check every minute
  }

  private stopMonitoring(): void {
    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = undefined;
    }
  }

  private startGoalProcessing(): void {
    // Process goals periodically
    setInterval(async () => {
      try {
        await this.processGoalUpdates();
        await this.checkDeadlines();
        await this.updateRisks();
      } catch (error) {
        this._logger.error('Goal processing cycle failed', error);
      }
    }, 5 * 60000); // Process every 5 minutes
  }

  private async updateHealthScore(): Promise<void> {
    const goals = Array.from(this._goals.values());

    if (goals.length === 0) {
      this._healthScore = 100;
      return;
    }

    let totalScore = 0;
    let weightSum = 0;

    for (const goal of goals) {
      if (goal.status === 'active') {
        let goalScore = 0;

        // Progress score (40% weight)
        goalScore += (goal.progress / 100) * 40;

        // KPI performance (40% weight)
        const kpiScore = this.calculateKPIScore(goal.kpis);
        goalScore += kpiScore * 40;

        // Risk assessment (20% weight)
        const riskScore = this.calculateRiskScore(goal.risks);
        goalScore += riskScore * 20;

        // Apply priority weighting
        const priorityWeight = this.getPriorityWeight(goal.priority);
        totalScore += goalScore * priorityWeight;
        weightSum += priorityWeight;
      }
    }

    this._healthScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 100;
    this._lastHealthCheck = new Date();

    this.emit('health-updated', { score: this._healthScore, timestamp: this._lastHealthCheck });
  }

  private calculateKPIScore(kpis: KPI[]): number {
    if (kpis.length === 0) return 100;

    let totalScore = 0;
    for (const kpi of kpis) {
      switch (kpi.status) {
        case 'exceeded': totalScore += 100; break;
        case 'on-track': totalScore += 85; break;
        case 'at-risk': totalScore += 60; break;
        case 'off-track': totalScore += 30; break;
      }
    }

    return totalScore / kpis.length;
  }

  private calculateRiskScore(risks: Risk[]): number {
    if (risks.length === 0) return 100;

    let riskPenalty = 0;
    for (const risk of risks) {
      if (risk.status === 'identified' || risk.status === 'mitigated') {
        const probabilityWeight = { low: 1, medium: 2, high: 3 }[risk.probability];
        const impactWeight = { low: 1, medium: 2, high: 3, critical: 4 }[risk.impact];
        riskPenalty += probabilityWeight * impactWeight * 5;
      }
    }

    return Math.max(0, 100 - riskPenalty);
  }

  private getPriorityWeight(priority: Priority): number {
    switch (priority) {
      case 'critical': return 3;
      case 'high': return 2;
      case 'medium': return 1.5;
      case 'low': return 1;
      default: return 1;
    }
  }

  private isGoalAtRisk(goal: StrategicGoal): boolean {
    // Check if goal is at risk based on various factors
    if (goal.progress < 30 && this.getDaysUntilDeadline(goal.deadline) < 30) {
      return true;
    }

    // Check KPI status
    const atRiskKPIs = goal.kpis.filter(kpi => kpi.status === 'at-risk' || kpi.status === 'off-track');
    if (atRiskKPIs.length > goal.kpis.length / 2) {
      return true;
    }

    // Check for high-impact risks
    const highImpactRisks = goal.risks.filter(risk =>
      risk.impact === 'high' || risk.impact === 'critical'
    );
    if (highImpactRisks.length > 0) {
      return true;
    }

    return false;
  }

  private getDaysUntilDeadline(deadline: Date): number {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateOverallProgress(): number {
    const activeGoals = Array.from(this._goals.values()).filter(goal => goal.status === 'active');

    if (activeGoals.length === 0) return 0;

    const totalProgress = activeGoals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / activeGoals.length);
  }

  private async updateGoalProgress(kpiId: string): Promise<void> {
    // Find goal containing this KPI
    for (const goal of this._goals.values()) {
      const kpi = goal.kpis.find(k => k.id === kpiId);
      if (kpi) {
        // Recalculate goal progress based on KPIs
        const totalWeight = goal.kpis.reduce((sum, k) => sum + k.weight, 0);
        const weightedProgress = goal.kpis.reduce((sum, k) => {
          const progress = Math.min((k.current / k.target) * 100, 100);
          return sum + (progress * k.weight);
        }, 0);

        goal.progress = Math.round(weightedProgress / totalWeight);
        goal.updatedAt = new Date();

        this._goals.set(goal.id, goal);
        break;
      }
    }
  }

  private async updateGoalProgressFromMilestones(milestoneId: string): Promise<void> {
    // Find goal containing this milestone
    for (const goal of this._goals.values()) {
      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        // Recalculate milestone completion percentage
        const completedMilestones = goal.milestones.filter(m => m.status === 'completed').length;
        const totalMilestones = goal.milestones.length;

        if (totalMilestones > 0) {
          const milestoneProgress = (completedMilestones / totalMilestones) * 100;
          // Weight milestone progress at 30% of total goal progress
          goal.progress = Math.round((goal.progress * 0.7) + (milestoneProgress * 0.3));
          goal.updatedAt = new Date();
        }

        this._goals.set(goal.id, goal);
        break;
      }
    }
  }

  private async processGoalUpdates(): Promise<void> {
    // Process automatic goal updates, status changes, etc.
    const now = new Date();

    for (const goal of this._goals.values()) {
      if (goal.status === 'active') {
        // Check if deadline has passed
        if (goal.deadline < now && goal.progress < 100) {
          goal.status = 'completed';
          this.emit('goal-expired', { goal, timestamp: now });
        }
        // Check if goal is completed
        else if (goal.progress >= 100) {
          goal.status = 'completed';
          goal.currentValue = goal.targetValue;
          this.emit('goal-completed', { goal, timestamp: now });
        }

        this._goals.set(goal.id, goal);
      }
    }
  }

  private async checkDeadlines(): Promise<void> {
    const upcomingDeadlines = this.getUpcomingMilestones(7);

    if (upcomingDeadlines.length > 0) {
      this.emit('upcoming-deadlines', {
        milestones: upcomingDeadlines,
        timestamp: new Date()
      });
    }
  }

  private async updateRisks(): Promise<void> {
    // Auto-update risk statuses based on changes in goals
    for (const risk of this._risks.values()) {
      if (risk.status === 'identified') {
        // Simple heuristic for risk escalation
        if (risk.probability === 'high' && risk.impact === 'critical') {
          risk.status = 'mitigated'; // Should trigger mitigation workflow
          this.emit('risk-escalated', { risk, timestamp: new Date() });
        }
      }
    }
  }

  private async checkForAlerts(): Promise<void> {
    const goals = Array.from(this._goals.values());
    const kpis = Array.from(this._kpis.values());
    const risks = Array.from(this._risks.values());

    // Check for goal-related alerts
    for (const goal of goals) {
      if (this.isGoalAtRisk(goal)) {
        this.emit('alert', {
          type: 'goal',
          level: 'warning',
          title: `Goal at Risk: ${goal.title}`,
          description: `Goal ${goal.title} is showing risk indicators and may need attention`,
          source: 'GoalDimension',
          metadata: { goalId: goal.id, goal }
        });
      }
    }

    // Check for KPI-related alerts
    for (const kpi of kpis) {
      if (kpi.status === 'off-track') {
        this.emit('alert', {
          type: 'goal',
          level: 'error',
          title: `KPI Off Track: ${kpi.name}`,
          description: `KPI ${kpi.name} is significantly off target`,
          source: 'GoalDimension',
          metadata: { kpiId: kpi.id, kpi }
        });
      }
    }

    // Check for risk-related alerts
    const criticalRisks = risks.filter(risk =>
      (risk.impact === 'critical' && risk.probability === 'high') ||
      risk.status === 'mitigated'
    );

    for (const risk of criticalRisks) {
      this.emit('alert', {
        type: 'goal',
        level: 'critical',
        title: `Critical Risk: ${risk.title}`,
        description: risk.description,
        source: 'GoalDimension',
        metadata: { riskId: risk.id, risk }
      });
    }
  }
}