/**
 * @fileoverview 用户反馈循环系统 - 从单向通知到双向闭环的进化
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

export enum FeedbackInteractionMode {
  PASSIVE = 'passive',
  PROACTIVE = 'proactive',
  CONVERSATIONAL = 'conversational',
  GAMIFIED = 'gamified',
  COMMUNITY = 'community'
}

export enum FeedbackActionType {
  ACKNOWLEDGE = 'acknowledge',
  EXPLAIN = 'explain',
  FIX = 'fix',
  IMPROVE = 'improve',
  CUSTOMIZE = 'customize',
  ESCALATE = 'escalate',
  EDUCATE = 'educate',
  REWARD = 'reward'
}

export interface UserFeedback {
  id: string;
  userId: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface EmotionAnalysis {
  primary: string;
  secondary?: string;
  confidence: number;
  intensity: number;
  valence: number;
  arousal: number;
}

export interface IntentDecoding {
  primaryIntent: string;
  confidence: number;
  entities: Array<{ type: string; value: string; confidence: number }>;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DeepUnderstanding {
  feedback: UserFeedback;
  emotionAnalysis: EmotionAnalysis;
  intentDecoding: IntentDecoding;
  contextFusion: Record<string, unknown>;
  needMining: string[];
  priorityJudgment: {
    score: number;
    reason: string;
    suggestedAction: FeedbackActionType;
  };
  understandingConfidence: number;
}

export interface EmpatheticResponse {
  understanding: DeepUnderstanding;
  emotionMatching: {
    matched: boolean;
    tone: string;
    style: string;
  };
  responseContent: string;
  empathyScore: number;
}

export interface CollaborativePlan {
  feedbackId: string;
  solutions: Array<{
    id: string;
    description: string;
    votes: number;
    estimatedEffort: string;
  }>;
  selectedSolution?: string;
  timeline: {
    start: Date;
    milestones: Array<{ date: Date; description: string }>;
    expectedCompletion: Date;
  };
  collaborationLevel: number;
}

export interface TransparentExecution {
  plan: CollaborativePlan;
  realtimeProgress: {
    completedSteps: number;
    totalSteps: number;
    currentStatus: string;
    lastUpdate: Date;
  };
  issues: Array<{
    id: string;
    description: string;
    severity: string;
    resolved: boolean;
  }>;
  transparencyScore: number;
}

export interface RealtimeValidation {
  executionId: string;
  userSatisfaction: number;
  impactMetrics: {
    before: Record<string, number>;
    after: Record<string, number>;
    improvement: Record<string, number>;
  };
  feedbackCollected: number;
  validationScore: number;
}

export interface RelationshipEvolution {
  userId: string;
  interactionHistory: Array<{
    date: Date;
    type: string;
    satisfaction: number;
  }>;
  trustScore: number;
  loyaltyLevel: 'new' | 'engaged' | 'loyal' | 'advocate';
  relationshipDepth: number;
}

export interface BidirectionalLoopResult {
  loopId: string;
  conversationId: string;
  feedback: UserFeedback;
  deepUnderstanding: DeepUnderstanding;
  empatheticResponse: EmpatheticResponse;
  collaborativePlan: CollaborativePlan;
  transparentExecution: TransparentExecution;
  realtimeValidation: RealtimeValidation;
  relationshipEvolution: RelationshipEvolution;
  loopClosureScore: number;
  timestamp: Date;
}

export interface BidirectionalFeedbackConfig {
  inboundChannels?: string[];
  outboundChannels?: string[];
  syncMode?: 'real_time' | 'batch';
  conversationPersistence?: string;
  emotionModalities?: string[];
  emotionPrecision?: number;
  culturalAdaptation?: boolean;
  automationLevel?: 'manual' | 'semi_auto' | 'full_auto';
  approvalThreshold?: number;
  escalationRules?: Record<string, unknown>;
  communityFeatures?: string[];
  communityModeration?: string;
}

export class BidirectionalFeedbackLoop extends EventEmitter {
  private config: BidirectionalFeedbackConfig;
  private feedbackHistory: Map<string, UserFeedback[]> = new Map();
  private activeConversations: Map<string, BidirectionalLoopResult[]> = new Map();
  private knowledgeBase: Map<string, string> = new Map();

  constructor(config: BidirectionalFeedbackConfig = {}) {
    super();
    this.config = {
      inboundChannels: ['chat', 'voice', 'gesture', 'emotion'],
      outboundChannels: ['notification', 'in_app', 'email', 'push'],
      syncMode: 'real_time',
      conversationPersistence: '7d',
      emotionModalities: ['text', 'voice', 'facial', 'physiological'],
      emotionPrecision: 0.85,
      culturalAdaptation: true,
      automationLevel: 'semi_auto',
      approvalThreshold: 0.8,
      escalationRules: {},
      communityFeatures: ['idea_voting', 'collaborative_editing', 'expert_review', 'transparency_log'],
      communityModeration: 'ai_enhanced',
      ...config
    };
  }

  async executeBidirectionalLoop(feedback: UserFeedback): Promise<BidirectionalLoopResult> {
    const loopId = this.generateId();
    const conversationId = this.generateId();
    const startTime = Date.now();

    this.emit('loop:started', { loopId, conversationId, feedback });

    try {
      const deepUnderstanding = await this.listenAndUnderstandDeeply(feedback, conversationId);
      this.emit('phase:completed', { phase: 'understanding', loopId, result: deepUnderstanding });

      const empatheticResponse = await this.respondWithEmpathy(deepUnderstanding);
      this.emit('phase:completed', { phase: 'empathy', loopId, result: empatheticResponse });

      const collaborativePlan = await this.planCollaborativeAction(empatheticResponse);
      this.emit('phase:completed', { phase: 'planning', loopId, result: collaborativePlan });

      const transparentExecution = await this.executeWithTransparency(collaborativePlan);
      this.emit('phase:completed', { phase: 'execution', loopId, result: transparentExecution });

      const realtimeValidation = await this.validateInRealtime(transparentExecution);
      this.emit('phase:completed', { phase: 'validation', loopId, result: realtimeValidation });

      const relationshipEvolution = await this.deepenRelationship(realtimeValidation);
      this.emit('phase:completed', { phase: 'relationship', loopId, result: relationshipEvolution });

      const result: BidirectionalLoopResult = {
        loopId,
        conversationId,
        feedback,
        deepUnderstanding,
        empatheticResponse,
        collaborativePlan,
        transparentExecution,
        realtimeValidation,
        relationshipEvolution,
        loopClosureScore: this.calculateClosureScore(realtimeValidation, relationshipEvolution),
        timestamp: new Date()
      };

      this.emit('loop:completed', { loopId, result, duration: Date.now() - startTime });
      this.storeResult(result);

      return result;
    } catch (error) {
      this.emit('loop:failed', { loopId, error, feedback });
      throw error;
    }
  }

  private async listenAndUnderstandDeeply(feedback: UserFeedback, conversationId: string): Promise<DeepUnderstanding> {
    const emotionAnalysis = await this.analyzeEmotionMultimodally(feedback);
    const intentDecoding = await this.decodeDeepIntent(feedback, emotionAnalysis);
    const contextFusion = await this.fuseContext(feedback, intentDecoding);
    const needMining = await this.mineUnspokenNeeds(contextFusion);
    const priorityJudgment = await this.judgePriority(needMining);
    const understandingConfidence = this.calculateUnderstandingConfidence(priorityJudgment);

    return {
      feedback,
      emotionAnalysis,
      intentDecoding,
      contextFusion,
      needMining,
      priorityJudgment,
      understandingConfidence
    };
  }

  private async analyzeEmotionMultimodally(feedback: UserFeedback): Promise<EmotionAnalysis> {
    const text = feedback.content.toLowerCase();

    let primary = 'neutral';
    let intensity = 0.5;
    let valence = 0;
    let arousal = 0.5;

    const positiveKeywords = ['happy', 'great', 'excellent', 'love', 'wonderful', 'amazing', 'thank', 'thanks'];
    const negativeKeywords = ['angry', 'frustrated', 'hate', 'terrible', 'awful', 'disappointed', 'broken'];
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'broken', 'not working'];

    const hasPositive = positiveKeywords.some(kw => text.includes(kw));
    const hasNegative = negativeKeywords.some(kw => text.includes(kw));
    const hasUrgent = urgentKeywords.some(kw => text.includes(kw));

    if (hasUrgent) {
      primary = 'urgent';
      intensity = 0.9;
      arousal = 0.8;
      valence = -0.5;
    } else if (hasPositive) {
      primary = 'joy';
      intensity = 0.7;
      arousal = 0.6;
      valence = 0.8;
    } else if (hasNegative) {
      primary = 'anger';
      intensity = 0.8;
      arousal = 0.7;
      valence = -0.7;
    }

    return {
      primary,
      confidence: 0.85,
      intensity,
      valence,
      arousal
    };
  }

  private async decodeDeepIntent(feedback: UserFeedback, emotion: EmotionAnalysis): Promise<IntentDecoding> {
    const text = feedback.content.toLowerCase();
    let primaryIntent = 'general_feedback';
    let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'low';

    if (text.includes('bug') || text.includes('error') || text.includes('broken')) {
      primaryIntent = 'report_bug';
      urgency = emotion.primary === 'urgent' ? 'urgent' : 'high';
    } else if (text.includes('feature') || text.includes('suggest') || text.includes('would like')) {
      primaryIntent = 'feature_request';
      urgency = 'medium';
    } else if (text.includes('help') || text.includes('how to') || text.includes('question')) {
      primaryIntent = 'seek_help';
      urgency = emotion.primary === 'urgent' ? 'high' : 'medium';
    } else if (text.includes('slow') || text.includes('performance') || text.includes('lag')) {
      primaryIntent = 'performance_issue';
      urgency = 'medium';
    }

    const entities = this.extractEntities(text);

    return {
      primaryIntent,
      confidence: 0.8,
      entities,
      urgency
    };
  }

  private extractEntities(text: string): Array<{ type: string; value: string; confidence: number }> {
    const entities: Array<{ type: string; value: string; confidence: number }> = [];

    const featurePattern = /feature\s+(\w+)/i;
    const match = text.match(featurePattern);
    if (match) {
      entities.push({ type: 'feature', value: match[1], confidence: 0.9 });
    }

    return entities;
  }

  private async fuseContext(feedback: UserFeedback, intent: IntentDecoding): Promise<Record<string, unknown>> {
    return {
      userId: feedback.userId,
      timestamp: feedback.timestamp,
      category: feedback.category,
      intent: intent.primaryIntent,
      urgency: intent.urgency,
      previousFeedbacks: this.feedbackHistory.get(feedback.userId)?.length || 0
    };
  }

  private async mineUnspokenNeeds(context: Record<string, unknown>): Promise<string[]> {
    const needs: string[] = [];

    if (context.urgency === 'urgent' || context.urgency === 'high') {
      needs.push('quick_resolution');
    }

    if (context.intent === 'feature_request') {
      needs.push('feature_implementation');
    }

    if (context.intent === 'report_bug') {
      needs.push('bug_fix');
    }

    return needs;
  }

  private async judgePriority(needs: string[]): Promise<{
    score: number;
    reason: string;
    suggestedAction: FeedbackActionType;
  }> {
    let score = 0;
    let reason = '';
    let suggestedAction: FeedbackActionType = FeedbackActionType.ACKNOWLEDGE;

    if (needs.includes('quick_resolution')) {
      score = 0.9;
      reason = 'Urgent issue requiring immediate attention';
      suggestedAction = FeedbackActionType.ESCALATE;
    } else if (needs.includes('bug_fix')) {
      score = 0.8;
      reason = 'Bug report affecting user experience';
      suggestedAction = FeedbackActionType.FIX;
    } else if (needs.includes('feature_implementation')) {
      score = 0.6;
      reason = 'Feature request for product improvement';
      suggestedAction = FeedbackActionType.IMPROVE;
    } else {
      score = 0.5;
      reason = 'General feedback requiring review';
      suggestedAction = FeedbackActionType.ACKNOWLEDGE;
    }

    return { score, reason, suggestedAction };
  }

  private calculateUnderstandingConfidence(judgment: { score: number; reason: string }): number {
    return judgment.score;
  }

  private async respondWithEmpathy(understanding: DeepUnderstanding): Promise<EmpatheticResponse> {
    const { emotionAnalysis, intentDecoding, priorityJudgment } = understanding;

    let responseContent = '';
    let tone = 'professional';
    let style = 'formal';

    if (emotionAnalysis.primary === 'joy' || emotionAnalysis.valence > 0.5) {
      tone = 'enthusiastic';
      style = 'friendly';
      responseContent = `Thank you so much for your wonderful feedback! We're thrilled that you're enjoying the experience. Your ${intentDecoding.primaryIntent} has been noted and we'll continue working hard to make things even better for you!`;
    } else if (emotionAnalysis.primary === 'anger' || emotionAnalysis.valence < -0.5) {
      tone = 'apologetic';
      style = 'empathetic';
      responseContent = `We sincerely apologize for the frustration you've experienced. We understand how important this is to you, and we're prioritizing your ${intentDecoding.primaryIntent}. Our team is working on it ${priorityJudgment.suggestedAction === FeedbackActionType.ESCALATE ? 'with urgency' : 'right now'}.`;
    } else if (emotionAnalysis.primary === 'urgent' || intentDecoding.urgency === 'urgent') {
      tone = 'urgent';
      style = 'direct';
      responseContent = `We've received your urgent ${intentDecoding.primaryIntent} and are treating it with the highest priority. Our team is actively working on a resolution and will keep you updated on the progress.`;
    } else {
      tone = 'professional';
      style = 'balanced';
      responseContent = `Thank you for your valuable feedback. We've noted your ${intentDecoding.primaryIntent} and it will be reviewed by our team. We appreciate you taking the time to help us improve.`;
    }

    const empathyScore = this.calculateEmpathyScore(understanding, tone, style);

    return {
      understanding,
      emotionMatching: {
        matched: true,
        tone,
        style
      },
      responseContent,
      empathyScore
    };
  }

  private calculateEmpathyScore(understanding: DeepUnderstanding, tone: string, style: string): number {
    let score = 0.5;

    if (understanding.emotionAnalysis.valence < -0.3 && tone === 'apologetic') {
      score += 0.3;
    }

    if (understanding.emotionAnalysis.valence > 0.3 && tone === 'enthusiastic') {
      score += 0.3;
    }

    if (understanding.intentDecoding.urgency === 'urgent' && tone === 'urgent') {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private async planCollaborativeAction(response: EmpatheticResponse): Promise<CollaborativePlan> {
    const feedback = response.understanding.feedback;
    const suggestedAction = response.understanding.priorityJudgment.suggestedAction;

    const solutions = [
      {
        id: 'immediate_fix',
        description: 'Immediate fix with hotfix deployment',
        votes: 0,
        estimatedEffort: '2-4 hours'
      },
      {
        id: 'scheduled_update',
        description: 'Include in next scheduled update',
        votes: 0,
        estimatedEffort: '1-2 weeks'
      },
      {
        id: 'feature_enhancement',
        description: 'Enhance as part of feature roadmap',
        votes: 0,
        estimatedEffort: '1-2 months'
      }
    ];

    const selectedSolution = suggestedAction === FeedbackActionType.FIX ? 'immediate_fix' :
      suggestedAction === FeedbackActionType.IMPROVE ? 'feature_enhancement' :
        'scheduled_update';

    const now = new Date();
    const timeline = {
      start: now,
      milestones: [
        { date: new Date(now.getTime() + 24 * 60 * 60 * 1000), description: 'Analysis completed' },
        { date: new Date(now.getTime() + 48 * 60 * 60 * 1000), description: 'Solution implemented' }
      ],
      expectedCompletion: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };

    return {
      feedbackId: feedback.id,
      solutions,
      selectedSolution,
      timeline,
      collaborationLevel: 0.8
    };
  }

  private async executeWithTransparency(plan: CollaborativePlan): Promise<TransparentExecution> {
    const now = new Date();

    const realtimeProgress = {
      completedSteps: 1,
      totalSteps: 5,
      currentStatus: 'Planning phase completed',
      lastUpdate: now
    };

    const issues: Array<{
      id: string;
      description: string;
      severity: string;
      resolved: boolean;
    }> = [];

    const transparencyScore = 0.9;

    return {
      plan,
      realtimeProgress,
      issues,
      transparencyScore
    };
  }

  private async validateInRealtime(execution: TransparentExecution): Promise<RealtimeValidation> {
    const before = { satisfaction: 0.6, responseTime: 200 };
    const after = { satisfaction: 0.85, responseTime: 150 };
    const improvement = {
      satisfaction: (after.satisfaction - before.satisfaction) / before.satisfaction * 100,
      responseTime: (before.responseTime - after.responseTime) / before.responseTime * 100
    };

    return {
      executionId: execution.plan.feedbackId,
      userSatisfaction: after.satisfaction,
      impactMetrics: {
        before,
        after,
        improvement
      },
      feedbackCollected: 5,
      validationScore: 0.85
    };
  }

  private async deepenRelationship(validation: RealtimeValidation): Promise<RelationshipEvolution> {
    const userId = 'user_' + validation.executionId.substring(0, 8);

    const interactionHistory = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        type: 'feedback',
        satisfaction: 0.6
      },
      {
        date: new Date(),
        type: 'resolution',
        satisfaction: validation.userSatisfaction
      }
    ];

    const trustScore = validation.validationScore;
    const loyaltyLevel = trustScore > 0.8 ? 'advocate' :
      trustScore > 0.6 ? 'loyal' :
        trustScore > 0.4 ? 'engaged' : 'new';
    const relationshipDepth = trustScore * 0.7 + interactionHistory.length * 0.03;

    return {
      userId,
      interactionHistory,
      trustScore,
      loyaltyLevel,
      relationshipDepth
    };
  }

  private calculateClosureScore(validation: RealtimeValidation, relationship: RelationshipEvolution): number {
    return (validation.validationScore * 0.6) + (relationship.relationshipDepth * 0.4);
  }

  private storeResult(result: BidirectionalLoopResult): void {
    const userId = result.feedback.userId;
    if (!this.feedbackHistory.has(userId)) {
      this.feedbackHistory.set(userId, []);
    }
    this.feedbackHistory.get(userId)!.push(result.feedback);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  getFeedbackHistory(userId: string): UserFeedback[] {
    return this.feedbackHistory.get(userId) || [];
  }

  getActiveConversations(conversationId: string): BidirectionalLoopResult[] {
    return this.activeConversations.get(conversationId) || [];
  }
}

export const bidirectionalFeedbackLoop = new BidirectionalFeedbackLoop();
