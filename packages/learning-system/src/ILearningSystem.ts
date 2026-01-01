/**
 * YYC³ LearningSystem Interface Definitions
 * 三层学习系统接口定义
 *
 * Defines comprehensive learning system with behavioral, strategic, and knowledge layers
 * 定义包含行为层、策略层和知识层的综合学习系统
 */

export interface ILearningSystem {
  readonly status: 'initializing' | 'active' | 'suspended' | 'error';
  readonly config: LearningSystemConfig;
  readonly metrics: LearningSystemMetrics;
  readonly behavioralLayer: IBehavioralLearningLayer;
  readonly strategicLayer: IStrategicLearningLayer;
  readonly knowledgeLayer: IKnowledgeLearningLayer;

  // Lifecycle Management
  initialize(config: LearningSystemConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;

  // Learning Operations
  learnFromExperience(experience: LearningExperience): Promise<LearningResult>;
  adaptStrategy(newStrategy: AdaptationStrategy): Promise<void>;
  updateKnowledge(knowledge: KnowledgeUpdate): Promise<void>;

  // Behavioral Learning
  recordBehavior(behavior: BehaviorRecord): Promise<void>;
  analyzeBehaviorPatterns(): Promise<BehaviorPattern[]>;
  predictBehavior(context: BehaviorContext): Promise<BehaviorPrediction>;

  // Strategic Learning
  updateStrategicGoals(goals: StrategicGoal[]): Promise<void>;
  evaluateStrategies(): Promise<StrategyEvaluation[]>;
  optimizeStrategy(): Promise<OptimizationResult>;

  // Knowledge Learning
  acquireKnowledge(knowledge: KnowledgeItem): Promise<void>;
  reasonWithKnowledge(query: KnowledgeQuery): Promise<ReasoningResult>;
  generalizeKnowledge(patterns: KnowledgePattern[]): Promise<GeneralizationResult>;

  // Cross-Layer Integration
  integrateInsights(insights: CrossLayerInsight[]): Promise<void>;
  synchronizeLayers(): Promise<SynchronizationResult>;
  optimizeCrossLayerPerformance(): Promise<PerformanceOptimizationResult>;

  // Configuration and Monitoring
  updateConfig(config: Partial<LearningSystemConfig>): Promise<void>;
  getLayerMetrics(): LayerMetrics;
  exportKnowledge(): Promise<KnowledgeExport>;
  importKnowledge(data: KnowledgeExport): Promise<void>;

  // Events
  on(event: 'learned', listener: (result: LearningResult) => void): void;
  on(event: 'adapted', listener: (strategy: AdaptationStrategy) => void): void;
  on(event: 'insight', listener: (insight: CrossLayerInsight) => void): void;
  on(event: 'error', listener: (error: LearningError) => void): void;
}

// Behavioral Learning Layer Interface
export interface IBehavioralLearningLayer {
  readonly status: LayerStatus;
  readonly metrics: BehavioralMetrics;
  readonly patterns: BehaviorPattern[];
  readonly models: PredictionModel[];

  // Behavior Recording
  recordBehavior(behavior: BehaviorRecord): Promise<void>;
  recordBehaviorBatch(behaviors: BehaviorRecord[]): Promise<void>;

  // Pattern Analysis
  analyzePatterns(timeRange?: TimeRange): Promise<BehaviorPattern[]>;
  detectAnomalies(baseline: BehaviorBaseline): Promise<Anomaly[]>;
  classifyBehavior(behavior: BehaviorData): Promise<BehaviorClassification>;

  // Prediction and Modeling
  predictBehavior(context: BehaviorContext): Promise<BehaviorPrediction>;
  updateModel(modelId: string, data: TrainingData): Promise<ModelUpdateResult>;
  evaluateModelPerformance(modelId: string): Promise<ModelPerformance>;

  // Behavioral Adaptation
  adaptBehaviorFeedback(feedback: BehaviorFeedback): Promise<void>;
  optimizeBehavioralResponses(): Promise<OptimizationResult>;
  generateBehavioralInsights(): Promise<BehavioralInsight[]>;

  // Configuration
  updateConfig(config: BehavioralLayerConfig): Promise<void>;
  resetBehaviors(): Promise<void>;
}

// Strategic Learning Layer Interface
export interface IStrategicLearningLayer {
  readonly status: LayerStatus;
  readonly metrics: StrategicMetrics;
  readonly strategies: Strategy[];
  readonly goals: StrategicGoal[];

  // Strategy Management
  createStrategy(strategy: StrategyDefinition): Promise<Strategy>;
  updateStrategy(strategyId: string, updates: StrategyUpdate): Promise<void>;
  evaluateStrategy(strategyId: string): Promise<StrategyEvaluation>;
  optimizeStrategy(strategyId: string): Promise<OptimizationResult>;

  // Goal Management
  setGoals(goals: StrategicGoal[]): Promise<void>;
  trackGoalProgress(goalId: string): Promise<GoalProgress>;
  adjustGoals(adjustments: GoalAdjustment[]): Promise<void>;

  // Decision Making
  makeDecision(context: DecisionContext): Promise<StrategicDecision>;
  evaluateDecisionOutcome(decisionId: string, outcome: DecisionOutcome): Promise<void>;
  learnFromDecision(decisionId: string): Promise<DecisionLearning>;

  // Resource Allocation
  optimizeResourceAllocation(): Promise<ResourceAllocation>;
  predictResourceNeeds(timeHorizon: number): Promise<ResourcePrediction>;

  // Strategic Planning
  generateStrategicPlan(): Promise<StrategicPlan>;
  adaptPlan(planId: string, changes: PlanAdaptation): Promise<void>;
  evaluatePlanEffectiveness(planId: string): Promise<PlanEvaluation>;

  // Configuration
  updateConfig(config: StrategicLayerConfig): Promise<void>;
  resetStrategies(): Promise<void>;
}

// Knowledge Learning Layer Interface
export interface IKnowledgeLearningLayer {
  readonly status: LayerStatus;
  readonly metrics: KnowledgeMetrics;
  readonly knowledge: KnowledgeGraph;
  readonly reasoning: ReasoningEngine;

  // Knowledge Acquisition
  acquireKnowledge(knowledge: KnowledgeItem): Promise<void>;
  extractKnowledge(source: DataSource): Promise<KnowledgeExtractionResult>;
  validateKnowledge(knowledgeId: string): Promise<ValidationResult>;

  // Knowledge Organization
  organizeKnowledge(): Promise<OrganizationResult>;
  categorizeKnowledge(knowledgeId: string): Promise<CategorizationResult>;
  linkKnowledge(link: KnowledgeLink): Promise<void>;

  // Knowledge Reasoning
  reason(query: ReasoningQuery): Promise<ReasoningResult>;
  infer(inference: InferenceRequest): Promise<InferenceResult>;
  explain(explanationRequest: ExplanationRequest): Promise<Explanation>;

  // Knowledge Evolution
  updateKnowledge(knowledgeId: string, update: KnowledgeUpdate): Promise<void>;
  generalizeKnowledge(patterns: KnowledgePattern[]): Promise<GeneralizationResult>;
  pruneKnowledge(criteria: PruningCriteria): Promise<PruningResult>;

  // Knowledge Sharing
  exportKnowledge(format: ExportFormat): Promise<KnowledgeExport>;
  importKnowledge(data: KnowledgeImport): Promise<void>;
  synchronizeKnowledge(source: KnowledgeSource): Promise<void>;

  // Configuration
  updateConfig(config: KnowledgeLayerConfig): Promise<void>;
  resetKnowledge(): Promise<void>;
}

// Core Type Definitions
export interface LearningSystemConfig {
  behavioral: BehavioralLayerConfig;
  strategic: StrategicLayerConfig;
  knowledge: KnowledgeLayerConfig;
  integration: IntegrationConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface BehavioralLayerConfig {
  enabled: boolean;
  recordingEnabled: boolean;
  patternAnalysisEnabled: boolean;
  predictionEnabled: boolean;
  models: ModelConfig[];
  dataRetention: DataRetentionPolicy;
  privacySettings: PrivacySettings;
}

export interface StrategicLayerConfig {
  enabled: boolean;
  goalManagementEnabled: boolean;
  strategyOptimizationEnabled: boolean;
  resourcePlanningEnabled: boolean;
  planningHorizon: number; // days
  evaluationFrequency: number; // hours
  riskAssessmentEnabled: boolean;
}

export interface KnowledgeLayerConfig {
  enabled: boolean;
  reasoningEnabled: boolean;
  knowledgeValidationEnabled: boolean;
  generalizationEnabled: boolean;
  knowledgeGraph: KnowledgeGraphConfig;
  reasoningEngine: ReasoningEngineConfig;
}

export interface IntegrationConfig {
  enabled: boolean;
  synchronizationFrequency: number; // minutes
  crossLayerLearningEnabled: boolean;
  insightGenerationEnabled: boolean;
  optimizationEnabled: boolean;
}

export interface LearningExperience {
  id: string;
  timestamp: number;
  context: ExperienceContext;
  actions: ExperienceAction[];
  outcomes: ExperienceOutcome[];
  feedback: ExperienceFeedback;
  metadata: ExperienceMetadata;
}

export interface ExperienceContext {
  situation: SituationDescription;
  environment: EnvironmentState;
  objectives: Objective[];
  constraints: Constraint[];
  availableResources: Resource[];
}

export interface ExperienceAction {
  id: string;
  type: ActionType;
  parameters: Record<string, any>;
  execution: ExecutionRecord;
  timestamp: number;
}

export interface ExperienceOutcome {
  id: string;
  success: boolean;
  effectiveness: number; // 0-1
  efficiency: number; // 0-1
  sideEffects: SideEffect[];
  measurements: Measurement[];
  timestamp: number;
}

export interface LearningResult {
  experienceId: string;
  timestamp: number;
  behavioralLearnings: BehavioralLearning[];
  strategicLearnings: StrategicLearning[];
  knowledgeLearnings: KnowledgeLearning[];
  confidence: number;
  applicability: ApplicabilityScope;
}

export interface BehaviorRecord {
  id: string;
  timestamp: number;
  actor: Actor;
  action: BehaviorAction;
  context: BehaviorContext;
  outcome: BehaviorOutcome;
  metadata: BehaviorMetadata;
}

export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  pattern: PatternDefinition;
  frequency: Frequency;
  confidence: number;
  predictivePower: number;
  lastObserved: number;
  examples: BehaviorExample[];
}

export interface BehaviorPrediction {
  context: BehaviorContext;
  predictedBehaviors: PredictedBehavior[];
  confidence: number;
  reasoning: PredictionReasoning;
  alternatives: AlternativePrediction[];
}

export interface PredictedBehavior {
  behavior: BehaviorAction;
  probability: number;
  expectedOutcome: ExpectedOutcome;
  timeFrame: TimeFrame;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  objectives: StrategyObjective[];
  tactics: Tactic[];
  resources: ResourceAllocation;
  constraints: Constraint[];
  metrics: StrategyMetrics;
  status: StrategyStatus;
  createdAt: number;
  updatedAt: number;
}

export interface StrategyEvaluation {
  strategyId: string;
  timestamp: number;
  effectiveness: number; // 0-1
  efficiency: number; // 0-1
  sustainability: number; // 0-1
  risk: RiskAssessment;
  recommendations: Recommendation[];
  nextActions: NextAction[];
}

export interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  targetValue: TargetValue;
  currentValue: number;
  deadline: number;
  milestones: Milestone[];
  dependencies: GoalDependency[];
  metrics: GoalMetrics;
}

export interface StrategicDecision {
  id: string;
  context: DecisionContext;
  options: DecisionOption[];
  selectedOption: DecisionOption;
  reasoning: DecisionReasoning;
  confidence: number;
  expectedOutcomes: ExpectedOutcome[];
  risks: DecisionRisk[];
  timestamp: number;
}

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  content: KnowledgeContent;
  source: KnowledgeSource;
  confidence: number;
  validity: ValidityPeriod;
  relationships: KnowledgeRelationship[];
  metadata: KnowledgeMetadata;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  properties: GraphProperties;
  statistics: GraphStatistics;
}

export interface ReasoningResult {
  query: ReasoningQuery;
  conclusion: Conclusion;
  reasoning: ReasoningPath;
  confidence: number;
  evidence: Evidence[];
  assumptions: Assumption[];
  alternatives: AlternativeReasoning[];
}

export interface KnowledgeQuery {
  type: QueryType;
  content: QueryContent;
  context: QueryContext;
  constraints: QueryConstraint[];
  preferences: QueryPreference[];
}

export interface CrossLayerInsight {
  id: string;
  timestamp: number;
  type: InsightType;
  layers: Layer[];
  content: InsightContent;
  confidence: number;
  impact: ImpactAssessment;
  recommendations: InsightRecommendation[];
}

export interface LearningSystemMetrics {
  timestamp: number;
  totalExperiences: number;
  totalLearnings: number;
  averageLearningRate: number;
  systemPerformance: SystemPerformance;
  layerMetrics: LayerMetrics;
  crossLayerMetrics: CrossLayerMetrics;
}

export interface LayerMetrics {
  behavioral: BehavioralMetrics;
  strategic: StrategicMetrics;
  knowledge: KnowledgeMetrics;
}

export interface BehavioralMetrics {
  recordedBehaviors: number;
  identifiedPatterns: number;
  predictionAccuracy: number;
  adaptationRate: number;
  modelPerformance: ModelPerformance[];
}

export interface StrategicMetrics {
  activeStrategies: number;
  goalProgress: GoalProgress[];
  decisionEffectiveness: number;
  resourceUtilization: ResourceUtilization[];
  riskAssessments: RiskAssessment[];
}

export interface KnowledgeMetrics {
  knowledgeItems: number;
  graphNodes: number;
  graphEdges: number;
  reasoningAccuracy: number;
  generalizationQuality: number;
  validationResults: ValidationResult[];
  reasoningQueries: number;
  successfulReasoning: number;
  categorizedItems: number;
}

// Utility Types
export type LayerStatus = 'initializing' | 'active' | 'suspended' | 'error';
export type ActionType = 'response' | 'decision' | 'action' | 'communication' | 'internal';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type StrategyStatus = 'planning' | 'active' | 'paused' | 'completed' | 'failed';
export type KnowledgeType = 'fact' | 'rule' | 'concept' | 'procedure' | 'principle' | 'model';
export type QueryType = 'factual' | 'inferential' | 'explanatory' | 'predictive' | 'prescriptive';
export type InsightType = 'pattern' | 'correlation' | 'causation' | 'optimization' | 'anomaly';

export type Layer = 'behavioral' | 'strategic' | 'knowledge';

export interface AdaptationStrategy {
  id: string;
  type: 'incremental' | 'radical' | 'hybrid';
  changes: Record<string, any>;
  rationale: string;
}

export interface KnowledgeUpdate {
  id: string;
  knowledgeId: string;
  updates: Record<string, any>;
  timestamp: number;
  source: string;
}

export interface OptimizationResult {
  id: string;
  timestamp: number;
  improvements: Record<string, number>;
  recommendations: string[];
  cost: number;
}

export interface KnowledgePattern {
  id: string;
  type: 'similarity' | 'difference' | 'sequence' | 'correlation';
  instances: string[];
  confidence: number;
}

export interface GeneralizationResult {
  id: string;
  generalizations: string[];
  confidence: number;
  coverage: number;
}

export interface SynchronizationResult {
  id: string;
  timestamp: number;
  synchronizedLayers: Layer[];
  conflictsResolved: number;
  status: 'success' | 'partial' | 'failed';
}

export interface PerformanceOptimizationResult {
  id: string;
  timestamp: number;
  layerImprovements: Record<Layer, number>;
  crossLayerImprovements: number;
  resourceSavings: number;
}

export interface KnowledgeExport {
  id: string;
  timestamp: number;
  format: 'json' | 'xml' | 'graphml';
  content: any;
  metadata: Record<string, any>;
}

export interface BehaviorBaseline {
  id: string;
  patterns: BehaviorPattern[];
  statisticalProperties: Record<string, number>;
  timestamp: number;
}

export interface Anomaly {
  id: string;
  type: 'behavioral' | 'strategic' | 'knowledge';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface BehaviorData {
  id: string;
  actions: BehaviorAction[];
  context: BehaviorContext;
  timestamp: number;
}

export interface BehaviorClassification {
  id: string;
  type: string;
  confidence: number;
  timestamp: number;
}

export interface ModelUpdateResult {
  id: string;
  modelId: string;
  performanceChange: number;
  timestamp: number;
  status: 'success' | 'failed';
}

export interface BehaviorFeedback {
  id: string;
  behaviorId: string;
  feedback: 'positive' | 'negative' | 'neutral';
  reason: string;
  timestamp: number;
}

export interface BehavioralInsight {
  id: string;
  type: string;
  content: string;
  confidence: number;
  timestamp: number;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  description: string;
  objectives: StrategyObjective[];
  tactics: Tactic[];
  resources: ResourceAllocation;
  constraints: Constraint[];
}

export interface StrategyUpdate {
  id: string;
  updates: Record<string, any>;
  timestamp: number;
  reason: string;
}

export interface GoalProgress {
  goalId: string;
  progress: number; // 0-1
  milestonesCompleted: number;
  timestamp: number;
}

export interface GoalAdjustment {
  goalId: string;
  adjustments: Record<string, any>;
  reason: string;
  timestamp: number;
}

export interface DecisionOutcome {
  id: string;
  decisionId: string;
  success: boolean;
  effectiveness: number; // 0-1
  lessonsLearned: string[];
  timestamp: number;
}

export interface DecisionLearning {
  id: string;
  decisionId: string;
  learnings: string[];
  improvements: Record<string, any>;
  timestamp: number;
}

export interface ResourceAllocation {
  id: string;
  resources: Resource[];
  allocations: Record<string, number>;
  timestamp: number;
}

export interface ResourcePrediction {
  id: string;
  timeHorizon: number;
  predictions: Record<string, number>;
  confidence: number;
  timestamp: number;
}

export interface StrategicPlan {
  id: string;
  name: string;
  description: string;
  situationAnalysis: any;
  goals: StrategicGoal[];
  strategies: Strategy[];
  timeline: PlanTimeline;
  resources: ResourceAllocation;
  lastEvaluation?: PlanEvaluation;
}

export interface PlanAdaptation {
  id: string;
  planId: string;
  changes: Record<string, any>;
  reason: string;
  timestamp: number;
}

export interface PlanEvaluation {
  id: string;
  planId: string;
  effectiveness: number; // 0-1
  efficiency: number; // 0-1
  recommendations: string[];
  timestamp: number;
}

export interface ReasoningEngine {
  id: string;
  type: 'deductive' | 'inductive' | 'abductive' | 'hybrid';
  parameters: Record<string, any>;
}

export interface DataSource {
  id: string;
  type: 'internal' | 'external';
  location: string;
  format: string;
  accessCredentials?: Record<string, string>;
}

export interface KnowledgeExtractionResult {
  id: string;
  sourceId: string;
  extractedKnowledge: KnowledgeItem[];
  success: boolean;
  timestamp: number;
}

export interface ValidationRule {
  id: string;
  description: string;
  validator: (node: any) => boolean;
}

export interface ValidationResult {
  id: string;
  knowledgeId: string;
  isValid: boolean;
  issues: string[];
  confidence: number;
  timestamp: number;
}

export interface OrganizationResult {
  id: string;
  knowledgeItemsOrganized: number;
  categoriesCreated: number;
  linksCreated: number;
  timestamp: number;
  status: 'success' | 'partial' | 'failed';
}

export interface CategorizationResult {
  id: string;
  knowledgeId: string;
  categories: string[];
  confidence: number;
  timestamp: number;
}

export interface KnowledgeLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
  timestamp: number;
}

export interface ReasoningQuery {
  id: string;
  query: string;
  context: Record<string, any>;
  type: QueryType;
}

export interface InferenceRequest {
  id: string;
  premises: string[];
  rules: string[];
  type: 'forward' | 'backward';
}

export interface InferenceResult {
  id: string;
  conclusions: string[];
  confidence: number;
  steps: string[];
  timestamp: number;
}

export interface ExplanationRequest {
  id: string;
  knowledgeId: string;
  levelOfDetail: 'basic' | 'detailed' | 'technical';
}

export interface Explanation {
  id: string;
  content: string;
  levelOfDetail: 'basic' | 'detailed' | 'technical';
  timestamp: number;
}

export interface PruningCriteria {
  id: string;
  ageThreshold: number;
  confidenceThreshold: number;
  usageThreshold: number;
}

export interface PruningResult {
  id: string;
  knowledgeItemsRemoved: number;
  knowledgeItemsKept: number;
  timestamp: number;
  status: 'success' | 'partial' | 'failed';
}

export interface ExportFormat {
  type: 'json' | 'xml' | 'graphml' | 'csv';
  options?: Record<string, any>;
}

export interface KnowledgeImport {
  id: string;
  format: ExportFormat['type'];
  content: any;
  metadata: Record<string, any>;
  timestamp: number;
}

export interface KnowledgeSource {
  id: string;
  type: 'internal' | 'external';
  name: string;
  reliability: number; // 0-1
}

export interface ExperienceFeedback {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  timestamp: number;
}

export interface ExperienceMetadata {
  id: string;
  tags: string[];
  source: string;
  version: string;
}

export interface ExecutionRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'failed' | 'partial';
  error?: string;
}

export interface BehavioralLearning {
  id: string;
  behaviorId: string;
  learnings: string[];
  confidence: number;
  timestamp: number;
}

export interface StrategicLearning {
  id: string;
  strategyId: string;
  learnings: string[];
  confidence: number;
  timestamp: number;
}

export interface KnowledgeLearning {
  id: string;
  knowledgeId: string;
  learnings: string[];
  confidence: number;
  timestamp: number;
}

export interface ApplicabilityScope {
  contexts: string[];
  timeRange: TimeRange;
  confidence: number;
}

export interface BehaviorMetadata {
  id: string;
  tags: string[];
  source: string;
  version: string;
}

export interface PatternDefinition {
  id: string;
  type: string;
  parameters: Record<string, any>;
  description: string;
}

export interface Frequency {
  count: number;
  rate: number;
  period: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface BehaviorExample {
  id: string;
  behaviorId: string;
  context: BehaviorContext;
  timestamp: number;
}

export interface PredictionReasoning {
  id: string;
  modelId: string;
  features: Record<string, number>;
  confidenceScores: Record<string, number>;
}

export interface AlternativePrediction {
  id: string;
  behavior: BehaviorAction;
  probability: number;
  reason: string;
}

export interface StrategyObjective {
  id: string;
  name: string;
  description: string;
  target: number;
  priority: Priority;
}

export interface Tactic {
  id: string;
  name: string;
  description: string;
  steps: string[];
  resources: Resource[];
}

export interface StrategyMetrics {
  effectiveness: number; // 0-1
  efficiency: number; // 0-1
  risk: number; // 0-1
  lastEvaluation: number;
}

export interface Recommendation {
  id: string;
  type: string;
  content: string;
  priority: Priority;
  impact: number; // 0-1
}

export interface NextAction {
  id: string;
  description: string;
  priority: Priority;
  deadline: number;
  responsible: string;
}

export interface TargetValue {
  value: number;
  unit: string;
  tolerance: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: number;
  completion: number; // 0-1
}

export interface GoalDependency {
  id: string;
  dependentGoalId: string;
  type: 'prerequisite' | 'concurrent' | 'optional';
  strength: number; // 0-1
}

export interface GoalMetrics {
  progressRate: number;
  variance: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface DecisionReasoning {
  id: string;
  factors: Record<string, number>;
  tradeoffs: string[];
  confidenceScores: Record<string, number>;
}

export interface KnowledgeContent {
  id: string;
  type: KnowledgeType;
  content: string;
  format: 'text' | 'structured' | 'graph';
}

export interface ValidityPeriod {
  start: number;
  end: number | null;
  confidence: number;
}

export interface KnowledgeRelationship {
  id: string;
  type: string;
  targetId: string;
  strength: number; // 0-1
}

export interface KnowledgeMetadata {
  id: string;
  tags: string[];
  source: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface GraphProperties {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface GraphStatistics {
  id: string;
  nodes: number;
  edges: number;
  density: number;
  averageDegree: number;
  clusteringCoefficient: number;
}

export interface Conclusion {
  id: string;
  content: string;
  confidence: number;
  timestamp: number;
}

export interface Assumption {
  id: string;
  content: string;
  confidence: number;
  timestamp: number;
}

export interface AlternativeReasoning {
  id: string;
  path: string[];
  conclusion: string;
  confidence: number;
}

export interface QueryContent {
  id: string;
  type: QueryType;
  content: string;
  parameters: Record<string, any>;
}

export interface QueryContext {
  id: string;
  situation: string;
  environment: Record<string, any>;
  constraints: string[];
}

export interface QueryConstraint {
  id: string;
  type: string;
  value: any;
}

export interface QueryPreference {
  id: string;
  type: string;
  weight: number;
}

export interface InsightContent {
  id: string;
  type: InsightType;
  content: string;
  supportingEvidence: string[];
}

export interface ImpactAssessment {
  id: string;
  layerImpacts: Record<Layer, number>;
  overallImpact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface InsightRecommendation {
  id: string;
  type: string;
  content: string;
  priority: Priority;
  impact: number;
}

export interface SystemPerformance {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  responseTime: number;
}

export interface CrossLayerMetrics {
  id: string;
  integrationScore: number;
  synchronizationAccuracy: number;
  insightQuality: number;
  optimizationEffectiveness: number;
}

export interface ResourceUtilization {
  id: string;
  resourceId: string;
  usage: number;
  capacity: number;
  utilizationRate: number;
  timestamp: number;
}

export interface PlanTimeline {
  id: string;
  startDate: number;
  endDate: number;
  milestones: Milestone[];
  dependencies: string[];
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface TimeFrame {
  start: number;
  end: number;
  probability: number;
}

export interface Actor {
  id: string;
  type: ActorType;
  properties: ActorProperties;
}

export type ActorType = 'user' | 'system' | 'agent' | 'service' | 'external';

/**
 * Actor Properties interface
 * 参与者属性接口
 */
export interface ActorProperties {
  id: string;
  name: string;
  description?: string;
  capabilities: string[];
  constraints: string[];
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface BehaviorAction {
  type: string;
  parameters: Record<string, any>;
  timestamp: number;
}

export interface BehaviorContext {
  situation: SituationDescription;
  environment: EnvironmentState;
  history: BehaviorHistory;
  goals: Objective[];
}

/**
 * Behavior History interface
 * 行为历史接口
 */
export interface BehaviorHistory {
  id: string;
  actions: BehaviorAction[];
  timeline: number[];
  contextHistory: BehaviorContext[];
  outcomes: BehaviorOutcome[];
}

export interface BehaviorOutcome {
  result: ActionResult;
  effectiveness: number;
  sideEffects: SideEffect[];
  measurements: Measurement[];
}

export interface Measurement {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface SideEffect {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface PredictionModel {
  id: string;
  type: ModelType;
  parameters: ModelParameters;
  performance: ModelPerformance;
  lastTrained: number;
  trainingData: TrainingStatistics;
}

/**
 * Model Parameters interface
 * 模型参数接口
 */
export interface ModelParameters {
  id: string;
  modelType: ModelType;
  hyperparameters: Record<string, any>;
  configuration: Record<string, any>;
  constraints: Record<string, any>;
  validationMetrics: Record<string, number>;
}

export type ModelType = 'classification' | 'regression' | 'clustering' | 'sequence' | 'reinforcement';

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  customMetrics: Record<string, number>;
}

export interface TrainingStatistics {
  samples: number;
  features: number;
  trainingTime: number;
  epochs: number;
  loss: number[];
}

export interface TrainingData {
  features: FeatureVector[];
  labels: Label[];
  timestamps: number[];
}

export interface FeatureVector {
  values: number[];
  metadata: FeatureMetadata;
}

export interface Label {
  value: any;
  confidence: number;
}

export interface DecisionContext {
  situation: SituationDescription;
  objectives: Objective[];
  constraints: Constraint[];
  availableOptions: DecisionOption[];
  riskTolerance: RiskTolerance;
  timeConstraints: TimeConstraints;
}

export interface DecisionOption {
  id: string;
  description: string;
  expectedOutcomes: ExpectedOutcome[];
  costs: Cost[];
  benefits: Benefit[];
  risks: DecisionRisk[];
  requirements: Requirement[];
}

export interface ExpectedOutcome {
  description: string;
  probability: number;
  impact: Impact;
  timeFrame: TimeFrame;
}

export interface DecisionRisk {
  type: RiskType;
  probability: number;
  impact: RiskImpact;
  mitigation: MitigationStrategy;
}

export type RiskType = 'financial' | 'operational' | 'strategic' | 'reputational' | 'technical';

/**
 * Risk Assessment interface
 * 风险评估接口
 */
export interface RiskAssessment {
  id: string;
  type: RiskType;
  probability: number;
  impact: RiskImpact;
  mitigation: MitigationStrategy;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface MitigationStrategy {
  id: string;
  description: string;
  effectiveness: number;
  cost: number;
  timeline: number;
}

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  content: NodeContent;
  properties: NodeProperties;
  relationships: string[]; // edge IDs
}

export interface KnowledgeEdge {
  id: string;
  source: string; // node ID
  target: string; // node ID
  type: EdgeType;
  weight: number;
  properties: EdgeProperties;
}

export type NodeType = 'entity' | 'concept' | 'event' | 'relationship' | 'attribute';
export type EdgeType = 'causes' | 'enables' | 'precedes' | 'related' | 'instance' | 'property';

export interface ReasoningPath {
  steps: ReasoningStep[];
  logic: LogicalStructure;
  assumptions: Assumption[];
  conclusions: Conclusion[];
}

export interface ReasoningStep {
  operation: ReasoningOperation;
  inputs: ReasoningInput[];
  output: ReasoningOutput;
  confidence: number;
}

export type ReasoningOperation = 'deduction' | 'induction' | 'abduction' | 'analogy' | 'causal';

export interface Evidence {
  source: EvidenceSource;
  content: EvidenceContent;
  reliability: number;
  relevance: number;
  timestamp: number;
}

// Error handling
export interface LearningError {
  id: string;
  timestamp: number;
  type: ErrorType;
  layer: LayerType;
  severity: ErrorSeverity;
  message: string;
  context: ErrorContext;
  stack?: string;
}

export type ErrorType = 'validation' | 'processing' | 'integration' | 'configuration' | 'runtime';
export type LayerType = 'behavioral' | 'strategic' | 'knowledge' | 'integration';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Event types
export type LearningEvent =
  | { type: 'learned'; data: LearningResult }
  | { type: 'adapted'; data: AdaptationStrategy }
  | { type: 'insight'; data: CrossLayerInsight }
  | { type: 'error'; data: LearningError };

// Additional interfaces for completeness
export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface RiskTolerance {
  level: 'low' | 'medium' | 'high';
  threshold: number;
  description: string;
}

export interface TimeConstraints {
  deadline: number;
  duration: number;
  dependencies: string[];
}

export interface Cost {
  id: string;
  type: string;
  amount: number;
  description: string;
  currency: string;
}

export interface Benefit {
  id: string;
  type: string;
  value: number;
  description: string;
  currency: string;
}

export interface Requirement {
  id: string;
  type: string;
  description: string;
  priority: Priority;
  status: string;
  owner: string;
}

export interface Impact {
  id: string;
  type: string;
  description: string;
  severity: number;
  probability: number;
  duration: number;
}

export interface RiskImpact {
  id: string;
  type: string;
  description: string;
  severity: number;
  probability: number;
  mitigationCost: number;
}

export interface MitigationStrategy {
  id: string;
  description: string;
  actions: string[];
  cost: number;
  effectiveness: number;
  timeToImplement: number;
}

export interface NodeContent {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface NodeProperties {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface EdgeProperties {
  id: string;
  type: string;
  source: string;
  target: string;
  weight: number;
  metadata: Record<string, any>;
}

export interface LogicalStructure {
  id: string;
  type: string;
  structure: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ReasoningInput {
  id: string;
  type: string;
  data: Record<string, any>;
  confidence: number;
}

export interface ReasoningOutput {
  id: string;
  type: string;
  data: Record<string, any>;
  confidence: number;
  evidence: string[];
}

export interface EvidenceSource {
  id: string;
  type: string;
  name: string;
  reliability: number;
  relevance: number;
}

export interface EvidenceContent {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface ErrorContext {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  stackTrace: string;
  environment: Record<string, any>;
}

export interface EnvironmentCondition {
  id: string;
  type: string;
  value: any;
  threshold: number;
  status: string;
}

export interface AvailableResource {
  id: string;
  type: string;
  name: string;
  quantity: number;
  availability: number;
  cost: number;
}

export interface ActiveConstraint {
  id: string;
  type: string;
  description: string;
  severity: number;
  status: string;
}

export interface Opportunity {
  id: string;
  type: string;
  description: string;
  potentialValue: number;
  probability: number;
  risk: number;
}

export interface Target {
  id: string;
  name: string;
  description: string;
  type: string;
  value: any;
  unit: string;
  deadline: number;
}

export interface FilterConfig {
  id: string;
  type: string;
  field: string;
  operator: string;
  value: any;
  active: boolean;
}

export interface VisualizationConfig {
  id: string;
  type: string;
  options: Record<string, any>;
  layout: Record<string, any>;
  dataMapping: Record<string, any>;
}

export interface DataClassificationPolicy {
  id: string;
  name: string;
  description: string;
  levels: string[];
  rules: Record<string, any>;
}

export interface PolicyException {
  id: string;
  policyId: string;
  description: string;
  reason: string;
  approvedBy: string;
  approvedAt: number;
  expiresAt: number;
}

export interface SituationDescription {
  type: string;
  description: string;
  severity: number;
  urgency: number;
  stakeholders: string[];
}

export interface EnvironmentState {
  conditions: EnvironmentCondition[];
  resources: AvailableResource[];
  constraints: ActiveConstraint[];
  opportunities: Opportunity[];
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  target: Target;
  deadline?: number;
}

export interface Constraint {
  id: string;
  type: string;
  description: string;
  severity: number;
  impact: string;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  capacity: number;
  availability: number;
  cost: number;
}

export type ResourceType = 'computational' | 'human' | 'financial' | 'temporal' | 'informational';

// Additional supporting interfaces
export interface DataRetentionPolicy {
  retentionPeriod: number; // days
  anonymization: boolean;
  compression: boolean;
  archival: boolean;
}

export interface PrivacySettings {
  dataMinimization: boolean;
  consentManagement: boolean;
  anonymizationLevel: AnonymizationLevel;
  accessControl: AccessControlPolicy;
}

export type AnonymizationLevel = 'none' | 'basic' | 'standard' | 'enhanced' | 'maximum';

export interface AccessControlPolicy {
  roles: Role[];
  permissions: Permission[];
  audit: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  condition?: string;
}

export interface ModelConfig {
  id: string;
  type: ModelType;
  algorithm: string;
  parameters: Record<string, any>;
  training: TrainingConfig;
  evaluation: EvaluationConfig;
}

export interface TrainingConfig {
  algorithm: string;
  hyperparameters: Record<string, any>;
  validation: ValidationConfig;
}

export interface ValidationConfig {
  method: ValidationMethod;
  parameters: Record<string, any>;
  metrics: string[];
}

export type ValidationMethod = 'cross_validation' | 'hold_out' | 'bootstrap' | 'time_series_split';

export interface EvaluationConfig {
  metrics: EvaluationMetric[];
  thresholds: Record<string, number>;
  benchmark: string;
}

export interface EvaluationMetric {
  name: string;
  description: string;
  calculation: string;
  target: number;
}

// Configuration classes
export interface KnowledgeGraphConfig {
  maxNodes: number;
  maxDepth: number;
  updateFrequency: number; // minutes
  consistencyCheck: boolean;
  indexingStrategy: IndexingStrategy;
}

export interface ReasoningEngineConfig {
  algorithm: ReasoningAlgorithm;
  maxDepth: number;
  timeout: number; // milliseconds
  confidenceThreshold: number;
  evidenceRequirements: EvidenceRequirements;
}

export type ReasoningAlgorithm = 'forward_chaining' | 'backward_chaining' | 'graph_based' | 'probabilistic';
export type IndexingStrategy = 'semantic' | 'structural' | 'temporal' | 'hybrid';

export interface EvidenceRequirements {
  minimumReliability: number;
  minimumRelevance: number;
  maximumAge: number; // days
  requiredTypes: EvidenceType[];
}

export type EvidenceType = 'empirical' | 'theoretical' | 'expert' | 'statistical' | 'documentary';

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // minutes
  alertThresholds: AlertThreshold[];
  dataRetention: DataRetentionPolicy;
  dashboards: DashboardConfig[];
}

export interface AlertThreshold {
  metric: string;
  operator: ComparisonOperator;
  value: number;
  severity: AlertSeverity;
  actions: AlertAction[];
}

export type ComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AlertAction {
  type: ActionType;
  parameters: Record<string, any>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  refreshInterval: number; // seconds
  filters: FilterConfig[];
}

export interface WidgetConfig {
  type: WidgetType;
  title: string;
  dataSource: string;
  visualization: VisualizationConfig;
}

export type WidgetType = 'chart' | 'table' | 'metric' | 'heatmap' | 'graph';

export interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  audit: AuditConfig;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: EncryptionAlgorithm;
  keyRotation: KeyRotationPolicy;
  dataClassification: DataClassificationPolicy;
}

export type EncryptionAlgorithm = 'aes_256_gcm' | 'chacha20_poly1305' | 'rsa_oaep';

export interface KeyRotationPolicy {
  frequency: number; // days
  automatic: boolean;
  retention: number; // days
}

export interface AuthenticationConfig {
  method: AuthenticationMethod;
  multiFactor: boolean;
  sessionTimeout: number; // minutes
}

export type AuthenticationMethod = 'password' | 'certificate' | 'token' | 'biometric';

export interface AuthorizationConfig {
  rbac: boolean;
  abac: boolean;
  defaultPolicy: DefaultPolicy;
}

export interface DefaultPolicy {
  action: 'allow' | 'deny';
  exceptions: PolicyException[];
}

export interface AuditConfig {
  enabled: boolean;
  level: AuditLevel;
  retention: number; // days
  format: AuditFormat;
}

export type AuditLevel = 'basic' | 'detailed' | 'comprehensive';
export type AuditFormat = 'json' | 'xml' | 'csv';