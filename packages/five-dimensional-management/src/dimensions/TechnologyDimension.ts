import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  IDimension,
  DimensionType,
  SystemStatus,
  ManagementConfig,
  TechnologyMetrics,
  PerformanceMetrics,
  ReliabilityMetrics,
  SecurityMetrics,
  MaintainabilityMetrics,
  Recommendation,
  AlertLevel
} from '@/types/IFiveDimensionalManagement';
import { Logger } from '@/utils/Logger';
import { SystemMonitor } from '@/monitoring/SystemMonitor';
import { SecurityScanner } from '@/security/SecurityScanner';

/**
 * Technology Dimension - Manages system performance, reliability, and security
 *
 * This dimension handles:
 * - Performance monitoring and optimization
 * - Reliability and availability tracking
 * - Security vulnerability scanning
 * - Technical debt management
 * - Infrastructure health monitoring
 */
export class TechnologyDimension extends EventEmitter implements IDimension {
  private _type: DimensionType = 'technology';
  private _enabled: boolean = false;
  private _status: SystemStatus = 'initializing';
  private _config: ManagementConfig;

  // Core components
  private _systemMonitor: SystemMonitor;
  private _securityScanner: SecurityScanner;
  private _logger: Logger;

  // Monitoring
  private _healthScore: number = 100;
  private _currentMetrics: TechnologyMetrics;
  private _monitoringInterval?: NodeJS.Timeout;

  constructor(config: ManagementConfig) {
    super();
    this._config = config;
    this._logger = new Logger('TechnologyDimension');
    this._systemMonitor = new SystemMonitor(config);
    this._securityScanner = new SecurityScanner(config);

    // Initialize current metrics
    this._currentMetrics = this.initializeMetrics();
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

  get metrics(): TechnologyMetrics {
    return { ...this._currentMetrics };
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  async initialize(): Promise<void> {
    this._logger.info('Initializing TechnologyDimension...');

    try {
      // Initialize core components
      await this._systemMonitor.initialize();
      await this._securityScanner.initialize();

      this._status = 'active';
      this._logger.info('TechnologyDimension initialized successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to initialize TechnologyDimension', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this._enabled) {
      this._logger.warn('TechnologyDimension is already enabled');
      return;
    }

    this._logger.info('Starting TechnologyDimension...');

    try {
      // Start monitoring components
      await this._systemMonitor.start();
      await this._securityScanner.start();

      // Start continuous monitoring
      this.startMonitoring();

      this._enabled = true;
      this._status = 'active';

      this.emit('started', { timestamp: new Date() });
      this._logger.info('TechnologyDimension started successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to start TechnologyDimension', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this._enabled) {
      this._logger.warn('TechnologyDimension is already disabled');
      return;
    }

    this._logger.info('Stopping TechnologyDimension...');

    try {
      // Stop monitoring
      this.stopMonitoring();

      // Stop core components
      await this._systemMonitor.stop();
      await this._securityScanner.stop();

      this._enabled = false;
      this._status = 'suspended';

      this.emit('stopped', { timestamp: new Date() });
      this._logger.info('TechnologyDimension stopped successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to stop TechnologyDimension', error);
      throw error;
    }
  }

  // ========================================================================
  // Metrics Collection
  // ========================================================================

  async collectMetrics(): Promise<TechnologyMetrics> {
    try {
      // Collect performance metrics
      const performance = await this._systemMonitor.getPerformanceMetrics();

      // Collect reliability metrics
      const reliability = await this._systemMonitor.getReliabilityMetrics();

      // Collect security metrics
      const security = await this._securityScanner.getSecurityMetrics();

      // Collect maintainability metrics
      const maintainability = await this._systemMonitor.getMaintainabilityMetrics();

      this._currentMetrics = {
        id: uuidv4(),
        timestamp: new Date(),
        performance,
        reliability,
        scalability: await this.getScalabilityMetrics(),
        security,
        maintainability
      };

      // Update health score
      await this.updateHealthScore();

      // Check for alerts
      await this.checkForAlerts();

      this.emit('metric-update', { metrics: this._currentMetrics, timestamp: new Date() });

      return this._currentMetrics;

    } catch (error) {
      this._logger.error('Failed to collect technology metrics', error);
      throw error;
    }
  }

  async getHealthScore(): Promise<number> {
    await this.updateHealthScore();
    return this._healthScore;
  }

  async getRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Performance recommendations
    if (this._currentMetrics.performance.cpuUtilization > 80) {
      recommendations.push({
        id: uuidv4(),
        type: 'technology',
        priority: 'high',
        title: 'High CPU Utilization Detected',
        description: 'CPU utilization is consistently above 80%. Consider scaling up resources or optimizing code.',
        rationale: `Current CPU utilization: ${this._currentMetrics.performance.cpuUtilization}%`,
        expectedImpact: 'Improved system performance and responsiveness',
        effort: 'medium',
        timeline: '1-2 weeks',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // Security recommendations
    if (this._currentMetrics.security.securityScore < 70) {
      recommendations.push({
        id: uuidv4(),
        type: 'technology',
        priority: 'critical',
        title: 'Security Score Below Acceptable Threshold',
        description: 'Security assessment score is below 70%. Immediate security improvements required.',
        rationale: `Current security score: ${this._currentMetrics.security.securityScore}`,
        expectedImpact: 'Improved security posture and compliance',
        effort: 'high',
        timeline: '2-4 weeks',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });
    }

    // Reliability recommendations
    if (this._currentMetrics.reliability.availability < 99.5) {
      recommendations.push({
        id: uuidv4(),
        type: 'technology',
        priority: 'high',
        title: 'Availability Below SLA Target',
        description: 'System availability is below the 99.5% SLA target. Investigate and resolve reliability issues.',
        rationale: `Current availability: ${this._currentMetrics.reliability.availability}%`,
        expectedImpact: 'Improved system reliability and customer satisfaction',
        effort: 'high',
        timeline: '1-2 weeks',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      });
    }

    return recommendations;
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private initializeMetrics(): TechnologyMetrics {
    return {
      id: uuidv4(),
      timestamp: new Date(),
      performance: {
        responseTime: 0,
        throughput: 0,
        cpuUtilization: 0,
        memoryUtilization: 0,
        diskUtilization: 0,
        networkLatency: 0,
        databaseQueryTime: 0,
        cacheHitRate: 100
      },
      reliability: {
        uptime: 100,
        mtbf: 0,
        mttr: 0,
        errorRate: 0,
        availability: 100,
        slaCompliance: 100
      },
      scalability: {
        concurrentUsers: 0,
        requestsPerMinute: 0,
        autoScalingEvents: 0,
        resourceElasticity: 100,
        horizontalScalingCapacity: 100,
        verticalScalingHeadroom: 100
      },
      security: {
        vulnerabilities: [],
        securityScore: 100,
        complianceStatus: {
          gdpr: true,
          soc2: true,
          iso27001: true,
          hipaa: false,
          pciDss: false,
          lastAudit: new Date(),
          nextAudit: new Date()
        },
        incidentCount: 0,
        authenticationAttempts: 0,
        failedAuthentications: 0,
        securityEvents: []
      },
      maintainability: {
        codeQuality: 100,
        technicalDebt: 0,
        testCoverage: 100,
        documentationCoverage: 100,
        codeComplexity: 0,
        refactorability: 100,
        deploymentFrequency: 0,
        leadTime: 0
      }
    };
  }

  private startMonitoring(): void {
    this._monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        this._logger.error('Technology monitoring cycle failed', error);
      }
    }, this._config.updateFrequency * 1000);
  }

  private stopMonitoring(): void {
    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = undefined;
    }
  }

  private async updateHealthScore(): Promise<void> {
    const weights = {
      performance: 0.25,
      reliability: 0.3,
      security: 0.25,
      maintainability: 0.2
    };

    const scores = {
      performance: this.calculatePerformanceScore(),
      reliability: this.calculateReliabilityScore(),
      security: this.calculateSecurityScore(),
      maintainability: this.calculateMaintainabilityScore()
    };

    this._healthScore = Math.round(
      scores.performance * weights.performance +
      scores.reliability * weights.reliability +
      scores.security * weights.security +
      scores.maintainability * weights.maintainability
    );

    this.emit('health-updated', { score: this._healthScore, timestamp: new Date() });
  }

  private calculatePerformanceScore(): number {
    const { performance } = this._currentMetrics;

    let score = 100;

    // Response time impact (optimal: <200ms)
    if (performance.responseTime > 1000) score -= 30;
    else if (performance.responseTime > 500) score -= 20;
    else if (performance.responseTime > 200) score -= 10;

    // CPU utilization impact (optimal: <70%)
    if (performance.cpuUtilization > 90) score -= 25;
    else if (performance.cpuUtilization > 80) score -= 15;
    else if (performance.cpuUtilization > 70) score -= 5;

    // Memory utilization impact (optimal: <80%)
    if (performance.memoryUtilization > 95) score -= 20;
    else if (performance.memoryUtilization > 85) score -= 10;

    return Math.max(0, score);
  }

  private calculateReliabilityScore(): number {
    const { reliability } = this._currentMetrics;

    let score = 100;

    // Availability impact (optimal: >99.9%)
    if (reliability.availability < 99) score -= 30;
    else if (reliability.availability < 99.5) score -= 15;
    else if (reliability.availability < 99.9) score -= 5;

    // Error rate impact (optimal: <0.1%)
    if (reliability.errorRate > 5) score -= 25;
    else if (reliability.errorRate > 1) score -= 15;
    else if (reliability.errorRate > 0.1) score -= 5;

    // SLA compliance impact
    if (reliability.slaCompliance < 95) score -= 20;
    else if (reliability.slaCompliance < 98) score -= 10;

    return Math.max(0, score);
  }

  private calculateSecurityScore(): number {
    const { security } = this._currentMetrics;

    // Use the security score calculated by the security scanner
    return security.securityScore;
  }

  private calculateMaintainabilityScore(): number {
    const { maintainability } = this._currentMetrics;

    let score = 100;

    // Code quality impact
    if (maintainability.codeQuality < 60) score -= 30;
    else if (maintainability.codeQuality < 80) score -= 15;
    else if (maintainability.codeQuality < 90) score -= 5;

    // Test coverage impact
    if (maintainability.testCoverage < 50) score -= 25;
    else if (maintainability.testCoverage < 70) score -= 15;
    else if (maintainability.testCoverage < 85) score -= 5;

    // Technical debt impact
    if (maintainability.technicalDebt > 100) score -= 20;
    else if (maintainability.technicalDebt > 50) score -= 10;
    else if (maintainability.technicalDebt > 20) score -= 5;

    return Math.max(0, score);
  }

  private async getScalabilityMetrics() {
    // In a real implementation, this would collect actual scalability metrics
    return {
      concurrentUsers: 0,
      requestsPerMinute: 0,
      autoScalingEvents: 0,
      resourceElasticity: 100,
      horizontalScalingCapacity: 100,
      verticalScalingHeadroom: 100
    };
  }

  private async checkForAlerts(): Promise<void> {
    // Performance alerts
    if (this._currentMetrics.performance.responseTime > 2000) {
      this.emit('alert', {
        type: 'technology',
        level: 'critical',
        title: 'Critical Response Time',
        description: `Response time is critically high: ${this._currentMetrics.performance.responseTime}ms`,
        source: 'TechnologyDimension',
        metadata: { metric: 'responseTime', value: this._currentMetrics.performance.responseTime }
      });
    }

    // Reliability alerts
    if (this._currentMetrics.reliability.availability < 99) {
      this.emit('alert', {
        type: 'technology',
        level: 'error',
        title: 'Low Availability',
        description: `System availability is below 99%: ${this._currentMetrics.reliability.availability}%`,
        source: 'TechnologyDimension',
        metadata: { metric: 'availability', value: this._currentMetrics.reliability.availability }
      });
    }

    // Security alerts
    const criticalVulnerabilities = this._currentMetrics.security.vulnerabilities.filter(
      v => v.severity === 'critical' && v.status === 'open'
    );

    if (criticalVulnerabilities.length > 0) {
      this.emit('alert', {
        type: 'technology',
        level: 'critical',
        title: 'Critical Security Vulnerabilities',
        description: `${criticalVulnerabilities.length} critical security vulnerabilities require immediate attention`,
        source: 'TechnologyDimension',
        metadata: { vulnerabilities: criticalVulnerabilities }
      });
    }
  }
}