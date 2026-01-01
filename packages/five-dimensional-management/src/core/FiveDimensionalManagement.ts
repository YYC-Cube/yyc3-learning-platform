import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import WebSocket from 'ws';
import express from 'express';
import {
  IFiveDimensionalManagement,
  IDimension,
  SystemStatus,
  ManagementConfig,
  ManagementMetrics,
  DashboardData,
  Alert,
  Recommendation,
  ReportConfig,
  Report,
  AlertFilters,
  DimensionType,
  AlertLevel,
  Priority
} from '@/types/IFiveDimensionalManagement';
import { GoalDimension } from '@/dimensions/GoalDimension';
import { TechnologyDimension } from '@/dimensions/TechnologyDimension';
import { DataDimension } from '@/dimensions/DataDimension';
import { UXDimension } from '@/dimensions/UXDimension';
import { ValueDimension } from '@/dimensions/ValueDimension';
import { MetricsCollector } from '@/monitoring/MetricsCollector';
import { AlertManager } from '@/monitoring/AlertManager';
import { RecommendationEngine } from '@/core/RecommendationEngine';
import { ReportGenerator } from '@/core/ReportGenerator';
import { Logger } from '@/utils/Logger';

/**
 * Five-Dimensional Closed-Loop Management System
 *
 * This is the core system that manages all five dimensions:
 * 1. Goal Dimension - Strategic objectives and KPI management
 * 2. Technology Dimension - System performance and reliability
 * 3. Data Dimension - Data quality and analytics
 * 4. UX Dimension - User experience and satisfaction
 * 5. Value Dimension - Business value and ROI
 */
export class FiveDimensionalManagement extends EventEmitter implements IFiveDimensionalManagement {
  private _status: SystemStatus = 'initializing';
  private _config: ManagementConfig;
  private _metrics: ManagementMetrics;
  private _dashboard: DashboardData;
  private _dimensions: Map<DimensionType, IDimension> = new Map();
  private _alerts: Map<string, Alert> = new Map();
  private _recommendations: Map<string, Recommendation> = new Map();

  // Core components
  private _metricsCollector: MetricsCollector;
  private _alertManager: AlertManager;
  private _recommendationEngine: RecommendationEngine;
  private _reportGenerator: ReportGenerator;
  private _logger: Logger;

  // Scheduled tasks
  private _metricsCollectionJob?: cron.ScheduledTask;
  private _alertProcessingJob?: cron.ScheduledTask;
  private _recommendationJob?: cron.ScheduledTask;
  private _dashboardRefreshJob?: cron.ScheduledTask;

  // Web server for dashboard
  private _app?: express.Express;
  private _server?: any;
  private _wsServer?: WebSocket.Server;

  constructor(config: ManagementConfig) {
    super();
    this._config = config;
    this._logger = new Logger('FiveDimensionalManagement');

    // Initialize metrics with default values
    this._metrics = this.initializeMetrics();
    this._dashboard = this.initializeDashboard();

    // Initialize core components
    this._metricsCollector = new MetricsCollector(config);
    this._alertManager = new AlertManager(config);
    this._recommendationEngine = new RecommendationEngine(config);
    this._reportGenerator = new ReportGenerator(config);

    // Setup event handlers
    this.setupEventHandlers();

    this._logger.info('FiveDimensionalManagement initialized', {
      systemId: config.systemId,
      environment: config.environment
    });
  }

  // ========================================================================
  // Properties
  // ========================================================================

  get status(): SystemStatus {
    return this._status;
  }

  get config(): ManagementConfig {
    return { ...this._config };
  }

  get metrics(): ManagementMetrics {
    return { ...this._metrics };
  }

  get dashboard(): DashboardData {
    return { ...this._dashboard };
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  async initialize(): Promise<void> {
    this._logger.info('Initializing FiveDimensionalManagement system...');
    this._status = 'initializing';

    try {
      // Initialize all dimensions
      await this.initializeDimensions();

      // Initialize core components
      await this._metricsCollector.initialize();
      await this._alertManager.initialize();
      await this._recommendationEngine.initialize();
      await this._reportGenerator.initialize();

      // Setup scheduled tasks
      this.setupScheduledTasks();

      // Initialize web server if enabled
      if (this._config.alerts.notifications.dashboard) {
        await this.initializeWebServer();
      }

      // Perform initial metrics collection
      await this.collectMetrics();
      await this.refreshDashboard();

      this._status = 'active';
      this.emit('system-status-change', { status: 'active', timestamp: new Date() });

      this._logger.info('FiveDimensionalManagement system initialized successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to initialize FiveDimensionalManagement', error);
      this.emit('system-status-change', { status: 'error', error, timestamp: new Date() });
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this._status === 'active') {
      this._logger.warn('System is already active');
      return;
    }

    this._logger.info('Starting FiveDimensionalManagement system...');

    try {
      // Start all dimensions
      for (const [type, dimension] of this._dimensions) {
        if (this._config.dimensions[type as keyof typeof this._config.dimensions].enabled) {
          await dimension.start();
          this._logger.info(`Started ${type} dimension`);
        }
      }

      // Start scheduled tasks
      this.startScheduledTasks();

      // Start web server
      if (this._server) {
        await this.startWebServer();
      }

      this._status = 'active';
      this.emit('system-status-change', { status: 'active', timestamp: new Date() });

      this._logger.info('FiveDimensionalManagement system started successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to start FiveDimensionalManagement', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this._status === 'suspended') {
      this._logger.warn('System is already suspended');
      return;
    }

    this._logger.info('Stopping FiveDimensionalManagement system...');

    try {
      // Stop scheduled tasks
      this.stopScheduledTasks();

      // Stop all dimensions
      for (const [type, dimension] of this._dimensions) {
        await dimension.stop();
        this._logger.info(`Stopped ${type} dimension`);
      }

      // Stop web server
      if (this._server) {
        await this.stopWebServer();
      }

      this._status = 'suspended';
      this.emit('system-status-change', { status: 'suspended', timestamp: new Date() });

      this._logger.info('FiveDimensionalManagement system stopped successfully');

    } catch (error) {
      this._status = 'error';
      this._logger.error('Failed to stop FiveDimensionalManagement', error);
      throw error;
    }
  }

  async restart(): Promise<void> {
    this._logger.info('Restarting FiveDimensionalManagement system...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
    await this.start();
  }

  async shutdown(): Promise<void> {
    this._logger.info('Shutting down FiveDimensionalManagement system...');

    try {
      // Stop everything first
      await this.stop();

      // Cleanup resources
      this._dimensions.clear();
      this._alerts.clear();
      this._recommendations.clear();

      // Shutdown core components
      if (this._metricsCollector) {
        await this._metricsCollector.shutdown();
      }
      if (this._alertManager) {
        await this._alertManager.shutdown();
      }
      if (this._recommendationEngine) {
        await this._recommendationEngine.shutdown();
      }
      if (this._reportGenerator) {
        await this._reportGenerator.shutdown();
      }

      this._status = 'initializing';
      this._logger.info('FiveDimensionalManagement system shutdown complete');

    } catch (error) {
      this._logger.error('Error during shutdown', error);
      throw error;
    }
  }

  // ========================================================================
  // Configuration Management
  // ========================================================================

  async updateConfig(config: Partial<ManagementConfig>): Promise<void> {
    this._logger.info('Updating configuration', { changes: Object.keys(config) });

    try {
      // Validate configuration
      const newConfig = { ...this._config, ...config };

      // Update dimensions configuration
      if (config.dimensions) {
        for (const [type, dimConfig] of Object.entries(config.dimensions)) {
          const dimension = this._dimensions.get(type as DimensionType);
          if (dimension && dimConfig.enabled !== this._config.dimensions[type as keyof typeof this._config.dimensions].enabled) {
            if (dimConfig.enabled) {
              await dimension.start();
            } else {
              await dimension.stop();
            }
          }
        }
      }

      this._config = newConfig;

      // Update core components configuration
      await this._metricsCollector.updateConfig(newConfig);
      await this._alertManager.updateConfig(newConfig);
      await this._recommendationEngine.updateConfig(newConfig);
      await this._reportGenerator.updateConfig(newConfig);

      // Restart scheduled tasks if frequency changed
      if (config.updateFrequency) {
        this.setupScheduledTasks();
      }

      this.emit('config-updated', { config: newConfig, timestamp: new Date() });

      this._logger.info('Configuration updated successfully');

    } catch (error) {
      this._logger.error('Failed to update configuration', error);
      throw error;
    }
  }

  getConfig(): ManagementConfig {
    return { ...this._config };
  }

  // ========================================================================
  // Dimension Management
  // ========================================================================

  getDimension<T extends DimensionType>(type: T): IDimension | undefined {
    return this._dimensions.get(type);
  }

  async enableDimension(type: DimensionType): Promise<void> {
    const dimension = this._dimensions.get(type);
    if (!dimension) {
      throw new Error(`Dimension ${type} not found`);
    }

    if (!dimension.enabled) {
      await dimension.start();
      this._config.dimensions[type as keyof typeof this._config.dimensions].enabled = true;
      this.emit('dimension-enabled', { type, timestamp: new Date() });
    }
  }

  async disableDimension(type: DimensionType): Promise<void> {
    const dimension = this._dimensions.get(type);
    if (!dimension) {
      throw new Error(`Dimension ${type} not found`);
    }

    if (dimension.enabled) {
      await dimension.stop();
      this._config.dimensions[type as keyof typeof this._config.dimensions].enabled = false;
      this.emit('dimension-disabled', { type, timestamp: new Date() });
    }
  }

  // ========================================================================
  // Data Collection
  // ========================================================================

  async collectMetrics(): Promise<void> {
    if (this._status !== 'active') {
      return;
    }

    try {
      const metrics = await this._metricsCollector.collectAllMetrics();
      this._metrics = metrics;

      // Update dashboard data
      await this.refreshDashboard();

      // Emit metrics update event
      this.emit('metric-update', { metrics, timestamp: new Date() });

      this._logger.debug('Metrics collected successfully');

    } catch (error) {
      this._logger.error('Failed to collect metrics', error);
      throw error;
    }
  }

  async getMetrics(timeRange?: { start: Date; end: Date }): Promise<ManagementMetrics> {
    if (timeRange) {
      return await this._metricsCollector.getHistoricalMetrics(timeRange);
    }
    return { ...this._metrics };
  }

  // ========================================================================
  // Alert Management
  // ========================================================================

  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    let alerts = Array.from(this._alerts.values());

    if (filters) {
      if (filters.type) {
        alerts = alerts.filter(alert => alert.type === filters.type);
      }
      if (filters.level) {
        alerts = alerts.filter(alert => alert.level === filters.level);
      }
      if (filters.status) {
        alerts = alerts.filter(alert => {
          if (filters.status === 'active') return !alert.acknowledged && !alert.resolved;
          if (filters.status === 'acknowledged') return alert.acknowledged && !alert.resolved;
          if (filters.status === 'resolved') return alert.resolved;
          return true;
        });
      }
      if (filters.dateRange) {
        alerts = alerts.filter(alert =>
          alert.timestamp >= filters.dateRange!.start &&
          alert.timestamp <= filters.dateRange!.end
        );
      }
      if (filters.source) {
        alerts = alerts.filter(alert => alert.source === filters.source);
      }
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this._alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    if (alert.acknowledged) {
      this._logger.warn(`Alert ${alertId} already acknowledged`);
      return;
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    this._alerts.set(alertId, alert);

    this.emit('alert-acknowledged', { alert, userId, timestamp: new Date() });
    this._logger.info(`Alert ${alertId} acknowledged by ${userId}`);
  }

  async resolveAlert(alertId: string, userId: string, resolution: string): Promise<void> {
    const alert = this._alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.resolved = true;
    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();

    // Add resolution to actions
    alert.actions.push({
      id: uuidv4(),
      type: 'manual',
      description: resolution,
      executed: true,
      executedBy: userId,
      executedAt: new Date(),
      result: 'resolved'
    });

    this._alerts.set(alertId, alert);

    this.emit('alert-resolved', { alert, userId, resolution, timestamp: new Date() });
    this._logger.info(`Alert ${alertId} resolved by ${userId}: ${resolution}`);
  }

  // ========================================================================
  // Dashboard
  // ========================================================================

  async getDashboardData(): Promise<DashboardData> {
    return { ...this._dashboard };
  }

  async refreshDashboard(): Promise<void> {
    try {
      const dashboardData = await this._metricsCollector.generateDashboardData();
      this._dashboard = dashboardData;

      this.emit('dashboard-refreshed', { dashboard: dashboardData, timestamp: new Date() });

    } catch (error) {
      this._logger.error('Failed to refresh dashboard', error);
      throw error;
    }
  }

  // ========================================================================
  // Recommendations
  // ========================================================================

  async getRecommendations(): Promise<Recommendation[]> {
    return Array.from(this._recommendations.values())
      .filter(rec => rec.status === 'pending')
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async generateRecommendations(): Promise<Recommendation[]> {
    try {
      const recommendations = await this._recommendationEngine.generateRecommendations(
        this._metrics,
        Array.from(this._dimensions.values())
      );

      // Store new recommendations
      for (const recommendation of recommendations) {
        this._recommendations.set(recommendation.id, recommendation);
      }

      this.emit('recommendations-generated', { recommendations, timestamp: new Date() });

      this._logger.info(`Generated ${recommendations.length} new recommendations`);

      return recommendations;

    } catch (error) {
      this._logger.error('Failed to generate recommendations', error);
      throw error;
    }
  }

  async applyRecommendation(recommendationId: string): Promise<void> {
    const recommendation = this._recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    if (recommendation.status !== 'pending') {
      throw new Error(`Recommendation ${recommendationId} is not in pending status`);
    }

    try {
      recommendation.status = 'in-progress';
      this._recommendations.set(recommendationId, recommendation);

      // Apply the recommendation logic here
      await this._recommendationEngine.applyRecommendation(recommendation);

      recommendation.status = 'completed';
      this._recommendations.set(recommendationId, recommendation);

      this.emit('recommendation-applied', { recommendation, timestamp: new Date() });

      this._logger.info(`Recommendation ${recommendationId} applied successfully`);

    } catch (error) {
      recommendation.status = 'pending'; // Reset to pending on failure
      this._recommendations.set(recommendationId, recommendation);

      this._logger.error(`Failed to apply recommendation ${recommendationId}`, error);
      throw error;
    }
  }

  // ========================================================================
  // Reports
  // ========================================================================

  async generateReport(reportConfig: ReportConfig): Promise<Report> {
    try {
      const report = await this._reportGenerator.generateReport(
        reportConfig,
        this._metrics,
        this._dashboard,
        Array.from(this._dimensions.values())
      );

      this.emit('report-generated', { report, timestamp: new Date() });

      this._logger.info(`Report generated: ${report.id}`);

      return report;

    } catch (error) {
      this._logger.error('Failed to generate report', error);
      throw error;
    }
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async initializeDimensions(): Promise<void> {
    this._dimensions.set('goal', new GoalDimension(this._config));
    this._dimensions.set('technology', new TechnologyDimension(this._config));
    this._dimensions.set('data', new DataDimension(this._config));
    this._dimensions.set('ux', new UXDimension(this._config));
    this._dimensions.set('value', new ValueDimension(this._config));

    // Initialize all dimensions
    for (const [type, dimension] of this._dimensions) {
      await dimension.initialize();
      this._logger.info(`Initialized ${type} dimension`);
    }
  }

  private initializeMetrics(): ManagementMetrics {
    return {
      timestamp: new Date(),
      systemHealth: 100,
      overallPerformance: 100,
      alertCount: 0,
      activeIssues: 0,
      resolvedIssues: 0,
      integrationHealth: {
        connectedSystems: 0,
        healthyConnections: 0,
        failedConnections: 0,
        dataSyncStatus: 'synced',
        lastSyncTime: new Date(),
        apiResponseTime: 0
      },
      systemLoad: {
        cpuUtilization: 0,
        memoryUtilization: 0,
        diskUtilization: 0,
        networkUtilization: 0,
        activeProcesses: 0,
        queueSize: 0,
        throughput: 0
      },
      responseTime: 0,
      uptime: 100
    };
  }

  private initializeDashboard(): DashboardData {
    return {
      summary: {
        overallScore: 100,
        status: 'excellent',
        keyHighlights: [],
        criticalIssues: [],
        topRecommendations: [],
        lastUpdated: new Date()
      },
      dimensions: {
        goal: {
          totalGoals: 0,
          completedGoals: 0,
          onTrackGoals: 0,
          atRiskGoals: 0,
          overallProgress: 0,
          topPriorities: [],
          upcomingDeadlines: []
        },
        technology: {
          systemHealth: 100,
          performance: {
            responseTime: 0,
            throughput: 0,
            cpuUtilization: 0,
            memoryUtilization: 0,
            diskUtilization: 0,
            networkLatency: 0,
            databaseQueryTime: 0,
            cacheHitRate: 0
          },
          reliability: {
            uptime: 100,
            mtbf: 0,
            mttr: 0,
            errorRate: 0,
            availability: 100,
            slaCompliance: 100
          },
          securityScore: 100,
          technicalDebt: 0,
          uptime: 100
        },
        data: {
          dataQuality: 100,
          governanceScore: 100,
          analyticsAccuracy: 100,
          pipelineHealth: 100,
          activeIssues: 0,
          dataVolume: 0
        },
        ux: {
          userSatisfaction: 100,
          systemUsability: 100,
          accessibilityScore: 100,
          performanceScore: 100,
          netPromoterScore: 100,
          activeUsers: 0
        },
        value: {
          roi: 0,
          costSavings: 0,
          revenueImpact: 0,
          efficiencyGain: 100,
          customerSatisfaction: 100,
          marketPosition: 100
        }
      },
      trends: [],
      alerts: [],
      recommendations: []
    };
  }

  private setupEventHandlers(): void {
    // Alert event handlers
    this._alertManager.on('alert-created', (alert: Alert) => {
      this._alerts.set(alert.id, alert);
      this.emit('alert', alert);
    });

    this._alertManager.on('alert-updated', (alert: Alert) => {
      this._alerts.set(alert.id, alert);
    });

    // Dimension event handlers
    for (const [type, dimension] of this._dimensions) {
      dimension.on('metric-update', (metrics: any) => {
        this.emit('dimension-metric-update', { type, metrics });
      });

      dimension.on('alert', (alert: Alert) => {
        this._alertManager.processAlert(alert);
      });
    }
  }

  private setupScheduledTasks(): void {
    const frequency = this._config.updateFrequency;

    // Stop existing jobs
    this.stopScheduledTasks();

    // Metrics collection job
    this._metricsCollectionJob = cron.schedule(`*/${frequency} * * * *`, async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        this._logger.error('Scheduled metrics collection failed', error);
      }
    });

    // Alert processing job
    this._alertProcessingJob = cron.schedule(`*/${Math.max(frequency / 2, 30)} * * * *`, async () => {
      try {
        await this._alertManager.processPendingAlerts();
      } catch (error) {
        this._logger.error('Scheduled alert processing failed', error);
      }
    });

    // Recommendation generation job
    this._recommendationJob = cron.schedule(`0 */${Math.floor(frequency / 60) || 1} * * *`, async () => {
      try {
        await this.generateRecommendations();
      } catch (error) {
        this._logger.error('Scheduled recommendation generation failed', error);
      }
    });

    // Dashboard refresh job
    this._dashboardRefreshJob = cron.schedule(`*/${frequency} * * * *`, async () => {
      try {
        await this.refreshDashboard();
      } catch (error) {
        this._logger.error('Scheduled dashboard refresh failed', error);
      }
    });

    this._logger.info('Scheduled tasks configured', { frequency });
  }

  private startScheduledTasks(): void {
    if (this._metricsCollectionJob) this._metricsCollectionJob.start();
    if (this._alertProcessingJob) this._alertProcessingJob.start();
    if (this._recommendationJob) this._recommendationJob.start();
    if (this._dashboardRefreshJob) this._dashboardRefreshJob.start();
  }

  private stopScheduledTasks(): void {
    if (this._metricsCollectionJob) {
      this._metricsCollectionJob.stop();
      this._metricsCollectionJob = undefined;
    }
    if (this._alertProcessingJob) {
      this._alertProcessingJob.stop();
      this._alertProcessingJob = undefined;
    }
    if (this._recommendationJob) {
      this._recommendationJob.stop();
      this._recommendationJob = undefined;
    }
    if (this._dashboardRefreshJob) {
      this._dashboardRefreshJob.stop();
      this._dashboardRefreshJob = undefined;
    }
  }

  private async initializeWebServer(): Promise<void> {
    this._app = express();

    // Basic middleware
    this._app.use(express.json());
    this._app.use(express.static('public'));

    // API routes
    this._app.get('/api/dashboard', async (req, res) => {
      try {
        const data = await this.getDashboardData();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get dashboard data' });
      }
    });

    this._app.get('/api/metrics', async (req, res) => {
      try {
        const data = await this.getMetrics();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get metrics' });
      }
    });

    this._app.get('/api/alerts', async (req, res) => {
      try {
        const filters = req.query as any;
        const data = await this.getAlerts(filters);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get alerts' });
      }
    });

    this._app.get('/api/recommendations', async (req, res) => {
      try {
        const data = await this.getRecommendations();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get recommendations' });
      }
    });

    this._app.post('/api/recommendations/:id/apply', async (req, res) => {
      try {
        await this.applyRecommendation(req.params.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to apply recommendation' });
      }
    });

    // Initialize WebSocket server for real-time updates
    this._wsServer = new WebSocket.Server({ port: 8081 });

    this._wsServer.on('connection', (ws) => {
      this._logger.info('Dashboard client connected');

      // Send initial data
      this.sendDashboardUpdate(ws);

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleDashboardMessage(ws, data);
        } catch (error) {
          this._logger.error('Invalid dashboard message', error);
        }
      });

      ws.on('close', () => {
        this._logger.info('Dashboard client disconnected');
      });
    });

    // Setup event forwarding to WebSocket clients
    this.on('metric-update', () => this.broadcastDashboardUpdate());
    this.on('alert', () => this.broadcastDashboardUpdate());
    this.on('dashboard-refreshed', () => this.broadcastDashboardUpdate());
  }

  private async startWebServer(): Promise<void> {
    if (!this._app) return;

    return new Promise((resolve, reject) => {
      this._server = this._app!.listen(3000, (err?: Error) => {
        if (err) {
          reject(err);
        } else {
          this._logger.info('Dashboard web server started on port 3000');
          resolve();
        }
      });
    });
  }

  private async stopWebServer(): Promise<void> {
    if (!this._server) return;

    return new Promise((resolve) => {
      this._server!.close(() => {
        this._logger.info('Dashboard web server stopped');
        resolve();
      });
    });
  }

  private sendDashboardUpdate(ws: WebSocket): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'dashboard-update',
        data: this._dashboard
      }));
    }
  }

  private broadcastDashboardUpdate(): void {
    if (!this._wsServer) return;

    this._wsServer.clients.forEach((ws) => {
      this.sendDashboardUpdate(ws);
    });
  }

  private handleDashboardMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'refresh':
        this.refreshDashboard().then(() => {
          this.sendDashboardUpdate(ws);
        }).catch(error => {
          this._logger.error('Failed to refresh dashboard on request', error);
        });
        break;

      case 'acknowledge-alert':
        this.acknowledgeAlert(data.alertId, data.userId).then(() => {
          ws.send(JSON.stringify({ type: 'alert-acknowledged', alertId: data.alertId }));
        }).catch(error => {
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
        });
        break;

      case 'resolve-alert':
        this.resolveAlert(data.alertId, data.userId, data.resolution).then(() => {
          ws.send(JSON.stringify({ type: 'alert-resolved', alertId: data.alertId }));
        }).catch(error => {
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
        });
        break;

      case 'apply-recommendation':
        this.applyRecommendation(data.recommendationId).then(() => {
          ws.send(JSON.stringify({ type: 'recommendation-applied', recommendationId: data.recommendationId }));
        }).catch(error => {
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
        });
        break;
    }
  }
}