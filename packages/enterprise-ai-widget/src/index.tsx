// ============================================================================
// YYC³ Enterprise AI Widget
// Advanced intelligent assistant with integrated management systems
// ============================================================================

// Main component exports
export {
  EnterpriseAIWidget,
  type EnterpriseAIWidgetProps, type Message, type MessageAction, type MessageAttachment, type WidgetPosition, type WidgetState
} from './EnterpriseAIWidget';

// Re-export core system types for convenience
export type {
  AutonomousAIEngine, FiveDimensionalManagement, LearningSystem, ModelAdapter
} from '@yyc3/five-dimensional-management';

// Utility exports
export { default as WidgetProvider } from './components/WidgetProvider';
export { default as useWidget } from './hooks/useWidget';
export { default as WidgetUtils } from './utils/WidgetUtils';

// ============================================================================
// Factory Functions
// ============================================================================

import type { EnterpriseAIWidgetProps } from './EnterpriseAIWidget';
import { EnterpriseAIWidget } from './EnterpriseAIWidget';

/**
 * Default configuration for the Enterprise AI Widget
 */
export const defaultWidgetConfig: Partial<EnterpriseAIWidgetProps> = {
  initialPosition: 'bottom-right',
  mode: 'floating',
  theme: 'auto',
  language: 'en',
  features: {
    chat: true,
    insights: true,
    workflow: true,
    knowledge: true,
    analytics: true,
    goals: true,
    settings: true
  },
  integrations: {
    autonomousEngine: true,
    modelAdapter: true,
    learningSystem: true,
    fiveDimensionalManagement: true
  }
};

/**
 * Create a configured Enterprise AI Widget instance
 */
export function createEnterpriseAIWidget(config: Partial<EnterpriseAIWidgetProps> = {}) {
  const mergedConfig = { ...defaultWidgetConfig, ...config };

  return function WidgetComponent(props: Omit<EnterpriseAIWidgetProps, keyof typeof mergedConfig>) {
    return <EnterpriseAIWidget {...mergedConfig} {...props} />;
  };
}

/**
 * Quick setup function for development
 */
export function setupDevelopmentWidget(userId: string, organizationId?: string) {
  return <EnterpriseAIWidget
    userId={userId}
    organizationId={organizationId || 'dev-org'}
    {...defaultWidgetConfig}
  />;
}

/**
 * Production setup with enterprise features enabled
 */
export function setupProductionWidget(userId: string, organizationId: string, overrides: Partial<EnterpriseAIWidgetProps> = {}) {
  const productionConfig: Partial<EnterpriseAIWidgetProps> = {
    ...defaultWidgetConfig,
    mode: 'docked',
    features: {
      chat: true,
      insights: true,
      workflow: true,
      knowledge: true,
      analytics: true,
      goals: true,
      settings: true
    },
    integrations: {
      autonomousEngine: true,
      modelAdapter: true,
      learningSystem: true,
      fiveDimensionalManagement: true
    },
    ...overrides
  };

  return <EnterpriseAIWidget
    userId={userId}
    organizationId={organizationId}
    {...productionConfig}
  />;
}

// ============================================================================
// Styling
// ============================================================================

import './styles/main.css';

// ============================================================================
// Version and Information
// ============================================================================

export const VERSION = '2.0.0';
export const BUILD_DATE = new Date().toISOString();
export const COMPATIBILITY = {
  react: '>=18.0.0',
  typescript: '>=5.0.0'
};

export const WIDGET_INFO = {
  name: '@yyc3/enterprise-ai-widget',
  description: 'YYC³ Enterprise AI Widget - Advanced intelligent assistant with integrated management systems',
  version: VERSION,
  author: 'YYC³ AI Team',
  license: 'MIT',
  features: [
    'Multi-modal AI conversation',
    'Autonomous reasoning and planning',
    'Real-time learning and adaptation',
    'Five-dimensional management integration',
    'Enterprise-grade analytics',
    'Goal tracking and insights',
    'Advanced customization options',
    'Responsive and accessible design',
    'High performance optimization',
    'Production-ready deployment'
  ],
  integrations: [
    'AutonomousAIEngine',
    'ModelAdapter',
    'LearningSystem',
    'FiveDimensionalManagement'
  ]
} as const;

// Default export
export default {
  EnterpriseAIWidget,
  createEnterpriseAIWidget,
  setupDevelopmentWidget,
  setupProductionWidget,
  defaultWidgetConfig,
  VERSION,
  WIDGET_INFO
};
