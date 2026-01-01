// ============================================================================
// Five-Dimensional Closed-Loop Management System
// YYC³ AI Platform - Enterprise Management Package
// ============================================================================

// Main System Exports
export {
  FiveDimensionalManagement,
  type IFiveDimensionalManagement
} from '@/core/FiveDimensionalManagement';

// Dimension Exports
export { GoalDimension } from '@/dimensions/GoalDimension';
export { TechnologyDimension } from '@/dimensions/TechnologyDimension';
export { DataDimension } from '@/dimensions/DataDimension';
export { UXDimension } from '@/dimensions/UXDimension';
export { ValueDimension } from '@/dimensions/ValueDimension';

// Type Exports
export type {
  ManagementConfig,
  ManagementMetrics,
  DashboardData,
  Alert,
  Recommendation,
  Report,
  ReportConfig,
  StrategicGoal,
  KPI,
  Milestone,
  Risk,
  TechnologyMetrics,
  DataMetrics,
  UXMetrics,
  ValueMetrics,
  SystemStatus,
  DimensionType,
  Priority,
  AlertLevel,
  IDimension,
  GoalDashboardData,
  TechnologyDashboardData,
  DataDashboardData,
  UXDashboardData,
  ValueDashboardData,
  ExecutiveSummary,
  TrendData,
  AlertFilters
} from '@/types/IFiveDimensionalManagement';

// Utility Exports
export { Logger, LogLevel } from '@/utils/Logger';
export { GoalValidator } from '@/utils/GoalValidator';

// Monitoring Exports
export { MetricsCollector } from '@/monitoring/MetricsCollector';
export { AlertManager } from '@/monitoring/AlertManager';
export { SystemMonitor } from '@/monitoring/SystemMonitor';

// Core Component Exports
export { RecommendationEngine } from '@/core/RecommendationEngine';
export { ReportGenerator } from '@/core/ReportGenerator';
export { GoalAnalyticsEngine } from '@/core/GoalAnalyticsEngine';

// Security Exports
export { SecurityScanner } from '@/security/SecurityScanner';

// ============================================================================
// Factory Functions
// ============================================================================

import { FiveDimensionalManagement } from '@/core/FiveDimensionalManagement';
import { ManagementConfigSchema, type ManagementConfig } from '@/types/IFiveDimensionalManagement';

/**
 * Default configuration for the Five-Dimensional Management System
 */
export const defaultConfig: ManagementConfig = {
  systemId: 'yyc3-five-dimensional-management',
  organizationId: 'yyc3-organization',
  environment: 'development',
  updateFrequency: 60,
  maxHistoryRecords: 10000,
  dimensions: {
    goal: { enabled: true, priority: 1 },
    technology: { enabled: true, priority: 2 },
    data: { enabled: true, priority: 3 },
    ux: { enabled: true, priority: 4 },
    value: { enabled: true, priority: 5 }
  },
  alerts: {
    thresholds: {
      goalDeviation: 0.15,
      performanceDegradation: 0.2,
      errorRate: 0.05,
      userSatisfactionDrop: 0.1
    },
    notifications: {
      email: true,
      slack: false,
      webhook: false,
      dashboard: true
    }
  },
  optimization: {
    enabled: true,
    autoAdjustment: false,
    learningEnabled: true
  },
  security: {
    level: 'standard',
    encryptionEnabled: true,
    auditLog: true,
    accessControl: true
  }
};

/**
 * Create a new Five-Dimensional Management System instance with default configuration
 */
export function createFiveDimensionalManagement(): FiveDimensionalManagement {
  return new FiveDimensionalManagement(defaultConfig);
}

/**
 * Create a new Five-Dimensional Management System with custom configuration
 */
export function createFiveDimensionalManagementWithConfig(config: Partial<ManagementConfig>): FiveDimensionalManagement {
  const mergedConfig = { ...defaultConfig, ...config };

  // Validate the final configuration
  const validation = ManagementConfigSchema.safeParse(mergedConfig);
  if (!validation.success) {
    throw new Error(`Invalid configuration: ${validation.error.message}`);
  }

  return new FiveDimensionalManagement(validation.data);
}

/**
 * Create a production-ready Five-Dimensional Management System
 */
export function createProductionFiveDimensionalManagement(overrides?: Partial<ManagementConfig>): FiveDimensionalManagement {
  const productionConfig: ManagementConfig = {
    ...defaultConfig,
    environment: 'production',
    updateFrequency: 30,
    dimensions: {
      goal: { enabled: true, priority: 1 },
      technology: { enabled: true, priority: 2 },
      data: { enabled: true, priority: 3 },
      ux: { enabled: true, priority: 4 },
      value: { enabled: true, priority: 5 }
    },
    alerts: {
      thresholds: {
        goalDeviation: 0.1,
        performanceDegradation: 0.15,
        errorRate: 0.02,
        userSatisfactionDrop: 0.05
      },
      notifications: {
        email: true,
        slack: true,
        webhook: true,
        dashboard: true
      }
    },
    optimization: {
      enabled: true,
      autoAdjustment: true,
      learningEnabled: true
    },
    security: {
      level: 'enhanced',
      encryptionEnabled: true,
      auditLog: true,
      accessControl: true
    },
    ...overrides
  };

  return createFiveDimensionalManagementWithConfig(productionConfig);
}

// ============================================================================
// Quick Start Examples
// ============================================================================

/**
 * Quick start example - Basic setup
 *
 * ```typescript
 * import { createFiveDimensionalManagement } from '@yyc3/five-dimensional-management';
 *
 * const management = createFiveDimensionalManagement();
 * await management.initialize();
 * await management.start();
 *
 * // Get dashboard data
 * const dashboard = await management.getDashboardData();
 * console.log('System Health:', dashboard.summary.overallScore);
 * ```
 */

/**
 * Advanced setup example - Custom configuration
 *
 * ```typescript
 * import { createProductionFiveDimensionalManagement } from '@yyc3/five-dimensional-management';
 *
 * const management = createProductionFiveDimensionalManagement({
 *   systemId: 'my-company-management',
 *   organizationId: 'my-org',
 *   updateFrequency: 30,
 *   alerts: {
 *     notifications: {
 *       slack: true,
 *       webhook: true
 *     }
 *   }
 * });
 *
 * await management.initialize();
 * await management.start();
 *
 * // Start monitoring and analysis
 * setInterval(async () => {
 *   const metrics = await management.collectMetrics();
 *   const recommendations = await management.getRecommendations();
 *
 *   console.log('Health Score:', metrics.systemHealth);
 *   console.log('Active Recommendations:', recommendations.length);
 * }, 60000);
 * ```
 */

// ============================================================================
// Version Information
// ============================================================================

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const COMPATIBILITY = {
  node: '>=18.0.0',
  bun: '>=1.0.0',
  typescript: '>=5.0.0'
};

// ============================================================================
// System Information
// ============================================================================

export const SYSTEM_INFO = {
  name: '@yyc3/five-dimensional-management',
  description: 'YYC³ Five-Dimensional Closed-Loop Management System - Enterprise goal, technology, data, UX, and value management',
  version: VERSION,
  author: 'YYC³ AI Team',
  license: 'MIT',
  repository: 'https://github.com/YYC-Cube/learning-platform',
  dimensions: ['goal', 'technology', 'data', 'ux', 'value'],
  features: [
    'Strategic Goal Management',
    'Performance Monitoring',
    'Data Quality Analytics',
    'User Experience Tracking',
    'Business Value Measurement',
    'Real-time Alerts',
    'Intelligent Recommendations',
    'Executive Dashboard',
    'Automated Reporting',
    'Closed-loop Optimization'
  ]
} as const;

// Default export
export default {
  FiveDimensionalManagement,
  createFiveDimensionalManagement,
  createFiveDimensionalManagementWithConfig,
  createProductionFiveDimensionalManagement,
  defaultConfig,
  VERSION,
  SYSTEM_INFO
};