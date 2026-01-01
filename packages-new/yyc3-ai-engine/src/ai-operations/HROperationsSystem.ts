/**
 * HR智能助手完整版
 * 集成四大系统的协同HR管理：招聘→员工服务→培训→绩效管理
 */

import { EventEmitter } from 'events';

// HR智能助手完整版
export class HROperationsSystem extends EventEmitter {
  private aiEngine: any;
  private dataService: any;
  private customerLifecycle: any;
  private outboundSystem: any;
  private formSystem: any;
  private activeProcesses: Map<string, HRProcess> = new Map();
  private employeeProfiles: Map<string, EmployeeProfile> = new Map();

  constructor(config: any) {
    super();
    this.aiEngine = config.aiEngine;
    this.dataService = config.dataService;
    this.customerLifecycle = config.customerLifecycle;
    this.outboundSystem = config.outboundSystem;
    this.formSystem = config.formSystem;
    this.initializeHRModules();
  }

  private initializeHRModules(): void {
    // 招聘模块
    this.on('recruitment-initiated', this.handleRecruitmentInitiated.bind(this));
    this.on('candidate-identified', this.handleCandidateIdentified.bind(this));

    // 员工服务模块
    this.on('employee-inquiry', this.handleEmployeeInquiry.bind(this));
    this.on('hr-request', this.handleHRRequest.bind(this));

    // 培训模块
    this.on('training-needed', this.handleTrainingNeeded.bind(this));
    this.on('skill-gap-detected', this.handleSkillGapDetected.bind(this));

    // 绩效模块
    this.on('performance-review', this.handlePerformanceReview.bind(this));
    this.on('goal-setting', this.handleGoalSetting.bind(this));
  }

  // 执行HR操作
  async executeOperations(config: HROperationsConfig): Promise<HROperationsResult> {
    try {
      const processId = `hr_process_${Date.now()}`;

      // AI优化HR操作策略
      const optimizedConfig = await this.optimizeHROperations(config);

      // 创建HR流程
      const hrProcess = await this.createHRProcess(optimizedConfig, processId);

      // 执行跨系统协同
      const executionResults = await this.executeCrossSystemCollaboration(hrProcess);

      // 收集HR洞察
      const hrInsights = await this.generateHRInsights(executionResults);

      const result: HROperationsResult = {
        operation: config.operation,
        outcomes: executionResults,
        efficiency: this.calculateHREfficiency(executionResults),
        satisfaction: await this.assessEmployeeSatisfaction(executionResults),
        insights: hrInsights,
        recommendations: await this.generateHRRecommendations(executionResults),
        costAnalysis: await this.analyzeHROperationsCost(executionResults)
      };

      this.emit('hr-operations-completed', result);
      return result;

    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // AI优化HR操作
  private async optimizeHROperations(config: HROperationsConfig): Promise<OptimizedHROperationsConfig> {
    const organizationalData = await this.getOrganizationalData();
    const workloadPredictions = await this.predictWorkloadPatterns(organizationalData);
    const historicalPerformance = await this.getHistoricalHRPerformance(config.operation);

    const optimization = await this.aiEngine.optimize({
      type: 'hr-operations-optimization',
      config: {
        originalConfig: config,
        organizationalData: organizationalData,
        workloadPredictions: workloadPredictions,
        historicalPerformance: historicalPerformance,
        constraints: config.constraints || {}
      }
    });

    return {
      ...config,
      strategy: optimization.strategy,
      resourceAllocation: optimization.resourceAllocation,
      timeline: optimization.timeline,
      qualityTargets: optimization.qualityTargets,
      automationLevel: optimization.automationLevel,
      crossSystemIntegration: optimization.crossSystemIntegration
    };
  }

  // 创建HR流程
  private async createHRProcess(config: OptimizedHROperationsConfig, processId: string): Promise<HRProcess> {
    const process: HRProcess = {
      id: processId,
      operation: config.operation,
      config: config,
      status: 'initializing',
      startTime: new Date(),
      steps: await this.generateHRProcessSteps(config),
      crossSystemData: {},
      metrics: {
        efficiency: 0,
        quality: 0,
        satisfaction: 0,
        cost: 0
      }
    };

    this.activeProcesses.set(processId, process);
    return process;
  }

  // 生成HR流程步骤
  private async generateHRProcessSteps(config: OptimizedHROperationsConfig): Promise<HRProcessStep[]> {
    switch (config.operation) {
      case 'recruitment':
        return await this.generateRecruitmentSteps(config);
      case 'employee-service':
        return await this.generateEmployeeServiceSteps(config);
      case 'training':
        return await this.generateTrainingSteps(config);
      case 'performance':
        return await this.generatePerformanceSteps(config);
      default:
        throw new Error(`未知的HR操作类型: ${config.operation}`);
    }
  }

  // 生成招聘流程步骤
  private async generateRecruitmentSteps(config: OptimizedHROperationsConfig): Promise<HRProcessStep[]> {
    return [
      {
        id: 'job-analysis',
        name: '职位分析',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI分析职位需求和岗位画像',
        estimatedDuration: 300
      },
      {
        id: 'candidate-sourcing',
        name: '候选人寻源',
        type: 'cross-system',
        system: 'customer-lifecycle',
        description: '利用客户全生命周期系统寻找候选人',
        estimatedDuration: 600
      },
      {
        id: 'outbound-campaign',
        name: '智能外呼',
        type: 'cross-system',
        system: 'outbound-calling',
        description: '智能外呼系统联系候选人',
        estimatedDuration: 1800
      },
      {
        id: 'application-form',
        name: '申请表单',
        type: 'cross-system',
        system: 'smart-forms',
        description: '智能表单系统收集申请信息',
        estimatedDuration: 900
      },
      {
        id: 'ai-screening',
        name: 'AI筛选',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI进行简历筛选和初步评估',
        estimatedDuration: 600
      },
      {
        id: 'interview-scheduling',
        name: '面试安排',
        type: 'automation',
        system: 'hr-system',
        description: '自动化安排面试流程',
        estimatedDuration: 300
      }
    ];
  }

  // 生成员工服务流程步骤
  private async generateEmployeeServiceSteps(config: OptimizedHROperationsConfig): Promise<HRProcessStep[]> {
    return [
      {
        id: 'inquiry-analysis',
        name: '咨询分析',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI分析员工咨询内容',
        estimatedDuration: 60
      },
      {
        id: 'knowledge-retrieval',
        name: '知识检索',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: '从知识库检索相关信息',
        estimatedDuration: 30
      },
      {
        id: 'response-generation',
        name: '响应生成',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI生成个性化响应',
        estimatedDuration: 60
      },
      {
        id: 'form-collection',
        name: '表单收集',
        type: 'cross-system',
        system: 'smart-forms',
        description: '如需要，收集额外信息',
        estimatedDuration: 300
      }
    ];
  }

  // 生成培训流程步骤
  private async generateTrainingSteps(config: OptimizedHROperationsConfig): Promise<HRProcessStep[]> {
    return [
      {
        id: 'skill-assessment',
        name: '技能评估',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI评估员工技能水平',
        estimatedDuration: 300
      },
      {
        id: 'gap-analysis',
        name: '差距分析',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: '分析技能差距',
        estimatedDuration: 180
      },
      {
        id: 'program-recommendation',
        name: '培训推荐',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI推荐培训项目',
        estimatedDuration: 120
      },
      {
        id: 'enrollment-form',
        name: '报名表单',
        type: 'cross-system',
        system: 'smart-forms',
        description: '培训报名表单',
        estimatedDuration: 180
      },
      {
        id: 'schedule-confirmation',
        name: '日程确认',
        type: 'automation',
        system: 'hr-system',
        description: '确认培训日程',
        estimatedDuration: 60
      }
    ];
  }

  // 生成绩效管理流程步骤
  private async generatePerformanceSteps(config: OptimizedHROperationsConfig): Promise<HRProcessStep[]> {
    return [
      {
        id: 'data-collection',
        name: '数据收集',
        type: 'automation',
        system: 'hr-system',
        description: '收集绩效数据',
        estimatedDuration: 300
      },
      {
        id: 'performance-analysis',
        name: '绩效分析',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI分析绩效表现',
        estimatedDuration: 240
      },
      {
        id: 'goal-evaluation',
        name: '目标评估',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: '评估目标达成情况',
        estimatedDuration: 180
      },
      {
        id: 'feedback-generation',
        name: '反馈生成',
        type: 'ai-analysis',
        system: 'ai-engine',
        description: 'AI生成绩效反馈',
        estimatedDuration: 120
      },
      {
        id: 'review-form',
        name: '评估表单',
        type: 'cross-system',
        system: 'smart-forms',
        description: '绩效评估表单',
        estimatedDuration: 240
      }
    ];
  }

  // 执行跨系统协同
  private async executeCrossSystemCollaboration(process: HRProcess): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const step of process.steps) {
      try {
        const stepResult = await this.executeStep(step, process);
        results.push(stepResult);

        // 步骤间的数据传递
        process.crossSystemData[step.id] = stepResult.data;

        // AI优化后续步骤
        await this.optimizeSubsequentSteps(step, stepResult, process);

      } catch (error) {
        const errorResult: ExecutionResult = {
          stepId: step.id,
          success: false,
          error: error.message,
          duration: 0,
          data: null
        };
        results.push(errorResult);
      }
    }

    process.status = 'completed';
    process.endTime = new Date();
    return results;
  }

  // 执行单个步骤
  private async executeStep(step: HRProcessStep, process: HRProcess): Promise<ExecutionResult> {
    const startTime = Date.now();

    let result: any;

    switch (step.system) {
      case 'customer-lifecycle':
        result = await this.executeCustomerLifecycleStep(step, process);
        break;
      case 'outbound-calling':
        result = await this.executeOutboundCallingStep(step, process);
        break;
      case 'smart-forms':
        result = await this.executeSmartFormsStep(step, process);
        break;
      case 'ai-engine':
        result = await this.executeAIEngineStep(step, process);
        break;
      case 'hr-system':
        result = await this.executeHRSystemStep(step, process);
        break;
    }

    return {
      stepId: step.id,
      success: true,
      duration: Date.now() - startTime,
      data: result
    };
  }

  // 执行客户生命周期步骤
  private async executeCustomerLifecycleStep(step: HRProcessStep, process: HRProcess): Promise<any> {
    if (step.id === 'candidate-sourcing') {
      // 利用客户全生命周期系统寻找候选人
      const candidateSegments = await this.aiEngine.segment({
        type: 'hr-candidate-segmentation',
        data: process.config.candidateCriteria,
        context: 'recruitment'
      });

      const lifecycleResult = await this.customerLifecycle.manageCustomerLifecycle({
        stage: 'acquisition',
        targetAudience: candidateSegments,
        objectives: ['find_candidates', 'qualify_leads']
      });

      return {
        candidatesIdentified: lifecycleResult.outcomes.length,
        qualifiedCandidates: lifecycleResult.outcomes.filter(o => o.quality > 0.7).length,
        nextActions: lifecycleResult.nextActions
      };
    }

    return {};
  }

  // 执行智能外呼步骤
  private async executeOutboundCallingStep(step: HRProcessStep, process: HRProcess): Promise<any> {
    if (step.id === 'outbound-campaign') {
      const candidates = process.crossSystemData['candidate-sourcing']?.candidates || [];

      const outboundConfig = {
        name: `HR招聘外呼 - ${process.config.position}`,
        targetList: candidates.map((candidate: any) => ({
          customerId: candidate.id,
          phoneNumber: candidate.phone,
          name: candidate.name,
          segment: 'hr-candidate'
        })),
        objectives: ['schedule_interview', 'qualify_candidate', 'provide_job_info']
      };

      const outboundResult = await this.outboundSystem.executeCampaign(outboundConfig);

      return {
        callsMade: outboundResult.callsMade,
        callsAnswered: outboundResult.callsAnswered,
        interviewsScheduled: outboundResult.insights.interviewScheduled || 0,
        qualifiedCandidates: outboundResult.insights.qualifiedCandidates || 0,
        campaignEfficiency: outboundResult.efficiency
      };
    }

    return {};
  }

  // 执行智能表单步骤
  private async executeSmartFormsStep(step: HRProcessStep, process: HRProcess): Promise<any> {
    if (step.id === 'application-form') {
      const formConfig = {
        type: 'hr-application',
        name: `${process.config.position}申请表`,
        template: 'hr-recruitment',
        personalization: {
          position: process.config.position,
          department: process.config.department,
          requirements: process.config.requirements
        }
      };

      const formResult = await this.formSystem.processForm(formConfig);

      return {
        formId: formResult.form,
        submissions: formResult.submissions,
        completionRate: formResult.completionRate,
        dataQuality: formResult.dataQuality
      };
    }

    return {};
  }

  // 执行AI引擎步骤
  private async executeAIEngineStep(step: HRProcessStep, process: HRProcess): Promise<any> {
    if (step.id === 'job-analysis') {
      const analysis = await this.aiEngine.analyze({
        type: 'job-analysis',
        jobDescription: process.config.jobDescription,
        requirements: process.config.requirements,
        marketData: await this.getMarketData()
      });

      return {
        skills: analysis.requiredSkills,
        qualifications: analysis.requiredQualifications,
        experience: analysis.experienceRequirements,
        salaryRange: analysis.salaryRange,
        marketCompetitiveness: analysis.competitiveness
      };
    }

    if (step.id === 'ai-screening') {
      const applications = process.crossSystemData['application-form']?.submissions || [];

      const screeningResults = await Promise.all(
        applications.map(async (application: any) => {
          const screening = await this.aiEngine.analyze({
            type: 'candidate-screening',
            application: application,
            jobRequirements: process.crossSystemData['job-analysis'],
            criteria: process.config.screeningCriteria
          });

          return {
            applicationId: application.id,
            score: screening.overallScore,
            strengths: screening.strengths,
            weaknesses: screening.weaknesses,
            recommendation: screening.recommendation
          };
        })
      );

      return {
        totalApplications: applications.length,
        screenedCandidates: screeningResults.filter(r => r.score > 0.6).length,
        topCandidates: screeningResults.filter(r => r.score > 0.8),
        screeningResults: screeningResults
      };
    }

    return {};
  }

  // 执行HR系统步骤
  private async executeHRSystemStep(step: HRProcessStep, process: HRProcess): Promise<any> {
    if (step.id === 'interview-scheduling') {
      const candidates = process.crossSystemData['ai-screening']?.topCandidates || [];

      const schedulingResults = await Promise.all(
        candidates.map(async (candidate: any) => {
          // AI优化面试时间
          const optimalTime = await this.aiEngine.recommend({
            type: 'interview-scheduling',
            candidate: candidate,
            interviewers: process.config.interviewers,
            constraints: process.config.constraints
          });

          return {
            candidateId: candidate.applicationId,
            scheduledTime: optimalTime.recommendedTime,
            interviewers: optimalTime.interviewers,
            format: optimalTime.format,
            preparation: optimalTime.preparation
          };
        })
      );

      return {
        interviewsScheduled: schedulingResults.length,
        schedulingEfficiency: this.calculateSchedulingEfficiency(schedulingResults),
        interviewCalendar: schedulingResults
      };
    }

    return {};
  }

  // 处理招聘启动
  private async handleRecruitmentInitiated(data: any): Promise<void> {
    const processConfig = {
      operation: 'recruitment',
      position: data.position,
      department: data.department,
      jobDescription: data.jobDescription,
      requirements: data.requirements,
      candidateCriteria: data.criteria,
      screeningCriteria: data.screening,
      interviewers: data.interviewers,
      constraints: data.constraints
    };

    await this.executeOperations(processConfig);
  }

  // 处理候选人识别
  private async handleCandidateIdentified(data: any): Promise<void> {
    // 触发智能外呼系统联系候选人
    await this.outboundSystem.updateCallStrategy({
      candidateId: data.id,
      profile: data.profile,
      source: 'recruitment'
    });
  }

  // 处理员工咨询
  private async handleEmployeeInquiry(inquiry: any): Promise<void> {
    const aiResponse = await this.aiEngine.chat({
      content: inquiry.question,
      context: {
        employeeId: inquiry.employeeId,
        inquiryType: inquiry.type,
        urgency: inquiry.urgency,
        department: inquiry.department
      },
      scenario: 'hr-service'
    });

    // 生成表单收集更多信息
    if (inquiry.requiresForm) {
      const formConfig = await this.generateInquiryForm(inquiry, aiResponse);
      await this.formSystem.processForm(formConfig);
    }
  }

  // 处理HR请求
  private async handleHRRequest(request: any): Promise<void> {
    const workflow = await this.aiEngine.generate({
      type: 'hr-workflow',
      request: request,
      policies: await this.getHRPolicies(),
      procedures: await this.getHRProcedures()
    });

    // 执行工作流
    for (const step of workflow.steps) {
      await this.executeWorkflowStep(step, request);
    }
  }

  // 处理培训需求
  private async handleTrainingNeeded(data: any): Promise<void> {
    // AI分析培训需求
    const trainingAnalysis = await this.aiEngine.analyze({
      type: 'training-needs-analysis',
      employeeData: data.employee,
      skillGaps: data.skillGaps,
      businessObjectives: data.objectives
    });

    // 生成培训表单
    const trainingForm = await this.formSystem.processForm({
      type: 'training-enrollment',
      name: `${trainingAnalysis.recommendedProgram}培训报名`,
      personalization: {
        employeeId: data.employee.id,
        program: trainingAnalysis.recommendedProgram,
        schedule: trainingAnalysis.recommendedSchedule
      }
    });
  }

  // 处理技能差距
  private async handleSkillGapDetected(data: any): Promise<void> {
    // AI推荐学习路径
    const learningPath = await this.aiEngine.recommend({
      type: 'learning-path',
      employee: data.employee,
      skillGaps: data.gaps,
      careerGoals: data.goals
    });

    // 安排培训
    await this.scheduleTraining({
      employeeId: data.employee.id,
      learningPath: learningPath,
      priority: data.priority
    });
  }

  // 处理绩效评估
  private async handlePerformanceReview(data: any): Promise<void> {
    const performanceData = await this.collectPerformanceData(data.employeeId);

    const analysis = await this.aiEngine.analyze({
      type: 'performance-analysis',
      performance: performanceData,
      goals: data.goals,
      period: data.period
    });

    // 生成绩效表单
    const performanceForm = await this.formSystem.processForm({
      type: 'performance-review',
      name: `绩效评估 - ${data.employee.name}`,
      personalization: {
        employeeId: data.employee.id,
        period: data.period,
        analysis: analysis
      }
    });
  }

  // 处理目标设定
  private async handleGoalSetting(data: any): Promise<void> {
    const smartGoals = await this.aiEngine.generate({
      type: 'smart-goals',
      employee: data.employee,
      department: data.department,
      objectives: data.objectives,
      previousPerformance: data.previousPerformance
    });

    // 创建目标跟踪表单
    const goalForm = await this.formSystem.processForm({
      type: 'goal-setting',
      name: `目标设定 - ${data.employee.name}`,
      personalization: {
        employeeId: data.employee.id,
        goals: smartGoals.goals,
        timeline: smartGoals.timeline
      }
    });
  }

  // 生成HR洞察
  private async generateHRInsights(results: ExecutionResult[]): Promise<any> {
    const insights = await this.aiEngine.analyze({
      type: 'hr-insights',
      executionResults: results,
      hrMetrics: await this.getHRMetrics(),
      trends: await this.getHRTrends()
    });

    return {
      operational: insights.operational,
      strategic: insights.strategic,
      workforce: insights.workforce,
      recommendations: insights.recommendations
    };
  }

  // 生成HR推荐
  private async generateHRRecommendations(results: ExecutionResult[]): Promise<string[]> {
    const recommendations = await this.aiEngine.recommend({
      type: 'hr-improvements',
      results: results,
      currentProcesses: await this.getCurrentHRProcesses(),
      bestPractices: await this.getHRBestPractices()
    });

    return recommendations.recommendations;
  }

  // 计算HR效率
  private calculateHREfficiency(results: ExecutionResult[]): number {
    const successRate = results.filter(r => r.success).length / results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const targetDuration = results.reduce((sum, r) => sum + (r.targetDuration || 300), 0) / results.length;

    const timeEfficiency = Math.max(0, (targetDuration - avgDuration) / targetDuration);
    return (successRate * 0.6 + timeEfficiency * 0.4) * 100;
  }

  // 评估员工满意度
  private async assessEmployeeSatisfaction(results: ExecutionResult[]): Promise<number> {
    const feedback = await this.collectEmployeeFeedback();
    const sentiment = await this.aiEngine.analyze({
      type: 'sentiment-analysis',
      feedback: feedback,
      context: 'hr-services'
    });

    return sentiment.averageSatisfaction * 100;
  }

  // 分析HR操作成本
  private async analyzeHROperationsCost(results: ExecutionResult[]): Promise<any> {
    const timeCost = results.reduce((sum, r) => sum + r.duration, 0) / 1000 * 50; // 假设时薪50元/小时
    const systemCost = results.length * 10; // 系统使用成本
    const aiCost = results.length * 5; // AI处理成本

    return {
      totalCost: timeCost + systemCost + aiCost,
      timeCost: timeCost,
      systemCost: systemCost,
      aiCost: aiCost,
      costPerTransaction: (timeCost + systemCost + aiCost) / results.length
    };
  }

  // 辅助方法
  private async getOrganizationalData(): Promise<any> {
    return {
      departments: [],
      employees: [],
      structure: {},
      policies: []
    };
  }

  private async predictWorkloadPatterns(data: any): Promise<any> {
    return { patterns: [], predictions: [] };
  }

  private async getHistoricalHRPerformance(operation: string): Promise<any> {
    return { data: [], metrics: {} };
  }

  private async getMarketData(): Promise<any> {
    return {};
  }

  private async generateInquiryForm(inquiry: any, aiResponse: any): Promise<any> {
    return {
      type: 'hr-inquiry',
      name: '员工咨询表',
      personalization: {
        inquiryType: inquiry.type,
        aiResponse: aiResponse,
        employeeId: inquiry.employeeId
      }
    };
  }

  private async getHRPolicies(): Promise<any> {
    return [];
  }

  private async getHRProcedures(): Promise<any> {
    return [];
  }

  private async executeWorkflowStep(step: any, request: any): Promise<void> {
    // 工作流步骤执行实现
  }

  private async collectPerformanceData(employeeId: string): Promise<any> {
    return {};
  }

  private async getHRMetrics(): Promise<any> {
    return {};
  }

  private async getHRTrends(): Promise<any> {
    return {};
  }

  private async getCurrentHRProcesses(): Promise<any> {
    return [];
  }

  private async getHRBestPractices(): Promise<any> {
    return [];
  }

  private async collectEmployeeFeedback(): Promise<any> {
    return [];
  }

  private async scheduleTraining(config: any): Promise<void> {
    // 培训安排实现
  }

  private async optimizeSubsequentSteps(step: HRProcessStep, result: any, process: HRProcess): Promise<void> {
    // 后续步骤优化
  }

  private calculateSchedulingEfficiency(scheduling: any[]): number {
    return 85; // 简化实现
  }
}

// 类型定义
export interface HROperationsConfig {
  operation: string;
  position?: string;
  department?: string;
  jobDescription?: string;
  requirements?: any;
  candidateCriteria?: any;
  screeningCriteria?: any;
  interviewers?: any[];
  objectives?: string[];
  constraints?: any;
}

export interface OptimizedHROperationsConfig extends HROperationsConfig {
  strategy: any;
  resourceAllocation: any;
  timeline: any;
  qualityTargets: any;
  automationLevel: number;
  crossSystemIntegration: any;
}

export interface HROperationsResult {
  operation: string;
  outcomes: ExecutionResult[];
  efficiency: number;
  satisfaction: number;
  insights: any;
  recommendations: string[];
  costAnalysis: any;
}

export interface HRProcess {
  id: string;
  operation: string;
  config: OptimizedHROperationsConfig;
  status: string;
  startTime: Date;
  endTime?: Date;
  steps: HRProcessStep[];
  crossSystemData: Record<string, any>;
  metrics: HRProcessMetrics;
}

export interface HRProcessStep {
  id: string;
  name: string;
  type: 'ai-analysis' | 'cross-system' | 'automation' | 'manual';
  system: string;
  description: string;
  estimatedDuration: number;
  targetDuration?: number;
}

export interface ExecutionResult {
  stepId: string;
  success: boolean;
  duration: number;
  targetDuration?: number;
  data?: any;
  error?: string;
}

export interface HRProcessMetrics {
  efficiency: number;
  quality: number;
  satisfaction: number;
  cost: number;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  department: string;
  position: string;
  skills: string[];
  performance: any;
  training: any;
  goals: any;
}