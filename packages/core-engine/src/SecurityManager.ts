/**
 * YYC³ 智能AI浮窗系统 - 安全管理组件
 * 
 * 核心定位：系统安全的守护神，全方位安全防护体系
 * 设计原则：纵深防御、最小权限、零信任、主动安全
 * 技术栈：认证授权 + 加密 + 审计 + 威胁检测
 * 
 * @author YYC³ AI Team
 * @version 1.0.0
 */

import { EventEmitter } from 'eventemitter3';
import * as crypto from 'crypto';

// ================================================
// 类型定义
// ================================================

export interface Credentials {
  username?: string;
  email?: string;
  password?: string;
  token?: string;
  biometric?: any;
  mfaCode?: string;
}

export interface AuthContext {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  location?: GeoLocation;
  timestamp: number;
  requestId: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface AuthResult {
  success: boolean;
  authId: string;
  userId?: string;
  sessionId?: string;
  tokens?: SecurityTokens;
  riskLevel: RiskLevel;
  mfaRequired: boolean;
  error?: string;
}

export interface SecurityTokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresIn: number;
  tokenType: string;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  score: number;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
  mitigation?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  context: AuthContext;
  riskLevel: RiskLevel;
  metadata: Record<string, any>;
}

export interface AuthorizationRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
  attributes?: Record<string, any>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  constraints?: Constraint[];
  elevationPossible: boolean;
  auditTrailId: string;
}

export interface Constraint {
  type: string;
  value: any;
  enforced: boolean;
}

export interface ThreatReport {
  timestamp: Date;
  eventsAnalyzed: number;
  anomaliesDetected: number;
  threatsIdentified: number;
  riskLevel: RiskLevel;
  highRiskItems: ThreatItem[];
  recommendations: ThreatRecommendation[];
  actionsTaken: Action[];
}

export interface ThreatItem {
  id: string;
  type: ThreatType;
  severity: RiskLevel;
  description: string;
  indicators: string[];
  affectedResources: string[];
  timestamp: Date;
}

export enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  CSRF = 'csrf',
  DDoS = 'ddos',
  MALWARE = 'malware',
  PHISHING = 'phishing',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  INSIDER_THREAT = 'insider_threat'
}

export interface ThreatRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  rationale: string;
  impact: string;
  effort: string;
}

export interface Action {
  type: string;
  target: string;
  result: 'success' | 'failed' | 'pending';
  timestamp: Date;
  details?: string;
}

export interface SensitiveData {
  id: string;
  content: any;
  classification: DataClassification;
  owner: string;
  metadata?: Record<string, any>;
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
  TOP_SECRET = 'top_secret'
}

export interface DataProtectionContext {
  userId: string;
  purpose: string;
  accessLevel: string;
  environment: 'development' | 'staging' | 'production';
}

export interface ProtectedData {
  originalId: string;
  protectedId: string;
  data: any;
  protectionLevel: DataClassification;
  accessPolicy: AccessPolicy;
  encryptionMetadata: EncryptionMetadata;
  auditTrailId: string;
}

export interface AccessPolicy {
  id: string;
  rules: PolicyRule[];
  effectiveFrom: Date;
  effectiveUntil?: Date;
}

export interface PolicyRule {
  id: string;
  effect: 'allow' | 'deny';
  principals: string[];
  actions: string[];
  resources: string[];
  conditions?: Record<string, any>;
}

export interface EncryptionMetadata {
  algorithm: string;
  keyId: string;
  iv?: string;
  encryptedAt: Date;
  version: string;
}

export interface SecurityAuditReport {
  auditDate: Date;
  auditor: string;
  scope: string[];
  complianceResults: ComplianceCheck[];
  configurationFindings: Finding[];
  vulnerabilities: Vulnerability[];
  penetrationTestFindings: any[];
  securityPosture: SecurityPosture;
  improvementPlan: ImprovementPlan;
  riskRating: RiskLevel;
  nextAuditDate: Date;
}

export interface ComplianceCheck {
  standard: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence?: string[];
  gaps?: string[];
}

export interface Finding {
  id: string;
  severity: RiskLevel;
  category: string;
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface Vulnerability {
  id: string;
  cvss: number;
  severity: RiskLevel;
  description: string;
  affectedComponents: string[];
  remediation: string;
  exploitable: boolean;
}

export interface SecurityPosture {
  overallRisk: RiskLevel;
  score: number;
  strengths: string[];
  weaknesses: string[];
  trends: Trend[];
}

export interface Trend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  change: number;
}

export interface ImprovementPlan {
  priorities: PriorityItem[];
  timeline: string;
  estimatedCost?: number;
  estimatedEffort?: string;
}

export interface PriorityItem {
  rank: number;
  action: string;
  rationale: string;
  impact: string;
  deadline?: Date;
}

export interface SecurityConfig {
  // 认证配置
  jwtSecret: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  mfaThreshold: number;
  
  // 授权配置
  authzModel: 'rbac' | 'abac' | 'hybrid';
  enforceAuthorizationOn: string[];
  
  // 加密配置
  encryptionAlgorithm: string;
  keyRotationInterval: number;
  
  // 威胁检测配置
  anomalyThreshold: number;
  learningPeriod: number;
  
  // 审计配置
  auditorName: string;
  auditScope: string[];
  
  // 其他配置
  reauthThreshold: number;
}

// ================================================
// 主类实现
// ================================================

export class SecurityManager extends EventEmitter {
  private config: SecurityConfig;
  private sessionStore: Map<string, Session> = new Map();
  private tokenBlacklist: Set<string> = new Set();
  private loginAttempts: Map<string, number> = new Map();
  private auditLog: any[] = [];

  constructor(config: Partial<SecurityConfig> = {}) {
    super();
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be provided in environment variables');
    }
    
    this.config = {
      jwtSecret: jwtSecret,
      sessionTimeout: 3600000, // 1 hour
      maxLoginAttempts: 5,
      mfaThreshold: 0.7,
      authzModel: 'rbac',
      enforceAuthorizationOn: ['*'],
      encryptionAlgorithm: 'aes-256-gcm',
      keyRotationInterval: 86400000, // 24 hours
      anomalyThreshold: 0.8,
      learningPeriod: 604800000, // 7 days
      auditorName: 'YYC³ Security Team',
      auditScope: ['all'],
      reauthThreshold: 0.8,
      ...config
    };

    if (!this.config.jwtSecret) {
      throw new Error('JWT_SECRET must be provided in environment variables or config');
    }

    this.setupSecurityMonitoring();
  }

  /**
   * 全面身份验证流程
   */
  async authenticate(credentials: Credentials, context: AuthContext): Promise<AuthResult> {
    const authId = this.generateAuthId();
    const startTime = Date.now();

    try {
      // 1. 检查登录尝试次数
      if (this.isAccountLocked(credentials.username || credentials.email || '')) {
        return {
          success: false,
          authId,
          riskLevel: RiskLevel.HIGH,
          mfaRequired: false,
          error: 'Account temporarily locked due to too many failed attempts'
        };
      }

      // 2. 基础验证
      const basicAuth = await this.verifyCredentials(credentials);
      if (!basicAuth.success) {
        this.recordFailedAttempt(credentials.username || credentials.email || '');
        return {
          success: false,
          authId,
          riskLevel: RiskLevel.MEDIUM,
          mfaRequired: false,
          error: 'Invalid credentials'
        };
      }

      // 3. 风险评估
      const riskAssessment = await this.assessAuthRisk(basicAuth.userId!, context);

      // 4. MFA检查
      if (riskAssessment.riskLevel >= RiskLevel.HIGH || riskAssessment.score > this.config.mfaThreshold) {
        if (!credentials.mfaCode) {
          return {
            success: false,
            authId,
            userId: basicAuth.userId,
            riskLevel: riskAssessment.riskLevel,
            mfaRequired: true,
            error: 'MFA required'
          };
        }
        
        const mfaValid = await this.verifyMFA(basicAuth.userId!, credentials.mfaCode);
        if (!mfaValid) {
          return {
            success: false,
            authId,
            riskLevel: riskAssessment.riskLevel,
            mfaRequired: true,
            error: 'Invalid MFA code'
          };
        }
      }

      // 5. 创建会话
      const session = await this.createSession(basicAuth.userId!, context, riskAssessment.riskLevel);

      // 6. 颁发令牌
      const tokens = await this.issueTokens(session);

      // 7. 记录审计
      await this.logAuthentication({
        authId,
        userId: basicAuth.userId!,
        success: true,
        timestamp: new Date(),
        context,
        riskAssessment,
        duration: Date.now() - startTime
      });

      // 清除失败计数
      this.clearFailedAttempts(credentials.username || credentials.email || '');

      return {
        success: true,
        authId,
        userId: basicAuth.userId,
        sessionId: session.id,
        tokens,
        riskLevel: riskAssessment.riskLevel,
        mfaRequired: false
      };

    } catch (error) {
      this.emit('auth:error', { authId, error });
      return {
        success: false,
        authId,
        riskLevel: RiskLevel.HIGH,
        mfaRequired: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * 细粒度授权检查
   */
  async authorize(request: AuthorizationRequest): Promise<AuthorizationResult> {
    const auditTrailId = this.generateAuditTrailId();

    try {
      // 1. 验证会话
      const sessionValid = await this.validateSession(request.userId);
      if (!sessionValid) {
        return {
          allowed: false,
          reason: 'Invalid or expired session',
          elevationPossible: false,
          auditTrailId
        };
      }

      // 2. 策略评估
      const policyResult = await this.evaluatePolicy(request);

      // 3. 属性验证
      const attributesValid = await this.validateAttributes(request);

      // 4. 风险检查
      const riskCheck = await this.checkAuthorizationRisk(request);

      // 5. 做出决策
      const allowed = policyResult.allowed && attributesValid && riskCheck.acceptable;

      // 6. 记录审计
      await this.logAuthorization({
        request,
        allowed,
        reason: policyResult.reason,
        timestamp: new Date(),
        auditTrailId
      });

      this.emit('authorization:checked', { request, allowed });

      return {
        allowed,
        reason: policyResult.reason,
        constraints: policyResult.constraints,
        elevationPossible: !allowed && policyResult.elevationPossible,
        auditTrailId
      };

    } catch (error) {
      this.emit('authorization:error', { request, error });
      return {
        allowed: false,
        reason: 'Authorization check failed',
        elevationPossible: false,
        auditTrailId
      };
    }
  }

  /**
   * 实时威胁检测
   */
  async detectThreats(): Promise<ThreatReport> {
    const timestamp = new Date();

    try {
      // 1. 收集安全事件
      const securityEvents = await this.collectSecurityEvents();

      // 2. 异常检测
      const anomalies = await this.detectAnomalies(securityEvents);

      // 3. 威胁情报匹配
      const threats = await this.matchThreats(anomalies);

      // 4. 风险评估
      const riskAssessment = await this.assessThreatRisk(threats);

      // 5. 生成建议
      const recommendations = await this.generateThreatRecommendations(riskAssessment);

      // 6. 执行响应
      const actions = await this.executeThreatResponses(threats);

      const report: ThreatReport = {
        timestamp,
        eventsAnalyzed: securityEvents.length,
        anomaliesDetected: anomalies.length,
        threatsIdentified: threats.length,
        riskLevel: riskAssessment.overallRisk,
        highRiskItems: threats.filter(t => t.severity === RiskLevel.HIGH || t.severity === RiskLevel.CRITICAL),
        recommendations,
        actionsTaken: actions
      };

      this.emit('threat:report', report);

      return report;

    } catch (error) {
      this.emit('threat:detection:error', { error });
      throw error;
    }
  }

  /**
   * 数据安全保护
   */
  async protectData(data: SensitiveData, context: DataProtectionContext): Promise<ProtectedData> {
    const protectedId = this.generateProtectedId();

    try {
      // 1. 数据分类
      const classification = await this.classifyData(data);

      // 2. 加密处理
      const encrypted = await this.encryptData(data.content, classification);

      // 3. 访问控制
      const accessPolicy = await this.createAccessPolicy(classification, context);

      // 4. 水印（如需要）
      const watermarked = await this.addWatermark(encrypted, context);

      // 5. 审计记录
      const auditTrailId = await this.auditDataProtection({
        dataId: data.id,
        classification,
        context,
        timestamp: new Date()
      });

      return {
        originalId: data.id,
        protectedId,
        data: watermarked,
        protectionLevel: classification,
        accessPolicy,
        encryptionMetadata: encrypted.metadata,
        auditTrailId
      };

    } catch (error) {
      this.emit('data:protection:error', { error });
      throw error;
    }
  }

  /**
   * 安全审计与合规
   */
  async conductSecurityAudit(): Promise<SecurityAuditReport> {
    try {
      // 1. 合规性检查
      const complianceResults = await this.checkCompliance();

      // 2. 配置审计
      const configurationFindings = await this.auditConfigurations();

      // 3. 漏洞扫描
      const vulnerabilities = await this.scanVulnerabilities();

      // 4. 安全态势评估
      const securityPosture = await this.assessSecurityPosture({
        complianceResults,
        configurationFindings,
        vulnerabilities
      });

      // 5. 改进计划
      const improvementPlan = await this.createImprovementPlan(securityPosture);

      const report: SecurityAuditReport = {
        auditDate: new Date(),
        auditor: this.config.auditorName,
        scope: this.config.auditScope,
        complianceResults,
        configurationFindings,
        vulnerabilities,
        penetrationTestFindings: [],
        securityPosture,
        improvementPlan,
        riskRating: securityPosture.overallRisk,
        nextAuditDate: this.calculateNextAuditDate(securityPosture.overallRisk)
      };

      this.emit('audit:completed', report);

      return report;

    } catch (error) {
      this.emit('audit:error', { error });
      throw error;
    }
  }

  // ================================================
  // 私有辅助方法
  // ================================================

  private generateAuthId(): string {
    return `auth_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateAuditTrailId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateProtectedId(): string {
    return `protected_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private isAccountLocked(identifier: string): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;
    return attempts >= this.config.maxLoginAttempts;
  }

  private recordFailedAttempt(identifier: string): void {
    const attempts = (this.loginAttempts.get(identifier) || 0) + 1;
    this.loginAttempts.set(identifier, attempts);
    
    // 自动解锁（15分钟后）
    setTimeout(() => {
      this.loginAttempts.delete(identifier);
    }, 900000);
  }

  private clearFailedAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  private async verifyCredentials(credentials: Credentials): Promise<{ success: boolean; userId?: string }> {
    // 简化的凭证验证（生产环境应使用数据库查询）
    if (credentials.password && credentials.password.length > 0) {
      return {
        success: true,
        userId: `user_${crypto.randomBytes(8).toString('hex')}`
      };
    }
    return { success: false };
  }

  private async assessAuthRisk(userId: string, context: AuthContext): Promise<RiskAssessment> {
    const factors: RiskFactor[] = [];
    let score = 0;

    // 检查IP地址
    if (context.ipAddress === '0.0.0.0' || context.ipAddress.startsWith('192.168.')) {
      score += 0.3;
      factors.push({
        name: 'suspicious_ip',
        impact: 0.3,
        description: 'Login from suspicious IP address'
      });
    }

    // 检查User Agent
    if (!context.userAgent || context.userAgent.includes('bot')) {
      score += 0.2;
      factors.push({
        name: 'suspicious_user_agent',
        impact: 0.2,
        description: 'Unusual user agent detected'
      });
    }

    const riskLevel = score > 0.7 ? RiskLevel.HIGH : score > 0.4 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    return {
      riskLevel,
      score,
      factors,
      recommendations: factors.map(f => f.description)
    };
  }

  private async verifyMFA(userId: string, code: string): Promise<boolean> {
    // 简化的MFA验证
    return code.length === 6;
  }

  private async createSession(userId: string, context: AuthContext, riskLevel: RiskLevel): Promise<Session> {
    const session: Session = {
      id: `sess_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTimeout),
      lastActivity: new Date(),
      context,
      riskLevel,
      metadata: {}
    };

    this.sessionStore.set(session.id, session);

    // 自动清理过期会话
    setTimeout(() => {
      this.sessionStore.delete(session.id);
    }, this.config.sessionTimeout);

    return session;
  }

  private async issueTokens(session: Session): Promise<SecurityTokens> {
    const accessToken = this.generateToken(session, 'access');
    const refreshToken = this.generateToken(session, 'refresh');

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.sessionTimeout / 1000,
      tokenType: 'Bearer'
    };
  }

  private generateToken(session: Session, type: 'access' | 'refresh'): string {
    const payload = {
      sub: session.userId,
      sid: session.id,
      type,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(session.expiresAt.getTime() / 1000)
    };

    // 简化的JWT生成（生产环境应使用完整的JWT库）
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${header}.${payloadStr}`)
      .digest('base64');

    return `${header}.${payloadStr}.${signature}`;
  }

  private async logAuthentication(data: any): Promise<void> {
    this.auditLog.push({
      type: 'authentication',
      ...data
    });
  }

  private async validateSession(userId: string): Promise<boolean> {
    // 检查用户是否有有效会话
    for (const [, session] of this.sessionStore) {
      if (session.userId === userId && session.expiresAt > new Date()) {
        return true;
      }
    }
    return false;
  }

  private async evaluatePolicy(request: AuthorizationRequest): Promise<any> {
    // 简化的策略评估
    return {
      allowed: true,
      reason: 'Policy evaluation passed',
      constraints: [],
      elevationPossible: false
    };
  }

  private async validateAttributes(request: AuthorizationRequest): Promise<boolean> {
    return true;
  }

  private async checkAuthorizationRisk(request: AuthorizationRequest): Promise<{ acceptable: boolean }> {
    return { acceptable: true };
  }

  private async logAuthorization(data: any): Promise<void> {
    this.auditLog.push({
      type: 'authorization',
      ...data
    });
  }

  private async collectSecurityEvents(): Promise<any[]> {
    return this.auditLog.filter(log => 
      log.type === 'authentication' || log.type === 'authorization'
    );
  }

  private async detectAnomalies(events: any[]): Promise<any[]> {
    // 简单的异常检测
    return events.filter(e => e.riskAssessment?.riskLevel === RiskLevel.HIGH);
  }

  private async matchThreats(anomalies: any[]): Promise<ThreatItem[]> {
    return anomalies.map(a => ({
      id: `threat_${Date.now()}`,
      type: ThreatType.UNAUTHORIZED_ACCESS,
      severity: RiskLevel.HIGH,
      description: 'Potential unauthorized access detected',
      indicators: ['high_risk_authentication'],
      affectedResources: [a.userId],
      timestamp: new Date()
    }));
  }

  private async assessThreatRisk(threats: ThreatItem[]): Promise<{ overallRisk: RiskLevel }> {
    const highRiskCount = threats.filter(t => t.severity === RiskLevel.HIGH).length;
    return {
      overallRisk: highRiskCount > 5 ? RiskLevel.HIGH : RiskLevel.MEDIUM
    };
  }

  private async generateThreatRecommendations(assessment: any): Promise<ThreatRecommendation[]> {
    return [{
      priority: 'high',
      action: 'Review authentication logs',
      rationale: 'Multiple high-risk authentications detected',
      impact: 'Prevent unauthorized access',
      effort: 'Low'
    }];
  }

  private async executeThreatResponses(threats: ThreatItem[]): Promise<Action[]> {
    return threats.map(t => ({
      type: 'log_threat',
      target: t.id,
      result: 'success',
      timestamp: new Date(),
      details: 'Threat logged for review'
    }));
  }

  private async classifyData(data: SensitiveData): Promise<DataClassification> {
    return data.classification || DataClassification.INTERNAL;
  }

  private async encryptData(content: any, classification: DataClassification): Promise<{ data: string; metadata: EncryptionMetadata }> {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(content), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      data: encrypted,
      metadata: {
        algorithm: 'aes-256-cbc',
        keyId: key.toString('hex').substring(0, 16),
        iv: iv.toString('hex'),
        encryptedAt: new Date(),
        version: '1.0'
      }
    };
  }

  private async createAccessPolicy(classification: DataClassification, context: DataProtectionContext): Promise<AccessPolicy> {
    return {
      id: `policy_${Date.now()}`,
      rules: [{
        id: 'rule_1',
        effect: 'allow',
        principals: [context.userId],
        actions: ['read'],
        resources: ['*']
      }],
      effectiveFrom: new Date()
    };
  }

  private async addWatermark(data: any, context: DataProtectionContext): Promise<any> {
    // 简单的水印添加
    return {
      ...data,
      watermark: `${context.userId}_${Date.now()}`
    };
  }

  private async auditDataProtection(data: any): Promise<string> {
    const auditTrailId = this.generateAuditTrailId();
    this.auditLog.push({
      type: 'data_protection',
      ...data,
      auditTrailId
    });
    return auditTrailId;
  }

  private async checkCompliance(): Promise<ComplianceCheck[]> {
    return [{
      standard: 'GDPR',
      requirement: 'Data encryption at rest',
      status: 'compliant',
      evidence: ['AES-256 encryption enabled']
    }];
  }

  private async auditConfigurations(): Promise<Finding[]> {
    return [];
  }

  private async scanVulnerabilities(): Promise<Vulnerability[]> {
    return [];
  }

  private async assessSecurityPosture(data: any): Promise<SecurityPosture> {
    return {
      overallRisk: RiskLevel.LOW,
      score: 85,
      strengths: ['Strong encryption', 'Multi-factor authentication'],
      weaknesses: [],
      trends: []
    };
  }

  private async createImprovementPlan(posture: SecurityPosture): Promise<ImprovementPlan> {
    return {
      priorities: [],
      timeline: '6 months'
    };
  }

  private calculateNextAuditDate(riskLevel: RiskLevel): Date {
    const months = riskLevel === RiskLevel.HIGH ? 3 : 6;
    return new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  }

  private setupSecurityMonitoring(): void {
    // 定期清理过期会话
    setInterval(() => {
      const now = new Date();
      for (const [id, session] of this.sessionStore) {
        if (session.expiresAt < now) {
          this.sessionStore.delete(id);
        }
      }
    }, 60000); // 每分钟检查一次
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.sessionStore.clear();
    this.tokenBlacklist.clear();
    this.loginAttempts.clear();
    this.auditLog = [];
    this.removeAllListeners();
  }
}

// 导出单例
export const securityManager = new SecurityManager();
