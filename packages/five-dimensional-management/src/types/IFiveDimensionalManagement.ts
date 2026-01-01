import { EventEmitter } from 'eventemitter3';
import { z } from 'zod';

// ============================================================================
// Core Management Types
// ============================================================================

export type SystemStatus = 'initializing' | 'active' | 'suspended' | 'error' | 'maintenance';
export type DimensionType = 'goal' | 'technology' | 'data' | 'ux' | 'value';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

// ============================================================================
// Configuration Schema
// ============================================================================

export const ManagementConfigSchema = z.object({
  systemId: z.string().min(1),
  organizationId: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production']),
  updateFrequency: z.number().min(1).max(3600).default(60),
  maxHistoryRecords: z.number().min(100).max(100000).default(10000),
  dimensions: z.object({
    goal: z.object({ enabled: z.boolean().default(true), priority: z.number().default(1) }),
    technology: z.object({ enabled: z.boolean().default(true), priority: z.number().default(2) }),
    data: z.object({ enabled: z.boolean().default(true), priority: z.number().default(3) }),
    ux: z.object({ enabled: z.boolean().default(true), priority: z.number().default(4) }),
    value: z.object({ enabled: z.boolean().default(true), priority: z.number().default(5) })
  }),
  alerts: z.object({
    thresholds: z.object({
      goalDeviation: z.number().min(0).max(1).default(0.15),
      performanceDegradation: z.number().min(0).max(1).default(0.2),
      errorRate: z.number().min(0).max(1).default(0.05),
      userSatisfactionDrop: z.number().min(0).max(1).default(0.1)
    }),
    notifications: z.object({
      email: z.boolean().default(true),
      slack: z.boolean().default(false),
      webhook: z.boolean().default(false),
      dashboard: z.boolean().default(true)
    })
  }),
  optimization: z.object({
    enabled: z.boolean().default(true),
    autoAdjustment: z.boolean().default(false),
    learningEnabled: z.boolean().default(true),
    mlModelPath: z.string().optional()
  }),
  security: z.object({
    level: z.enum(['basic', 'standard', 'enhanced']).default('standard'),
    encryptionEnabled: z.boolean().default(true),
    auditLog: z.boolean().default(true),
    accessControl: z.boolean().default(true)
  })
});

export type ManagementConfig = z.infer<typeof ManagementConfigSchema>;

// ============================================================================
// Goal Dimension Types
// ============================================================================

export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'growth' | 'efficiency' | 'quality' | 'innovation' | 'customer';
  priority: Priority;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  progress: number; // 0-100
  owner: string;
  stakeholders: string[];
  kpis: KPI[];
  milestones: Milestone[];
  dependencies: string[];
  risks: Risk[];
  createdAt: Date;
  updatedAt: Date;
  lastReviewed: Date;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  weight: number; // 0-1
  status: 'on-track' | 'at-risk' | 'off-track' | 'exceeded';
  lastUpdated: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completionPercentage: number;
  deliverables: string[];
  assignee: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'mitigated' | 'accepted' | 'closed';
  mitigationPlan: string;
  owner: string;
}

// ============================================================================
// Technology Dimension Types
// ============================================================================

export interface TechnologyMetrics {
  id: string;
  timestamp: Date;
  performance: PerformanceMetrics;
  reliability: ReliabilityMetrics;
  scalability: ScalabilityMetrics;
  security: SecurityMetrics;
  maintainability: MaintainabilityMetrics;
}

export interface PerformanceMetrics {
  responseTime: number; // ms
  throughput: number; // requests/second
  cpuUtilization: number; // 0-100
  memoryUtilization: number; // 0-100
  diskUtilization: number; // 0-100
  networkLatency: number; // ms
  databaseQueryTime: number; // ms
  cacheHitRate: number; // 0-100
}

export interface ReliabilityMetrics {
  uptime: number; // percentage
  mtbf: number; // mean time between failures (hours)
  mttr: number; // mean time to repair (hours)
  errorRate: number; // errors per thousand requests
  availability: number; // 0-100
  slaCompliance: number; // 0-100
}

export interface ScalabilityMetrics {
  concurrentUsers: number;
  requestsPerMinute: number;
  autoScalingEvents: number;
  resourceElasticity: number; // 0-100
  horizontalScalingCapacity: number;
  verticalScalingHeadroom: number; // 0-100
}

export interface SecurityMetrics {
  vulnerabilities: SecurityVulnerability[];
  securityScore: number; // 0-100
  complianceStatus: ComplianceStatus;
  incidentCount: number;
  authenticationAttempts: number;
  failedAuthentications: number;
  securityEvents: SecurityEvent[];
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'false-positive';
  discoveredAt: Date;
  resolvedAt?: Date;
}

export interface ComplianceStatus {
  gdpr: boolean;
  soc2: boolean;
  iso27001: boolean;
  hipaa: boolean;
  pciDss: boolean;
  lastAudit: Date;
  nextAudit: Date;
}

export interface SecurityEvent {
  id: string;
  type: 'intrusion' | 'data-breach' | 'malware' | 'phishing' | 'ddos' | 'other';
  severity: AlertLevel;
  description: string;
  timestamp: Date;
  resolved: boolean;
  impactAssessment: string;
}

export interface MaintainabilityMetrics {
  codeQuality: number; // 0-100
  technicalDebt: number; // hours
  testCoverage: number; // 0-100
  documentationCoverage: number; // 0-100
  codeComplexity: number; // cyclomatic complexity
  refactorability: number; // 0-100
  deploymentFrequency: number; // deployments per week
  leadTime: number; // hours from commit to deploy
}

// ============================================================================
// Data Dimension Types
// ============================================================================

export interface DataMetrics {
  id: string;
  timestamp: Date;
  quality: DataQualityMetrics;
  governance: DataGovernanceMetrics;
  analytics: DataAnalyticsMetrics;
  pipeline: DataPipelineMetrics;
}

export interface DataQualityMetrics {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  timeliness: number; // 0-100
  validity: number; // 0-100
  uniqueness: number; // 0-100
  overallScore: number; // 0-100
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  id: string;
  type: 'missing' | 'invalid' | 'duplicate' | 'inconsistent' | 'outdated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecords: number;
  dataSource: string;
  discoveredAt: Date;
  status: 'open' | 'investigating' | 'resolved';
}

export interface DataGovernanceMetrics {
  complianceScore: number; // 0-100
  policyAdherence: number; // 0-100
  dataLineage: number; // 0-100
  accessControlCompliance: number; // 0-100
  retentionPolicyCompliance: number; // 0-100
  auditTrailCompleteness: number; // 0-100
}

export interface DataAnalyticsMetrics {
  insightsGenerated: number;
  accuracyRate: number; // 0-100
  processingTime: number; // ms
  modelPerformance: ModelPerformance;
  userAdoptionRate: number; // 0-100
  businessImpact: BusinessImpact;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  lastTrained: Date;
  modelVersion: string;
}

export interface BusinessImpact {
  costSavings: number;
  revenueIncrease: number;
  efficiencyGain: number;
  riskReduction: number;
  customerSatisfaction: number;
}

export interface DataPipelineMetrics {
  throughput: number; // records/second
  latency: number; // ms
  errorRate: number; // 0-100
  successRate: number; // 0-100
  dataFreshness: number; // minutes
  pipelineHealth: number; // 0-100
  activePipelines: number;
  failedJobs: number;
}

// ============================================================================
// UX Dimension Types
// ============================================================================

export interface UXMetrics {
  id: string;
  timestamp: Date;
  usability: UsabilityMetrics;
  accessibility: AccessibilityMetrics;
  performance: UXPerformanceMetrics;
  satisfaction: UserSatisfactionMetrics;
  engagement: UserEngagementMetrics;
}

export interface UsabilityMetrics {
  taskSuccessRate: number; // 0-100
  taskCompletionTime: number; // seconds
  errorRate: number; // 0-100
  learnability: number; // 0-100
  efficiency: number; // 0-100
  memorability: number; // 0-100
  satisfaction: number; // 0-100
  systemUsabilityScale: number; // 0-100
}

export interface AccessibilityMetrics {
  wcagCompliance: number; // 0-100
  screenReaderCompatibility: number; // 0-100
  keyboardNavigation: number; // 0-100
  colorContrast: number; // 0-100
  alternativeText: number; // 0-100
  focusManagement: number; // 0-100
  overallAccessibility: number; // 0-100
  issues: AccessibilityIssue[];
}

export interface AccessibilityIssue {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  wcagGuideline: string;
  element: string;
  page: string;
  discoveredAt: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface UXPerformanceMetrics {
  pageLoadTime: number; // ms
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  cumulativeLayoutShift: number;
  firstInputDelay: number; // ms
  timeToInteractive: number; // ms
  coreWebVitalsScore: number; // 0-100
}

export interface UserSatisfactionMetrics {
  overallSatisfaction: number; // 0-100
  netPromoterScore: number; // -100 to 100
  customerEffortScore: number; // 0-100
  userRating: number; // 0-5
  feedbackVolume: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number; // minutes
  pagesPerSession: number;
  bounceRate: number; // 0-100
  retentionRate: number; // 0-100
  featureAdoption: FeatureAdoption[];
  userJourneys: UserJourney[];
}

export interface FeatureAdoption {
  featureId: string;
  featureName: string;
  adoptionRate: number; // 0-100
  usageFrequency: number; // uses per user per day
  userSatisfaction: number; // 0-100
  dropOffRate: number; // 0-100
}

export interface UserJourney {
  id: string;
  name: string;
  steps: JourneyStep[];
  conversionRate: number; // 0-100
  averageDuration: number; // minutes
  dropOffPoints: string[];
  userSegment: string;
}

export interface JourneyStep {
  stepId: string;
  name: string;
  completionRate: number; // 0-100
  averageTime: number; // seconds
  errors: number;
  dropOffRate: number; // 0-100
}

// ============================================================================
// Value Dimension Types
// ============================================================================

export interface ValueMetrics {
  id: string;
  timestamp: Date;
  financial: FinancialMetrics;
  operational: OperationalMetrics;
  strategic: StrategicValueMetrics;
  customer: CustomerValueMetrics;
  innovation: InnovationMetrics;
}

export interface FinancialMetrics {
  revenue: number;
  profit: number;
  roi: number; // return on investment
  costSavings: number;
  totalCostOfOwnership: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  grossMargin: number; // percentage
  netMargin: number; // percentage
}

export interface OperationalMetrics {
  efficiency: number; // 0-100
  productivity: number; // 0-100
  automationRate: number; // 0-100
  processOptimization: number; // 0-100
  resourceUtilization: number; // 0-100
  timeToMarket: number; // days
  operationalExcellence: number; // 0-100
  qualityImprovement: number; // 0-100
}

export interface StrategicValueMetrics {
  marketPosition: number; // 0-100
  competitiveAdvantage: number; // 0-100
  brandValue: number; // 0-100
  innovationIndex: number; // 0-100
  strategicAlignment: number; // 0-100
  riskMitigation: number; // 0-100
  longTermValue: number; // 0-100
  sustainability: number; // 0-100
}

export interface CustomerValueMetrics {
  customerSatisfaction: number; // 0-100
  customerRetention: number; // 0-100
  customerLoyalty: number; // 0-100
  netPromoterScore: number; // -100 to 100
  customerEffortScore: number; // 0-100
  customerSuccessRate: number; // 0-100
  customerLifetimeValue: number;
  customerChurnRate: number; // 0-100
}

export interface InnovationMetrics {
  innovationRate: number; // new features per quarter
  timeToInnovation: number; // days from idea to implementation
  innovationSuccessRate: number; // 0-100
  patentApplications: number;
  researchInvestment: number;
  rdEffectiveness: number; // 0-100
  technologyAdoption: number; // 0-100
  breakthroughs: number;
}

// ============================================================================
// System-wide Types
// ============================================================================

export interface ManagementMetrics {
  timestamp: Date;
  systemHealth: number; // 0-100
  overallPerformance: number; // 0-100
  alertCount: number;
  activeIssues: number;
  resolvedIssues: number;
  integrationHealth: IntegrationHealth;
  systemLoad: SystemLoad;
  responseTime: number; // ms
  uptime: number; // percentage
}

export interface IntegrationHealth {
  connectedSystems: number;
  healthyConnections: number;
  failedConnections: number;
  dataSyncStatus: 'synced' | 'syncing' | 'error';
  lastSyncTime: Date;
  apiResponseTime: number; // ms
}

export interface SystemLoad {
  cpuUtilization: number; // 0-100
  memoryUtilization: number; // 0-100
  diskUtilization: number; // 0-100
  networkUtilization: number; // 0-100
  activeProcesses: number;
  queueSize: number;
  throughput: number; // operations per second
}

export interface Alert {
  id: string;
  type: DimensionType;
  level: AlertLevel;
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actionRequired: boolean;
  actions: AlertAction[];
  metadata: Record<string, any>;
}

export interface AlertAction {
  id: string;
  type: 'manual' | 'automated';
  description: string;
  executed: boolean;
  executedBy?: string;
  executedAt?: Date;
  result?: string;
}

export interface DashboardData {
  summary: ExecutiveSummary;
  dimensions: {
    goal: GoalDashboardData;
    technology: TechnologyDashboardData;
    data: DataDashboardData;
    ux: UXDashboardData;
    value: ValueDashboardData;
  };
  trends: TrendData[];
  alerts: Alert[];
  recommendations: Recommendation[];
}

export interface ExecutiveSummary {
  overallScore: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  keyHighlights: string[];
  criticalIssues: string[];
  topRecommendations: string[];
  lastUpdated: Date;
}

export interface GoalDashboardData {
  totalGoals: number;
  completedGoals: number;
  onTrackGoals: number;
  atRiskGoals: number;
  overallProgress: number; // 0-100
  topPriorities: StrategicGoal[];
  upcomingDeadlines: StrategicGoal[];
}

export interface TechnologyDashboardData {
  systemHealth: number; // 0-100
  performance: PerformanceMetrics;
  reliability: ReliabilityMetrics;
  securityScore: number; // 0-100
  technicalDebt: number; // hours
  uptime: number; // percentage
}

export interface DataDashboardData {
  dataQuality: number; // 0-100
  governanceScore: number; // 0-100
  analyticsAccuracy: number; // 0-100
  pipelineHealth: number; // 0-100
  activeIssues: number;
  dataVolume: number; // GB
}

export interface UXDashboardData {
  userSatisfaction: number; // 0-100
  systemUsability: number; // 0-100
  accessibilityScore: number; // 0-100
  performanceScore: number; // 0-100
  netPromoterScore: number; // -100 to 100
  activeUsers: number;
}

export interface ValueDashboardData {
  roi: number; // percentage
  costSavings: number;
  revenueImpact: number;
  efficiencyGain: number; // 0-100
  customerSatisfaction: number; // 0-100
  marketPosition: number; // 0-100
}

export interface TrendData {
  metric: string;
  dimension: DimensionType;
  timeRange: { start: Date; end: Date };
  dataPoints: DataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  significance: 'high' | 'medium' | 'low';
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  type: DimensionType;
  priority: Priority;
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: Date;
  validUntil: Date;
}

// ============================================================================
// Core Interfaces
// ============================================================================

export interface IFiveDimensionalManagement extends EventEmitter {
  readonly status: SystemStatus;
  readonly config: ManagementConfig;
  readonly metrics: ManagementMetrics;
  readonly dashboard: DashboardData;

  // Lifecycle
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  shutdown(): Promise<void>;

  // Configuration
  updateConfig(config: Partial<ManagementConfig>): Promise<void>;
  getConfig(): ManagementConfig;

  // Dimension Management
  getDimension<T extends DimensionType>(type: T): any;
  enableDimension(type: DimensionType): Promise<void>;
  disableDimension(type: DimensionType): Promise<void>;

  // Data Collection
  collectMetrics(): Promise<void>;
  getMetrics(timeRange?: { start: Date; end: Date }): Promise<ManagementMetrics>;

  // Alert Management
  getAlerts(filters?: AlertFilters): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  resolveAlert(alertId: string, userId: string, resolution: string): Promise<void>;

  // Dashboard
  getDashboardData(): Promise<DashboardData>;
  refreshDashboard(): Promise<void>;

  // Recommendations
  getRecommendations(): Promise<Recommendation[]>;
  generateRecommendations(): Promise<Recommendation[]>;
  applyRecommendation(recommendationId: string): Promise<void>;

  // Reports
  generateReport(reportConfig: ReportConfig): Promise<Report>;

  // Events
  emit(event: 'alert' | 'metric-update' | 'dimension-change' | 'system-status-change', data: any): boolean;
  on(event: string, listener: (...args: any[]) => void): this;
}

export interface IDimension extends EventEmitter {
  readonly type: DimensionType;
  readonly enabled: boolean;
  readonly metrics: any;
  readonly status: SystemStatus;

  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  collectMetrics(): Promise<any>;
  getHealthScore(): Promise<number>;
  getRecommendations(): Promise<Recommendation[]>;
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface AlertFilters {
  type?: DimensionType;
  level?: AlertLevel;
  status?: 'active' | 'acknowledged' | 'resolved';
  dateRange?: { start: Date; end: Date };
  source?: string;
}

export interface ReportConfig {
  type: 'executive' | 'dimensional' | 'detailed' | 'custom';
  dimensions?: DimensionType[];
  timeRange: { start: Date; end: Date };
  format: 'pdf' | 'excel' | 'json' | 'html';
  includeCharts: boolean;
  includeRecommendations: boolean;
  customFields?: Record<string, any>;
}

export interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  format: string;
  size: number; // bytes
  downloadUrl: string;
  metadata: Record<string, any>;
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const StrategicGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.enum(['revenue', 'growth', 'efficiency', 'quality', 'innovation', 'customer']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  targetValue: z.number(),
  currentValue: z.number(),
  unit: z.string(),
  deadline: z.date(),
  progress: z.number().min(0).max(100),
  owner: z.string().min(1),
  stakeholders: z.array(z.string()),
  kpis: z.array(z.any()),
  milestones: z.array(z.any()),
  dependencies: z.array(z.string()),
  risks: z.array(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastReviewed: z.date()
});

export const AlertSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['goal', 'technology', 'data', 'ux', 'value']),
  level: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  source: z.string().min(1),
  timestamp: z.date(),
  acknowledged: z.boolean(),
  acknowledgedBy: z.string().optional(),
  acknowledgedAt: z.date().optional(),
  resolved: z.boolean(),
  resolvedBy: z.string().optional(),
  resolvedAt: z.date().optional(),
  actionRequired: z.boolean(),
  actions: z.array(z.any()),
  metadata: z.record(z.any())
});

// Export all types for external use
export type {
  ManagementConfig,
  StrategicGoal,
  KPI,
  Milestone,
  Risk,
  TechnologyMetrics,
  PerformanceMetrics,
  ReliabilityMetrics,
  ScalabilityMetrics,
  SecurityMetrics,
  MaintainabilityMetrics,
  DataMetrics,
  DataQualityMetrics,
  DataGovernanceMetrics,
  DataAnalyticsMetrics,
  DataPipelineMetrics,
  UXMetrics,
  UsabilityMetrics,
  AccessibilityMetrics,
  UXPerformanceMetrics,
  UserSatisfactionMetrics,
  UserEngagementMetrics,
  ValueMetrics,
  FinancialMetrics,
  OperationalMetrics,
  StrategicValueMetrics,
  CustomerValueMetrics,
  InnovationMetrics,
  ManagementMetrics,
  Alert,
  DashboardData,
  ExecutiveSummary,
  TrendData,
  Recommendation,
  Report,
  ReportConfig
};