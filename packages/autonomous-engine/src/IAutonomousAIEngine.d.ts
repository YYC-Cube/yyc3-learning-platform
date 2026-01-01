/**
 * YYC³ 自治AI引擎接口定义
 * 基于五高五标五化设计原则的企业级自治AI系统核心接口
 *
 * 设计原则:
 * - 五高: 高性能/高可用/高并发/高扩展/高安全
 * - 五标: 标准化/标度化/标控化/标评化/标优化
 * - 五化: 智能化/自动化/模块化/可视化/生态化
 */
export interface IAutonomousAIEngine {
    readonly status: 'initializing' | 'active' | 'suspended' | 'error';
    readonly capabilities: EngineCapabilities;
    readonly metrics: EngineMetrics;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    updateConfiguration(_config: Partial<EngineConfiguration>): Promise<void>;
    addEventListener(_event: EngineEvent, _handler: EventHandler): void;
    removeEventListener(_event: EngineEvent, _handler: EventHandler): void;
    emit(_event: EngineEvent, _payload: unknown): void;
    setGoal(_goal: Goal): Promise<void>;
    getActiveGoals(): readonly Goal[];
    updateGoalProgress(_goalId: string, _progress: number): Promise<void>;
    completeGoal(_goalId: string, _result: unknown): Promise<void>;
    executeTask(_task: Task): Promise<TaskResult>;
    scheduleTask(_task: Task, _schedule?: ScheduleConfig): Promise<string>;
    cancelTask(_taskId: string): Promise<void>;
    getTaskStatus(_taskId: string): TaskStatus;
    allocateResources(_requirements: ResourceRequirements): Promise<ResourceAllocation>;
    releaseResources(_allocationId: string): Promise<void>;
    getResourceUtilization(): ResourceUtilization;
    makeDecision(_context: DecisionContext, _options: DecisionOption[]): Promise<Decision>;
    evaluateDecision(_decisionId: string): Promise<DecisionEvaluation>;
    learnFromExperience(_experience: Experience): Promise<void>;
    adaptStrategy(_newStrategy: Strategy): Promise<void>;
    getLearningProgress(): LearningProgress;
    sendMessage(_message: EngineMessage): Promise<void>;
    receiveMessages(): readonly EngineMessage[];
    collaborateWith(_otherEngines: readonly string[], _task: CollaborativeTask): Promise<CollaborativeResult>;
    getHealthStatus(): HealthStatus;
    getDiagnosticInfo(): DiagnosticInfo;
    exportMetrics(): Promise<EngineMetrics>;
}
export interface EngineCapabilities {
    eventDriven: boolean;
    goalDriven: boolean;
    multiModal: boolean;
    distributed: boolean;
    learningEnabled: boolean;
    maxConcurrentTasks: number;
    supportedResourceTypes: readonly ResourceType[];
    decisionMakingModels: readonly DecisionModel[];
    integrationPoints: readonly IntegrationPoint[];
}
export interface EngineMetrics {
    uptime: number;
    totalTasksExecuted: number;
    successfulTasks: number;
    failedTasks: number;
    averageTaskDuration: number;
    resourceUtilization: ResourceUtilization;
    decisionAccuracy: number;
    learningRate: number;
    collaborationScore: number;
    errorRate: number;
    throughput: number;
    latency: LatencyMetrics;
    memory: MemoryMetrics;
    performance: PerformanceMetrics;
}
export interface EngineConfiguration {
    maxConcurrentTasks: number;
    resourceLimits: ResourceLimits;
    learningConfig: LearningConfiguration;
    decisionMakingConfig: DecisionMakingConfiguration;
    collaborationConfig: CollaborationConfiguration;
    monitoringConfig: MonitoringConfiguration;
    securityConfig: SecurityConfiguration;
    integrationConfig: IntegrationConfiguration;
}
export type EngineEvent = 'engine.started' | 'engine.stopped' | 'engine.error' | 'goal.created' | 'goal.updated' | 'goal.completed' | 'task.started' | 'task.completed' | 'task.failed' | 'decision.made' | 'resource.allocated' | 'resource.released' | 'learning.completed' | 'collaboration.started' | 'collaboration.completed' | 'health.status.changed';
export type EventHandler = (_payload: unknown) => void | Promise<void>;
export interface Goal {
    id: string;
    name: string;
    description: string;
    type: GoalType;
    priority: Priority;
    status: GoalStatus;
    objective: string;
    keyResults: readonly KeyResult[];
    constraints: readonly Constraint[];
    deadline?: Date;
    dependencies: readonly string[];
    metadata: GoalMetadata;
    createdAt: Date;
    updatedAt: Date;
    progress: number;
}
export type GoalType = 'performance' | 'efficiency' | 'quality' | 'innovation' | 'collaboration' | 'learning' | 'resource_optimization' | 'user_experience';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface KeyResult {
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    weight: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
export interface Constraint {
    type: 'resource' | 'time' | 'quality' | 'security' | 'compliance';
    description: string;
    parameters: Record<string, unknown>;
    severity: 'warning' | 'error' | 'critical';
}
export interface GoalMetadata {
    source: 'user' | 'system' | 'collaboration' | 'learning';
    tags: readonly string[];
    category: string;
    estimatedDuration?: number;
    requiredResources: readonly ResourceType[];
    successCriteria: readonly string[];
}
export interface Task {
    id: string;
    name: string;
    description: string;
    type: TaskType;
    priority: Priority;
    status: TaskStatus;
    goalId?: string;
    dependencies: readonly string[];
    requirements: ResourceRequirements;
    steps: readonly TaskStep[];
    metadata: TaskMetadata;
    createdAt: Date;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export type TaskType = 'computation' | 'analysis' | 'decision' | 'communication' | 'learning' | 'coordination' | 'monitoring' | 'optimization';
export type TaskStatus = 'pending' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface TaskStep {
    id: string;
    name: string;
    description: string;
    type: StepType;
    parameters: Record<string, unknown>;
    dependencies: readonly string[];
    estimatedDuration: number;
    requiredResources: readonly ResourceType[];
}
export type StepType = 'data_processing' | 'model_inference' | 'api_call' | 'file_operation' | 'communication' | 'validation' | 'transformation';
export interface TaskMetadata {
    source: string;
    category: string;
    tags: readonly string[];
    retryPolicy: RetryPolicy;
    timeout: number;
    qualityRequirements: QualityRequirements;
}
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    baseDelay: number;
    maxDelay: number;
}
export interface QualityRequirements {
    accuracy?: number;
    precision?: number;
    recall?: number;
    latency?: number;
    throughput?: number;
}
export interface ScheduleConfig {
    type: 'immediate' | 'delayed' | 'recurring';
    startTime?: Date;
    interval?: number;
    maxOccurrences?: number;
}
export interface TaskResult {
    taskId: string;
    status: TaskStatus;
    result: unknown;
    metadata: ResultMetadata;
    metrics: TaskMetrics;
    artifacts: readonly Artifact[];
}
export interface ResultMetadata {
    executionTime: number;
    resourceUsage: ResourceUsage;
    quality: QualityMetrics;
    errors: readonly ErrorInfo[];
    warnings: readonly WarningInfo[];
}
export interface TaskMetrics {
    duration: number;
    resourceUtilization: ResourceUtilization;
    stepMetrics: readonly StepMetric[];
    performance: PerformanceMetrics;
}
export interface StepMetric {
    stepId: string;
    duration: number;
    status: TaskStatus;
    resourceUsage: ResourceUsage;
    result?: unknown;
}
export interface Artifact {
    id: string;
    name: string;
    type: ArtifactType;
    content: unknown;
    metadata: ArtifactMetadata;
}
export type ArtifactType = 'data' | 'model' | 'report' | 'log' | 'visualization' | 'configuration' | 'documentation';
export interface ArtifactMetadata {
    format: string;
    size: number;
    checksum: string;
    createdAt: Date;
    tags: readonly string[];
}
export interface ResourceRequirements {
    cpu: ResourceRequirement;
    memory: ResourceRequirement;
    storage: ResourceRequirement;
    network: ResourceRequirement;
    specialized: readonly SpecializedResource[];
}
export interface ResourceRequirement {
    min: number;
    max?: number;
    preferred?: number;
    unit: string;
}
export interface SpecializedResource {
    type: string;
    requirements: Record<string, unknown>;
}
export type ResourceType = 'cpu' | 'memory' | 'storage' | 'network' | 'gpu' | 'model' | 'database' | 'cache' | 'queue';
export interface ResourceAllocation {
    id: string;
    resources: AllocatedResource[];
    expiresAt: Date;
    status: 'active' | 'expired' | 'released';
}
export interface AllocatedResource {
    type: ResourceType;
    amount: number;
    unit: string;
    utilization: number;
}
export interface ResourceUtilization {
    cpu: UtilizationMetric;
    memory: UtilizationMetric;
    storage: UtilizationMetric;
    network: UtilizationMetric;
    specialized: readonly SpecializedUtilization[];
}
export interface UtilizationMetric {
    allocated: number;
    used: number;
    available: number;
    percentage: number;
}
export interface SpecializedUtilization {
    type: string;
    utilization: Record<string, number>;
}
export interface ResourceLimits {
    cpu: ResourceLimit;
    memory: ResourceLimit;
    storage: ResourceLimit;
    network: ResourceLimit;
    specialized: readonly SpecializedResourceLimit[];
}
export interface ResourceLimit {
    hard: number;
    soft: number;
    unit: string;
}
export interface SpecializedResourceLimit {
    type: string;
    limits: Record<string, ResourceLimit>;
}
export interface ResourceUsage {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
    specialized: Record<string, number>;
}
export interface DecisionContext {
    id: string;
    type: DecisionType;
    priority: Priority;
    description: string;
    parameters: Record<string, unknown>;
    constraints: readonly Constraint[];
    objectives: readonly Objective[];
    stakeholders: readonly string[];
    deadline?: Date;
    metadata: DecisionMetadata;
}
export type DecisionType = 'resource_allocation' | 'task_prioritization' | 'strategy_selection' | 'risk_assessment' | 'optimization' | 'collaboration' | 'learning' | 'adaptation';
export interface Objective {
    name: string;
    weight: number;
    target: number;
    unit: string;
    optimization: 'minimize' | 'maximize';
}
export interface DecisionMetadata {
    source: string;
    category: string;
    tags: readonly string[];
    historicalData: boolean;
    requiredConfidence: number;
}
export interface DecisionOption {
    id: string;
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    expectedOutcomes: readonly ExpectedOutcome[];
    risks: readonly Risk[];
    costs: Cost;
    benefits: Benefit;
    confidence: number;
}
export interface ExpectedOutcome {
    metric: string;
    value: number;
    probability: number;
    timeHorizon: number;
}
export interface Risk {
    type: string;
    description: string;
    probability: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
}
export interface Cost {
    computational: number;
    financial: number;
    time: number;
    opportunity: number;
}
export interface Benefit {
    efficiency: number;
    quality: number;
    innovation: number;
    collaboration: number;
}
export interface Decision {
    id: string;
    contextId: string;
    selectedOption: string;
    reasoning: DecisionReasoning;
    confidence: number;
    alternatives: readonly string[];
    expectedValue: number;
    riskAssessment: RiskAssessment;
    implementationPlan: ImplementationPlan;
    timestamp: Date;
}
export interface DecisionReasoning {
    criteria: readonly string[];
    weights: Record<string, number>;
    scores: Record<string, number>;
    methodology: DecisionMethodology;
    assumptions: readonly string[];
}
export type DecisionMethodology = 'utility_theory' | 'analytic_hierarchy_process' | 'multi_criteria_decision' | 'game_theory' | 'machine_learning' | 'expert_system' | 'hybrid';
export interface RiskAssessment {
    overall: RiskLevel;
    factors: readonly RiskFactor[];
    mitigation: readonly MitigationStrategy[];
    contingencyPlans: readonly ContingencyPlan[];
}
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export interface RiskFactor {
    factor: string;
    probability: number;
    impact: number;
    severity: RiskLevel;
}
export interface MitigationStrategy {
    risk: string;
    strategy: string;
    effectiveness: number;
    cost: number;
    timeline: number;
}
export interface ContingencyPlan {
    trigger: string;
    action: string;
    probability: number;
    impact: string;
}
export interface ImplementationPlan {
    phases: readonly ImplementationPhase[];
    resources: ResourceRequirements;
    timeline: Timeline;
    dependencies: readonly string[];
    milestones: readonly Milestone[];
}
export interface ImplementationPhase {
    id: string;
    name: string;
    description: string;
    duration: number;
    dependencies: readonly string[];
    deliverables: readonly string[];
    risks: readonly string[];
}
export interface Timeline {
    start: Date;
    end: Date;
    milestones: readonly Milestone[];
    criticalPath: readonly string[];
}
export interface Milestone {
    id: string;
    name: string;
    date: Date;
    deliverables: readonly string[];
    criteria: readonly string[];
}
export interface DecisionEvaluation {
    decisionId: string;
    actualOutcomes: readonly ActualOutcome[];
    effectiveness: EffectivenessMetrics;
    lessons: readonly Lesson[];
    recommendations: readonly string[];
    timestamp: Date;
}
export interface ActualOutcome {
    metric: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
    explanation: string;
}
export interface EffectivenessMetrics {
    goalAlignment: number;
    efficiency: number;
    stakeholderSatisfaction: number;
    innovation: number;
    adaptability: number;
}
export interface Lesson {
    situation: string;
    observation: string;
    insight: string;
    actionability: Actionability;
}
export type Actionability = 'immediate' | 'short_term' | 'long_term' | 'strategic';
export type DecisionModel = 'utility_based' | 'rule_based' | 'learning_based' | 'hybrid' | 'consensus' | 'optimization' | 'simulation';
export interface Experience {
    id: string;
    type: ExperienceType;
    context: ExperienceContext;
    situation: Situation;
    actions: readonly Action[];
    outcomes: readonly Outcome[];
    feedback: Feedback;
    timestamp: Date;
    metadata: ExperienceMetadata;
}
export type ExperienceType = 'task_execution' | 'decision_making' | 'problem_solving' | 'collaboration' | 'adaptation' | 'failure' | 'success' | 'optimization';
export interface ExperienceContext {
    goals: readonly string[];
    constraints: readonly Constraint[];
    resources: ResourceUtilization;
    environment: EnvironmentContext;
    stakeholders: readonly string[];
}
export interface EnvironmentContext {
    type: 'development' | 'staging' | 'production';
    load: number;
    conditions: Record<string, unknown>;
    externalFactors: readonly string[];
}
export interface Situation {
    description: string;
    complexity: ComplexityLevel;
    uncertainty: UncertaintyLevel;
    novelty: NoveltyLevel;
    criticality: CriticalityLevel;
}
export type ComplexityLevel = 'simple' | 'complicated' | 'complex' | 'chaotic';
export type UncertaintyLevel = 'low' | 'medium' | 'high' | 'extreme';
export type NoveltyLevel = 'known' | 'familiar' | 'new' | 'unknown';
export type CriticalityLevel = 'low' | 'medium' | 'high' | 'critical';
export interface Action {
    id: string;
    type: ActionType;
    description: string;
    parameters: Record<string, unknown>;
    reasoning: string;
    expectedOutcome?: string;
}
export type ActionType = 'analysis' | 'planning' | 'execution' | 'coordination' | 'communication' | 'adaptation' | 'optimization';
export interface Outcome {
    id: string;
    type: OutcomeType;
    value: unknown;
    quality: QualityLevel;
    duration: number;
    resourceUsage: ResourceUsage;
}
export type OutcomeType = 'success' | 'failure' | 'partial_success' | 'unexpected' | 'learning_opportunity';
export type QualityLevel = 'excellent' | 'good' | 'satisfactory' | 'poor' | 'unacceptable';
export interface Feedback {
    source: string;
    type: FeedbackType;
    content: string;
    sentiment: Sentiment;
    confidence: number;
    actionability: Actionability;
}
export type FeedbackType = 'user' | 'system' | 'peer' | 'automated' | 'expert' | 'performance';
export type Sentiment = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
export interface ExperienceMetadata {
    tags: readonly string[];
    category: string;
    importance: ImportanceLevel;
    applicability: readonly string[];
    sharingConsent: boolean;
}
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';
export interface Strategy {
    id: string;
    name: string;
    description: string;
    type: StrategyType;
    objectives: readonly Objective[];
    tactics: readonly Tactic[];
    evaluation: StrategyEvaluation;
    adaptation: AdaptationPlan;
    metadata: StrategyMetadata;
}
export type StrategyType = 'performance' | 'efficiency' | 'quality' | 'adaptability' | 'collaboration' | 'learning' | 'risk_management' | 'innovation';
export interface Tactic {
    id: string;
    name: string;
    description: string;
    conditions: readonly Condition[];
    actions: readonly Action[];
    expectedResults: readonly ExpectedResult[];
    fallback: string;
}
export interface Condition {
    type: string;
    operator: ComparisonOperator;
    value: unknown;
    threshold: number;
}
export type ComparisonOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
export interface ExpectedResult {
    metric: string;
    expectedValue: number;
    tolerance: number;
    timeFrame: number;
}
export interface StrategyEvaluation {
    successCriteria: readonly SuccessCriterion[];
    metrics: readonly StrategyMetric[];
    reviewSchedule: ReviewSchedule;
    feedbackMechanisms: readonly FeedbackMechanism[];
}
export interface SuccessCriterion {
    name: string;
    description: string;
    measurement: string;
    threshold: number;
    weight: number;
}
export interface StrategyMetric {
    name: string;
    type: 'leading' | 'lagging';
    measurement: string;
    target: number;
    current: number;
}
export interface ReviewSchedule {
    frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    nextReview: Date;
    responsible: string[];
}
export interface FeedbackMechanism {
    type: FeedbackType;
    frequency: string;
    source: string;
    format: string;
}
export interface AdaptationPlan {
    triggers: readonly AdaptationTrigger[];
    conditions: readonly AdaptationCondition[];
    strategies: readonly AdaptationStrategy[];
    evaluation: AdaptationEvaluation;
}
export interface AdaptationTrigger {
    type: 'performance' | 'environment' | 'feedback' | 'learning' | 'time';
    description: string;
    threshold: number;
    measurement: string;
}
export interface AdaptationCondition {
    condition: string;
    severity: SeverityLevel;
    urgency: UrgencyLevel;
}
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'immediate';
export interface AdaptationStrategy {
    trigger: string;
    action: string;
    parameters: Record<string, unknown>;
    expectedOutcome: string;
    riskLevel: RiskLevel;
}
export interface AdaptationEvaluation {
    criteria: readonly EvaluationCriterion[];
    timeline: number;
    responsible: string;
    rollbackPlan: RollbackPlan;
}
export interface EvaluationCriterion {
    metric: string;
    expectedChange: number;
    measurementMethod: string;
}
export interface RollbackPlan {
    triggers: readonly string[];
    procedures: readonly string[];
    responsible: string;
    timeline: number;
}
export interface StrategyMetadata {
    version: string;
    author: string;
    createdAt: Date;
    lastModified: Date;
    tags: readonly string[];
    category: string;
    scope: string;
}
export interface LearningProgress {
    totalExperiences: number;
    successfulAdaptations: number;
    failedAdaptations: number;
    learningRate: number;
    competencyLevel: CompetencyLevel;
    areasOfImprovement: readonly string[];
    recentInsights: readonly Insight[];
    nextMilestones: readonly LearningMilestone[];
}
export type CompetencyLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
export interface Insight {
    id: string;
    description: string;
    type: InsightType;
    confidence: number;
    actionability: Actionability;
    impact: ImpactLevel;
    timestamp: Date;
}
export type InsightType = 'pattern' | 'anomaly' | 'opportunity' | 'risk' | 'optimization' | 'correlation' | 'causation';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'strategic';
export interface LearningMilestone {
    description: string;
    targetDate: Date;
    criteria: readonly string[];
    progress: number;
}
export interface EngineMessage {
    id: string;
    from: string;
    to: string | readonly string[];
    type: MessageType;
    priority: Priority;
    subject: string;
    content: unknown;
    metadata: MessageMetadata;
    timestamp: Date;
    expiresAt?: Date;
}
export type MessageType = 'request' | 'response' | 'notification' | 'alert' | 'collaboration' | 'coordination' | 'learning' | 'status';
export interface MessageMetadata {
    format: 'json' | 'xml' | 'text' | 'binary';
    encoding: string;
    size: number;
    checksum: string;
    requiresResponse: boolean;
    responseDeadline?: Date;
}
export interface CollaborativeTask {
    id: string;
    name: string;
    description: string;
    type: CollaborativeTaskType;
    participants: readonly string[];
    coordinator: string;
    objectives: readonly Objective[];
    deliverables: readonly Deliverable[];
    timeline: Timeline;
    communicationProtocol: CommunicationProtocol;
    coordinationStrategy: CoordinationStrategy;
}
export type CollaborativeTaskType = 'joint_problem_solving' | 'resource_sharing' | 'knowledge_exchange' | 'distributed_computation' | 'consensus_building' | 'mutual_learning' | 'coordinated_action';
export interface Deliverable {
    id: string;
    name: string;
    description: string;
    type: DeliverableType;
    requirements: DeliverableRequirements;
    responsible: string;
    deadline: Date;
}
export type DeliverableType = 'report' | 'analysis' | 'decision' | 'plan' | 'model' | 'data' | 'code' | 'configuration';
export interface DeliverableRequirements {
    format: string;
    quality: QualityRequirements;
    standards: readonly string[];
    dependencies: readonly string[];
}
export interface CommunicationProtocol {
    channels: readonly CommunicationChannel[];
    frequency: CommunicationFrequency;
    escalationRules: readonly EscalationRule[];
    documentation: DocumentationRequirements;
}
export interface CommunicationChannel {
    type: ChannelType;
    address: string;
    protocol: string;
    security: SecurityRequirements;
    availability: AvailabilityRequirements;
}
export type ChannelType = 'message_queue' | 'websocket' | 'rest_api' | 'grpc' | 'event_stream';
export interface SecurityRequirements {
    authentication: AuthenticationRequirement;
    authorization: AuthorizationRequirement;
    encryption: EncryptionRequirement;
    audit: AuditRequirement;
}
export interface AuthenticationRequirement {
    method: 'token' | 'certificate' | 'biometric' | 'multi_factor';
    strength: 'basic' | 'standard' | 'high' | 'maximum';
}
export interface AuthorizationRequirement {
    model: 'rbac' | 'abac' | 'pbac' | 'hybrid';
    permissions: readonly string[];
}
export interface EncryptionRequirement {
    inTransit: boolean;
    atRest: boolean;
    algorithm: string;
    keyManagement: string;
}
export interface AuditRequirement {
    logLevel: 'basic' | 'detailed' | 'comprehensive';
    retention: number;
    monitoring: boolean;
}
export interface AvailabilityRequirements {
    uptime: number;
    responseTime: number;
    throughput: number;
    redundancy: number;
}
export type CommunicationFrequency = 'continuous' | 'real_time' | 'hourly' | 'daily' | 'weekly' | 'event_driven';
export interface EscalationRule {
    trigger: EscalationTrigger;
    action: EscalationAction;
    timeline: number;
    responsible: string;
}
export interface EscalationTrigger {
    condition: string;
    threshold: number;
    measurement: string;
}
export interface EscalationAction {
    type: 'notify' | 'reassign' | 'escalate' | 'abort' | 'manual_intervention';
    parameters: Record<string, unknown>;
}
export interface DocumentationRequirements {
    format: string;
    frequency: string;
    retention: number;
    accessibility: string;
}
export interface CoordinationStrategy {
    type: CoordinationType;
    methodology: CoordinationMethodology;
    tools: readonly CoordinationTool[];
    decisionMaking: DecisionMakingProcess;
    conflictResolution: ConflictResolutionStrategy;
}
export type CoordinationType = 'centralized' | 'distributed' | 'hierarchical' | 'holacracy' | 'consensus' | 'adaptive';
export type CoordinationMethodology = 'agile' | 'waterfall' | 'scrum' | 'kanban' | 'lean' | 'custom';
export interface CoordinationTool {
    name: string;
    type: string;
    configuration: Record<string, unknown>;
    integration: ToolIntegration;
}
export interface ToolIntegration {
    type: 'api' | 'plugin' | 'webhook' | 'sdk' | 'cli';
    version: string;
    authentication: AuthenticationInfo;
}
export interface AuthenticationInfo {
    type: string;
    credentials: Record<string, unknown>;
    encryption: boolean;
}
export interface DecisionMakingProcess {
    type: DecisionMakingType;
    participants: readonly string[];
    rules: readonly DecisionRule[];
    voting: VotingMechanism;
}
export type DecisionMakingType = 'consensus' | 'majority' | 'expert' | 'hierarchical' | 'delegated' | 'weighted';
export interface DecisionRule {
    condition: string;
    action: string;
    priority: number;
}
export interface VotingMechanism {
    type: 'simple' | 'weighted' | 'qualified' | 'consensus';
    threshold: number;
    deadline: number;
}
export interface ConflictResolutionStrategy {
    type: ConflictResolutionType;
    procedures: readonly ConflictResolutionProcedure[];
    escalation: EscalationProcedure;
    prevention: readonly ConflictPreventionMeasure[];
}
export type ConflictResolutionType = 'negotiation' | 'mediation' | 'arbitration' | 'voting' | 'hierarchical' | 'algorithmic';
export interface ConflictResolutionProcedure {
    step: number;
    description: string;
    responsible: string;
    timeline: number;
}
export interface EscalationProcedure {
    triggers: readonly string[];
    levels: readonly EscalationLevel[];
    final: FinalResolutionProcedure;
}
export interface EscalationLevel {
    level: number;
    authority: string;
    timeline: number;
    powers: readonly string[];
}
export interface FinalResolutionProcedure {
    method: string;
    authority: string;
    binding: boolean;
}
export interface ConflictPreventionMeasure {
    measure: string;
    effectiveness: number;
    implementation: string;
    monitoring: string;
}
export interface CollaborativeResult {
    taskId: string;
    outcome: CollaborativeOutcome;
    contributions: readonly Contribution[];
    quality: QualityMetrics;
    efficiency: EfficiencyMetrics;
    lessons: readonly Lesson[];
    nextSteps: readonly string[];
}
export interface CollaborativeOutcome {
    success: boolean;
    deliverables: readonly DeliverableResult[];
    satisfaction: SatisfactionMetrics;
    collaboration: CollaborationMetrics;
    innovation: InnovationMetrics;
}
export interface DeliverableResult {
    deliverableId: string;
    status: 'completed' | 'partial' | 'failed';
    quality: QualityLevel;
    contributors: readonly string[];
    timeline: TimelineResult;
}
export interface TimelineResult {
    planned: number;
    actual: number;
    variance: number;
    explanation: string;
}
export interface SatisfactionMetrics {
    overall: number;
    technical: number;
    process: number;
    outcome: number;
    collaboration: number;
}
export interface CollaborationMetrics {
    communication: CommunicationQuality;
    coordination: CoordinationEffectiveness;
    knowledgeSharing: KnowledgeSharingMetrics;
    conflictResolution: ConflictResolutionMetrics;
}
export interface CommunicationQuality {
    clarity: number;
    timeliness: number;
    completeness: number;
    appropriateness: number;
}
export interface CoordinationEffectiveness {
    synchronization: number;
    resourceSharing: number;
    taskAlignment: number;
    dependencyManagement: number;
}
export interface KnowledgeSharingMetrics {
    knowledgeTransfer: number;
    learningOpportunities: number;
    documentationQuality: number;
    innovationGeneration: number;
}
export interface ConflictResolutionMetrics {
    prevention: number;
    resolution: number;
    satisfaction: number;
    relationshipPreservation: number;
}
export interface InnovationMetrics {
    novelty: number;
    usefulness: number;
    feasibility: number;
    adoption: number;
}
export interface Contribution {
    participantId: string;
    role: string;
    contributions: readonly string[];
    quality: number;
    efficiency: number;
    collaboration: number;
}
export interface QualityMetrics {
    accuracy: number;
    completeness: number;
    relevance: number;
    reliability: number;
    usability: number;
}
export interface EfficiencyMetrics {
    timeEfficiency: number;
    resourceEfficiency: number;
    costEfficiency: number;
    processEfficiency: number;
}
export interface ErrorInfo {
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    context: Record<string, unknown>;
}
export interface WarningInfo {
    code: string;
    message: string;
    category: string;
    timestamp: Date;
    recommendation?: string;
}
export interface HealthStatus {
    overall: HealthLevel;
    components: readonly ComponentHealth[];
    alerts: readonly Alert[];
    lastCheck: Date;
    nextCheck: Date;
}
export type HealthLevel = 'healthy' | 'degraded' | 'unhealthy' | 'critical';
export interface ComponentHealth {
    component: string;
    status: HealthLevel;
    metrics: ComponentMetrics;
    issues: readonly Issue[];
    dependencies: readonly string[];
}
export interface ComponentMetrics {
    uptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUsage: ResourceUsage;
}
export interface Issue {
    id: string;
    severity: SeverityLevel;
    type: IssueType;
    description: string;
    impact: string;
    resolution?: string;
    detectedAt: Date;
    resolvedAt?: Date;
}
export type IssueType = 'performance' | 'availability' | 'security' | 'resource' | 'integration' | 'data' | 'configuration';
export interface Alert {
    id: string;
    type: AlertType;
    severity: SeverityLevel;
    title: string;
    description: string;
    source: string;
    timestamp: Date;
    acknowledged: boolean;
    resolved: boolean;
    actions: readonly AlertAction[];
}
export type AlertType = 'system' | 'performance' | 'security' | 'resource' | 'collaboration' | 'learning' | 'decision';
export interface AlertAction {
    type: 'acknowledge' | 'resolve' | 'escalate' | 'investigate' | 'ignore';
    description: string;
    responsible?: string;
    timeline?: number;
}
export interface DiagnosticInfo {
    system: SystemDiagnostics;
    performance: PerformanceDiagnostics;
    resources: ResourceDiagnostics;
    learning: LearningDiagnostics;
    collaboration: CollaborationDiagnostics;
    integration: IntegrationDiagnostics;
}
export interface SystemDiagnostics {
    version: string;
    configuration: ConfigurationStatus;
    dependencies: DependencyStatus;
    environment: EnvironmentStatus;
    logs: LogStatus;
}
export interface ConfigurationStatus {
    valid: boolean;
    issues: readonly ConfigurationIssue[];
    lastValidated: Date;
}
export interface ConfigurationIssue {
    parameter: string;
    issue: string;
    severity: SeverityLevel;
    recommendation: string;
}
export interface DependencyStatus {
    satisfied: boolean;
    missing: readonly string[];
    outdated: readonly string[];
    conflicts: readonly Conflict[];
}
export interface Conflict {
    dependency: string;
    conflictType: string;
    description: string;
    resolution: string;
}
export interface EnvironmentStatus {
    variables: EnvironmentVariableStatus;
    permissions: PermissionStatus;
    network: NetworkStatus;
    storage: StorageStatus;
}
export interface EnvironmentVariableStatus {
    required: readonly string[];
    optional: readonly string[];
    missing: readonly string[];
    invalid: readonly string[];
}
export interface PermissionStatus {
    required: readonly string[];
    granted: readonly string[];
    denied: readonly string[];
}
export interface NetworkStatus {
    connectivity: boolean;
    bandwidth: number;
    latency: number;
    packetLoss: number;
}
export interface StorageStatus {
    available: number;
    used: number;
    total: number;
    performance: StoragePerformance;
}
export interface StoragePerformance {
    readSpeed: number;
    writeSpeed: number;
    iops: number;
}
export interface LogStatus {
    accessible: boolean;
    size: number;
    retention: number;
    rotation: boolean;
}
export interface PerformanceDiagnostics {
    cpu: CPUDiagnostics;
    memory: MemoryDiagnostics;
    io: IODiagnostics;
    network: NetworkDiagnostics;
    application: ApplicationDiagnostics;
}
export interface CPUDiagnostics {
    utilization: number;
    loadAverage: number[];
    temperature: number;
    throttling: boolean;
}
export interface MemoryDiagnostics {
    total: number;
    used: number;
    free: number;
    cached: number;
    swap: SwapDiagnostics;
}
export interface SwapDiagnostics {
    total: number;
    used: number;
    free: number;
    activity: number;
}
export interface IODiagnostics {
    disk: DiskDiagnostics;
    network: NetworkIODiagnostics;
}
export interface DiskDiagnostics {
    readOps: number;
    writeOps: number;
    readBytes: number;
    writeBytes: number;
    queueDepth: number;
    utilization: number;
}
export interface NetworkIODiagnostics {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errorsIn: number;
    errorsOut: number;
}
export interface NetworkDiagnostics {
    connections: number;
    bandwidth: BandwidthDiagnostics;
    latency: LatencyDiagnostics;
    errors: ErrorDiagnostics;
}
export interface BandwidthDiagnostics {
    current: number;
    peak: number;
    average: number;
    limit: number;
}
export interface LatencyDiagnostics {
    current: number;
    average: number;
    p50: number;
    p95: number;
    p99: number;
}
export interface ErrorDiagnostics {
    count: number;
    rate: number;
    types: ErrorTypeCount[];
}
export interface ErrorTypeCount {
    type: string;
    count: number;
    percentage: number;
}
export interface ApplicationDiagnostics {
    responseTime: ResponseTimeDiagnostics;
    throughput: ThroughputDiagnostics;
    errorRate: ErrorRateDiagnostics;
    utilization: UtilizationDiagnostics;
}
export interface ResponseTimeDiagnostics {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    trend: number;
}
export interface ThroughputDiagnostics {
    current: number;
    average: number;
    peak: number;
    capacity: number;
}
export interface ErrorRateDiagnostics {
    current: number;
    average: number;
    trend: number;
    types: ErrorTypeCount[];
}
export interface UtilizationDiagnostics {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}
export interface ResourceDiagnostics {
    allocation: ResourceAllocationDiagnostics;
    utilization: ResourceUtilizationDiagnostics;
    efficiency: ResourceEfficiencyDiagnostics;
    bottlenecks: readonly ResourceBottleneck[];
}
export interface ResourceAllocationDiagnostics {
    total: number;
    allocated: number;
    available: number;
    efficiency: number;
    fragmentation: number;
}
export interface ResourceUtilizationDiagnostics {
    average: number;
    peak: number;
    distribution: ResourceDistribution[];
    trends: ResourceTrend[];
}
export interface ResourceDistribution {
    resource: ResourceType;
    percentage: number;
    trend: number;
}
export interface ResourceTrend {
    resource: ResourceType;
    period: number;
    change: number;
    direction: 'increasing' | 'decreasing' | 'stable';
}
export interface ResourceEfficiencyDiagnostics {
    overall: number;
    byResource: ResourceEfficiency[];
    optimization: OptimizationOpportunity[];
}
export interface ResourceEfficiency {
    resource: ResourceType;
    efficiency: number;
    potential: number;
    recommendations: readonly string[];
}
export interface OptimizationOpportunity {
    resource: ResourceType;
    current: number;
    potential: number;
    effort: number;
    impact: number;
}
export interface ResourceBottleneck {
    resource: ResourceType;
    severity: SeverityLevel;
    impact: string;
    resolution: string;
    timeline: number;
}
export interface LearningDiagnostics {
    experience: ExperienceDiagnostics;
    adaptation: AdaptationDiagnostics;
    performance: PerformanceTrendDiagnostics;
    knowledge: KnowledgeDiagnostics;
}
export interface ExperienceDiagnostics {
    total: number;
    recent: number;
    quality: ExperienceQualityMetrics;
    patterns: ExperiencePattern[];
}
export interface ExperienceQualityMetrics {
    completeness: number;
    accuracy: number;
    relevance: number;
    diversity: number;
}
export interface ExperiencePattern {
    type: string;
    frequency: number;
    confidence: number;
    impact: number;
}
export interface AdaptationDiagnostics {
    attempts: number;
    successes: number;
    failures: number;
    rate: number;
    effectiveness: AdaptationEffectiveness;
}
export interface AdaptationEffectiveness {
    overall: number;
    byType: AdaptationTypeEffectiveness[];
    trends: AdaptationTrend[];
}
export interface AdaptationTypeEffectiveness {
    type: string;
    success: number;
    impact: number;
}
export interface AdaptationTrend {
    period: number;
    change: number;
    direction: 'improving' | 'declining' | 'stable';
}
export interface PerformanceTrendDiagnostics {
    accuracy: TrendDiagnostics;
    efficiency: TrendDiagnostics;
    quality: TrendDiagnostics;
    innovation: TrendDiagnostics;
}
export interface TrendDiagnostics {
    current: number;
    baseline: number;
    change: number;
    direction: 'improving' | 'declining' | 'stable';
    significance: number;
}
export interface KnowledgeDiagnostics {
    total: number;
    domains: KnowledgeDomain[];
    gaps: KnowledgeGap[];
    quality: KnowledgeQualityMetrics;
}
export interface KnowledgeDomain {
    domain: string;
    coverage: number;
    depth: number;
    confidence: number;
    lastUpdated: Date;
}
export interface KnowledgeGap {
    domain: string;
    gap: string;
    impact: string;
    priority: Priority;
    resolution: string;
}
export interface KnowledgeQualityMetrics {
    accuracy: number;
    completeness: number;
    relevance: number;
    timeliness: number;
    consistency: number;
}
export interface CollaborationDiagnostics {
    participation: ParticipationDiagnostics;
    communication: CommunicationDiagnostics;
    coordination: CoordinationDiagnostics;
    performance: CollaborationPerformanceDiagnostics;
}
export interface ParticipationDiagnostics {
    active: number;
    total: number;
    engagement: number;
    contribution: number;
    satisfaction: number;
}
export interface CommunicationDiagnostics {
    volume: CommunicationVolumeDiagnostics;
    quality: CommunicationQualityDiagnostics;
    effectiveness: CommunicationEffectivenessDiagnostics;
}
export interface CommunicationVolumeDiagnostics {
    messages: number;
    participants: number;
    channels: number;
    frequency: number;
}
export interface CommunicationQualityDiagnostics {
    clarity: number;
    completeness: number;
    timeliness: number;
    relevance: number;
}
export interface CommunicationEffectivenessDiagnostics {
    understanding: number;
    alignment: number;
    decisionSpeed: number;
    conflictResolution: number;
}
export interface CoordinationDiagnostics {
    synchronization: number;
    resourceSharing: number;
    taskCoordination: number;
    dependencyManagement: number;
}
export interface CollaborationPerformanceDiagnostics {
    efficiency: number;
    quality: number;
    innovation: number;
    satisfaction: number;
}
export interface IntegrationDiagnostics {
    endpoints: EndpointDiagnostics;
    dataFlow: DataFlowDiagnostics;
    compatibility: CompatibilityDiagnostics;
    reliability: ReliabilityDiagnostics;
}
export interface EndpointDiagnostics {
    total: number;
    active: number;
    healthy: number;
    responseTime: number;
    throughput: number;
}
export interface DataFlowDiagnostics {
    volume: DataVolumeDiagnostics;
    latency: DataLatencyDiagnostics;
    quality: DataQualityDiagnostics;
    security: DataSecurityDiagnostics;
}
export interface DataVolumeDiagnostics {
    total: number;
    average: number;
    peak: number;
    trend: number;
}
export interface DataLatencyDiagnostics {
    current: number;
    average: number;
    p95: number;
    target: number;
    compliance: number;
}
export interface DataQualityDiagnostics {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
}
export interface DataSecurityDiagnostics {
    encryption: number;
    authentication: number;
    authorization: number;
    audit: number;
    compliance: number;
}
export interface CompatibilityDiagnostics {
    standards: CompatibilityMetrics;
    protocols: ProtocolCompatibility[];
    formats: FormatCompatibility[];
    versions: VersionCompatibility[];
}
export interface CompatibilityMetrics {
    compliant: number;
    total: number;
    percentage: number;
    issues: readonly string[];
}
export interface ProtocolCompatibility {
    protocol: string;
    version: string;
    status: 'compatible' | 'partial' | 'incompatible';
    issues: readonly string[];
}
export interface FormatCompatibility {
    format: string;
    version: string;
    status: 'compatible' | 'partial' | 'incompatible';
    issues: readonly string[];
}
export interface VersionCompatibility {
    component: string;
    version: string;
    status: 'compatible' | 'partial' | 'incompatible';
    issues: readonly string[];
}
export interface ReliabilityDiagnostics {
    availability: AvailabilityDiagnostics;
    mtbf: MTBFDiagnostics;
    mttr: MTTRDiagnostics;
    errors: ErrorDiagnostics;
}
export interface AvailabilityDiagnostics {
    current: number;
    target: number;
    uptime: number;
    downtime: DowntimeDiagnostics;
}
export interface DowntimeDiagnostics {
    total: number;
    planned: number;
    unplanned: number;
    incidents: IncidentDiagnostics[];
}
export interface IncidentDiagnostics {
    count: number;
    duration: number;
    impact: number;
    resolution: number;
}
export interface MTBFDiagnostics {
    current: number;
    target: number;
    trend: number;
}
export interface MTTRDiagnostics {
    current: number;
    target: number;
    trend: number;
}
export interface LearningConfiguration {
    enableLearning: boolean;
    experienceRetention: number;
    adaptationThreshold: number;
    learningRate: number;
    explorationRate: number;
    knowledgeDomains: readonly string[];
    feedbackIntegration: FeedbackIntegrationConfig;
}
export interface FeedbackIntegrationConfig {
    enableFeedback: boolean;
    sources: readonly string[];
    weighting: FeedbackWeighting;
    processing: FeedbackProcessingConfig;
}
export interface FeedbackWeighting {
    user: number;
    system: number;
    peer: number;
    automated: number;
    expert: number;
}
export interface FeedbackProcessingConfig {
    aggregation: AggregationMethod;
    filtering: FilterMethod;
    validation: ValidationMethod;
    integration: IntegrationMethod;
}
export type AggregationMethod = 'average' | 'weighted_average' | 'median' | 'mode' | 'consensus';
export type FilterMethod = 'outlier_removal' | 'confidence_threshold' | 'reputation_filter' | 'temporal_filter' | 'semantic_filter';
export type ValidationMethod = 'cross_validation' | 'consensus_validation' | 'expert_validation' | 'historical_validation' | 'automated_validation';
export type IntegrationMethod = 'immediate' | 'batch' | 'incremental' | 'selective' | 'conditional';
export interface DecisionMakingConfiguration {
    enableDecisionMaking: boolean;
    defaultMethodology: DecisionMethodology;
    confidenceThreshold: number;
    riskTolerance: number;
    timeHorizon: number;
    stakeholderWeights: Record<string, number>;
    evaluationCriteria: readonly EvaluationCriterion[];
}
export interface CollaborationConfiguration {
    enableCollaboration: boolean;
    maxParticipants: number;
    defaultProtocol: CommunicationProtocol;
    coordinationStrategy: CoordinationStrategy;
    trustManagement: TrustManagementConfig;
}
export interface TrustManagementConfig {
    enableTrustScoring: boolean;
    initialTrust: number;
    trustDecay: number;
    rewardMultiplier: number;
    penaltyMultiplier: number;
    reputationWeighting: Record<string, number>;
}
export interface MonitoringConfiguration {
    enableMonitoring: boolean;
    metrics: MetricsConfiguration;
    alerting: AlertingConfiguration;
    logging: LoggingConfiguration;
    healthChecks: HealthCheckConfiguration;
}
export interface MetricsConfiguration {
    collectionInterval: number;
    retention: number;
    aggregation: AggregationConfig;
    export: ExportConfiguration;
}
export interface AggregationConfig {
    enabled: boolean;
    methods: readonly string[];
    intervals: readonly number[];
}
export interface ExportConfiguration {
    enabled: boolean;
    formats: readonly string[];
    destinations: readonly string[];
    schedule: string;
}
export interface AlertingConfiguration {
    enabled: boolean;
    thresholds: AlertThresholds;
    routing: AlertRouting;
    escalation: AlertEscalationConfig;
}
export interface AlertThresholds {
    performance: PerformanceThresholds;
    availability: AvailabilityThresholds;
    resources: ResourceThresholds;
    security: SecurityThresholds;
}
export interface PerformanceThresholds {
    responseTime: number;
    throughput: number;
    errorRate: number;
    latency: number;
}
export interface AvailabilityThresholds {
    uptime: number;
    downtime: number;
    incidentRate: number;
    recoveryTime: number;
}
export interface ResourceThresholds {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}
export interface SecurityThresholds {
    failedLogins: number;
    suspiciousActivity: number;
    dataBreaches: number;
    complianceViolations: number;
}
export interface AlertRouting {
    rules: readonly AlertRoutingRule[];
    channels: readonly AlertChannel[];
}
export interface AlertRoutingRule {
    condition: string;
    channel: string;
    severity: readonly SeverityLevel[];
    delay: number;
}
export interface AlertChannel {
    name: string;
    type: AlertChannelType;
    configuration: Record<string, unknown>;
}
export type AlertChannelType = 'email' | 'sms' | 'webhook' | 'slack' | 'teams' | 'pagerduty' | 'custom';
export interface AlertEscalationConfig {
    enabled: boolean;
    levels: readonly EscalationLevel[];
    autoEscalate: boolean;
}
export interface LoggingConfiguration {
    level: LogLevel;
    format: LogFormat;
    destinations: readonly LogDestination[];
    rotation: LogRotationConfig;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogFormat = 'json' | 'text' | 'structured' | 'custom';
export interface LogDestination {
    type: LogDestinationType;
    configuration: Record<string, unknown>;
}
export type LogDestinationType = 'file' | 'console' | 'syslog' | 'database' | 'external' | 'stream';
export interface LogRotationConfig {
    enabled: boolean;
    maxSize: number;
    maxFiles: number;
    compress: boolean;
}
export interface HealthCheckConfiguration {
    enabled: boolean;
    interval: number;
    timeout: number;
    endpoints: readonly HealthCheckEndpoint[];
}
export interface HealthCheckEndpoint {
    name: string;
    url: string;
    method: string;
    expectedStatus: number;
    timeout: number;
    interval: number;
}
export interface SecurityConfiguration {
    enableSecurity: boolean;
    authentication: AuthenticationConfig;
    authorization: AuthorizationConfig;
    encryption: EncryptionConfig;
    audit: AuditConfig;
}
export interface AuthenticationConfig {
    enabled: boolean;
    methods: readonly AuthenticationMethod[];
    tokenExpiry: number;
    refreshTokenExpiry: number;
    passwordPolicy: PasswordPolicyConfig;
}
export interface AuthenticationMethod {
    type: 'password' | 'token' | 'certificate' | 'biometric' | 'multi_factor';
    configuration: Record<string, unknown>;
}
export interface PasswordPolicyConfig {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number;
    historyCount: number;
}
export interface AuthorizationConfig {
    enabled: boolean;
    model: AuthorizationModel;
    roles: readonly RoleConfig[];
    permissions: readonly PermissionConfig[];
}
export interface AuthorizationModel {
    type: 'rbac' | 'abac' | 'pbac' | 'hybrid';
    configuration: Record<string, unknown>;
}
export interface RoleConfig {
    name: string;
    description: string;
    permissions: readonly string[];
    hierarchy: readonly string[];
}
export interface PermissionConfig {
    name: string;
    description: string;
    resource: string;
    actions: readonly string[];
    conditions: readonly Condition[];
}
export interface EncryptionConfig {
    enabled: boolean;
    algorithm: string;
    keyManagement: KeyManagementConfig;
    dataEncryption: DataEncryptionConfig;
}
export interface KeyManagementConfig {
    type: 'internal' | 'external' | 'hybrid';
    rotation: KeyRotationConfig;
    storage: KeyStorageConfig;
}
export interface KeyRotationConfig {
    enabled: boolean;
    interval: number;
    algorithm: string;
}
export interface KeyStorageConfig {
    type: 'file' | 'database' | 'vault' | 'cloud';
    configuration: Record<string, unknown>;
}
export interface DataEncryptionConfig {
    inTransit: boolean;
    atRest: boolean;
    inMemory: boolean;
    algorithm: string;
}
export interface AuditConfig {
    enabled: boolean;
    events: readonly AuditEvent[];
    retention: number;
    format: AuditFormat;
    storage: AuditStorageConfig;
}
export interface AuditEvent {
    type: string;
    category: string;
    severity: SeverityLevel;
    required: boolean;
}
export type AuditFormat = 'json' | 'csv' | 'structured' | 'custom';
export interface AuditStorageConfig {
    type: AuditStorageType;
    configuration: Record<string, unknown>;
}
export type AuditStorageType = 'file' | 'database' | 'log' | 'external' | 'stream';
export interface IntegrationConfiguration {
    enableIntegration: boolean;
    endpoints: readonly IntegrationEndpoint[];
    dataFormats: readonly DataFormat[];
    protocols: readonly ProtocolConfig[];
    middlewares: readonly MiddlewareConfig[];
}
export interface IntegrationEndpoint {
    name: string;
    type: IntegrationType;
    configuration: Record<string, unknown>;
    authentication: AuthenticationInfo;
    rateLimiting: RateLimitingConfig;
}
export interface RateLimitingConfig {
    enabled: boolean;
    requests: number;
    window: number;
    strategy: RateLimitingStrategy;
}
export interface RateLimitingStrategy {
    type: 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';
    configuration: Record<string, unknown>;
}
export type IntegrationType = 'rest_api' | 'graphql' | 'websocket' | 'message_queue' | 'database' | 'file_system' | 'event_stream' | 'grpc';
export interface DataFormat {
    name: string;
    version: string;
    schema: unknown;
    validation: ValidationConfig;
}
export interface ValidationConfig {
    enabled: boolean;
    schema: unknown;
    strict: boolean;
    errorHandling: ErrorHandlingConfig;
}
export interface ErrorHandlingConfig {
    strategy: 'fail_fast' | 'log_continue' | 'retry' | 'fallback';
    maxRetries: number;
    backoffStrategy: BackoffStrategy;
}
export interface BackoffStrategy {
    type: 'linear' | 'exponential' | 'fixed';
    baseDelay: number;
    maxDelay: number;
}
export interface ProtocolConfig {
    name: string;
    version: string;
    configuration: Record<string, unknown>;
    security: SecurityRequirements;
}
export interface MiddlewareConfig {
    name: string;
    type: MiddlewareType;
    configuration: Record<string, unknown>;
    order: number;
    enabled: boolean;
}
export type MiddlewareType = 'authentication' | 'authorization' | 'logging' | 'monitoring' | 'caching' | 'compression' | 'encryption' | 'transformation' | 'validation' | 'custom';
export interface IntegrationPoint {
    name: string;
    type: IntegrationType;
    capabilities: readonly string[];
    requirements: ResourceRequirements;
    configuration: Record<string, unknown>;
}
export interface LatencyMetrics {
    p50: number;
    p95: number;
    p99: number;
    average: number;
    max: number;
    min: number;
}
export interface MemoryMetrics {
    total: number;
    used: number;
    free: number;
    cached: number;
    heap: HeapMetrics;
}
export interface HeapMetrics {
    total: number;
    used: number;
    limit: number;
}
export interface PerformanceMetrics {
    throughput: number;
    latency: LatencyMetrics;
    memory: MemoryMetrics;
    cpu: CPUMetrics;
}
export interface CPUMetrics {
    utilization: number;
    loadAverage: number[];
}
export interface Error {
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
    timestamp?: Date;
}
export interface Warning {
    code: string;
    message: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
}
//# sourceMappingURL=IAutonomousAIEngine.d.ts.map