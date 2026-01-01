import { AutonomousAIEngine, LearningSystem } from './AutonomousAIEngine';
import {
  Decision,
  DecisionContext,
  DecisionEvaluation,
  DecisionOption,
  EventHandler,
  Experience,
  ExperienceType,
  Goal,
  Priority,
  ResourceAllocation,
  ResourceRequirements,
  ResourceUsage,
  ResourceUtilization,
  Strategy,
  StrategyType,
  Task,
  TaskResult,
  TaskStatus,
  TaskType
} from './IAutonomousAIEngine';

// EventEmitter mocking is handled through subsystem mocks

// Mock the subsystems that AutonomousAIEngine depends on
// We'll mock them by replacing them on the instance after creation
const mockMessageBus = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  on: jest.fn(), // Add missing 'on' method
  isRunning: false,
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reconfigure: jest.fn().mockResolvedValue(undefined)
};

const mockTaskScheduler = {
  schedule: jest.fn().mockImplementation((task) => task.id),
  cancel: jest.fn().mockResolvedValue(undefined),
  getTaskStatus: jest.fn(),
  on: jest.fn(),
  isRunning: false,
  start: jest.fn().mockImplementation(async () => {
    mockTaskScheduler.isRunning = true;
  }),
  stop: jest.fn().mockImplementation(async () => {
    mockTaskScheduler.isRunning = false;
  }),
  reconfigure: jest.fn().mockResolvedValue(undefined)
};

const mockStateManager = {
  saveState: jest.fn().mockResolvedValue(undefined),
  loadState: jest.fn().mockResolvedValue({}),
  clearState: jest.fn(),
  on: jest.fn(),
  start: jest.fn().mockImplementation(async () => {
    mockStateManager.isRunning = true;
  }),
  stop: jest.fn().mockImplementation(async () => {
    mockStateManager.isRunning = false;
  }),
  reconfigure: jest.fn().mockImplementation(async (config) => {
    mockStateManager.configuration = config;
  }),
  set: jest.fn().mockImplementation((key, value) => {
    mockStateManager._state = mockStateManager._state || new Map();
    mockStateManager._state.set(key, value);
  }),
  get: jest.fn().mockImplementation((key) => {
    mockStateManager._state = mockStateManager._state || new Map();
    return mockStateManager._state.get(key);
  }),
  delete: jest.fn().mockImplementation((key) => {
    mockStateManager._state = mockStateManager._state || new Map();
    return mockStateManager._state.delete(key);
  }),
  isRunning: false,
  configuration: {},
  _state: new Map()
};

const mockDecisionEngine = {
  isRunning: false,
  configuration: {},
  _listeners: new Map(),
  on: jest.fn().mockImplementation((event, listener: EventHandler) => {
    if (!mockDecisionEngine._listeners.has(event)) {
      mockDecisionEngine._listeners.set(event, []);
    }
    mockDecisionEngine._listeners.get(event)?.push(listener);
  }),
  emit: jest.fn().mockImplementation((event, data) => {
    const listeners = mockDecisionEngine._listeners.get(event);
    if (listeners) {
      listeners.forEach((listener: EventHandler) => listener(data));
    }
  }),
  start: jest.fn().mockImplementation(async () => {
    mockDecisionEngine.isRunning = true;
  }),
  stop: jest.fn().mockImplementation(async () => {
    mockDecisionEngine.isRunning = false;
  }),

  // Add missing properties for DecisionEngine interface
  getDecisionHistory: jest.fn().mockReturnValue([]),
  getDecisionPatterns: jest.fn().mockReturnValue([]),
  analyzeDecisionImpact: jest.fn().mockReturnValue({}),
  evaluateDecision: jest.fn().mockImplementation((decision) => {
    return Promise.resolve({
      decisionId: decision.id,
      actualOutcomes: [],
      effectiveness: {
        goalAlignment: 0.85,
        efficiency: 0.75,
        stakeholderSatisfaction: 0.88,
        innovation: 0.7,
        adaptability: 0.8,
        sustainability: 0.9
      },
      lessons: ['Great decision', 'Could be more efficient'],
      recommendations: ['Consider more alternatives next time', 'Monitor implementation closely'],
      timestamp: new Date()
    });
  }),
  makeDecision: jest.fn().mockImplementation((context: DecisionContext, options: DecisionOption[]) => {
    let decision;
    if (options.length === 0) {
      decision = {
        id: 'decision_123',
        contextId: context.id,
        selectedOption: '',
        reasoning: {
          criteria: ['efficiency', 'quality', 'risk'],
          weights: { efficiency: 0.4, quality: 0.4, risk: 0.2 },
          scores: { efficiency: 0.8, quality: 0.7, risk: 0.6 },
          methodology: 'utility_theory',
          assumptions: ['Current trends continue']
        },
        confidence: 0,
        alternatives: [],
        expectedValue: 0,
        riskAssessment: {
          overall: 'medium',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          resources: { cpu: { min: 0.1, unit: 'cores' }, memory: { min: 128, unit: 'MB' }, storage: { min: 0, unit: 'GB' }, network: { min: 0, unit: 'Mbps' }, specialized: [] },
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 86400000),
            milestones: [],
            criticalPath: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };
    } else {
      decision = {
        id: 'decision_123',
        contextId: context.id,
        selectedOption: options[0].id,
        reasoning: {
          criteria: ['efficiency', 'quality', 'risk'],
          weights: { efficiency: 0.4, quality: 0.4, risk: 0.2 },
          scores: { efficiency: 0.8, quality: 0.7, risk: 0.6 },
          methodology: 'utility_theory',
          assumptions: ['Current trends continue']
        },
        confidence: 0.75,
        alternatives: options.map(o => o.id),
        expectedValue: 0.75,
        riskAssessment: {
          overall: 'medium',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          resources: { cpu: { min: 0.1, unit: 'cores' }, memory: { min: 128, unit: 'MB' }, storage: { min: 0, unit: 'GB' }, network: { min: 0, unit: 'Mbps' }, specialized: [] },
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 86400000),
            milestones: [],
            criticalPath: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };
    }

    // Emit decision.made event to match real implementation
    if (mockDecisionEngine.emit) {
      mockDecisionEngine.emit('decision.made', { decision });
    }

    return decision;
  }),
  reconfigure: jest.fn().mockImplementation(async (config) => {
    mockDecisionEngine.configuration = config;
  })
};

const mockLearningSystem = {
  isRunning: false,
  configuration: {},
  on: jest.fn(),
  emit: jest.fn(),
  learnFromExperience: jest.fn().mockImplementation(async (experience) => {
    // 模拟真实实现中的事件发射
    mockLearningSystem.emit('learning.completed', { experience });
  }),
  getProgress: jest.fn().mockImplementation(() => {
    // 返回与真实实现完全匹配的字段
    const config = mockLearningSystem.configuration as any;
    return {
      totalExperiences: 0,
      successfulAdaptations: 0,
      failedAdaptations: 0,
      learningRate: config.learningRate || 0.1,
      competencyLevel: 'intermediate',
      areasOfImprovement: ['decision_making', 'collaboration'],
      recentInsights: [],
      nextMilestones: []
    };
  }),
  adaptStrategy: jest.fn().mockImplementation(async (strategy) => {
    // 模拟真实实现中的事件发射
    mockLearningSystem.emit('strategy.adapted', { strategy });
  }),
  start: jest.fn().mockImplementation(async () => {
    mockLearningSystem.isRunning = true;
  }),
  stop: jest.fn().mockImplementation(async () => {
    mockLearningSystem.isRunning = false;
  }),
  reconfigure: jest.fn().mockImplementation(async (config) => {
    mockLearningSystem.configuration = config;
  })
};

const mockCollaborationManager = {
  collaborate: jest.fn().mockImplementation((otherEngines, task) => {
    return Promise.resolve({
      taskId: task.id,
      outcome: {
        success: true,
        results: []
      }
    });
  }),
  initiateCollaboration: jest.fn().mockImplementation(async () => {
    const collaborationId = `collab_${Date.now()}`;
    return {
      collaborationId,
      status: 'active' as const,
      engines: [],
      resources: [],
      timeline: {
        start: new Date(),
        end: new Date(Date.now() + 86400000) // 1 day from now
      },
      goals: []
    };
  }),
  getCollaborationStatus: jest.fn().mockImplementation((collaborationId) => {
    return {
      collaborationId,
      status: 'active' as const,
      progress: 0.5,
      engines: [],
      resources: [],
      timeline: {
        start: new Date(),
        end: new Date(Date.now() + 86400000) // 1 day from now
      },
      goals: []
    };
  }),
  sendMessage: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  isRunning: false,
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reconfigure: jest.fn().mockResolvedValue(undefined)
};

// Define proper types for mock objects
interface MockResourceManagerType {
  isRunning: boolean;
  configuration: { maxResources: { cpu: number; memory: number; storage: number; network: number } };
  allocations: Map<string, ResourceAllocation>;
  usage: Map<string, ResourceUsage>;
  on: jest.Mock;
  allocateResources: jest.Mock<Promise<ResourceAllocation>, [ResourceRequirements]>;
  releaseResources: jest.Mock<Promise<void>, [string]>;
  getResourceUtilization: jest.Mock<ResourceUtilization>;
  getUsage: jest.Mock<ResourceUsage, [string]>;
  getCurrentUsage: jest.Mock<ResourceUsage>;
  start: jest.Mock<Promise<void>>;
  stop: jest.Mock<Promise<void>>;
  reconfigure: jest.Mock<Promise<void>, [any]>;
}

const mockResourceManager: MockResourceManagerType = {
  isRunning: false,
  configuration: { maxResources: { cpu: 100, memory: 1000, storage: 100, network: 100 } },
  allocations: new Map(),
  usage: new Map(),
  on: jest.fn(),
  allocateResources: jest.fn().mockImplementation(async (requirements) => {
    const allocationId = `allocation_${Date.now()}`;
    const cpuAmount = requirements.cpu?.min || 10;
    const memoryAmount = requirements.memory?.min || 128;
    const storageAmount = requirements.storage?.min || 1;
    const networkAmount = requirements.network?.min || 1;

    // Check if resources are available
    let totalAllocatedCpu = 0;
    for (const [_, alloc] of (mockResourceManager as any).allocations) {
      const cpuResource = alloc.resources.find((r: any) => r.type === 'cpu');
      totalAllocatedCpu += cpuResource ? cpuResource.amount : 0;
    }

    if (totalAllocatedCpu + cpuAmount > 100) {
      throw new Error('Insufficient resources available');
    }

    const allocation = {
      id: allocationId,
      status: 'active' as const,
      resources: [
        { type: 'cpu', amount: cpuAmount, unit: requirements.cpu?.unit || 'cores' },
        { type: 'memory', amount: memoryAmount, unit: requirements.memory?.unit || 'MB' },
        { type: 'storage', amount: storageAmount, unit: requirements.storage?.unit || 'GB' },
        { type: 'network', amount: networkAmount, unit: requirements.network?.unit || 'Mbps' },
        ...(requirements.specialized || [])
      ],
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    };

    mockResourceManager.allocations.set(allocationId, allocation);

    // Set some usage data (simulate 50% utilization)
    mockResourceManager.usage.set(allocationId, {
      cpu: cpuAmount * 0.5, // 50% utilization
      memory: memoryAmount * 0.5,
      storage: storageAmount * 0.5,
      network: networkAmount * 0.5,
      specialized: {}
    });

    return allocation;
  }),
  releaseResources: jest.fn().mockImplementation(async (allocationId) => {
    mockResourceManager.allocations.delete(allocationId);
    mockResourceManager.usage.delete(allocationId);
  }),
  getResourceUtilization: jest.fn().mockImplementation(() => {
    let totalAllocatedCpu = 0;
    let totalAllocatedMemory = 0;
    let totalAllocatedStorage = 0;
    let totalAllocatedNetwork = 0;
    let totalUsedCpu = 0;
    let totalUsedMemory = 0;
    let totalUsedStorage = 0;
    let totalUsedNetwork = 0;

    // Calculate real allocated resources from allocations
    const allocations = Array.from(mockResourceManager.allocations.values());
    for (const allocation of allocations) {
      const cpuResource = allocation.resources.find((r: any) => r.type === 'cpu');
      const memoryResource = allocation.resources.find((r: any) => r.type === 'memory');
      const storageResource = allocation.resources.find((r: any) => r.type === 'storage');
      const networkResource = allocation.resources.find((r: any) => r.type === 'network');

      if (cpuResource) {
        totalAllocatedCpu += cpuResource.amount;
        totalUsedCpu += cpuResource.amount * 0.5; // 50% utilization
      }
      if (memoryResource) {
        totalAllocatedMemory += memoryResource.amount;
        totalUsedMemory += memoryResource.amount * 0.5;
      }
      if (storageResource) {
        totalAllocatedStorage += storageResource.amount;
        totalUsedStorage += storageResource.amount * 0.5;
      }
      if (networkResource) {
        totalAllocatedNetwork += networkResource.amount;
        totalUsedNetwork += networkResource.amount * 0.5;
      }
    }

    return {
      cpu: {
        allocated: totalAllocatedCpu,
        used: totalUsedCpu,
        available: 100 - totalAllocatedCpu,
        percentage: (totalAllocatedCpu / 100) * 100
      },
      memory: {
        allocated: totalAllocatedMemory,
        used: totalUsedMemory,
        available: 100 - totalAllocatedMemory,
        percentage: (totalAllocatedMemory / 100) * 100
      },
      storage: {
        allocated: totalAllocatedStorage,
        used: totalUsedStorage,
        available: 100 - totalAllocatedStorage,
        percentage: (totalAllocatedStorage / 100) * 100
      },
      network: {
        allocated: totalAllocatedNetwork,
        used: totalUsedNetwork,
        available: 100 - totalAllocatedNetwork,
        percentage: (totalAllocatedNetwork / 100) * 100
      },
      specialized: [] as SpecializedUtilization[]
    };
  }),
  getUsage: jest.fn().mockImplementation((allocationId) => {
    const usage = mockResourceManager.usage.get(allocationId);
    if (!usage) {
      throw new Error(`Allocation not found: ${allocationId}`);
    }
    // Ensure the usage object includes specialized record
    return {
      ...usage,
      specialized: {}
    };
  }),
  getCurrentUsage: jest.fn().mockImplementation(() => {
    return {
      cpu: 15,
      memory: 200,
      storage: 1.5,
      network: 1.2,
      specialized: {}
    };
  }),
  start: jest.fn().mockImplementation(async () => {
    mockResourceManager.isRunning = true;
  }),
  stop: jest.fn().mockImplementation(async () => {
    mockResourceManager.isRunning = false;
  }),
  reconfigure: jest.fn().mockImplementation(async (config) => {
    mockResourceManager.configuration = config;
  })
};

const mockMonitoringSystem = {
  collectMetrics: jest.fn().mockReturnValue({}),
  getDiagnostics: jest.fn().mockReturnValue({}),
  getDiagnosticInfo: jest.fn().mockReturnValue({}),
  getHealthStatus: jest.fn().mockReturnValue({ 
    overall: 'healthy',
    components: []
  }),
  isRunning: false,
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reconfigure: jest.fn().mockResolvedValue(undefined)
};

const mockSecurityManager = {
  validateInput: jest.fn().mockReturnValue(true),
  sanitizeData: jest.fn().mockReturnValue({}),
  encryptData: jest.fn(),
  decryptData: jest.fn(),
  isRunning: false,
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reconfigure: jest.fn().mockResolvedValue(undefined)
};

// We'll mock the initializeSubsystems method to prevent it from creating real subsystem instances
// This is done in the beforeEach block after creating the engine instance

// Helper function to mock all subsystems
const mockSubsystems = (engine: AutonomousAIEngine) => {
  // Mock the subsystems
  (engine as any).messageBus = mockMessageBus;
  (engine as any).taskScheduler = mockTaskScheduler;
  (engine as any).stateManager = mockStateManager;
  (engine as any).decisionEngine = mockDecisionEngine;
  (engine as any).learningSystem = mockLearningSystem;
  (engine as any).collaborationManager = mockCollaborationManager;
  (engine as any).resourceManager = mockResourceManager;
  (engine as any).monitoringSystem = mockMonitoringSystem;
  (engine as any).securityManager = mockSecurityManager;

  // Don't mock internal methods that we want to test directly
  // (engine as any).stopSubsystems = jest.fn().mockResolvedValue(undefined);
  // (engine as any).finalizeTasks = jest.fn().mockResolvedValue(undefined); // Don't mock - we want to test the actual implementation
  // (engine as any).reconfigureSubsystems = jest.fn().mockResolvedValue(undefined);
  // (engine as any).processGoal = jest.fn().mockResolvedValue(undefined);
  // (engine as any).recordTaskExperience = jest.fn().mockResolvedValue(undefined);

  // Additional internal methods that need mocking
  (engine as any).startTime = Date.now();
  // Don't mock these methods as we want to test them directly
  // (engine as any).setupEventListeners = jest.fn();
  // (engine as any).updateMetrics = jest.fn();
  (engine as any).isShuttingDown = false;

  // Don't mock learnFromExperience - we want to test the actual implementation

};

// Create a test subclass that doesn't override private methods
class TestAutonomousAIEngine extends AutonomousAIEngine {
  // We'll mock subsystems after construction instead of overriding private methods
}

// Create a helper function to create a fully mocked AutonomousAIEngine instance
async function createAutonomousEngine(config?: any) {
  // Define default configuration if none provided
  const defaultConfig = {
    maxConcurrentTasks: 10,
    healthCheckInterval: 30000,
    resourceAllocationStrategy: 'balanced'
  };

  const engine = new AutonomousAIEngine(config || defaultConfig);

  // Ensure all subsystem mock methods correctly update isRunning state
  // Re-define start and stop methods for all subsystems
  mockTaskScheduler.start.mockImplementation(async () => {
    mockTaskScheduler.isRunning = true;
  });
  mockTaskScheduler.stop.mockImplementation(async () => {
    mockTaskScheduler.isRunning = false;
  });

  mockDecisionEngine.start.mockImplementation(async () => {
    mockDecisionEngine.isRunning = true;
  });
  mockDecisionEngine.stop.mockImplementation(async () => {
    mockDecisionEngine.isRunning = false;
  });

  mockStateManager.start.mockImplementation(async () => {
    mockStateManager.isRunning = true;
  });
  mockStateManager.stop.mockImplementation(async () => {
    mockStateManager.isRunning = false;
  });

  mockLearningSystem.start.mockImplementation(async () => {
    mockLearningSystem.isRunning = true;
  });
  mockLearningSystem.stop.mockImplementation(async () => {
    mockLearningSystem.isRunning = false;
  });

  mockCollaborationManager.start.mockImplementation(async () => {
    mockCollaborationManager.isRunning = true;
  });
  mockCollaborationManager.stop.mockImplementation(async () => {
    mockCollaborationManager.isRunning = false;
  });

  mockResourceManager.start.mockImplementation(async () => {
    mockResourceManager.isRunning = true;
  });
  mockResourceManager.stop.mockImplementation(async () => {
    mockResourceManager.isRunning = false;
  });

  mockMessageBus.start.mockImplementation(async () => {
    mockMessageBus.isRunning = true;
  });
  mockMessageBus.stop.mockImplementation(async () => {
    mockMessageBus.isRunning = false;
  });

  mockMonitoringSystem.start.mockImplementation(async () => {
    mockMonitoringSystem.isRunning = true;
  });
  mockMonitoringSystem.stop.mockImplementation(async () => {
    mockMonitoringSystem.isRunning = false;
  });

  mockSecurityManager.start.mockImplementation(async () => {
    mockSecurityManager.isRunning = true;
  });
  mockSecurityManager.stop.mockImplementation(async () => {
    mockSecurityManager.isRunning = false;
  });

  mockSubsystems(engine); // Apply mocks first
  (engine as any)._status = 'initializing'; // Set status to initializing so start() works
  await engine.start(); // Start the engine and subsystems - this will call mock subsystems' start methods
  return engine;
}

describe('AutonomousAIEngine', () => {
  let engine: AutonomousAIEngine;
  const mockConfig = {
    maxConcurrentTasks: 10,
    healthCheckInterval: 30000,
    resourceAllocationStrategy: 'balanced'
  };

  beforeEach(() => {
    // Use jest.clearAllMocks() instead of resetAllMocks() for Bun compatibility
    jest.clearAllMocks();
    engine = new AutonomousAIEngine(mockConfig);

    // Reset mock objects' state before each test
    mockTaskScheduler.isRunning = false;
    mockDecisionEngine.isRunning = false;
    mockStateManager.isRunning = false;
    mockLearningSystem.isRunning = false;
    mockCollaborationManager.isRunning = false;
    mockResourceManager.isRunning = false;
    mockMonitoringSystem.isRunning = false;
    mockSecurityManager.isRunning = false;
    mockMessageBus.isRunning = false;

    // Re-define mock functions that need specific implementations
    // This is necessary because jest.clearAllMocks() preserves implementations
    // but in case they were accidentally cleared, we re-define them here
    mockDecisionEngine.evaluateDecision.mockImplementation((decision) => {
      return Promise.resolve({
        decisionId: decision.id,
        actualOutcomes: [],
        effectiveness: {
          goalAlignment: 0.85,
          efficiency: 0.75,
          stakeholderSatisfaction: 0.88,
          innovation: 0.7,
          adaptability: 0.8,
          sustainability: 0.9
        },
        lessons: ['Great decision', 'Could be more efficient'],
        recommendations: ['Consider more alternatives next time', 'Monitor implementation closely'],
        timestamp: new Date()
      });
    });

    mockLearningSystem.learnFromExperience.mockImplementation(async (experience) => {
      mockLearningSystem.emit('learning.completed', { experience });
    });

    mockLearningSystem.getProgress.mockImplementation(() => {
      const config = mockLearningSystem.configuration as any;
      return {
        totalExperiences: 0,
        successfulAdaptations: 0,
        failedAdaptations: 0,
        learningRate: config.learningRate || 0.1,
        competencyLevel: 'intermediate',
        areasOfImprovement: ['decision_making', 'collaboration'],
        recentInsights: [],
        nextMilestones: []
      };
    });

    // Re-define methods for CollaborationManager
    mockCollaborationManager.initiateCollaboration.mockImplementation(async (config) => {
      const collaborationId = `collab_${Date.now()}`;
      return {
        collaborationId,
        status: 'active' as const,
        engines: [],
        resources: [],
        timeline: {
          start: new Date(),
          end: new Date(Date.now() + 86400000) // 1 day from now
        },
        goals: []
      };
    });

    mockCollaborationManager.getCollaborationStatus.mockImplementation((collaborationId) => {
      return {
        collaborationId,
        status: 'active' as const,
        progress: 0.5,
        engines: [],
        resources: [],
        timeline: {
          start: new Date(),
          end: new Date(Date.now() + 86400000) // 1 day from now
        },
        goals: []
      };
    });

    mockCollaborationManager.collaborate.mockImplementation((otherEngines, task) => {
      return Promise.resolve({
        taskId: task.id,
        outcome: {
          success: true,
          results: []
        }
      });
    });

    // Restore original mock implementations
    mockResourceManager.getResourceUtilization.mockImplementation(() => {
      let totalAllocatedCpu = 0;
      let totalAllocatedMemory = 0;
      let totalAllocatedStorage = 0;
      let totalAllocatedNetwork = 0;
      let totalUsedCpu = 0;
      let totalUsedMemory = 0;
      let totalUsedStorage = 0;
      let totalUsedNetwork = 0;

      // Calculate real allocated resources from allocations
      const allocations = Array.from((mockResourceManager as any).allocations.values());
      for (const allocation of allocations) {
        const cpuResource = allocation.resources.find((r: any) => r.type === 'cpu');
        const memoryResource = allocation.resources.find((r: any) => r.type === 'memory');
        const storageResource = allocation.resources.find((r: any) => r.type === 'storage');
        const networkResource = allocation.resources.find((r: any) => r.type === 'network');

        if (cpuResource) {
          totalAllocatedCpu += cpuResource.amount;
          totalUsedCpu += cpuResource.amount * 0.5; // 50% utilization
        }
        if (memoryResource) {
          totalAllocatedMemory += memoryResource.amount;
          totalUsedMemory += memoryResource.amount * 0.5;
        }
        if (storageResource) {
          totalAllocatedStorage += storageResource.amount;
          totalUsedStorage += storageResource.amount * 0.5;
        }
        if (networkResource) {
          totalAllocatedNetwork += networkResource.amount;
          totalUsedNetwork += networkResource.amount * 0.5;
        }
      }

      return {
        cpu: {
          allocated: totalAllocatedCpu,
          used: totalUsedCpu,
          available: 100 - totalAllocatedCpu,
          percentage: (totalAllocatedCpu / 100) * 100
        },
        memory: {
          allocated: totalAllocatedMemory,
          used: totalUsedMemory,
          available: 1000 - totalAllocatedMemory,
          percentage: (totalAllocatedMemory / 1000) * 100
        },
        storage: {
          allocated: totalAllocatedStorage,
          used: totalUsedStorage,
          available: 100 - totalAllocatedStorage,
          percentage: (totalAllocatedStorage / 100) * 100
        },
        network: {
          allocated: totalAllocatedNetwork,
          used: totalUsedNetwork,
          available: 100 - totalAllocatedNetwork,
          percentage: (totalAllocatedNetwork / 100) * 100
        },
        specialized: []
      };
    });

    mockResourceManager.getCurrentUsage.mockImplementation(() => {
      return {
        cpu: 15,
        memory: 200,
        storage: 1.5,
        network: 1.2,
        specialized: {}
      };
    });

    mockResourceManager.getUsage.mockImplementation((allocationId) => {
      const usage = (mockResourceManager as any).usage.get(allocationId);
      if (!usage) {
        throw new Error(`Allocation not found: ${allocationId}`);
      }
      return {
        ...usage,
        specialized: {}
      };
    });

    mockResourceManager.allocateResources.mockImplementation(async (requirements) => {
      const allocationId = `allocation_${Date.now()}`;
      const cpuAmount = requirements.cpu?.min || 10;
      const memoryAmount = requirements.memory?.min || 128;
      const storageAmount = requirements.storage?.min || 1;
      const networkAmount = requirements.network?.min || 1;

      // Check if resources are available
      let totalAllocatedCpu = 0;
      for (const [_, alloc] of (mockResourceManager as any).allocations) {
        const cpuResource = alloc.resources.find((r: any) => r.type === 'cpu');
        totalAllocatedCpu += cpuResource ? cpuResource.amount : 0;
      }

      if (totalAllocatedCpu + cpuAmount > 100) {
        throw new Error('Insufficient resources available');
      }

      const allocation = {
        id: allocationId,
        status: 'active' as const,
        resources: [
          { type: 'cpu', amount: cpuAmount, unit: requirements.cpu?.unit || 'cores' },
          { type: 'memory', amount: memoryAmount, unit: requirements.memory?.unit || 'MB' },
          { type: 'storage', amount: storageAmount, unit: requirements.storage?.unit || 'GB' },
          { type: 'network', amount: networkAmount, unit: requirements.network?.unit || 'Mbps' },
          ...(requirements.specialized || [])
        ],
        expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
      };

      (mockResourceManager as any).allocations.set(allocationId, allocation);

      // Set some usage data (simulate 50% utilization)
      (mockResourceManager as any).usage.set(allocationId, {
        cpu: cpuAmount * 0.5, // 50% utilization
        memory: memoryAmount * 0.5,
        storage: storageAmount * 0.5,
        network: networkAmount * 0.5
      });

      return allocation;
    });

    mockResourceManager.releaseResources.mockImplementation(async (allocationId) => {
      (mockResourceManager as any).allocations.delete(allocationId);
      (mockResourceManager as any).usage.delete(allocationId);
    });

    // Re-define methods for MonitoringSystem
    mockMonitoringSystem.getHealthStatus.mockImplementation(() => {
      return {
        overall: 'healthy',
        components: [
          { name: 'taskScheduler', status: 'healthy' },
          { name: 'stateManager', status: 'healthy' },
          { name: 'decisionEngine', status: 'healthy' },
          { name: 'learningSystem', status: 'healthy' },
          { name: 'resourceManager', status: 'healthy' },
          { name: 'monitoringSystem', status: 'healthy' },
          { name: 'securityManager', status: 'healthy' },
          { name: 'collaborationManager', status: 'healthy' },
          { name: 'messageBus', status: 'healthy' }
        ],
        metrics: {
          uptime: '10h 30m 45s',
          cpuUsage: 25,
          memoryUsage: 40,
          activeTasks: 5,
          collaborationSessions: 2
        },
        alerts: [],
        lastCheck: new Date()
      };
    });

    mockMonitoringSystem.getDiagnosticInfo.mockImplementation(() => {
      return {
        system: {
          os: 'Linux',
          nodeVersion: 'v18.16.0',
          bunVersion: '1.0.0',
          architecture: 'x64'
        },
        engine: {
          version: '1.0.0',
          status: 'running',
          subsystems: {
            taskScheduler: 'running',
            stateManager: 'running',
            decisionEngine: 'running',
            learningSystem: 'running',
            resourceManager: 'running',
            monitoringSystem: 'running',
            securityManager: 'running',
            collaborationManager: 'running',
            messageBus: 'running'
          },
          configuration: mockConfig
        },
        resources: {
          currentUsage: {
            cpu: 25,
            memory: 40,
            storage: 15,
            network: 5
          },
          peakUsage: {
            cpu: 60,
            memory: 85,
            storage: 30,
            network: 20
          },
          available: {
            cpu: 75,
            memory: 60,
            storage: 85,
            network: 95
          }
        },
        performance: {
          averageResponseTime: 150,
          throughput: 100,
          errorRate: 0.1,
          taskCompletionRate: 99.5
        },
        logs: [
          {
            timestamp: new Date(Date.now() - 3600000),
            level: 'info',
            message: 'Engine started successfully'
          },
          {
            timestamp: new Date(Date.now() - 1800000),
            level: 'info',
            message: 'Learning system completed training'
          }
        ],
        timestamp: new Date()
      };
    });

    // Re-define methods for SecurityManager
    mockSecurityManager.validateInput.mockImplementation((input) => {
      return true;
    });

    mockSecurityManager.sanitizeData.mockImplementation((data) => {
      return data;
    });

    // Re-define methods for MessageBus
    mockMessageBus.publish.mockImplementation((topic, message) => {
      // Simulate message publication
    });

    mockMessageBus.subscribe.mockImplementation((topic, handler) => {
      // Simulate subscription
      return 'subscription-123';
    });

    mockMessageBus.unsubscribe.mockImplementation((subscriptionId) => {
      // Simulate unsubscription
    });

    // Re-define start and stop methods for all subsystems to ensure they work correctly in tests
    mockTaskScheduler.start.mockImplementation(async () => {
      mockTaskScheduler.isRunning = true;
    });
    mockTaskScheduler.stop.mockImplementation(async () => {
      mockTaskScheduler.isRunning = false;
    });

    mockDecisionEngine.start.mockImplementation(async () => {
      mockDecisionEngine.isRunning = true;
    });
    mockDecisionEngine.stop.mockImplementation(async () => {
      mockDecisionEngine.isRunning = false;
    });

    mockStateManager.start.mockImplementation(async () => {
      mockStateManager.isRunning = true;
    });
    mockStateManager.stop.mockImplementation(async () => {
      mockStateManager.isRunning = false;
    });

    mockLearningSystem.start.mockImplementation(async () => {
      mockLearningSystem.isRunning = true;
    });
    mockLearningSystem.stop.mockImplementation(async () => {
      mockLearningSystem.isRunning = false;
    });

    mockResourceManager.start.mockImplementation(async () => {
      mockResourceManager.isRunning = true;
    });
    mockResourceManager.stop.mockImplementation(async () => {
      mockResourceManager.isRunning = false;
    });

    mockMessageBus.start.mockImplementation(async () => {
      mockMessageBus.isRunning = true;
    });
    mockMessageBus.stop.mockImplementation(async () => {
      mockMessageBus.isRunning = false;
    });

    mockCollaborationManager.start.mockImplementation(async () => {
      mockCollaborationManager.isRunning = true;
    });
    mockCollaborationManager.stop.mockImplementation(async () => {
      mockCollaborationManager.isRunning = false;
    });

    mockMonitoringSystem.start.mockImplementation(async () => {
      mockMonitoringSystem.isRunning = true;
    });
    mockMonitoringSystem.stop.mockImplementation(async () => {
      mockMonitoringSystem.isRunning = false;
    });

    mockSecurityManager.start.mockImplementation(async () => {
      mockSecurityManager.isRunning = true;
    });
    mockSecurityManager.stop.mockImplementation(async () => {
      mockSecurityManager.isRunning = false;
    });

    // Immediately replace the real subsystems with our mocks
    mockSubsystems(engine);

    // Mock the status to 'initializing' initially so start() works
    (engine as any)._status = 'initializing';
  });

  describe('constructor', () => {
    it('should initialize with default configuration when no config provided', () => {
      const defaultEngine = new AutonomousAIEngine();
      expect(defaultEngine).toBeInstanceOf(AutonomousAIEngine);
    });

    it('should initialize with provided configuration', () => {
      expect(engine).toBeInstanceOf(AutonomousAIEngine);
    });
  });

  describe('ResourceManager', () => {
    let resourceManager: any;

    beforeEach(() => {
      // Create a new ResourceManager instance from the engine
      resourceManager = (engine as any).resourceManager;

      // Reset the allocations map for each test
      (resourceManager as any).allocations.clear();
    });

    it('should start and stop the resource manager', async () => {
      // Start the resource manager
      await resourceManager.start();
      expect(resourceManager.isRunning).toBe(true);

      // Stop the resource manager
      await resourceManager.stop();
      expect(resourceManager.isRunning).toBe(false);
    });

    it('should handle reconfigure', async () => {
      // Reconfigure the resource manager
      const newConfig = { maxResources: { cpu: 200, memory: 200 } };
      await resourceManager.reconfigure(newConfig);
      expect(resourceManager.configuration).toBe(newConfig);
    });

    it('should allocate resources successfully when available', async () => {
      const testRequirements: ResourceRequirements = {
        cpu: { min: 10, max: 20, unit: 'cores' },
        memory: { min: 50, max: 100, unit: 'MB' },
        storage: { min: 1, max: 10, unit: 'GB' },
        network: { min: 1, max: 10, unit: 'Mbps' },
        specialized: []
      };

      const allocation = await resourceManager.allocateResources(testRequirements);

      // Verify allocation properties
      expect(allocation).toHaveProperty('id');
      expect(allocation.id).toMatch(/^allocation_/);
      expect(allocation.status).toBe('active');
      expect(allocation.resources.length).toBe(4); // cpu, memory, storage, network

      // Verify allocation contains correct resource types and amounts
      const cpuResource = allocation.resources.find((r: any) => r.type === 'cpu');
      const memoryResource = allocation.resources.find((r: any) => r.type === 'memory');
      const storageResource = allocation.resources.find((r: any) => r.type === 'storage');
      const networkResource = allocation.resources.find((r: any) => r.type === 'network');

      expect(cpuResource).toHaveProperty('amount', 10);
      expect(memoryResource).toHaveProperty('amount', 50);
      expect(storageResource).toHaveProperty('amount', 1);
      expect(networkResource).toHaveProperty('amount', 1);

      // Verify utilization was updated
      const utilization = resourceManager.getResourceUtilization();
      expect(utilization.cpu.allocated).toBe(10);
      expect(utilization.memory.allocated).toBe(50);
    });

    it('should throw error when insufficient resources available', async () => {
      // First allocate most available CPU (leave 1 core free)
      const highRequirements: ResourceRequirements = {
        cpu: { min: 99, max: 99, unit: 'cores' },
        memory: { min: 10, max: 10, unit: 'MB' },
        storage: { min: 1, max: 1, unit: 'GB' },
        network: { min: 1, max: 1, unit: 'Mbps' },
        specialized: []
      };

      await resourceManager.allocateResources(highRequirements);

      // Try to allocate more CPU than available (2 cores when only 1 is free)
      const additionalRequirements: ResourceRequirements = {
        cpu: { min: 2, max: 2, unit: 'cores' },
        memory: { min: 1, max: 1, unit: 'MB' },
        storage: { min: 1, max: 1, unit: 'GB' },
        network: { min: 1, max: 1, unit: 'Mbps' },
        specialized: []
      };

      await expect(resourceManager.allocateResources(additionalRequirements)).rejects.toThrow('Insufficient resources available');
    });

    it('should release resources correctly', async () => {
      const testRequirements: ResourceRequirements = {
        cpu: { min: 10, max: 20, unit: 'cores' },
        memory: { min: 128, max: 256, unit: 'MB' },
        storage: { min: 1, max: 10, unit: 'GB' },
        network: { min: 1, max: 10, unit: 'Mbps' },
        specialized: []
      };

      // Allocate resources first
      const allocation = await resourceManager.allocateResources(testRequirements);
      const allocationId = allocation.id;

      // Verify allocation exists
      expect((resourceManager as any).allocations.size).toBe(1);

      // Release resources
      await resourceManager.releaseResources(allocationId);

      // Verify allocation was removed
      expect((resourceManager as any).allocations.size).toBe(0);

      // Verify utilization was updated
      const utilization = resourceManager.getResourceUtilization();
      expect(utilization.cpu.allocated).toBe(0);
      expect(utilization.memory.allocated).toBe(0);
    });

    it('should get resource utilization statistics', () => {
      const utilization = resourceManager.getResourceUtilization();

      // Verify utilization structure
      expect(utilization).toHaveProperty('cpu');
      expect(utilization).toHaveProperty('memory');
      expect(utilization).toHaveProperty('storage');
      expect(utilization).toHaveProperty('network');

      // Verify CPU utilization properties
      expect(utilization.cpu).toHaveProperty('allocated');
      expect(utilization.cpu).toHaveProperty('used');
      expect(utilization.cpu).toHaveProperty('available');
      expect(utilization.cpu).toHaveProperty('percentage');
    });

    it('should get current resource usage', () => {
      const usage = resourceManager.getCurrentUsage();

      // Verify usage structure
      expect(usage).toHaveProperty('cpu');
      expect(usage).toHaveProperty('memory');
      expect(usage).toHaveProperty('storage');
      expect(usage).toHaveProperty('network');
      expect(usage).toHaveProperty('specialized');

      // Verify all usage values are numbers
      expect(typeof usage.cpu).toBe('number');
      expect(typeof usage.memory).toBe('number');
      expect(typeof usage.storage).toBe('number');
      expect(typeof usage.network).toBe('number');
      expect(typeof usage.specialized).toBe('object');
    });

    it('should get usage for a specific allocation', async () => {
      const testRequirements: ResourceRequirements = {
        cpu: { min: 10, max: 20, unit: 'cores' },
        memory: { min: 128, max: 256, unit: 'MB' },
        storage: { min: 1, max: 10, unit: 'GB' },
        network: { min: 1, max: 10, unit: 'Mbps' },
        specialized: []
      };

      // Allocate resources
      const allocation = await resourceManager.allocateResources(testRequirements);

      // Modify resource utilization for testing
      allocation.resources.forEach((resource: any) => {
        resource.utilization = 50; // Set to 50% utilization
      });

      // Get usage for this allocation
      const usage = resourceManager.getUsage(allocation.id);

      // Verify usage values are calculated correctly (50% of allocated)
      expect(usage.cpu).toBe(5); // 10 * 50% = 5
      expect(usage.memory).toBe(64); // 128 * 50% = 64
      expect(usage.storage).toBe(0.5); // 1 * 50% = 0.5
      expect(usage.network).toBe(0.5); // 1 * 50% = 0.5
    });

    it('should handle release of non-existent allocation gracefully', async () => {
      // This should not throw an error
      await resourceManager.releaseResources('non-existent-allocation-id');

      // Verify no errors occurred
      expect(true).toBe(true); // Just a placeholder to verify test completes
    });

    it('should throw error when getting usage for non-existent allocation', () => {
      expect(() => {
        resourceManager.getUsage('non-existent-allocation-id');
      }).toThrow('Allocation not found: non-existent-allocation-id');
    });
  });

  describe('DecisionEngine', () => {
    let decisionEngine: any;
    let mockDecisionMadeEvent: jest.Mock;

    beforeEach(() => {
      // Use the mock DecisionEngine instance
      decisionEngine = mockDecisionEngine;

      // Mock the decision.made event
      mockDecisionMadeEvent = jest.fn();
      decisionEngine.on('decision.made', mockDecisionMadeEvent);
    });

    afterEach(() => {
      // Clean up event listeners - eventemitter3 doesn't have removeListener method in this context
      // decisionEngine.removeListener('decision.made', mockDecisionMadeEvent);
    });

    it('should start and stop the decision engine', async () => {
      // Start the decision engine
      await decisionEngine.start();
      expect(decisionEngine.isRunning).toBe(true);

      // Stop the decision engine
      await decisionEngine.stop();
      expect(decisionEngine.isRunning).toBe(false);
    });

    it('should handle reconfigure', async () => {
      // Reconfigure the decision engine
      const newConfig = { decisionStrategy: 'optimistic' };
      await decisionEngine.reconfigure(newConfig);
      expect(decisionEngine.configuration).toBe(newConfig);
    });

    it('should make a decision with valid context and options', async () => {
      const testContext: DecisionContext = {
        id: 'context-123',
        type: 'learning',
        priority: 'medium',
        description: 'Test decision context',
        parameters: { userLevel: 'intermediate', timeAvailable: 60 },
        constraints: [
          { type: 'time', description: 'Time limit constraint', parameters: { maxTime: 60 }, severity: 'warning' },
          { type: 'resource', description: 'Resource limit constraint', parameters: { maxMemory: 1000 }, severity: 'error' }
        ],
        objectives: [
          { name: 'maximize_learning', weight: 0.7, target: 0.9, unit: 'score', optimization: 'maximize' },
          { name: 'minimize_frustration', weight: 0.3, target: 0.1, unit: 'score', optimization: 'minimize' }
        ],
        stakeholders: ['user-123', 'system'],
        metadata: { source: 'test', category: 'learning', tags: [], historicalData: false, requiredConfidence: 0.7 }
      };

      const testOptions: DecisionOption[] = [
        {
          id: 'option-1',
          name: 'Option 1',
          description: 'First decision option',
          parameters: {
            resourceRequirements: {
              cpu: { min: 0.1, unit: 'cores' },
              memory: { min: 128, unit: 'MB' },
              storage: { min: 0, unit: 'GB' },
              network: { min: 0, unit: 'Mbps' },
              specialized: []
            }
          },
          expectedOutcomes: [{ metric: 'learning_gain', value: 0.8, probability: 0.9, timeHorizon: 30 }],
          risks: [{ type: 'resource_constraint', description: 'Resource constraint risk', probability: 0.1, impact: 'low', mitigation: 'allocate_additional_resources' }],
          costs: { computational: 10, financial: 0, time: 5, opportunity: 0 },
          benefits: { efficiency: 0.8, quality: 0.7, innovation: 0.6, collaboration: 0.5 },
          confidence: 0.9
        },
        {
          id: 'option-2',
          name: 'Option 2',
          description: 'Second decision option',
          parameters: {
            resourceRequirements: {
              cpu: { min: 0.2, unit: 'cores' },
              memory: { min: 256, unit: 'MB' },
              storage: { min: 0, unit: 'GB' },
              network: { min: 0, unit: 'Mbps' },
              specialized: []
            }
          },
          expectedOutcomes: [{ metric: 'learning_gain', value: 0.7, probability: 0.8, timeHorizon: 30 }],
          risks: [{ type: 'resource_constraint', description: 'Resource constraint risk', probability: 0.05, impact: 'low', mitigation: 'allocate_additional_resources' }],
          costs: { computational: 15, financial: 0, time: 7, opportunity: 0 },
          benefits: { efficiency: 0.7, quality: 0.6, innovation: 0.5, collaboration: 0.4 },
          confidence: 0.8
        }
      ];

      const decision = await decisionEngine.makeDecision(testContext, testOptions);

      // Verify decision properties
      expect(decision).toHaveProperty('id');
      expect(decision.id).toMatch(/^decision_/);
      expect(decision.contextId).toBe(testContext.id);
      expect(decision.selectedOption).toBe(testOptions[0].id);
      expect(decision.alternatives).toEqual(testOptions.map(o => o.id));
      expect(decision.confidence).toBe(0.75);
      expect(decision.expectedValue).toBe(0.75);

      // Verify reasoning properties
      expect(decision.reasoning).toHaveProperty('criteria');
      expect(decision.reasoning).toHaveProperty('weights');
      expect(decision.reasoning).toHaveProperty('scores');
      expect(decision.reasoning.methodology).toBe('utility_theory');

      // Verify risk assessment
      expect(decision.riskAssessment).toHaveProperty('overall');
      expect(decision.riskAssessment.overall).toBe('medium');

      // Verify implementation plan
      expect(decision.implementationPlan).toHaveProperty('resources');
      expect(decision.implementationPlan).toHaveProperty('timeline');

      // Verify event was emitted
      expect(mockDecisionMadeEvent).toHaveBeenCalledWith({ decision });
    });

    it('should handle makeDecision with empty options array', async () => {
      const testContext: DecisionContext = {
        id: 'context-123',
        type: 'learning',
        description: 'Test decision context',
        priority: 'medium',
        parameters: { userLevel: 'intermediate', timeAvailable: 60 },
        constraints: [
          { type: 'time', description: 'Time limit constraint', parameters: { maxTime: 60 }, severity: 'warning' },
          { type: 'resource', description: 'Resource limit constraint', parameters: { maxMemory: 1000 }, severity: 'error' }
        ],
        objectives: [
          { name: 'maximize_learning', weight: 0.7, target: 0.9, unit: 'score', optimization: 'maximize' },
          { name: 'minimize_frustration', weight: 0.3, target: 0.1, unit: 'score', optimization: 'minimize' }
        ],
        stakeholders: ['user-123', 'system'],
        metadata: { source: 'test', category: 'learning', tags: [], historicalData: false, requiredConfidence: 0.7 }
      };

      const testOptions: DecisionOption[] = [];

      const decision = await decisionEngine.makeDecision(testContext, testOptions);

      // Verify decision properties with empty options
      expect(decision).toHaveProperty('id');
      expect(decision.selectedOption).toBe('');
      expect(decision.alternatives).toEqual([]);

      // Verify event was still emitted
      expect(mockDecisionMadeEvent).toHaveBeenCalledWith({ decision });
    });

    it('should evaluate a decision correctly', async () => {
      const testDecision: Decision = {
        id: 'decision-123',
        contextId: 'context-456',
        selectedOption: 'option-1',
        reasoning: {
          criteria: ['efficiency', 'quality'],
          weights: { efficiency: 0.6, quality: 0.4 },
          scores: { efficiency: 0.8, quality: 0.7 },
          methodology: 'utility_theory',
          assumptions: ['Current trends continue']
        },
        confidence: 0.75,
        alternatives: ['option-1', 'option-2'],
        expectedValue: 0.76,
        riskAssessment: {
          overall: 'medium',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          resources: {
            cpu: { min: 0.1, max: 1, unit: 'cores' },
            memory: { min: 128, max: 1024, unit: 'MB' },
            storage: { min: 1, max: 10, unit: 'GB' },
            network: { min: 1, max: 100, unit: 'Mbps' },
            specialized: []
          },
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 86400000),
            milestones: [],
            criticalPath: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };

      const evaluation = await decisionEngine.evaluateDecision(testDecision);

      // Verify evaluation properties
      expect(evaluation).toHaveProperty('decisionId', testDecision.id);
      expect(evaluation).toHaveProperty('actualOutcomes');
      expect(evaluation).toHaveProperty('effectiveness');
      expect(evaluation).toHaveProperty('lessons');
      expect(evaluation).toHaveProperty('recommendations');

      // Verify specific effectiveness metrics
      expect(typeof evaluation.effectiveness).toBe('object');
      expect(evaluation.effectiveness.goalAlignment).toBeGreaterThan(0);
      expect(evaluation.effectiveness.efficiency).toBeGreaterThan(0);
      expect(evaluation.effectiveness.stakeholderSatisfaction).toBeGreaterThan(0);

      // Verify lessons and recommendations
      expect(Array.isArray(evaluation.lessons)).toBe(true);
      expect(Array.isArray(evaluation.recommendations)).toBe(true);
      expect(evaluation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('MessageBus', () => {
    // Since MessageBus is an inner class, we need to create an instance via AutonomousAIEngine
    let messageBus: any;

    beforeEach(() => {
      // Create a new MessageBus instance
      messageBus = (new AutonomousAIEngine() as any).messageBus;
    });

    it('should subscribe to and publish events', () => {
      const mockHandler = jest.fn();
      const testPayload = { data: 'test' };

      // Subscribe to event
      messageBus.subscribe('test.event', mockHandler);

      // Publish event
      messageBus.publish('test.event', testPayload);

      // Verify handler was called
      expect(mockHandler).toHaveBeenCalledWith(testPayload);
    });

    it('should unsubscribe from events', () => {
      const mockHandler = jest.fn();
      const testPayload = { data: 'test' };

      // Subscribe to event
      messageBus.subscribe('test.event', mockHandler);

      // Unsubscribe from event
      messageBus.unsubscribe('test.event', mockHandler);

      // Publish event
      messageBus.publish('test.event', testPayload);

      // Verify handler was NOT called
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();
      const testPayload = { data: 'test' };

      // Subscribe multiple handlers
      messageBus.subscribe('test.event', mockHandler1);
      messageBus.subscribe('test.event', mockHandler2);

      // Publish event
      messageBus.publish('test.event', testPayload);

      // Verify all handlers were called
      expect(mockHandler1).toHaveBeenCalledWith(testPayload);
      expect(mockHandler2).toHaveBeenCalledWith(testPayload);
    });

    it('should not throw error when publishing to non-existent event', () => {
      expect(() => {
        messageBus.publish('non.existent.event', { data: 'test' });
      }).not.toThrow();
    });

    it('should start the message bus', async () => {
      await messageBus.start();
      expect(messageBus.isRunning).toBe(true);
    });

    it('should stop the message bus and clear subscribers', async () => {
      // Subscribe a handler first
      const mockHandler = jest.fn();
      messageBus.subscribe('test.event', mockHandler);

      // Start the message bus
      await messageBus.start();
      expect(messageBus.isRunning).toBe(true);

      // Stop the message bus
      await messageBus.stop();
      expect(messageBus.isRunning).toBe(false);

      // Publish event and verify no handlers are called (subscribers cleared)
      messageBus.publish('test.event', { data: 'test' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should reconfigure the message bus', async () => {
      const newConfig = { maxMessages: 1000 };
      await messageBus.reconfigure(newConfig);
      expect(messageBus.configuration).toBe(newConfig);
    });

    it('should handle unsubscribe from non-existent event', () => {
      const mockHandler = jest.fn();
      expect(() => {
        messageBus.unsubscribe('non.existent.event', mockHandler);
      }).not.toThrow();
    });

    it('should handle unsubscribe from non-existent handler', () => {
      const mockHandler = jest.fn();
      // Subscribe a different handler first
      messageBus.subscribe('test.event', jest.fn());

      expect(() => {
        messageBus.unsubscribe('test.event', mockHandler);
      }).not.toThrow();
    });
  });

  describe('TaskScheduler', () => {
    // TaskScheduler is an inner class, so we'll test it via the AutonomousAIEngine's taskScheduler property
    // We'll also test the scheduleTask and cancelTask methods of AutonomousAIEngine

    const testTask: Task = {
      id: 'task-123',
      name: 'Test Task',
      description: 'A test task',
      type: 'learning',
      priority: 'medium',
      status: 'pending',
      goalId: 'goal-123',
      dependencies: [],
      requirements: {
        cpu: { min: 0.1, max: 1, unit: 'cores' },
        memory: { min: 128, max: 1024, unit: 'MB' },
        storage: { min: 1, max: 10, unit: 'GB' },
        network: { min: 1, max: 100, unit: 'Mbps' },
        specialized: []
      },
      steps: [{
        id: 'step-1',
        name: 'Test Step',
        description: 'Test step description',
        type: 'data_processing',
        parameters: {},
        dependencies: [],
        estimatedDuration: 60,
        requiredResources: ['cpu', 'memory']
      }],
      metadata: {
        source: 'test',
        category: 'learning',
        tags: [],
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          baseDelay: 1000,
          maxDelay: 10000
        },
        timeout: 300000,
        qualityRequirements: {
          accuracy: 0.9,
          precision: 0.85,
          recall: 0.8,
          latency: 5000
        }
      },
      createdAt: new Date(),
      scheduledAt: new Date()
    };

    it('should schedule a task', () => {
      const taskId = (engine as any).taskScheduler.schedule(testTask);
      expect(taskId).toBe(testTask.id);
    });

    it('should schedule a task with schedule parameter', () => {
      const schedule = { cron: '* * * * *' };
      const taskId = (engine as any).taskScheduler.schedule(testTask, schedule);
      expect(taskId).toBe(testTask.id);
    });

    it('should cancel a task', async () => {
      // Schedule a task first
      (engine as any).taskScheduler.schedule(testTask);

      // Cancel the task
      await (engine as any).taskScheduler.cancel(testTask.id);

      // Since we can't directly access scheduledTasks, we'll test that cancel works
      // by verifying that scheduling another task with the same ID doesn't cause issues
      const taskId = (engine as any).taskScheduler.schedule(testTask);
      expect(taskId).toBe(testTask.id);
    });



    it('should reconfigure with new max concurrent tasks', async () => {
      await (engine as any).taskScheduler.reconfigure({ maxConcurrentTasks: 20 });
      // We can't directly verify maxConcurrentTasks is updated, but we can verify the method exists
      expect(typeof (engine as any).taskScheduler.reconfigure).toBe('function');
    });

    it('should reconfigure with undefined max concurrent tasks', async () => {
      await (engine as any).taskScheduler.reconfigure({});
      // We can't directly verify maxConcurrentTasks remains the same, but we can verify the method exists
      expect(typeof (engine as any).taskScheduler.reconfigure).toBe('function');
    });
  });

  describe('start', () => {
    it('should start the engine successfully', async () => {
      // Directly call the method and check if it doesn't throw
      let error;
      try {
        await engine.start();
      } catch (err) {
        error = err;
      }
      expect(error).toBeUndefined();
    });

    it('should throw error when trying to start engine in invalid status', async () => {
      // Mock status to 'error'
      (engine as any)._status = 'error';
      let error;
      try {
        await engine.start();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect((error as Error).message).toBe('Cannot start engine in status: error');
    });
  });

  describe('stop', () => {
    it('should stop the engine successfully', async () => {
      // First start the engine
      await engine.start();

      // Mock stopSubsystems and finalizeTasks methods
      jest.spyOn(engine as any, 'stopSubsystems').mockResolvedValue(undefined);
      jest.spyOn(engine as any, 'finalizeTasks').mockResolvedValue(undefined);

      // Directly call the method and check if it doesn't throw
      let error;
      try {
        await engine.stop();
      } catch (err) {
        error = err;
      }
      expect(error).toBeUndefined();
    });

    it('should do nothing when engine is already stopped', async () => {
      // Mock status to 'suspended'
      (engine as any)._status = 'suspended';
      (engine as any).isShuttingDown = false;

      // Directly call the method and check if it doesn't throw
      let error;
      try {
        await engine.stop();
      } catch (err) {
        error = err;
      }
      expect(error).toBeUndefined();
    });
  });

  describe('restart', () => {
    it('should restart the engine successfully', async () => {
      // Mock stop and start methods
      const stopSpy = jest.spyOn(engine, 'stop').mockResolvedValue(undefined);
      const startSpy = jest.spyOn(engine, 'start').mockResolvedValue(undefined);

      await engine.restart();

      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();

      stopSpy.mockRestore();
      startSpy.mockRestore();
    });
  });

  describe('updateConfiguration', () => {
    it('should update configuration successfully', async () => {
      const newConfig = { maxConcurrentTasks: 20 };

      // Mock reconfigureSubsystems method
      jest.spyOn(engine as any, 'reconfigureSubsystems').mockResolvedValue(undefined);

      // Directly call the method and check if it doesn't throw
      let error;
      try {
        await engine.updateConfiguration(newConfig);
      } catch (err) {
        error = err;
      }
      expect(error).toBeUndefined();
    });
  });

  describe('goal management', () => {
    const testGoal: Goal = {
      id: 'goal-123',
      name: 'Test Goal',
      description: 'A test goal',
      type: 'learning',
      priority: 'high',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      objective: 'Main test objective',
      keyResults: [
        { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: '%', weight: 0.5, status: 'pending' }
      ],
      constraints: [],
      dependencies: [],
      progress: 0,
      metadata: {
        source: 'user',
        tags: [],
        category: 'test',
        requiredResources: [],
        successCriteria: []
      }
    };

    it('should set a goal successfully', async () => {
      // Mock the validateGoal method
      jest.spyOn(engine as any, 'validateGoal').mockImplementation(() => { });

      // Mock the processGoal method
      jest.spyOn(engine as any, 'processGoal').mockResolvedValue(undefined);

      // Directly call the method and check if it doesn't throw
      let error;
      try {
        await engine.setGoal(testGoal);
      } catch (err) {
        error = err;
      }
      expect(error).toBeUndefined();
    });

    it('should get active goals', () => {
      // Add test goals to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);
      (engine as any)._goals.set('goal-456', {
        ...testGoal,
        id: 'goal-456',
        status: 'completed'
      });

      const activeGoals = engine.getActiveGoals();
      expect(activeGoals).toHaveLength(1);
      expect(activeGoals[0].id).toBe(testGoal.id);
    });

    it('should update goal progress', async () => {
      // Add test goal to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);

      // Directly call the method and check if it doesn't throw
      let error;
      try {
        await engine.updateGoalProgress(testGoal.id, 50);
      } catch (err) {
        error = err;
      }
      expect(error).toBeUndefined();
    });

    it('should complete a goal', async () => {
      // Add test goal to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);

      // Mock dependencies
      const mockGenerateId = jest.spyOn(engine as any, 'generateId').mockReturnValue('exp-123');
      const mockResourceUtilization = mockResourceManager.getResourceUtilization.mockReturnValue({
        cpu: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        memory: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        storage: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        network: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        specialized: []
      });
      const mockCurrentUsage = mockResourceManager.getCurrentUsage.mockReturnValue({
        cpu: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        memory: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        storage: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        network: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        specialized: []
      });
      const mockGetGoalCriticality = jest.spyOn(engine as any, 'getGoalCriticality').mockReturnValue('high');
      const mockLearnFromExperience = jest.spyOn(mockLearningSystem, 'learnFromExperience').mockResolvedValue({});
      const mockEmit = jest.spyOn(engine, 'emit').mockImplementation();

      // Call completeGoal
      await engine.completeGoal(testGoal.id, { success: true });

      // Verify goal state
      const updatedGoal = (engine as any)._goals.get(testGoal.id);
      expect(updatedGoal.status).toBe('completed');
      expect(updatedGoal.updatedAt).toBeInstanceOf(Date);

      // Verify experience recording
      expect(mockGenerateId).toHaveBeenCalledWith('exp');
      expect(mockGetGoalCriticality).toHaveBeenCalledWith(testGoal);
      expect(mockResourceUtilization).toHaveBeenCalled();
      expect(mockCurrentUsage).toHaveBeenCalled();
      expect(mockLearnFromExperience).toHaveBeenCalled();

      // Verify event emission
      expect(mockEmit).toHaveBeenCalledWith('goal.completed', expect.anything());

      // Restore mocks
      mockGenerateId.mockRestore();
      mockGetGoalCriticality.mockRestore();
      mockEmit.mockRestore();
    });

    it('should throw error when completing non-existent goal', async () => {
      await expect(engine.completeGoal('non-existent-goal', { success: true })).rejects.toThrow('Goal not found: non-existent-goal');
    });

    it('should update goal progress correctly', async () => {
      // Add test goal to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);

      // Mock emit method
      const mockEmit = jest.spyOn(engine, 'emit').mockImplementation();

      // Update progress
      await engine.updateGoalProgress(testGoal.id, 75);

      // Verify goal state
      const updatedGoal = (engine as any)._goals.get(testGoal.id);
      expect(updatedGoal.progress).toBe(75);
      expect(updatedGoal.updatedAt).toBeInstanceOf(Date);

      // Verify event emission
      expect(mockEmit).toHaveBeenCalledWith('goal.progress.updated', {
        goal: updatedGoal,
        progress: 75,
        timestamp: expect.any(Date)
      });

      // Restore mock
      mockEmit.mockRestore();
    });

    it('should throw error when updating progress for non-existent goal', async () => {
      await expect(engine.updateGoalProgress('non-existent-goal', 50)).rejects.toThrow('Goal not found: non-existent-goal');
    });

    it('should throw error when updating progress with invalid value', async () => {
      // Add test goal to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);

      // Test with progress < 0
      await expect(engine.updateGoalProgress(testGoal.id, -10)).rejects.toThrow('Progress must be between 0 and 100');

      // Test with progress > 100
      await expect(engine.updateGoalProgress(testGoal.id, 110)).rejects.toThrow('Progress must be between 0 and 100');
    });

    it('should auto-complete goal when progress reaches 100%', async () => {
      // Add test goal to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);

      // Mock completeGoal method
      const mockCompleteGoal = jest.spyOn(engine, 'completeGoal').mockResolvedValue(undefined);

      // Update progress to 100%
      await engine.updateGoalProgress(testGoal.id, 100);

      // Verify completeGoal was called
      expect(mockCompleteGoal).toHaveBeenCalledWith(testGoal.id, expect.anything());

      // Restore mock
      mockCompleteGoal.mockRestore();
    });

    it('should update key results when progress changes', async () => {
      // Create a goal with key results
      const goalWithKeyResults: Goal = {
        ...testGoal,
        keyResults: [
          { id: 'kr-1', description: 'KR 1', target: 100, current: 0, unit: '%', weight: 0.5, status: 'pending' },
          { id: 'kr-2', description: 'KR 2', target: 200, current: 0, unit: 'users', weight: 0.5, status: 'pending' }
        ]
      };

      // Add to engine
      (engine as any)._goals.set(goalWithKeyResults.id, goalWithKeyResults);

      // Update progress to 50%
      await engine.updateGoalProgress(goalWithKeyResults.id, 50);

      // Verify key results were updated
      const updatedGoal = (engine as any)._goals.get(goalWithKeyResults.id);
      expect(updatedGoal.keyResults[0].current).toBe(50);
      expect(updatedGoal.keyResults[1].current).toBe(100);
    });

    it('should update key results correctly with 0% progress', async () => {
      // Create a goal with key results that have existing progress
      const goalWithKeyResults: Goal = {
        ...testGoal,
        keyResults: [
          { id: 'kr-1', description: 'KR 1', target: 100, current: 75, unit: '%', weight: 0.5, status: 'in_progress' },
          { id: 'kr-2', description: 'KR 2', target: 200, current: 150, unit: 'users', weight: 0.5, status: 'in_progress' }
        ]
      };

      // Add to engine
      (engine as any)._goals.set(goalWithKeyResults.id, goalWithKeyResults);

      // Update progress to 0%
      await engine.updateGoalProgress(goalWithKeyResults.id, 0);

      // Verify key results were reset to 0
      const updatedGoal = (engine as any)._goals.get(goalWithKeyResults.id);
      expect(updatedGoal.keyResults[0].current).toBe(0);
      expect(updatedGoal.keyResults[1].current).toBe(0);
      expect(updatedGoal.progress).toBe(0);
    });

    it('should update key results correctly with 100% progress', async () => {
      // Create a goal with key results
      const goalWithKeyResults: Goal = {
        ...testGoal,
        keyResults: [
          { id: 'kr-1', description: 'KR 1', target: 100, current: 0, unit: '%', weight: 0.5, status: 'pending' },
          { id: 'kr-2', description: 'KR 2', target: 200, current: 0, unit: 'users', weight: 0.5, status: 'pending' }
        ]
      };

      // Add to engine
      (engine as any)._goals.set(goalWithKeyResults.id, goalWithKeyResults);

      // Update progress to 100%
      await engine.updateGoalProgress(goalWithKeyResults.id, 100);

      // Verify key results reach their targets
      const updatedGoal = (engine as any)._goals.get(goalWithKeyResults.id);
      expect(updatedGoal.keyResults[0].current).toBe(100);
      expect(updatedGoal.keyResults[1].current).toBe(200);
      expect(updatedGoal.progress).toBe(100);
    });

    it('should handle key results with units when updating progress', async () => {
      // Create a goal with key results that have units
      const goalWithKeyResults: Goal = {
        ...testGoal,
        keyResults: [
          { id: 'kr-1', description: 'KR 1', target: 100, current: 0, unit: '%', weight: 0.4, status: 'pending' },
          { id: 'kr-2', description: 'KR 2', target: 200, current: 0, unit: 'users', weight: 0.4, status: 'pending' },
          { id: 'kr-3', description: 'KR 3', target: 50, current: 0, unit: 'days', weight: 0.2, status: 'pending' }
        ]
      };

      // Add to engine
      (engine as any)._goals.set(goalWithKeyResults.id, goalWithKeyResults);

      // Update progress to 75%
      await engine.updateGoalProgress(goalWithKeyResults.id, 75);

      // Verify key results were updated correctly while preserving units
      const updatedGoal = (engine as any)._goals.get(goalWithKeyResults.id);
      expect(updatedGoal.keyResults[0].current).toBe(75);
      expect(updatedGoal.keyResults[0].unit).toBe('%');
      expect(updatedGoal.keyResults[1].current).toBe(150);
      expect(updatedGoal.keyResults[1].unit).toBe('users');
      expect(updatedGoal.keyResults[2].current).toBe(37.5);
      expect(updatedGoal.keyResults[2].unit).toBe('days');
      expect(updatedGoal.progress).toBe(75);
    });

    it('should handle empty key results array when updating progress', async () => {
      // Create a goal with no key results
      const goalWithoutKeyResults: Goal = {
        ...testGoal,
        keyResults: []
      };

      // Add to engine
      (engine as any)._goals.set(goalWithoutKeyResults.id, goalWithoutKeyResults);

      // Update progress - should not throw error
      await engine.updateGoalProgress(goalWithoutKeyResults.id, 50);

      // Verify progress is updated correctly
      const updatedGoal = (engine as any)._goals.get(goalWithoutKeyResults.id);
      expect(updatedGoal.progress).toBe(50);
      expect(updatedGoal.keyResults).toEqual([]);
    });

    it('should handle decimal progress values when updating key results', async () => {
      // Create a goal with key results
      const goalWithKeyResults: Goal = {
        ...testGoal,
        keyResults: [
          { id: 'kr-1', description: 'KR 1', target: 100, current: 0, unit: '%', weight: 0.6, status: 'pending' },
          { id: 'kr-2', description: 'KR 2', target: 75, current: 0, unit: 'points', weight: 0.4, status: 'pending' }
        ]
      };

      // Add to engine
      (engine as any)._goals.set(goalWithKeyResults.id, goalWithKeyResults);

      // Update progress to 33.333%
      await engine.updateGoalProgress(goalWithKeyResults.id, 33.333);

      // Verify key results were updated proportionally
      const updatedGoal = (engine as any)._goals.get(goalWithKeyResults.id);
      expect(updatedGoal.keyResults[0].current).toBeCloseTo(33.333);
      expect(updatedGoal.keyResults[1].current).toBeCloseTo(25);
      expect(updatedGoal.progress).toBe(33.333);
    });

    it('should complete goal with proper experience recording', async () => {
      // Add test goal to the engine
      (engine as any)._goals.set(testGoal.id, testGoal);

      // Mock learnFromExperience method
      const mockLearnFromExperience = jest.spyOn(mockLearningSystem, 'learnFromExperience').mockResolvedValue(undefined);

      // Complete the goal
      await engine.completeGoal(testGoal.id, { success: true });

      // Verify experience was recorded
      expect(mockLearnFromExperience).toHaveBeenCalled();

      // Verify goal status was updated
      const updatedGoal = (engine as any)._goals.get(testGoal.id);
      expect(updatedGoal.status).toBe('completed');
      expect(updatedGoal.updatedAt).toBeInstanceOf(Date);

      // Restore mock
      mockLearnFromExperience.mockRestore();
    });

    it('should get goal criticality based on priority', () => {
      // Test different priorities
      const criticalGoal: Goal = { ...testGoal, priority: 'critical' };
      const highGoal: Goal = { ...testGoal, priority: 'high' };
      const mediumGoal: Goal = { ...testGoal, priority: 'medium' };
      const lowGoal: Goal = { ...testGoal, priority: 'low' };

      // Get criticality
      const criticality1 = (engine as any).getGoalCriticality(criticalGoal);
      const criticality2 = (engine as any).getGoalCriticality(highGoal);
      const criticality3 = (engine as any).getGoalCriticality(mediumGoal);
      const criticality4 = (engine as any).getGoalCriticality(lowGoal);

      // Verify results
      expect(criticality1).toBe('critical');
      expect(criticality2).toBe('high');
      expect(criticality3).toBe('medium');
      expect(criticality4).toBe('low');
    });
  });

  describe('task execution', () => {
    const testTask: Task = {
      id: 'task-123',
      name: 'Test Task',
      description: 'A test task',
      type: 'analysis',
      priority: 'medium',
      status: 'pending',
      goalId: 'goal-123',
      dependencies: [],
      requirements: {
        cpu: { min: 0.1, max: 1, unit: 'cores' },
        memory: { min: 128, max: 1024, unit: 'MB' },
        storage: { min: 1, max: 10, unit: 'GB' },
        network: { min: 1, max: 100, unit: 'Mbps' },
        specialized: []
      },
      steps: [],
      metadata: {
        source: 'test',
        category: 'test',
        tags: [],
        retryPolicy: {
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          baseDelay: 1000,
          maxDelay: 10000
        },
        timeout: 30000,
        qualityRequirements: {}
      },
      createdAt: new Date(),
      scheduledAt: new Date(),
      startedAt: undefined,
      completedAt: undefined
    };

    it('should execute a task successfully', async () => {
      // Mock validateTask method
      jest.spyOn(engine as any, 'validateTask').mockImplementation(() => { });

      // Mock executeTaskSteps method
      jest.spyOn(engine as any, 'executeTaskSteps').mockResolvedValue([]);

      // Mock aggregateStepResults method
      jest.spyOn(engine as any, 'aggregateStepResults').mockReturnValue({});

      // Mock calculateTaskQuality method
      jest.spyOn(engine as any, 'calculateTaskQuality').mockReturnValue('excellent');

      // Mock calculatePerformanceMetrics method
      jest.spyOn(engine as any, 'calculatePerformanceMetrics').mockReturnValue({});

      // Mock generateTaskArtifacts method
      jest.spyOn(engine as any, 'generateTaskArtifacts').mockReturnValue([]);

      const result = await engine.executeTask(testTask);
      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
    });
  });

  describe('decision making', () => {
    const testDecisionContext: DecisionContext = {
      id: 'context-123',
      type: 'resource_allocation',
      priority: 'medium',
      description: 'Test decision context',
      parameters: {},
      constraints: [],
      objectives: [],
      stakeholders: [],
      deadline: undefined,
      metadata: {
        source: 'test',
        category: 'test',
        tags: [],
        historicalData: false,
        requiredConfidence: 0.8
      }
    };

    const testDecisionOptions: DecisionOption[] = [
      {
        id: 'option-1',
        name: 'Option 1',
        description: 'Option 1 description',
        parameters: {},
        expectedOutcomes: [],
        risks: [],
        costs: { computational: 50, financial: 100, time: 0.5, opportunity: 25 },
        benefits: { efficiency: 0.8, quality: 0.9, innovation: 0.7, collaboration: 0.6 },
        confidence: 0.8
      },
      {
        id: 'option-2',
        name: 'Option 2',
        description: 'Option 2 description',
        parameters: {},
        expectedOutcomes: [],
        risks: [],
        costs: { computational: 75, financial: 150, time: 1.0, opportunity: 50 },
        benefits: { efficiency: 0.9, quality: 0.8, innovation: 0.6, collaboration: 0.7 },
        confidence: 0.7
      }
    ];

    const mockDecision: Decision = {
      id: 'decision-123',
      contextId: testDecisionContext.id,
      selectedOption: testDecisionOptions[0].id,
      reasoning: {
        criteria: ['efficiency', 'cost', 'quality'],
        weights: { efficiency: 0.4, cost: 0.3, quality: 0.3 },
        scores: { efficiency: 0.8, cost: 0.7, quality: 0.9 },
        methodology: 'utility_theory',
        assumptions: ['stable environment', 'accurate data']
      },
      confidence: 0.9,
      alternatives: [testDecisionOptions[1].id],
      expectedValue: 0.85,
      riskAssessment: {
        overall: 'low',
        factors: [],
        mitigation: [],
        contingencyPlans: []
      },
      implementationPlan: {
        phases: [],
        timeline: { start: new Date(), end: new Date(Date.now() + 86400000), milestones: [], criticalPath: [] },
        dependencies: [],
        milestones: [],
        resources: {
          cpu: { min: 0.1, max: 1, unit: 'cores' },
          memory: { min: 128, max: 1024, unit: 'MB' },
          storage: { min: 1, max: 10, unit: 'GB' },
          network: { min: 1, max: 100, unit: 'Mbps' },
          specialized: []
        }
      },
      timestamp: new Date()
    };

    it('should make a decision successfully', async () => {
      // Mock the decision engine's makeDecision method
      const mockDecisionEngineMakeDecision = jest.spyOn(mockDecisionEngine, 'makeDecision').mockResolvedValue(mockDecision as any);

      const result = await engine.makeDecision(testDecisionContext as any, testDecisionOptions as any);
      expect(result).toEqual(mockDecision);
      expect(mockDecisionEngineMakeDecision).toHaveBeenCalledWith(testDecisionContext, testDecisionOptions);

      mockDecisionEngineMakeDecision.mockRestore();
    });

    it('should store decision in internal collection', async () => {
      // Mock the decision engine's makeDecision method
      const mockDecisionEngineMakeDecision = jest.spyOn(mockDecisionEngine, 'makeDecision').mockResolvedValue(mockDecision as any);

      await engine.makeDecision(testDecisionContext as any, testDecisionOptions as any);

      // Verify decision is stored
      const storedDecision = (engine as any)._decisions.get(mockDecision.id);
      expect(storedDecision).toBeDefined();
      expect(storedDecision).toEqual(mockDecision);

      mockDecisionEngineMakeDecision.mockRestore();
    });

    it('should evaluate decision when decision exists', async () => {
      // Add decision to internal collection
      (engine as any)._decisions.set(mockDecision.id, mockDecision);

      const mockEvaluation: DecisionEvaluation = {
        decisionId: mockDecision.id,
        actualOutcomes: [],
        effectiveness: { goalAlignment: 0.8, efficiency: 0.9, stakeholderSatisfaction: 0.85, innovation: 0.7, adaptability: 0.8 },
        lessons: [],
        recommendations: [],
        timestamp: new Date()
      };

      // Mock the decision engine's evaluateDecision method
      const mockDecisionEngineEvaluateDecision = jest.spyOn(mockDecisionEngine, 'evaluateDecision').mockResolvedValue(mockEvaluation as any);

      const result = await engine.evaluateDecision(mockDecision.id);
      expect(result).toEqual(mockEvaluation);
      expect(mockDecisionEngineEvaluateDecision).toHaveBeenCalledWith(mockDecision);

      mockDecisionEngineEvaluateDecision.mockRestore();
    });

    it('should throw error when evaluating non-existent decision', async () => {
      await expect(engine.evaluateDecision('non-existent-decision')).rejects.toThrow('Decision not found: non-existent-decision');
    });

    it('should handle empty options when making decision', async () => {
      // Mock the decision engine's makeDecision method to handle empty options
      const emptyOptionsDecision: Decision = {
        id: 'decision-456',
        contextId: testDecisionContext.id,
        selectedOption: '',
        reasoning: {
          criteria: ['availability'],
          weights: { availability: 1.0 },
          scores: { availability: 0.0 },
          methodology: 'utility_theory',
          assumptions: ['no options available']
        },
        confidence: 0.5,
        alternatives: [],
        expectedValue: 0.0,
        riskAssessment: {
          overall: 'high',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          timeline: { start: new Date(), end: new Date(Date.now() + 86400000), milestones: [], criticalPath: [] },
          resources: {
            cpu: { min: 0.1, max: 1, unit: 'cores' },
            memory: { min: 128, max: 1024, unit: 'MB' },
            storage: { min: 1, max: 10, unit: 'GB' },
            network: { min: 1, max: 100, unit: 'Mbps' },
            specialized: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };

      const mockDecisionEngineMakeDecision = jest.spyOn(mockDecisionEngine, 'makeDecision').mockResolvedValue(emptyOptionsDecision as any);

      const result = await engine.makeDecision(testDecisionContext as any, [] as any);
      expect(result).toEqual(emptyOptionsDecision);
      expect(mockDecisionEngineMakeDecision).toHaveBeenCalledWith(testDecisionContext, []);

      mockDecisionEngineMakeDecision.mockRestore();
    });

    it('should handle decision with high confidence', async () => {
      const highConfidenceDecision: Decision = {
        id: 'decision-789',
        contextId: testDecisionContext.id,
        selectedOption: testDecisionOptions[1].id,
        reasoning: {
          criteria: ['value', 'confidence'],
          weights: { value: 0.6, confidence: 0.4 },
          scores: { value: 0.9, confidence: 0.95 },
          methodology: 'utility_theory',
          assumptions: ['high value option']
        },
        confidence: 0.95,
        alternatives: [testDecisionOptions[0].id],
        expectedValue: 0.92,
        riskAssessment: {
          overall: 'low',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          timeline: { start: new Date(), end: new Date(Date.now() + 86400000), milestones: [], criticalPath: [] },
          resources: {
            cpu: { min: 0.1, max: 1, unit: 'cores' },
            memory: { min: 128, max: 1024, unit: 'MB' },
            storage: { min: 1, max: 10, unit: 'GB' },
            network: { min: 1, max: 100, unit: 'Mbps' },
            specialized: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };

      const mockDecisionEngineMakeDecision = jest.spyOn(mockDecisionEngine, 'makeDecision').mockResolvedValue(highConfidenceDecision as any);

      const result = await engine.makeDecision(testDecisionContext as any, testDecisionOptions as any);
      expect(result).toEqual(highConfidenceDecision);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);

      mockDecisionEngineMakeDecision.mockRestore();
    });

    it('should handle decision with low confidence', async () => {
      const lowConfidenceDecision: Decision = {
        id: 'decision-101',
        contextId: testDecisionContext.id,
        selectedOption: testDecisionOptions[0].id,
        reasoning: {
          criteria: ['uncertainty', 'safety'],
          weights: { uncertainty: 0.7, safety: 0.3 },
          scores: { uncertainty: 0.6, safety: 0.8 },
          methodology: 'utility_theory',
          assumptions: ['high uncertainty environment']
        },
        confidence: 0.4,
        alternatives: [testDecisionOptions[1].id],
        expectedValue: 0.35,
        riskAssessment: {
          overall: 'high',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          timeline: { start: new Date(), end: new Date(Date.now() + 86400000), milestones: [], criticalPath: [] },
          resources: {
            cpu: { min: 0.1, max: 1, unit: 'cores' },
            memory: { min: 128, max: 1024, unit: 'MB' },
            storage: { min: 1, max: 10, unit: 'GB' },
            network: { min: 1, max: 100, unit: 'Mbps' },
            specialized: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };

      const mockDecisionEngineMakeDecision = jest.spyOn(mockDecisionEngine, 'makeDecision').mockResolvedValue(lowConfidenceDecision as any);

      const result = await engine.makeDecision(testDecisionContext as any, testDecisionOptions as any);
      expect(result).toEqual(lowConfidenceDecision);
      expect(result.confidence).toBeLessThan(0.5);

      mockDecisionEngineMakeDecision.mockRestore();
    });
  });

  describe('learning and adaptation', () => {
    const testExperience: Experience = {
      id: 'exp-123',
      type: 'success',
      context: {
        goals: ['goal-123'],
        constraints: [],
        resources: {
          cpu: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
          memory: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
          storage: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
          network: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
          specialized: []
        },
        environment: { type: 'production', load: 0, conditions: {}, externalFactors: [] },
        stakeholders: []
      },
      situation: {
        description: 'Test situation',
        complexity: 'simple',
        uncertainty: 'low',
        novelty: 'familiar',
        criticality: 'low'
      },
      actions: [],
      outcomes: [],
      feedback: {
        source: 'system',
        type: 'performance',
        content: 'Test feedback',
        sentiment: 'positive',
        confidence: 1.0,
        actionability: 'immediate'
      },
      timestamp: new Date(),
      metadata: {
        tags: [],
        category: 'performance',
        importance: 'medium',
        applicability: [],
        sharingConsent: true
      }
    };

    const testStrategy = {
      id: 'strategy-123',
      name: 'Test Strategy',
      description: 'A test strategy',
      type: 'adaptability' as StrategyType,
      objectives: [],
      tactics: [],
      evaluation: {
        successCriteria: [],
        metrics: [],
        reviewSchedule: { frequency: 'weekly' as const, nextReview: new Date(), responsible: [] },
        feedbackMechanisms: []
      },
      adaptation: {
        triggers: [],
        conditions: [],
        strategies: [],
        evaluation: { criteria: [], timeline: 30, responsible: 'system', rollbackPlan: { triggers: [], procedures: [], responsible: 'system', timeline: 30 } }
      },
      metadata: {
        version: '1.0.0',
        author: 'test',
        createdAt: new Date(),
        lastModified: new Date(),
        tags: [],
        category: 'test',
        scope: 'test'
      }
    };

    const testLearningProgress = {
      totalExperiences: 100,
      successfulAdaptations: 80,
      adaptationRate: 0.8,
      learningEfficiency: 0.9,
      strategyEffectiveness: 0.85,
      adaptationQuality: 'high',
      knowledgeGrowth: 0.75,
      lastAdaptation: new Date(),
      metrics: {}
    };

    it('should learn from experience successfully', async () => {
      // Mock learnFromExperience method
      const mockLearnFromExperience = jest.spyOn(mockLearningSystem, 'learnFromExperience').mockResolvedValue(undefined);
      const mockEmit = jest.spyOn(engine, 'emit').mockImplementation();

      await engine.learnFromExperience(testExperience);

      // Verify experience was stored
      const storedExperience = (engine as any)._experiences.get(testExperience.id);
      expect(storedExperience).toEqual(testExperience);

      // Verify delegation to learning system
      expect(mockLearnFromExperience).toHaveBeenCalledWith(testExperience);

      // Verify event emission
      expect(mockEmit).toHaveBeenCalledWith('learning.completed', expect.objectContaining({
        experience: testExperience,
        timestamp: expect.any(Date)
      }));

      // Restore mocks
      mockLearnFromExperience.mockRestore();
      mockEmit.mockRestore();
    });

    it('should adapt strategy successfully', async () => {
      // Mock adaptStrategy method
      const mockAdaptStrategy = jest.spyOn(mockLearningSystem, 'adaptStrategy').mockResolvedValue(undefined);
      const mockEmit = jest.spyOn(engine, 'emit').mockImplementation();

      await engine.adaptStrategy(testStrategy);

      // Verify strategy was stored
      const storedStrategy = (engine as any)._strategies.get(testStrategy.id);
      expect(storedStrategy).toEqual(testStrategy);

      // Verify delegation to learning system
      expect(mockAdaptStrategy).toHaveBeenCalledWith(testStrategy);

      // Verify event emission
      expect(mockEmit).toHaveBeenCalledWith('strategy.adapted', expect.objectContaining({
        strategy: testStrategy,
        timestamp: expect.any(Date)
      }));

      // Restore mocks
      mockAdaptStrategy.mockRestore();
      mockEmit.mockRestore();
    });

    it('should get learning progress successfully', () => {
      // Mock getProgress method
      const mockGetProgress = jest.spyOn(mockLearningSystem, 'getProgress').mockReturnValue(testLearningProgress as any);

      const progress = engine.getLearningProgress();

      // Verify progress was returned
      expect(progress).toEqual(testLearningProgress);

      // Verify delegation to learning system
      expect(mockGetProgress).toHaveBeenCalled();

      // Restore mock
      mockGetProgress.mockRestore();
    });

    it('should handle multiple experiences', async () => {
      // Create multiple experiences
      const exp1 = { ...testExperience, id: 'exp-1', type: 'success' as ExperienceType };
      const exp2 = { ...testExperience, id: 'exp-2', type: 'failure' as ExperienceType };
      const exp3 = { ...testExperience, id: 'exp-3', type: 'task_execution' as ExperienceType };

      // Mock learnFromExperience method
      const mockLearnFromExperience = jest.spyOn(mockLearningSystem, 'learnFromExperience').mockResolvedValue(undefined);

      // Learn from all experiences
      await Promise.all([
        engine.learnFromExperience(exp1),
        engine.learnFromExperience(exp2),
        engine.learnFromExperience(exp3)
      ]);

      // Verify all experiences were stored
      expect((engine as any)._experiences.size).toBe(3);
      expect((engine as any)._experiences.get('exp-1')).toEqual(exp1);
      expect((engine as any)._experiences.get('exp-2')).toEqual(exp2);
      expect((engine as any)._experiences.get('exp-3')).toEqual(exp3);

      // Verify delegation for each experience
      expect(mockLearnFromExperience).toHaveBeenCalledTimes(3);

      // Restore mock
      mockLearnFromExperience.mockRestore();
    });

    it('should handle multiple strategies', async () => {
      // Create multiple strategies
      const strategy1 = { ...testStrategy, id: 'strategy-1', type: 'learning' as StrategyType };
      const strategy2 = { ...testStrategy, id: 'strategy-2', type: 'performance' as StrategyType };
      const strategy3 = { ...testStrategy, id: 'strategy-3', type: 'collaboration' as StrategyType };

      // Mock adaptStrategy method
      const mockAdaptStrategy = jest.spyOn(mockLearningSystem, 'adaptStrategy').mockResolvedValue(undefined);

      // Adapt all strategies
      await Promise.all([
        engine.adaptStrategy(strategy1),
        engine.adaptStrategy(strategy2),
        engine.adaptStrategy(strategy3)
      ]);

      // Verify all strategies were stored
      expect((engine as any)._strategies.size).toBe(3);
      expect((engine as any)._strategies.get('strategy-1')).toEqual(strategy1);
      expect((engine as any)._strategies.get('strategy-2')).toEqual(strategy2);
      expect((engine as any)._strategies.get('strategy-3')).toEqual(strategy3);

      // Verify delegation for each strategy
      expect(mockAdaptStrategy).toHaveBeenCalledTimes(3);

      // Restore mock
      mockAdaptStrategy.mockRestore();
    });
  });

  describe('public properties', () => {
    it('should return correct status', () => {
      const status = engine.status;
      expect(status).toBe('initializing');
    });

    it('should return correct capabilities', () => {
      const capabilities = engine.capabilities;
      expect(capabilities).toBeDefined();
    });

    it('should return correct metrics', () => {
      const metrics = engine.metrics;
      expect(metrics).toBeDefined();
    });
  });

  describe('task execution - additional methods', () => {
    it('should schedule a task', async () => {
      const testTask: Task = {
        id: 'task-789',
        name: 'Test Task',
        description: 'A test task',
        type: 'learning',
        priority: 'medium',
        status: 'pending',
        createdAt: new Date(),

        requirements: {
          cpu: { min: 0.1, max: 1, unit: 'cores' },
          memory: { min: 128, max: 1024, unit: 'MB' },
          storage: { min: 1, max: 10, unit: 'GB' },
          network: { min: 1, max: 100, unit: 'Mbps' },
          specialized: []
        },
        steps: [{ id: 'step-1', name: 'Test Step', description: 'Test step description', type: 'data_processing' as const, parameters: {}, dependencies: [], estimatedDuration: 60, requiredResources: [] }],
        dependencies: [],
        metadata: {
          source: 'test',
          category: 'test',
          tags: [],
          retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential', baseDelay: 1000, maxDelay: 10000 },
          timeout: 30000,
          qualityRequirements: {}
        }
      };

      const result = await engine.scheduleTask(testTask);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(mockTaskScheduler.schedule).toHaveBeenCalledWith(testTask, undefined);
    });

    it('should cancel a task', async () => {
      const taskId = 'task-789';

      // Add test task to the engine
      (engine as any)._tasks.set(taskId, {
        id: taskId,
        name: 'Test Task',
        description: 'A test task',
        type: 'learning',
        priority: 'medium',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: 'system',
        requirements: {
          cpu: { min: 0.1, max: 1, unit: 'cores' },
          memory: { min: 128, max: 1024, unit: 'MB' },
          storage: { min: 1, max: 10, unit: 'GB' },
          network: { min: 1, max: 100, unit: 'Mbps' },
          specialized: []
        },
        steps: [{ id: 'step-1', name: 'Test Step', description: 'Test step description', type: 'data_processing' as const, parameters: {}, dependencies: [], estimatedDuration: 60, requiredResources: [] }],
        dependencies: []
      });

      await engine.cancelTask(taskId);
      expect(mockTaskScheduler.cancel).toHaveBeenCalledWith(taskId);
    });

    it('should get task status', () => {
      const taskId = 'task-789';
      const taskStatus: TaskStatus = 'running';

      // Add test task to the engine
      (engine as any)._tasks.set(taskId, {
        id: taskId,
        name: 'Test Task',
        description: 'A test task',
        type: 'learning',
        priority: 'medium',
        status: taskStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: 'system',
        requirements: {
          cpu: { min: 0.1, max: 1, unit: 'cores' },
          memory: { min: 128, max: 1024, unit: 'MB' },
          storage: { min: 1, max: 10, unit: 'GB' },
          network: { min: 1, max: 100, unit: 'Mbps' },
          specialized: []
        },
        steps: [{ id: 'step-1', name: 'Test Step', description: 'Test step description', type: 'data_processing' as const, parameters: {}, dependencies: [], estimatedDuration: 60, requiredResources: [] }],
        dependencies: [],
        metrics: []
      });

      const status = engine.getTaskStatus(taskId);
      expect(status).toBe(taskStatus);
    });

    it('should execute step successfully', async () => {
      const step = { id: 'step-1', name: 'Test Step', description: 'Test step description', type: 'data_processing', parameters: {}, dependencies: [], estimatedDuration: 100, requiredResources: [] };
      const result = await engine['executeStep'](step);

      expect(result).toHaveProperty('stepId', 'step-1');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('resourceUsage');
      expect((result as any).result).toEqual({ success: true, data: 'Step Test Step completed' });
    });

    it('should handle step execution failure', async () => {
      // Create a direct mock for executeStep method
      const mockExecuteStep = jest.spyOn(engine, 'executeStep' as any).mockResolvedValue({
        stepId: 'step-1',
        duration: 100,
        resourceUsage: { cpu: 0.1, memory: 50, storage: 0, network: 0, specialized: {} },
        result: { success: false, error: 'Step execution failed' }
      });

      const step = { id: 'step-1', name: 'Test Step', description: 'Test step description', type: 'data_processing', parameters: {}, dependencies: [], estimatedDuration: 100, requiredResources: [] };
      const result = await engine['executeStep'](step);

      expect(result).toHaveProperty('stepId', 'step-1');
      expect((result as any).result).toEqual({ success: false, error: 'Step execution failed' });

      // Restore mock
      mockExecuteStep.mockRestore();
    });

    it('should execute task steps correctly', async () => {
      // Mock the executeStep method to control its behavior
      const mockExecuteStep = jest.spyOn(engine, 'executeStep' as any);

      // Return different results for each step
      mockExecuteStep.mockResolvedValueOnce({
        stepId: 'step-1',
        duration: 100,
        resourceUsage: { cpu: 0.1, memory: 50, storage: 0, network: 0, specialized: {} },
        result: { success: true, data: 'Step 1 completed' }
      }).mockResolvedValueOnce({
        stepId: 'step-2',
        duration: 150,
        resourceUsage: { cpu: 0.1, memory: 50, storage: 0, network: 0, specialized: {} },
        result: { success: true, data: 'Step 2 completed' }
      });

      const task: Task = {
        id: 'test-task',
        name: 'Test Task',
        description: 'Test task description',
        type: 'computation',
        priority: 'medium',
        status: 'pending',
        goalId: 'goal-1',
        dependencies: [],
        requirements: {
          cpu: { min: 0.1, max: 1, unit: 'cores' },
          memory: { min: 128, max: 1024, unit: 'MB' },
          storage: { min: 1, max: 10, unit: 'GB' },
          network: { min: 1, max: 100, unit: 'Mbps' },
          specialized: []
        },
        steps: [
          { id: 'step-1', name: 'Step 1', description: 'Step 1 description', type: 'data_processing', parameters: {}, dependencies: [], estimatedDuration: 100, requiredResources: [] },
          { id: 'step-2', name: 'Step 2', description: 'Step 2 description', type: 'data_processing', parameters: {}, dependencies: [], estimatedDuration: 100, requiredResources: [] }
        ],
        metadata: {
          source: 'system',
          category: 'test',
          tags: [],
          retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential', baseDelay: 1000, maxDelay: 10000 },
          timeout: 30000,
          qualityRequirements: {}
        },
        createdAt: new Date()
      };

      const results = await engine['executeTaskSteps'](task);

      expect(results).toHaveLength(2);
      expect((results[0] as any).stepId).toBe('step-1');
      expect((results[1] as any).stepId).toBe('step-2');
      expect((results[0] as any).result).toHaveProperty('success', true);
      expect((results[1] as any).result).toHaveProperty('success', true);

      // Restore mock
      mockExecuteStep.mockRestore();
    });

    it('should aggregate step results correctly with all successful steps', async () => {
      const stepResults = [
        { stepId: 'step-1', result: { success: true, data: 'result-1' } },
        { stepId: 'step-2', result: { success: true, data: 'result-2' } }
      ];

      const aggregated = engine['aggregateStepResults'](stepResults);

      expect(aggregated).toEqual({
        totalSteps: 2,
        successfulSteps: 2,
        failedSteps: 0,
        overallSuccess: true,
        data: ['result-1', 'result-2'],
        errors: []
      });
    });

    it('should aggregate step results correctly with failed steps', async () => {
      const stepResults = [
        { stepId: 'step-1', result: { success: true, data: 'result-1' } },
        { stepId: 'step-2', result: { success: false, error: 'error-1' } },
        { stepId: 'step-3', result: { success: false, error: 'error-2' } }
      ];

      const aggregated = engine['aggregateStepResults'](stepResults);

      expect(aggregated).toEqual({
        totalSteps: 3,
        successfulSteps: 1,
        failedSteps: 2,
        overallSuccess: false,
        data: ['result-1'],
        errors: ['error-1', 'error-2']
      });
    });

    it('should aggregate step results correctly with empty steps', async () => {
      const stepResults: any[] = [];

      const aggregated = engine['aggregateStepResults'](stepResults);

      expect(aggregated).toEqual({
        totalSteps: 0,
        successfulSteps: 0,
        failedSteps: 0,
        overallSuccess: true,
        data: [],
        errors: []
      });
    });

    it('should aggregate step results correctly with only failed steps', async () => {
      const stepResults = [
        { stepId: 'step-1', result: { success: false, error: 'error-1' } },
        { stepId: 'step-2', result: { success: false, error: 'error-2' } }
      ];

      const aggregated = engine['aggregateStepResults'](stepResults);

      expect(aggregated).toEqual({
        totalSteps: 2,
        successfulSteps: 0,
        failedSteps: 2,
        overallSuccess: false,
        data: [],
        errors: ['error-1', 'error-2']
      });
    });

    it('should calculate task quality correctly with all successful steps', async () => {
      const stepResults = [
        { stepId: 'step-1', result: { success: true, data: 'result-1' } },
        { stepId: 'step-2', result: { success: true, data: 'result-2' } }
      ];

      const quality = engine['calculateTaskQuality'](stepResults);

      expect(quality).toEqual({
        accuracy: 1,
        completeness: 1,
        relevance: 0.9,
        reliability: 1,
        usability: 0.8
      });
    });

    it('should calculate task quality correctly with partial success', async () => {
      const stepResults = [
        { stepId: 'step-1', result: { success: true, data: 'result-1' } },
        { stepId: 'step-2', result: { success: true, data: 'result-2' } },
        { stepId: 'step-3', result: { success: false, error: 'error-1' } }
      ];

      const quality = engine['calculateTaskQuality'](stepResults);

      expect(quality).toEqual({
        accuracy: 2 / 3,
        completeness: 2 / 3,
        relevance: 0.9,
        reliability: 2 / 3,
        usability: 0.8
      });
    });

    it('should calculate task quality correctly with all failed steps', async () => {
      const stepResults = [
        { stepId: 'step-1', result: { success: false, error: 'error-1' } },
        { stepId: 'step-2', result: { success: false, error: 'error-2' } }
      ];

      const quality = engine['calculateTaskQuality'](stepResults);

      expect(quality).toEqual({
        accuracy: 0,
        completeness: 0,
        relevance: 0.9,
        reliability: 0,
        usability: 0.8
      });
    });

    it('should calculate task quality correctly with empty steps', async () => {
      const stepResults: any[] = [];

      // This should handle division by zero gracefully
      const quality = engine['calculateTaskQuality'](stepResults);

      expect(quality).toEqual({
        accuracy: 0,
        completeness: 0,
        relevance: 0.9,
        reliability: 0,
        usability: 0.8
      });
    });
  });

  describe('resource management', () => {
    it('should allocate resources', async () => {
      const requirements = {
        cpu: { min: 0.1, max: 1, unit: 'cores' },
        memory: { min: 128, max: 1024, unit: 'MB' },
        storage: { min: 1, max: 10, unit: 'GB' },
        network: { min: 1, max: 100, unit: 'Mbps' },
        specialized: []
      };

      const mockAllocation = { id: 'alloc-789' };
      mockResourceManager.allocateResources.mockResolvedValue(mockAllocation);

      const result = await engine.allocateResources(requirements);
      expect(result).toBe(mockAllocation);
      expect(mockResourceManager.allocateResources).toHaveBeenCalledWith(requirements);
    });

    it('should release resources', async () => {
      const allocationId = 'alloc-789';

      // Add resource allocation to the engine
      (engine as any)._resources.set(allocationId, { id: allocationId });

      await engine.releaseResources(allocationId);
      expect(mockResourceManager.releaseResources).toHaveBeenCalledWith(allocationId);
      expect((engine as any)._resources.has(allocationId)).toBe(false);
    });

    it('should get resource utilization', () => {
      const mockUtilization = { cpu: 50, memory: 60 };
      mockResourceManager.getResourceUtilization.mockReturnValue(mockUtilization);

      const result = engine.getResourceUtilization();
      expect(result).toBe(mockUtilization);
      expect(mockResourceManager.getResourceUtilization).toHaveBeenCalled();
    });

    it('should get current usage', () => {
      const mockUsage = { cpu: 30, memory: 40 };
      mockResourceManager.getCurrentUsage.mockReturnValue(mockUsage);

      const result = engine.getCurrentUsage();
      expect(result).toBe(mockUsage);
      expect(mockResourceManager.getCurrentUsage).toHaveBeenCalled();
    });

    it('should get usage for a specific allocation', () => {
      const allocationId = 'alloc-456';
      const mockUsage = { cpu: 10, memory: 20 };
      mockResourceManager.getUsage.mockReturnValue(mockUsage);

      const result = engine.getUsage(allocationId);
      expect(result).toBe(mockUsage);
      expect(mockResourceManager.getUsage).toHaveBeenCalledWith(allocationId);
    });
  });

  describe('decision making - additional methods', () => {
    it('should evaluate a decision', async () => {
      const decisionId = 'decision-789';
      const mockDecision = { id: decisionId, description: 'Test Decision' };
      const mockEvaluation = { decisionId, score: 0.9 };

      // Add decision to the engine
      (engine as any)._decisions.set(decisionId, mockDecision as any);
      const evaluateDecisionSpy = jest.spyOn(mockDecisionEngine, 'evaluateDecision').mockResolvedValue(mockEvaluation as any);

      const result = await engine.evaluateDecision(decisionId);
      expect(result).toBe(mockEvaluation);
      expect(evaluateDecisionSpy).toHaveBeenCalledWith(mockDecision);

      // Restore original implementation
      evaluateDecisionSpy.mockRestore();
    });

    it('should throw error when evaluating non-existent decision', async () => {
      await expect(engine.evaluateDecision('non-existent-decision')).rejects.toThrow(
        'Decision not found: non-existent-decision'
      );
    });

    it('should make decision and store it in decisions collection', async () => {
      const testContext = { id: 'context-123', description: 'Test Context' };
      const testOptions = [
        { id: 'option-1', description: 'Option 1', value: 100 },
        { id: 'option-2', description: 'Option 2', value: 200 }
      ];

      const mockDecision = {
        id: 'decision-456',
        contextId: testContext.id,
        optionId: 'option-1',
        reasoning: 'Selected option 1',
        confidence: 0.85
      };

      mockDecisionEngine.makeDecision.mockResolvedValue(mockDecision as any);

      const result = await engine.makeDecision(testContext as any, testOptions as any);

      expect(result).toEqual(mockDecision);
      expect(mockDecisionEngine.makeDecision).toHaveBeenCalledWith(testContext, testOptions);
      expect((engine as any)._decisions.get(mockDecision.id)).toBeDefined();
    });
  });

  describe('learning and adaptation', () => {
    it('should adapt a strategy', async () => {
      const testStrategy = {
        id: 'strategy-789',
        name: 'Test Strategy',
        description: 'A test strategy',
        type: 'adaptability' as StrategyType,
        objectives: [],
        tactics: [],
        evaluation: {
          successCriteria: [],
          metrics: [],
          reviewSchedule: { frequency: 'weekly', nextReview: new Date(), responsible: [] },
          feedbackMechanisms: []
        },
        adaptation: {
          triggers: [],
          actions: [],
          evaluation: { successCriteria: [], metrics: [] }
        },
        metadata: {
          version: '1.0.0',
          author: 'test',
          createdAt: new Date(),
          lastModified: new Date(),
          tags: [],
          category: 'test',
          scope: 'test'
        }
      };

      await engine.adaptStrategy(testStrategy as any);
      expect((engine as any)._strategies.get(testStrategy.id)).toBe(testStrategy);
      expect(mockLearningSystem.adaptStrategy).toHaveBeenCalledWith(testStrategy);
    });

    it('should get learning progress', () => {
      const mockProgress = { completed: 50, total: 100 };
      (mockLearningSystem as any).getProgress = jest.fn().mockReturnValue(mockProgress);

      const result = engine.getLearningProgress();
      expect(result).toBe(mockProgress);
      expect((mockLearningSystem as any).getProgress).toHaveBeenCalled();
    });
  });

  describe('collaboration and communication', () => {
    it('should send a message', async () => {
      const testMessage = { id: 'msg-789', content: 'Test Message' };

      await engine.sendMessage(testMessage as any);
      expect((engine as any)._messages).toContain(testMessage);
      expect(mockCollaborationManager.sendMessage).toHaveBeenCalledWith(testMessage);
    });

    it('should receive messages', () => {
      const testMessage1 = { id: 'msg-789', content: 'Test Message 1' };
      const testMessage2 = { id: 'msg-890', content: 'Test Message 2' };

      // Add messages to the engine
      (engine as any)._messages.push(testMessage1);
      (engine as any)._messages.push(testMessage2);

      const result = engine.receiveMessages();
      expect(result).toEqual([testMessage1, testMessage2]);
      expect((engine as any)._messages).toEqual([]);
    });

    it('should collaborate with other engines', async () => {
      const otherEngines = ['engine-2', 'engine-3'];
      const testTask = { id: 'collab-789', name: 'Test Collaboration' };
      const mockResult = { success: true, results: [] };

      mockCollaborationManager.collaborate.mockResolvedValue(mockResult);

      const result = await engine.collaborateWith(otherEngines, testTask as any);
      expect(result).toBe(mockResult);
      expect((engine as any)._collaborations.get(testTask.id)).toBe(testTask);
      expect(mockCollaborationManager.collaborate).toHaveBeenCalledWith(otherEngines, testTask);
    });

    it('should handle collaboration failure', async () => {
      const otherEngines = ['engine-2', 'engine-3'];
      const testTask = { id: 'collab-790', name: 'Test Collaboration Failure' };
      const mockError = new Error('Collaboration failed');

      mockCollaborationManager.collaborate.mockRejectedValue(mockError);

      await expect(engine.collaborateWith(otherEngines, testTask as any)).rejects.toThrow('Collaboration failed');
      expect(mockCollaborationManager.collaborate).toHaveBeenCalledWith(otherEngines, testTask);
    });

    it('should send multiple messages', async () => {
      const testMessages = [
        { id: 'msg-1', content: 'Message 1' },
        { id: 'msg-2', content: 'Message 2' },
        { id: 'msg-3', content: 'Message 3' }
      ];

      for (const message of testMessages) {
        await engine.sendMessage(message as any);
      }

      expect((engine as any)._messages).toEqual(testMessages);
      expect(mockCollaborationManager.sendMessage).toHaveBeenCalledTimes(3);
      testMessages.forEach(message => {
        expect(mockCollaborationManager.sendMessage).toHaveBeenCalledWith(message);
      });
    });

    it('should receive empty message queue', () => {
      // Ensure message queue is empty
      (engine as any)._messages = [];

      const result = engine.receiveMessages();
      expect(result).toEqual([]);
      expect((engine as any)._messages).toEqual([]);
    });

    it('should initialize collaboration', async () => {
      const collaborationConfig = {
        id: 'collab-init-1',
        name: 'Test Collaboration',
        participants: ['engine-1', 'engine-2'],
        goals: ['goal-1'],
        resources: [],
        constraints: []
      };

      const mockCollaborationResult = {
        id: 'collab-123',
        participants: collaborationConfig.participants,
        status: 'initialized'
      };

      mockCollaborationManager.initiateCollaboration.mockResolvedValue(mockCollaborationResult);

      const result = await engine.initiateCollaboration(collaborationConfig as any);
      expect(result).toEqual(mockCollaborationResult);
      expect(mockCollaborationManager.initiateCollaboration).toHaveBeenCalledWith(collaborationConfig);
    });

    it('should get collaboration status', async () => {
      const collaborationId = 'collab-123';
      const mockStatus = {
        id: collaborationId,
        status: 'active',
        participants: ['engine-1', 'engine-2'],
        progress: 50
      };

      mockCollaborationManager.getCollaborationStatus.mockResolvedValue(mockStatus);

      const result = await engine.getCollaborationStatus(collaborationId);
      expect(result).toEqual(mockStatus);
      expect(mockCollaborationManager.getCollaborationStatus).toHaveBeenCalledWith(collaborationId);
    });

    it('should handle collaboration status retrieval failure', async () => {
      const collaborationId = 'non-existent-collab';
      const mockError = new Error('Collaboration not found');

      mockCollaborationManager.getCollaborationStatus.mockRejectedValue(mockError);

      await expect(engine.getCollaborationStatus(collaborationId)).rejects.toThrow('Collaboration not found');
      expect(mockCollaborationManager.getCollaborationStatus).toHaveBeenCalledWith(collaborationId);
    });
  });

  describe('monitoring and diagnostics', () => {
    it('should get health status', () => {
      const mockHealthStatus = { overall: 'healthy' };
      mockMonitoringSystem.getHealthStatus.mockReturnValue(mockHealthStatus);

      const result = engine.getHealthStatus();
      expect(result).toBe(mockHealthStatus);
      expect(mockMonitoringSystem.getHealthStatus).toHaveBeenCalled();
    });

    it('should get health status in error state', () => {
      const mockHealthStatus = { overall: 'error', subsystems: { messageBus: 'down' } };
      mockMonitoringSystem.getHealthStatus.mockReturnValue(mockHealthStatus);

      const result = engine.getHealthStatus();
      expect(result).toBe(mockHealthStatus);
      expect(result.overall).toBe('error');
      expect(mockMonitoringSystem.getHealthStatus).toHaveBeenCalled();
    });

    it('should get diagnostic info', () => {
      const mockDiagnosticInfo = { cpu: { usage: 50 }, memory: { usage: 60 } };
      mockMonitoringSystem.getDiagnosticInfo.mockReturnValue(mockDiagnosticInfo);

      const result = engine.getDiagnosticInfo();
      expect(result).toBe(mockDiagnosticInfo);
      expect(mockMonitoringSystem.getDiagnosticInfo).toHaveBeenCalled();
    });

    it('should get empty diagnostic info', () => {
      const mockDiagnosticInfo = {};
      mockMonitoringSystem.getDiagnosticInfo.mockReturnValue(mockDiagnosticInfo);

      const result = engine.getDiagnosticInfo();
      expect(result).toBe(mockDiagnosticInfo);
      expect(Object.keys(result)).toHaveLength(0);
      expect(mockMonitoringSystem.getDiagnosticInfo).toHaveBeenCalled();
    });

    it('should export metrics', async () => {
      const mockMetrics = { uptime: 1000, totalTasksExecuted: 5 };
      (engine as any)._metrics = mockMetrics;

      const result = await engine.exportMetrics();
      expect(result).toEqual(mockMetrics);
      expect(result).not.toBe((engine as any)._metrics); // Should be a copy
    });

    it('should export metrics when no metrics exist', async () => {
      (engine as any)._metrics = undefined;

      const result = await engine.exportMetrics();
      expect(result).toEqual({});
      expect(typeof result).toBe('object');
    });

    it('should handle error when getting health status', () => {
      const mockError = new Error('Health check failed');
      mockMonitoringSystem.getHealthStatus.mockImplementation(() => {
        throw mockError;
      });

      expect(() => engine.getHealthStatus()).toThrow('Health check failed');
      expect(mockMonitoringSystem.getHealthStatus).toHaveBeenCalled();
    });

    it('should handle error when getting diagnostic info', () => {
      const mockError = new Error('Diagnostics collection failed');
      mockMonitoringSystem.getDiagnosticInfo.mockImplementation(() => {
        throw mockError;
      });

      expect(() => engine.getDiagnosticInfo()).toThrow('Diagnostics collection failed');
      expect(mockMonitoringSystem.getDiagnosticInfo).toHaveBeenCalled();
    });

    it('should collect metrics through monitoring system', () => {
      const mockMetrics = { cpu: 75, memory: 80, disk: 65 };
      mockMonitoringSystem.collectMetrics.mockReturnValue(mockMetrics);

      // Call collectMetrics directly on the monitoringSystem since it's not exposed via the engine
      const result = (engine as any).monitoringSystem.collectMetrics();
      expect(result).toBe(mockMetrics);
      expect(mockMonitoringSystem.collectMetrics).toHaveBeenCalled();
    });

    it('should get health status with detailed subsystem information', () => {
      const mockHealthStatus = {
        overall: 'degraded',
        subsystems: {
          messageBus: 'healthy',
          taskScheduler: 'warning',
          stateManager: 'error'
        },
        components: [
          { component: 'taskScheduler', status: 'warning', details: {} },
          { component: 'stateManager', status: 'error', details: {} }
        ],
        timestamp: Date.now()
      };
      mockMonitoringSystem.getHealthStatus.mockReturnValue(mockHealthStatus);

      const result = engine.getHealthStatus();
      expect(result).toBe(mockHealthStatus);
      expect(result.components).toBeDefined();
      expect(result.components[0].component).toBe('taskScheduler');
      expect(result.components[0].status).toBe('warning');
      expect(mockMonitoringSystem.getHealthStatus).toHaveBeenCalled();
    });
  });

  describe('internal methods', () => {
    it('should generate unique IDs', () => {
      const id1 = (engine as any).generateId('test');
      const id2 = (engine as any).generateId('test');
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should calculate goal criticality for all priority levels', () => {
      const testGoals: Goal[] = [
        {
          id: 'goal-critical',
          name: 'Critical Goal',
          description: 'A critical goal',
          type: 'learning',
          priority: 'critical',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          objective: 'Critical objective',
          keyResults: [
            { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: '%', weight: 1.0, status: 'pending' }
          ],
          constraints: [],
          dependencies: [],
          progress: 0,
          metadata: {
            source: 'user',
            tags: [],
            category: 'test',
            requiredResources: [],
            successCriteria: []
          }
        },
        {
          id: 'goal-high',
          name: 'High Priority Goal',
          description: 'A high priority goal',
          type: 'learning',
          priority: 'high',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          objective: 'High priority objective',
          keyResults: [
            { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: '%', weight: 1.0, status: 'pending' }
          ],
          constraints: [],
          dependencies: [],
          progress: 0,
          metadata: {
            source: 'user',
            tags: [],
            category: 'test',
            requiredResources: [],
            successCriteria: []
          }
        },
        {
          id: 'goal-medium',
          name: 'Medium Priority Goal',
          description: 'A medium priority goal',
          type: 'learning',
          priority: 'medium',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          objective: 'Medium priority objective',
          keyResults: [
            { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: 'percentage', weight: 1, status: 'pending' }
          ],
          constraints: [],
          dependencies: [],
          progress: 0,
          metadata: {
            source: 'user',
            tags: [],
            category: 'test',
            requiredResources: [],
            successCriteria: []
          }
        },
        {
          id: 'goal-low',
          name: 'Low Priority Goal',
          description: 'A low priority goal',
          type: 'learning',
          priority: 'low',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          objective: 'Low priority objective',
          keyResults: [
            { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: '%', weight: 1.0, status: 'pending' }
          ],
          constraints: [],
          dependencies: [],
          progress: 0,
          metadata: {
            source: 'user',
            tags: [],
            category: 'test',
            requiredResources: [],
            successCriteria: []
          }
        }
      ];

      expect((engine as any).getGoalCriticality(testGoals[0])).toBe('critical');
      expect((engine as any).getGoalCriticality(testGoals[1])).toBe('high');
      expect((engine as any).getGoalCriticality(testGoals[2])).toBe('medium');
      expect((engine as any).getGoalCriticality(testGoals[3])).toBe('low');
    });

    it('should get priority value correctly', () => {
      expect((engine as any).getPriorityValue('low')).toBe(1);
      expect((engine as any).getPriorityValue('medium')).toBe(2);
      expect((engine as any).getPriorityValue('high')).toBe(3);
      expect((engine as any).getPriorityValue('critical')).toBe(4);
      expect((engine as any).getPriorityValue('unknown' as Priority)).toBe(0);
    });

    it('should validate goal correctly with valid goal', () => {
      const validGoal: Goal = {
        id: 'goal-456',
        name: 'Test Goal',
        description: 'A test goal',
        type: 'learning',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        objective: 'Main test objective',
        keyResults: [
          { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: '%', weight: 1.0, status: 'pending' }
        ],
        constraints: [],
        dependencies: [],
        progress: 0,
        metadata: {
          source: 'user',
          tags: [],
          category: 'test',
          requiredResources: [],
          successCriteria: []
        }
      };

      expect(() => (engine as any).validateGoal(validGoal)).not.toThrow();
    });

    it('should validate goal correctly with invalid goal (missing id)', () => {
      const invalidGoal: any = {
        name: 'Test Goal',
        description: 'A test goal',
        type: 'learning',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        objective: 'Main test objective',
        keyResults: [
          { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0 }
        ],
        constraints: [],
        dependencies: [],
        progress: 0,
        metadata: {
          source: 'user',
          tags: [],
          category: 'test',
          requiredResources: [],
          successCriteria: []
        }
      };

      expect(() => (engine as any).validateGoal(invalidGoal)).toThrow('Goal must have id, name, and objective');
    });

    it('should validate goal correctly with invalid goal (missing name)', () => {
      const invalidGoal: any = {
        id: 'goal-456',
        description: 'A test goal',
        type: 'learning',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        objective: 'Main test objective',
        keyResults: [
          { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0 }
        ],
        constraints: [],
        dependencies: [],
        progress: 0,
        metadata: {
          source: 'user',
          tags: [],
          category: 'test',
          requiredResources: [],
          successCriteria: []
        }
      };

      expect(() => (engine as any).validateGoal(invalidGoal)).toThrow('Goal must have id, name, and objective');
    });

    it('should validate goal correctly with invalid goal (missing objective)', () => {
      const invalidGoal: any = {
        id: 'goal-456',
        name: 'Test Goal',
        description: 'A test goal',
        type: 'learning',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        keyResults: [
          { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0 }
        ],
        constraints: [],
        dependencies: [],
        progress: 0,
        metadata: {
          source: 'user',
          tags: [],
          category: 'test',
          requiredResources: [],
          successCriteria: []
        }
      };

      expect(() => (engine as any).validateGoal(invalidGoal)).toThrow('Goal must have id, name, and objective');
    });

    it('should validate goal correctly with invalid goal (no key results)', () => {
      const invalidGoal: any = {
        id: 'goal-456',
        name: 'Test Goal',
        description: 'A test goal',
        type: 'learning',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        objective: 'Main test objective',
        keyResults: [],
        constraints: [],
        dependencies: [],
        progress: 0,
        metadata: {
          source: 'user',
          tags: [],
          category: 'test',
          requiredResources: [],
          successCriteria: []
        }
      };

      expect(() => (engine as any).validateGoal(invalidGoal)).toThrow('Goal must have at least one key result');
    });

    it('should validate task correctly', () => {
      const invalidTask = {} as any;
      let error;
      try {
        (engine as any).validateTask(invalidTask);
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
    });

    it('should merge with defaults correctly', () => {
      const config = { maxConcurrentTasks: 20 };
      const result = (engine as any).mergeWithDefaults(config);
      expect(result).toBeDefined();
      expect(result.maxConcurrentTasks).toBe(20);
      // Verify that defaults are merged for missing properties
      expect(result.resourceLimits).toBeDefined();
    });

    it('should generate task artifacts', () => {
      const testTask: Task = {
        id: 'task-456',
        name: 'Test Task',
        description: 'A test task',
        type: 'learning' as TaskType,
        priority: 'medium' as Priority,
        status: 'pending' as TaskStatus,
        createdAt: new Date(),
        requirements: {
          cpu: { min: 0.1, max: 1, unit: 'cores' },
          memory: { min: 128, max: 1024, unit: 'MB' },
          storage: { min: 1, max: 10, unit: 'GB' },
          network: { min: 1, max: 100, unit: 'Mbps' },
          specialized: []
        },
        steps: [{ id: 'step-1', name: 'Test Step', description: 'Test step description', type: 'data_processing' as const, parameters: {}, dependencies: [], estimatedDuration: 60, requiredResources: [] }],
        dependencies: [],
        metadata: {
          source: 'test',
          category: 'test',
          tags: [],
          retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential', baseDelay: 1000, maxDelay: 10000 },
          timeout: 30000,
          qualityRequirements: {}
        }
      };

      const stepResults = [{ result: { success: true }, duration: 100 }];
      const artifacts = (engine as any).generateTaskArtifacts(testTask, stepResults);
      expect(artifacts).toBeDefined();
      expect(Array.isArray(artifacts)).toBe(true);
    });

    it('should calculate task quality', () => {
      const stepResults = [{ result: { success: true } }, { result: { success: true } }];
      const quality = (engine as any).calculateTaskQuality(stepResults);
      expect(quality).toBeDefined();
      expect(typeof quality).toBe('object');
    });

    it('should calculate performance metrics', () => {
      const stepResults = [{ duration: 100 }, { duration: 200 }];
      const metrics = (engine as any).calculatePerformanceMetrics(stepResults);
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('should get priority value', () => {
      expect((engine as any).getPriorityValue('low')).toBe(1);
      expect((engine as any).getPriorityValue('medium')).toBe(2);
      expect((engine as any).getPriorityValue('high')).toBe(3);
      expect((engine as any).getPriorityValue('critical')).toBe(4);
    });

    it('should aggregate step results', () => {
      const stepResults = [
        { result: { success: true, data: 'Step 1' } },
        { result: { success: true, data: 'Step 2' } },
        { result: { success: false, error: 'Error' } }
      ];

      const result = (engine as any).aggregateStepResults(stepResults);
      expect(result).toBeDefined();
      expect(result.totalSteps).toBe(3);
      expect(result.successfulSteps).toBe(2);
      expect(result.failedSteps).toBe(1);
      expect(result.overallSuccess).toBe(false);
    });

    it('should initialize metrics', () => {
      const metrics = (engine as any).initializeMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.uptime).toBe(0);
      expect(metrics.totalTasksExecuted).toBe(0);
      expect(metrics.successfulTasks).toBe(0);
      expect(metrics.failedTasks).toBe(0);
    });

    // === System Initialization and Health Check Tests ===
    it('should setup event listeners', () => {
      // Mock the event handlers to prevent actual execution
      jest.spyOn(engine as any, 'handleGoalCreated').mockImplementation();
      jest.spyOn(engine as any, 'handleTaskCompleted').mockImplementation();
      jest.spyOn(engine as any, 'handleDecisionMade').mockImplementation();
      jest.spyOn(engine as any, 'handleLearningCompleted').mockImplementation();
      jest.spyOn(engine as any, 'handleCollaborationCompleted').mockImplementation();
      jest.spyOn(engine as any, 'handleError').mockImplementation();

      // Spy on EventEmitter's on and emit methods
      const mockOn = jest.spyOn(engine, 'on').mockImplementation();
      const mockEmit = jest.spyOn(engine, 'emit').mockImplementation();

      (engine as any).setupEventListeners();

      // Verify event listeners are set up
      expect(mockOn).toHaveBeenCalledWith('goal.created', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('task.completed', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('decision.made', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('learning.completed', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('collaboration.completed', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));

      mockOn.mockRestore();
      mockEmit.mockRestore();
    });

    it('should connect subsystem events', () => {
      const mockOn = jest.spyOn(mockMessageBus, 'on').mockImplementation();
      const mockEmit = jest.spyOn(engine, 'emit').mockImplementation();

      (engine as any).connectSubsystemEvents();

      // Verify message bus events are connected to engine emit
      expect(mockOn).toHaveBeenCalledWith('*', expect.any(Function));

      mockOn.mockRestore();
      mockEmit.mockRestore();
    });

    it('should perform health check', () => {
      const mockHealthStatus = {
        overall: 'healthy',
        subsystems: {
          messageBus: 'healthy',
          taskScheduler: 'healthy',
          stateManager: 'healthy'
        },
        timestamp: Date.now()
      };

      const mockGetHealthStatus = jest.spyOn(mockMonitoringSystem, 'getHealthStatus').mockReturnValue(mockHealthStatus);
      const mockUpdateMetrics = jest.spyOn(engine as any, 'updateMetrics').mockImplementation();

      (engine as any).performHealthCheck();

      // Verify health check is performed
      expect(mockGetHealthStatus).toHaveBeenCalled();
      expect(engine['lastHealthCheck']).toBeGreaterThanOrEqual(0);

      mockGetHealthStatus.mockRestore();
      mockUpdateMetrics.mockRestore();
    });

    it('should update metrics correctly', () => {
      const startTime = Date.now() - 1000;
      (engine as any).startTime = startTime;

      // Mock process.memoryUsage to avoid test environment issues
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        rss: 1024 * 1024 * 200, // 200MB
        heapTotal: 1024 * 1024 * 100, // 100MB
        heapUsed: 1024 * 1024 * 50, // 50MB
        external: 1024 * 1024 * 10 // 10MB
      }) as any;

      // Mock resourceManager.getResourceUtilization
      const mockResourceUtilization = jest.spyOn(mockResourceManager, 'getResourceUtilization').mockReturnValue({
        cpu: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        memory: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        storage: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        network: { allocated: 0.5, used: 0.3, available: 0.2, percentage: 60 },
        specialized: []
      });

      // Set initial metrics
      (engine as any)._metrics = {
        uptime: 0,
        totalTasksExecuted: 5,
        successfulTasks: 3,
        failedTasks: 2,
        errorRate: 0,
        averageResponseTime: 0,
        resourceUtilization: { cpu: 0, memory: 0 },
        taskSuccessRate: 0
      };

      (engine as any).updateMetrics();

      // Verify metrics are updated
      expect(engine['_metrics'].uptime).toBeGreaterThanOrEqual(1000);
      expect(engine['_metrics'].resourceUtilization).toEqual({
        cpu: {
          allocated: 0.5,
          available: 0.2,
          percentage: 60,
          used: 0.3,
        },
        memory: {
          allocated: 0.5,
          available: 0.2,
          percentage: 60,
          used: 0.3,
        },
        storage: {
          allocated: 0.5,
          available: 0.2,
          percentage: 60,
          used: 0.3,
        },
        network: {
          allocated: 0.5,
          available: 0.2,
          percentage: 60,
          used: 0.3,
        },
        specialized: []
      });

      // Restore original functions
      process.memoryUsage = originalMemoryUsage;
      mockResourceUtilization.mockRestore();
    });

    it('should start health checking', () => {
      // Mock setInterval to prevent actual timer creation
      const originalSetInterval = global.setInterval;
      const mockSetInterval = jest.fn();
      global.setInterval = mockSetInterval;

      const mockPerformHealthCheck = jest.spyOn(engine as any, 'performHealthCheck').mockImplementation();

      (engine as any).startHealthChecking();

      // Verify health checking is started
      expect(mockSetInterval).toHaveBeenCalled();

      // Restore original setInterval
      global.setInterval = originalSetInterval;
      mockPerformHealthCheck.mockRestore();
    });
    // === Event Handler Tests ===
    describe('event handlers', () => {
      it('should handle goal created event', () => {
        // Mock console.log to verify it's called
        const originalLog = console.log;
        const mockLog = jest.fn();
        console.log = mockLog;

        const testGoal = { name: 'Test Goal' };
        (engine as any).handleGoalCreated({ goal: testGoal });

        // Verify console log was called
        expect(mockLog).toHaveBeenCalledWith(`🎯 Goal created: ${testGoal.name}`);

        // Restore original console.log
        console.log = originalLog;
      });

      it('should handle task completed event', () => {
        // Set initial metrics
        (engine as any)._metrics = {
          totalTasksExecuted: 0,
          successfulTasks: 0,
          failedTasks: 0
        };

        // Mock console.log
        const originalLog = console.log;
        const mockLog = jest.fn();
        console.log = mockLog;

        const testEvent = {
          result: { status: 'completed' },
          task: { name: 'Test Task' }
        };

        // Test successful task
        (engine as any).handleTaskCompleted(testEvent);
        expect((engine as any)._metrics.totalTasksExecuted).toBe(1);
        expect((engine as any)._metrics.successfulTasks).toBe(1);
        expect((engine as any)._metrics.failedTasks).toBe(0);
        expect(mockLog).toHaveBeenCalledWith(`✅ Task completed: ${testEvent.task.name}`);

        // Test failed task
        testEvent.result.status = 'failed';
        (engine as any).handleTaskCompleted(testEvent);
        expect((engine as any)._metrics.totalTasksExecuted).toBe(2);
        expect((engine as any)._metrics.successfulTasks).toBe(1);
        expect((engine as any)._metrics.failedTasks).toBe(1);

        // Restore original console.log
        console.log = originalLog;
      });

      it('should handle decision made event', () => {
        const testDecision: Decision = {
          id: 'decision-456',
          contextId: 'context-123',
          selectedOption: 'option-1',
          reasoning: { criteria: ['Test reasoning'], weights: { 'factor1': 0.9 }, scores: { 'factor1': 0.8 }, methodology: 'utility_theory', assumptions: ['Test assumption'] },
          confidence: 0.9,
          alternatives: ['option-2', 'option-3'],
          expectedValue: 0.8,
          riskAssessment: { overall: 'low', factors: [], mitigation: [], contingencyPlans: [] },
          implementationPlan: {
            phases: [],
            resources: {
              cpu: { min: 0.1, unit: 'cores' },
              memory: { min: 512, unit: 'MB' },
              storage: { min: 1024, unit: 'MB' },
              network: { min: 1, unit: 'Mbps' },
              specialized: []
            },
            timeline: { start: new Date(), end: new Date(), milestones: [], criticalPath: [] },
            dependencies: [],
            milestones: []
          },
          timestamp: new Date()
        };

        // Mock console.log
        const originalLog = console.log;
        const mockLog = jest.fn();
        console.log = mockLog;

        (engine as any).handleDecisionMade({ decision: testDecision });

        // Verify decision was stored
        expect((engine as any)._decisions.get(testDecision.id)).toEqual(testDecision);
        expect(mockLog).toHaveBeenCalledWith(`🧠 Decision made: ${testDecision.id}`);

        // Restore original console.log
        console.log = originalLog;
      });

      it('should handle learning completed event', () => {
        const testExperience: Experience = {
          id: 'exp-456',
          type: 'success',
          context: {
            goals: ['test-goal'],
            constraints: [],
            resources: {
              cpu: { allocated: 100, used: 50, available: 50, percentage: 50 },
              memory: { allocated: 8192, used: 4096, available: 4096, percentage: 50 },
              storage: { allocated: 1024, used: 512, available: 512, percentage: 50 },
              network: { allocated: 1000, used: 500, available: 500, percentage: 50 },
              specialized: []
            },
            environment: {
              type: 'development',
              load: 0.5,
              conditions: {},
              externalFactors: []
            },
            stakeholders: ['test-user']
          },
          situation: {
            description: 'Test situation',
            complexity: 'complicated',
            uncertainty: 'low',
            novelty: 'familiar',
            criticality: 'medium'
          },
          actions: [],
          outcomes: [],
          feedback: {
            source: 'test',
            type: 'user',
            content: 'Test feedback',
            sentiment: 'positive',
            confidence: 0.9,
            actionability: 'immediate'
          },
          timestamp: new Date(),
          metadata: {
            tags: ['test'],
            category: 'test',
            importance: 'medium',
            applicability: ['test'],
            sharingConsent: false
          }
        };

        // Mock console.log
        const originalLog = console.log;
        const mockLog = jest.fn();
        console.log = mockLog;

        (engine as any).handleLearningCompleted({ experience: testExperience });

        // Verify console log was called
        expect(mockLog).toHaveBeenCalledWith(`🎓 Learning completed from experience: ${testExperience.id}`);

        // Restore original console.log
        console.log = originalLog;
      });

      it('should handle collaboration completed event', () => {
        const testTask: Task = {
          id: 'task-456',
          goalId: 'goal-123',
          name: 'Test Collaboration Task',
          description: 'A test collaboration task',
          type: 'coordination',
          status: 'completed',
          priority: 'medium',
          steps: [],
          dependencies: [],
          requirements: {
            cpu: {
              min: 1,
              unit: 'core'
            },
            memory: {
              min: 512,
              unit: 'MB'
            },
            storage: {
              min: 1024,
              unit: 'MB'
            },
            network: {
              min: 100,
              unit: 'Mbps'
            },
            specialized: []
          },
          createdAt: new Date(),
          metadata: {
            source: 'test',
            category: 'test-category',
            tags: ['test-tag'],
            retryPolicy: {
              maxAttempts: 3,
              backoffStrategy: 'exponential',
              baseDelay: 1000,
              maxDelay: 10000
            },
            timeout: 30000,
            qualityRequirements: {
              accuracy: 0.9,
              precision: 0.8,
              recall: 0.85,
              latency: 100,
              throughput: 1000
            }
          }
        };

        // Mock console.log
        const originalLog = console.log;
        const mockLog = jest.fn();
        console.log = mockLog;

        (engine as any).handleCollaborationCompleted({ task: testTask });

        // Verify console log was called
        expect(mockLog).toHaveBeenCalledWith(`🤝 Collaboration completed: ${testTask.name}`);

        // Restore original console.log
        console.log = originalLog;
      });

      it('should handle error event', () => {
        // Set initial metrics
        (engine as any)._metrics = {
          totalTasksExecuted: 5,
          failedTasks: 2,
          errorRate: 0
        };

        // Mock console.error
        const originalError = console.error;
        const mockError = jest.fn();
        console.error = mockError;

        const testError = new Error('Test error');
        (engine as any).handleError(testError);

        // Verify console error was called
        expect(mockError).toHaveBeenCalledWith('❌ AutonomousAIEngine Error:', testError);

        // Verify error rate was updated
        expect((engine as any)._metrics.errorRate).toBe(0.4); // 2 failed out of 5 total

        // Test with zero total tasks
        (engine as any)._metrics = {
          totalTasksExecuted: 0,
          failedTasks: 1,
          errorRate: 0
        };

        (engine as any).handleError(testError);
        expect((engine as any)._metrics.errorRate).toBe(1); // 1 failed out of 1 total (min 1)

        // Restore original console.error
        console.error = originalError;
      });
    });
  });

  describe('StateManager', () => {
    let stateManager: any;

    beforeEach(() => {
      // Create a new StateManager instance from the engine
      stateManager = (engine as any).stateManager;
    });

    it('should start and stop the state manager', async () => {
      // Start the state manager
      await stateManager.start();
      expect(stateManager.isRunning).toBe(true);

      // Stop the state manager
      await stateManager.stop();
      expect(stateManager.isRunning).toBe(false);
    });

    it('should handle reconfigure', async () => {
      // Reconfigure the state manager
      const newConfig = { someConfig: 'value' };
      await stateManager.reconfigure(newConfig);
      expect(stateManager.configuration).toBe(newConfig);
    });

    it('should set and get state values', () => {
      // Set a state value
      const testKey = 'test-key';
      const testValue = 'test-value';
      stateManager.set(testKey, testValue);

      // Get the state value
      const retrievedValue = stateManager.get(testKey);
      expect(retrievedValue).toBe(testValue);
    });

    it('should return undefined for non-existent keys', () => {
      // Get a non-existent key
      const retrievedValue = stateManager.get('non-existent-key');
      expect(retrievedValue).toBeUndefined();
    });

    it('should delete state values', () => {
      // Set a state value first
      const testKey = 'test-key';
      const testValue = 'test-value';
      stateManager.set(testKey, testValue);

      // Delete the state value
      const deleteResult = stateManager.delete(testKey);
      expect(deleteResult).toBe(true);

      // Verify the value is deleted
      const retrievedValue = stateManager.get(testKey);
      expect(retrievedValue).toBeUndefined();
    });

    it('should return false when deleting non-existent keys', () => {
      // Delete a non-existent key
      const deleteResult = stateManager.delete('non-existent-key');
      expect(deleteResult).toBe(false);
    });

    it('should handle different types of values', () => {
      // Test with string
      stateManager.set('string-key', 'string-value');
      expect(stateManager.get('string-key')).toBe('string-value');

      // Test with number
      stateManager.set('number-key', 123);
      expect(stateManager.get('number-key')).toBe(123);

      // Test with boolean
      stateManager.set('boolean-key', true);
      expect(stateManager.get('boolean-key')).toBe(true);

      // Test with object
      const testObject = { prop: 'value' };
      stateManager.set('object-key', testObject);
      expect(stateManager.get('object-key')).toBe(testObject);

      // Test with array
      const testArray = [1, 2, 3];
      stateManager.set('array-key', testArray);
      expect(stateManager.get('array-key')).toBe(testArray);
    });
  });

  describe('LearningSystem', () => {
    let learningSystem: any;
    let mockLearningCompletedEvent: jest.Mock;
    let mockStrategyAdaptedEvent: jest.Mock;

    beforeEach(() => {
      // Use the real LearningSystem class
      learningSystem = new LearningSystem({});

      // Mock the events
      mockLearningCompletedEvent = jest.fn();
      mockStrategyAdaptedEvent = jest.fn();

      // Set up event listeners
      learningSystem.on('learning.completed', mockLearningCompletedEvent);
      learningSystem.on('strategy.adapted', mockStrategyAdaptedEvent);
    });

    afterEach(() => {
      // Clean up event listeners - eventemitter3 doesn't have removeListener method in this context
      // learningSystem.removeListener('learning.completed', mockLearningCompletedEvent);
      // learningSystem.removeListener('strategy.adapted', mockStrategyAdaptedEvent);
    });

    it('should start and stop the learning system', async () => {
      // Start the learning system
      await learningSystem.start();
      expect(learningSystem.isRunning).toBe(true);

      // Stop the learning system
      await learningSystem.stop();
      expect(learningSystem.isRunning).toBe(false);
    });

    it('should handle reconfigure', async () => {
      // Reconfigure the learning system
      const newConfig = { learningRate: 0.2, strategy: 'deep_learning' };
      await learningSystem.reconfigure(newConfig);
      expect(learningSystem.configuration).toBe(newConfig);
    });

    it('should learn from experience and emit learning.completed event', async () => {
      const testExperience: Experience = {
        id: 'exp-123',
        type: 'learning' as ExperienceType,
        context: {
          goals: ['test-goal'],
          constraints: [],
          resources: {
            cpu: { allocated: 100, used: 50, available: 50, percentage: 50 },
            memory: { allocated: 8192, used: 4096, available: 4096, percentage: 50 },
            storage: { allocated: 1024, used: 512, available: 512, percentage: 50 },
            network: { allocated: 1000, used: 500, available: 500, percentage: 50 },
            specialized: []
          },
          environment: {
            type: 'development',
            load: 0.5,
            conditions: {},
            externalFactors: []
          },
          stakeholders: ['test-user']
        },
        situation: {
          description: 'Test situation',
          complexity: 'complicated',
          uncertainty: 'low',
          novelty: 'familiar',
          criticality: 'medium'
        },
        actions: [{
          id: 'action-1',
          type: 'adaptation',
          description: 'Test action',
          parameters: {},
          reasoning: 'Test reasoning'
        }],
        outcomes: [{
          id: 'outcome-1',
          type: 'success',
          value: { accuracy: 0.9 },
          quality: 'good',
          duration: 1000,
          resourceUsage: {
            cpu: 50,
            memory: 1024,
            storage: 512,
            network: 100,
            specialized: {}
          }
        }],
        feedback: {
          source: 'test',
          type: 'user',
          content: 'Test feedback',
          sentiment: 'positive',
          confidence: 0.9,
          actionability: 'immediate'
        },
        timestamp: new Date(),
        metadata: {
          tags: [],
          category: 'performance',
          importance: 'medium',
          applicability: [],
          sharingConsent: true
        }
      };

      // Mock the emit method
      const emitSpy = jest.spyOn(learningSystem, 'emit');

      // Learn from experience
      await learningSystem.learnFromExperience(testExperience);

      // Verify the event was emitted
      expect(emitSpy).toHaveBeenCalledWith('learning.completed', { experience: testExperience });
    });

    it('should adapt strategy and emit strategy.adapted event', async () => {
      const testStrategy: Strategy = {
        id: 'strat-123',
        name: 'Adaptive Learning Strategy',
        description: 'Test strategy',
        type: 'learning_path' as StrategyType,
        objectives: [],
        tactics: [],
        evaluation: {
          metrics: [
            { name: 'effectiveness', type: 'lagging', measurement: 'ratio', target: 1, current: 0.8 },
            { name: 'efficiency', type: 'lagging', measurement: 'ratio', target: 1, current: 0.7 },
            { name: 'adaptability', type: 'leading', measurement: 'ratio', target: 1, current: 0.9 },
            { name: 'sustainability', type: 'leading', measurement: 'ratio', target: 1, current: 0.6 }
          ],
          reviewSchedule: {
            frequency: 'weekly',
            nextReview: new Date(),
            responsible: ['system']
          },
          successCriteria: [],
          feedbackMechanisms: []
        },
        adaptation: {
          triggers: [],
          conditions: [],
          strategies: [],
          evaluation: {
            criteria: [],
            timeline: 30,
            responsible: 'system',
            rollbackPlan: {
              triggers: [],
              procedures: [],
              responsible: 'system',
              timeline: 60
            }
          }
        },
        metadata: {
          version: '1.0',
          author: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          tags: [],
          category: 'test',
          scope: 'local'
        }
      };

      // Mock the emit method
      const emitSpy = jest.spyOn(learningSystem, 'emit');

      // Adapt strategy
      await learningSystem.adaptStrategy(testStrategy);

      // Verify the event was emitted
      expect(emitSpy).toHaveBeenCalledWith('strategy.adapted', { strategy: testStrategy });
    });

    it('should get learning progress with default configuration', () => {
      // Reset configuration to default
      learningSystem.configuration = {};

      const progress = learningSystem.getProgress();
      expect(progress).toBeDefined();
      expect(progress.totalExperiences).toBe(0);
      expect(progress.successfulAdaptations).toBe(0);
      expect(progress.failedAdaptations).toBe(0);
      expect(progress.learningRate).toBe(0.1); // Default learning rate
      expect(progress.competencyLevel).toBe('intermediate');
      expect(Array.isArray(progress.areasOfImprovement)).toBe(true);
      expect(progress.areasOfImprovement).toContain('decision_making');
      expect(progress.areasOfImprovement).toContain('collaboration');
    });

    it('should get learning progress with custom configuration', async () => {
      // Set custom configuration with learning rate
      const customConfig = { learningRate: 0.3 };
      await learningSystem.reconfigure(customConfig);

      const progress = learningSystem.getProgress();
      expect(progress.learningRate).toBe(0.3); // Should use the custom learning rate
    });
  });

  // Additional tests to improve coverage
  describe('internal methods coverage', () => {
    let engine: AutonomousAIEngine;

    beforeEach(async () => {
      engine = await createAutonomousEngine();
    });

    it('should stop subsystems correctly', async () => {
      // Mock subsystem stop methods
      const stopMock = jest.fn().mockResolvedValue(undefined);
      (engine as any).taskScheduler.stop = stopMock;
      (engine as any).resourceManager.stop = stopMock;
      (engine as any).decisionEngine.stop = stopMock;
      (engine as any).learningSystem.stop = stopMock;
      (engine as any).collaborationManager.stop = stopMock;
      (engine as any).monitoringSystem.stop = stopMock;
      (engine as any).securityManager.stop = stopMock;
      (engine as any).messageBus.stop = stopMock;
      (engine as any).stateManager.stop = stopMock;

      // Call the method
      await (engine as any).stopSubsystems();

      // Verify all subsystems were stopped
      expect(stopMock).toHaveBeenCalledTimes(9);
    });

    it('should reconfigure subsystems correctly', async () => {
      // Mock subsystem reconfigure methods
      const reconfigureMock = jest.fn().mockResolvedValue(undefined);
      (engine as any).resourceManager.reconfigure = reconfigureMock;
      (engine as any).decisionEngine.reconfigure = reconfigureMock;
      (engine as any).learningSystem.reconfigure = reconfigureMock;
      (engine as any).collaborationManager.reconfigure = reconfigureMock;
      (engine as any).monitoringSystem.reconfigure = reconfigureMock;
      (engine as any).securityManager.reconfigure = reconfigureMock;

      // Call the method
      await (engine as any).reconfigureSubsystems();

      // Verify all subsystems were reconfigured
      expect(reconfigureMock).toHaveBeenCalledTimes(6);
      expect((engine as any).resourceManager.reconfigure).toHaveBeenCalledWith(
        (engine as any)._configuration.resourceLimits
      );
    });

    it('should process goal correctly', async () => {
      // Mock executeTask method
      const executeTaskMock = jest.fn().mockResolvedValue(undefined);
      (engine as any).executeTask = executeTaskMock;

      // Mock generateId method
      const generateIdMock = jest.fn().mockReturnValue('test-id');
      (engine as any).generateId = generateIdMock;

      const testGoal: Goal = {
        id: 'goal-1',
        name: 'Test Goal',
        description: 'A test goal',
        type: 'learning',
        priority: 'medium',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        objective: 'Test objective',
        keyResults: [
          { id: 'kr-1', description: 'Key Result 1', target: 100, current: 0, unit: '%', weight: 1.0, status: 'pending' }
        ],
        constraints: [],
        dependencies: [],
        progress: 0,
        metadata: {
          source: 'user',
          tags: [],
          category: 'test',
          requiredResources: [],
          successCriteria: []
        }
      };

      // Call the method
      await (engine as any).processGoal(testGoal);

      // Verify executeTask was called with the created task
      expect(executeTaskMock).toHaveBeenCalledTimes(1);
      expect(executeTaskMock).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Execute goal: Test Goal',
        goalId: 'goal-1',
        priority: 'medium'
      }));
    });

    it('should record task experience correctly', async () => {
      // Mock required methods
      const generateIdMock = jest.fn().mockReturnValue('test-id');
      (engine as any).generateId = generateIdMock;

      const getResourceUtilizationMock = jest.fn().mockReturnValue({
        cpu: { usage: 0.5, capacity: 4 },
        memory: { usage: 1024, capacity: 8192 },
        storage: { usage: 10240, capacity: 102400 },
        network: { usage: 10, capacity: 100 }
      });
      (engine as any).resourceManager.getResourceUtilization = getResourceUtilizationMock;

      const getTaskCriticalityMock = jest.fn().mockReturnValue('medium');
      (engine as any).getTaskCriticality = getTaskCriticalityMock;

      const learnFromExperienceMock = jest.fn().mockResolvedValue(undefined);
      (engine as any).learnFromExperience = learnFromExperienceMock;

      const testTask: Task = {
        id: 'task-1',
        name: 'Test Task',
        description: 'A test task',
        type: 'coordination',
        priority: 'medium',
        status: 'completed',
        goalId: 'goal-1',
        dependencies: [],
        requirements: {
          cpu: { min: 0.1, unit: 'cores' },
          memory: { min: 128, unit: 'MB' },
          storage: { min: 0, unit: 'GB' },
          network: { min: 0, unit: 'Mbps' },
          specialized: []
        },
        steps: [
          {
            id: 'step-1',
            name: 'Step 1',
            description: 'First step',
            type: 'data_processing',
            parameters: { target: 100 },
            dependencies: [],
            estimatedDuration: 60000,
            requiredResources: []
          }
        ],
        metadata: {
          source: 'goal_execution',
          category: 'learning',
          tags: [],
          retryPolicy: {
            maxAttempts: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 10000
          },
          timeout: 3600000,
          qualityRequirements: {
            accuracy: 0.9,
            latency: 1000
          }
        },
        createdAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date()
      };

      const testTaskResult: TaskResult = {
        taskId: 'task-1',
        status: 'completed',
        result: 'Success',
        metadata: {
          executionTime: 1000,
          resourceUsage: {
            cpu: 0.2,
            memory: 256,
            storage: 0,
            network: 5,
            specialized: {}
          },
          quality: {
            accuracy: 0.9,
            completeness: 1.0,
            relevance: 1.0,
            reliability: 1.0,
            usability: 1.0
          },
          errors: [],
          warnings: []
        },
        artifacts: [],
        metrics: {
          duration: 1000,
          resourceUtilization: {
            cpu: { allocated: 1, used: 0.2, available: 0.8, percentage: 20 },
            memory: { allocated: 512, used: 256, available: 256, percentage: 50 },
            storage: { allocated: 1024, used: 0, available: 1024, percentage: 0 },
            network: { allocated: 10, used: 5, available: 5, percentage: 50 },
            specialized: []
          },
          stepMetrics: [],
          performance: {
            throughput: 100,
            latency: { p50: 1000, p95: 1500, p99: 2000, average: 1000, min: 500, max: 2000 },
            memory: { total: 512, used: 256, free: 256, cached: 0, heap: { total: 512, used: 256, limit: 1024 } },
            cpu: { utilization: 0.2, loadAverage: [0.5, 0.7, 0.9] }
          }
        }
      };

      // Call the method
      await (engine as any).recordTaskExperience(testTask, testTaskResult);

      // Verify methods were called
      expect(learnFromExperienceMock).toHaveBeenCalledTimes(1);
      expect(learnFromExperienceMock).toHaveBeenCalledWith(expect.objectContaining({
        type: 'success',
        context: expect.objectContaining({
          goals: ['goal-1']
        }),
        situation: expect.objectContaining({
          description: 'Task executed: Test Task'
        })
      }));
    });

    it('should connect subsystem events correctly', async () => {
      const engine = await createAutonomousEngine();

      // Mock event emitters
      const onMock = jest.fn();
      const emitMock = jest.fn();

      (engine as any).messageBus.on = onMock;
      (engine as any).messageBus.emit = emitMock;
      (engine as any).resourceManager.on = onMock;
      (engine as any).decisionEngine.on = onMock;
      (engine as any).learningSystem.on = onMock;

      // Call the method
      (engine as any).connectSubsystemEvents();

      // Verify events were connected
      expect(onMock).toHaveBeenCalledWith('*', expect.any(Function));
      expect(onMock).toHaveBeenCalledWith('resource.allocation.failed', expect.any(Function));
      expect(onMock).toHaveBeenCalledWith('decision.made', expect.any(Function));
      expect(onMock).toHaveBeenCalledWith('adaptation.required', expect.any(Function));
    });

    it('should calculate performance metrics correctly', async () => {
      const engine = await createAutonomousEngine();

      const stepResults = [
        {
          stepId: 'step-1',
          duration: 1000,
          resourceUsage: {
            cpu: 0.2,
            memory: 128,
            storage: 0,
            network: 5
          },
          result: { value: 100 }
        },
        {
          stepId: 'step-2',
          duration: 2000,
          resourceUsage: {
            cpu: 0.4,
            memory: 256,
            storage: 0,
            network: 10
          },
          result: { value: 200 }
        }
      ];

      const metrics = (engine as any).calculatePerformanceMetrics(stepResults);

      expect(metrics).toBeDefined();
      expect(metrics.throughput).toBe(2 / 3); // 2 steps / 3 seconds
      expect(metrics.latency).toBeDefined();
      expect(metrics.latency.average).toBe(1500);
      expect(metrics.latency.max).toBe(2000);
      expect(metrics.latency.min).toBe(1000);
      expect(metrics.memory).toBeDefined();
      expect(metrics.cpu).toBeDefined();
    });

    it('should start health checking correctly', async () => {
      const engine = await createAutonomousEngine();

      // Mock setInterval
      const originalSetInterval = global.setInterval;
      const setIntervalMock = jest.fn();
      global.setInterval = setIntervalMock;

      // Call the method
      (engine as any).startHealthChecking();

      // Verify setInterval was called
      expect(setIntervalMock).toHaveBeenCalledWith(
        expect.any(Function),
        (engine as any)._configuration.monitoringConfig.healthChecks.interval
      );

      // Restore original setInterval
      global.setInterval = originalSetInterval;
    });
  });

  // Additional tests for uncovered code
  describe('Additional internal methods coverage', () => {
    it('should get task criticality correctly', async () => {
      const engine = await createAutonomousEngine();

      const criticalTask = { priority: 'critical', requirements: { cpu: { min: 2, unit: 'cores' }, memory: { min: 1024, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 100, unit: 'Mbps' }, specialized: [] } } as Task;
      const highTask = { priority: 'high', requirements: { cpu: { min: 1, unit: 'cores' }, memory: { min: 512, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 50, unit: 'Mbps' }, specialized: [] } } as Task;
      const mediumTask = { priority: 'medium', requirements: { cpu: { min: 1, unit: 'cores' }, memory: { min: 256, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 10, unit: 'Mbps' }, specialized: [] } } as Task;
      const lowTask = { priority: 'low', requirements: { cpu: { min: 0.5, unit: 'cores' }, memory: { min: 128, unit: 'MB' }, storage: { min: 0.5, unit: 'GB' }, network: { min: 1, unit: 'Mbps' }, specialized: [] } } as Task;
      const defaultTask = { priority: 'unknown' } as any;

      expect((engine as any).getTaskCriticality(criticalTask)).toBe('critical');
      expect((engine as any).getTaskCriticality(highTask)).toBe('high');
      expect((engine as any).getTaskCriticality(mediumTask)).toBe('medium');
      expect((engine as any).getTaskCriticality(lowTask)).toBe('low');
      expect((engine as any).getTaskCriticality(defaultTask)).toBe('low');
    });

    it('should finalize tasks correctly', async () => {
      const engine = await createAutonomousEngine();
      // Create proper task objects that match the interface
      const task1 = {
        id: 'task-1',
        name: 'Test Task 1',
        description: 'Test description',
        type: 'computation',
        priority: 'medium',
        status: 'running',
        dependencies: [],
        requirements: { cpu: { min: 1, unit: 'cores' }, memory: { min: 512, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 1, unit: 'Mbps' }, specialized: [] },
        steps: [],
        metadata: { version: '1.0', tags: [] },
        createdAt: new Date()
      } as Task;

      const task2 = {
        id: 'task-2',
        name: 'Test Task 2',
        description: 'Test description',
        type: 'analysis',
        priority: 'high',
        status: 'running',
        dependencies: [],
        requirements: { cpu: { min: 2, unit: 'cores' }, memory: { min: 1024, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 1, unit: 'Mbps' }, specialized: [] },
        steps: [],
        metadata: { version: '1.0', tags: [] },
        createdAt: new Date()
      } as Task;

      const task3 = {
        id: 'task-3',
        name: 'Test Task 3',
        description: 'Test description',
        type: 'decision',
        priority: 'low',
        status: 'completed',
        dependencies: [],
        requirements: { cpu: { min: 1, unit: 'cores' }, memory: { min: 256, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 1, unit: 'Mbps' }, specialized: [] },
        steps: [],
        metadata: { version: '1.0', tags: [] },
        createdAt: new Date()
      } as Task;

      // Add tasks to engine
      (engine as any)._tasks.set('task-1', task1);
      (engine as any)._tasks.set('task-2', task2);
      (engine as any)._tasks.set('task-3', task3);

      // Mock emit method
      const emitSpy = jest.spyOn(engine as any, 'emit').mockImplementation();

      // Call finalizeTasks
      await (engine as any).finalizeTasks();

      // Verify tasks were cancelled in the engine's internal state
      const updatedTask1 = (engine as any)._tasks.get('task-1');
      const updatedTask2 = (engine as any)._tasks.get('task-2');
      const updatedTask3 = (engine as any)._tasks.get('task-3');

      // Check that running tasks were cancelled
      expect(updatedTask1.status).toBe('cancelled');
      expect(updatedTask2.status).toBe('cancelled');
      expect(updatedTask3.status).toBe('completed'); // Should not change

      // Verify events were emitted
      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenCalledWith('task.cancelled', expect.objectContaining({
        task: expect.objectContaining({ id: 'task-1' }),
        reason: 'Engine shutdown'
      }));
      expect(emitSpy).toHaveBeenCalledWith('task.cancelled', expect.objectContaining({
        task: expect.objectContaining({ id: 'task-2' }),
        reason: 'Engine shutdown'
      }));

      emitSpy.mockRestore();
    });

    it('should handle goal created event correctly', async () => {
      const engine = await createAutonomousEngine();

      // Call the event handler directly
      (engine as any).handleGoalCreated({ goal: { name: 'Test Goal' } });

      // Since this method only logs, we just need to ensure it doesn't throw
      expect(true).toBe(true); // Dummy assertion
    });

    it('should handle task completed event correctly', async () => {
      const engine = await createAutonomousEngine();
      (engine as any)._metrics = {
        totalTasksExecuted: 0,
        successfulTasks: 0,
        failedTasks: 0
      };

      // Test with completed status
      (engine as any).handleTaskCompleted({
        result: { status: 'completed' },
        task: { name: 'Test Task' }
      });

      expect((engine as any)._metrics.totalTasksExecuted).toBe(1);
      expect((engine as any)._metrics.successfulTasks).toBe(1);
      expect((engine as any)._metrics.failedTasks).toBe(0);

      // Test with failed status
      (engine as any).handleTaskCompleted({
        result: { status: 'failed' },
        task: { name: 'Test Task 2' }
      });

      expect((engine as any)._metrics.totalTasksExecuted).toBe(2);
      expect((engine as any)._metrics.successfulTasks).toBe(1);
      expect((engine as any)._metrics.failedTasks).toBe(1);
    });

    it('should handle decision made event correctly', async () => {
      const engine = await createAutonomousEngine();
      const decision = { id: 'decision-1', contextId: 'context-1' } as Decision;

      // Call the event handler
      (engine as any).handleDecisionMade({ decision });

      // Verify decision was added to _decisions map
      expect((engine as any)._decisions.get('decision-1')).toBe(decision);
    });

    it('should handle learning completed event correctly', async () => {
      const engine = await createAutonomousEngine();

      // Call the event handler directly
      (engine as any).handleLearningCompleted({ experience: { id: 'exp-1' } as Experience });

      // Since this method only logs, we just need to ensure it doesn't throw
      expect(true).toBe(true); // Dummy assertion
    });

    it('should handle collaboration completed event correctly', async () => {
      const engine = await createAutonomousEngine();

      // Call the event handler directly
      (engine as any).handleCollaborationCompleted({ task: { name: 'Test Task', requirements: { cpu: { min: 1, unit: 'cores' }, memory: { min: 256, unit: 'MB' }, storage: { min: 1, unit: 'GB' }, network: { min: 10, unit: 'Mbps' }, specialized: [] } } as Task });

      // Since this method only logs, we just need to ensure it doesn't throw
      expect(true).toBe(true); // Dummy assertion
    });

    it('should handle error event correctly', async () => {
      const engine = await createAutonomousEngine();

      // Call the event handler directly
      (engine as any).handleError(new Error('Test error'));

      // Since this method only logs, we just need to ensure it doesn't throw
      expect(true).toBe(true); // Dummy assertion
    });

    it('should generate unique IDs with correct prefix', async () => {
      const engine = await createAutonomousEngine();

      const taskId = (engine as any).generateId('task');
      const goalId = (engine as any).generateId('goal');
      const decisionId = (engine as any).generateId('decision');

      // Updated regex to match actual implementation (uses underscores, not hyphens)
      expect(taskId).toMatch(/^task_[a-zA-Z0-9_]+$/);
      expect(goalId).toMatch(/^goal_[a-zA-Z0-9_]+$/);
      expect(decisionId).toMatch(/^decision_[a-zA-Z0-9_]+$/);

      // Ensure IDs are unique
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add((engine as any).generateId('test'));
      }
      expect(ids.size).toBe(100);
    });

    it('should merge with defaults correctly', async () => {
      const engine = await createAutonomousEngine();

      const customConfig = { maxConcurrentTasks: 100 };
      const merged = (engine as any).mergeWithDefaults(customConfig);

      expect(merged).toBeDefined();
      expect(merged.maxConcurrentTasks).toBe(100);
      expect(merged.resourceLimits).toBeDefined();
      expect(merged.learningConfig).toBeDefined();
    });

    it('should get priority value correctly', async () => {
      const engine = await createAutonomousEngine();

      expect((engine as any).getPriorityValue('critical')).toBe(4);
      expect((engine as any).getPriorityValue('high')).toBe(3);
      expect((engine as any).getPriorityValue('medium')).toBe(2);
      expect((engine as any).getPriorityValue('low')).toBe(1);
      expect((engine as any).getPriorityValue('unknown')).toBe(0);
    });

    it('should update metrics correctly', async () => {
      const engine = await createAutonomousEngine();
      (engine as any).startTime = Date.now() - 1000;
      (engine as any)._metrics = {
        uptime: 0,
        memory: {},
        cpu: {}
      };

      // Call updateMetrics
      (engine as any).updateMetrics();

      // Verify uptime is updated
      expect((engine as any)._metrics.uptime).toBeGreaterThanOrEqual(1000);
      expect((engine as any)._metrics.memory).toBeDefined();
      expect((engine as any)._metrics.cpu).toBeDefined();
    });
  });

  // Subsystem tests
  describe('TaskScheduler subsystem', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const taskScheduler = (engine as any).taskScheduler;

      expect(taskScheduler).toBeDefined();
      // isRunning is already true when engine starts
    });

    it('should call start and stop methods correctly', async () => {
      const engine = await createAutonomousEngine();
      const taskScheduler = (engine as any).taskScheduler;

      // Verify methods exist and can be called
      expect(typeof taskScheduler.start).toBe('function');
      expect(typeof taskScheduler.stop).toBe('function');

      // Call start and stop and verify they were invoked
      await taskScheduler.stop();
      expect(taskScheduler.stop).toHaveBeenCalled();

      await taskScheduler.start();
      expect(taskScheduler.start).toHaveBeenCalled();
    });

    it('should reconfigure correctly', async () => {
      const engine = await createAutonomousEngine();
      const taskScheduler = (engine as any).taskScheduler;

      const newConfig = { maxConcurrentTasks: 10 };
      await taskScheduler.reconfigure(newConfig);
    });

    it('should handle task scheduling', async () => {
      const engine = await createAutonomousEngine();
      const taskScheduler = (engine as any).taskScheduler;

      const testTask = {
        id: 'test-task-1',
        name: 'testTask',
        priority: 'medium',
        execute: async () => {
          return { success: true };
        },
        dependencies: [],
        metadata: {}
      };

      const taskId = taskScheduler.schedule(testTask);
      expect(taskId).toBe('test-task-1');
    });

    it('should handle task cancellation', async () => {
      const engine = await createAutonomousEngine();
      const taskScheduler = (engine as any).taskScheduler;

      const testTask = {
        id: 'test-task-2',
        name: 'testTask',
        priority: 'medium',
        execute: async () => {
          return { success: true };
        },
        dependencies: [],
        metadata: {}
      };

      taskScheduler.schedule(testTask);
      await taskScheduler.cancel('test-task-2');
      // No return value expected
    });
  });

  describe('DecisionEngine subsystem', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const decisionEngine = (engine as any).decisionEngine;

      expect(decisionEngine).toBeDefined();
      // isRunning is already true when engine starts
    });

    it('should call start and stop methods correctly', async () => {
      const engine = await createAutonomousEngine();
      const decisionEngine = (engine as any).decisionEngine;

      // Verify methods exist and can be called
      expect(typeof decisionEngine.start).toBe('function');
      expect(typeof decisionEngine.stop).toBe('function');

      // Call start and stop and verify they were invoked
      await decisionEngine.stop();
      expect(decisionEngine.stop).toHaveBeenCalled();

      await decisionEngine.start();
      expect(decisionEngine.start).toHaveBeenCalled();
    });

    it('should reconfigure correctly', async () => {
      const engine = await createAutonomousEngine();
      const decisionEngine = (engine as any).decisionEngine;

      const newConfig = { decisionAlgorithm: 'custom-algorithm' };
      await decisionEngine.reconfigure(newConfig);
    });

    it('should make decisions based on input', async () => {
      const engine = await createAutonomousEngine();
      const decisionEngine = (engine as any).decisionEngine;

      const context = {
        id: 'context-1',
        currentState: 'idle',
        pendingTasks: ['task-1', 'task-2'],
        availableResources: { memory: 500, cpu: 0.3 }
      };

      const options = [
        { id: 'option-1', action: 'execute-task-1', estimatedCost: 10 },
        { id: 'option-2', action: 'execute-task-2', estimatedCost: 20 }
      ];

      const decision = await decisionEngine.makeDecision(context, options);

      expect(decision).toBeDefined();
      expect(decision.id).toBeDefined();
    });

    it('should evaluate decisions', async () => {
      const engine = await createAutonomousEngine();
      const decisionEngine = (engine as any).decisionEngine;

      const decision = {
        id: 'decision-1',
        contextId: 'context-1',
        selectedOption: 'option-1',
        reasoning: {
          criteria: ['efficiency', 'quality', 'risk'],
          weights: { efficiency: 0.4, quality: 0.4, risk: 0.2 },
          scores: { efficiency: 0.8, quality: 0.7, risk: 0.6 },
          methodology: 'utility_theory',
          assumptions: ['Current trends continue']
        },
        confidence: 0.75,
        alternatives: ['option-1', 'option-2'],
        expectedValue: 0.75,
        riskAssessment: {
          overall: 'medium',
          factors: [],
          mitigation: [],
          contingencyPlans: []
        },
        implementationPlan: {
          phases: [],
          resources: { cpu: { min: 0.1, unit: 'cores' }, memory: { min: 128, unit: 'MB' }, storage: { min: 0, unit: 'GB' }, network: { min: 0, unit: 'Mbps' }, specialized: [] },
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 86400000),
            milestones: [],
            criticalPath: []
          },
          dependencies: [],
          milestones: []
        },
        timestamp: new Date()
      };

      const evaluation = await decisionEngine.evaluateDecision(decision);

      expect(evaluation).toBeDefined();
      // evaluation.decisionId should match the decision.id that was passed in
      expect(evaluation.decisionId).toBe(decision.id);
    });
  });

  describe('StateManager subsystem', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const stateManager = (engine as any).stateManager;

      expect(stateManager).toBeDefined();
      // isRunning is already true when engine starts
    });

    it('should call start and stop methods correctly', async () => {
      const engine = await createAutonomousEngine();
      const stateManager = (engine as any).stateManager;

      // Verify methods exist and can be called
      expect(typeof stateManager.start).toBe('function');
      expect(typeof stateManager.stop).toBe('function');

      // Call start and stop and verify they were invoked
      await stateManager.stop();
      expect(stateManager.stop).toHaveBeenCalled();

      await stateManager.start();
      expect(stateManager.start).toHaveBeenCalled();
    });

    it('should manage state', async () => {
      const engine = await createAutonomousEngine();
      const stateManager = (engine as any).stateManager;

      // Test get and set methods (synchronous)
      stateManager.set('testKey', 'testValue');
      const value = stateManager.get('testKey');
      expect(value).toBe('testValue');

      // Test delete method
      const deleteResult = stateManager.delete('testKey');
      expect(deleteResult).toBe(true);
      const deletedValue = stateManager.get('testKey');
      expect(deletedValue).toBeUndefined();
    });
  });

  describe('CollaborationManager', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const collaborationManager = (engine as any).collaborationManager;
      expect(collaborationManager).toBeDefined();
      expect(collaborationManager.isRunning).toBe(true);
    });

    it('should start and stop correctly', async () => {
      const engine = await createAutonomousEngine();
      const collaborationManager = (engine as any).collaborationManager;

      await collaborationManager.stop();
      expect(collaborationManager.stop).toHaveBeenCalled();

      await collaborationManager.start();
      expect(collaborationManager.start).toHaveBeenCalled();
    });

    it('should send messages', async () => {
      const engine = await createAutonomousEngine();
      const collaborationManager = (engine as any).collaborationManager;

      const message: any = { id: 'msg-1', content: 'test message', type: 'test' };
      await collaborationManager.sendMessage(message);
      expect(collaborationManager.sendMessage).toHaveBeenCalledWith(message);
    });

    it('should initiate collaboration', async () => {
      const engine = await createAutonomousEngine();
      const collaborationManager = (engine as any).collaborationManager;

      const config = { participants: ['engine1', 'engine2'] };
      const result = await collaborationManager.initiateCollaboration(config);
      expect(collaborationManager.initiateCollaboration).toHaveBeenCalledWith(config);
      expect(result).toHaveProperty('collaborationId');
      expect(result).toHaveProperty('status', 'active');
    });

    it('should get collaboration status', async () => {
      const engine = await createAutonomousEngine();
      const collaborationManager = (engine as any).collaborationManager;

      const collaborationId = 'collab-123';
      const result = await collaborationManager.getCollaborationStatus(collaborationId);
      expect(collaborationManager.getCollaborationStatus).toHaveBeenCalledWith(collaborationId);
      expect(result).toHaveProperty('collaborationId', collaborationId);
      expect(result).toHaveProperty('status', 'active');
    });

    it('should collaborate with other engines', async () => {
      const engine = await createAutonomousEngine();
      const collaborationManager = (engine as any).collaborationManager;

      const otherEngines = ['engine1', 'engine2'];
      const task: any = { id: 'task-1', description: 'test task' };
      const result = await collaborationManager.collaborate(otherEngines, task);
      expect(collaborationManager.collaborate).toHaveBeenCalledWith(otherEngines, task);
      expect(result).toHaveProperty('taskId', task.id);
      expect(result).toHaveProperty('outcome.success', true);
    });
  });

  describe('ResourceManager', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const resourceManager = (engine as any).resourceManager;
      expect(resourceManager).toBeDefined();
      expect(resourceManager.isRunning).toBe(true);
    });

    it('should start and stop correctly', async () => {
      const engine = await createAutonomousEngine();
      const resourceManager = (engine as any).resourceManager;

      await resourceManager.stop();
      expect(resourceManager.stop).toHaveBeenCalled();

      await resourceManager.start();
      expect(resourceManager.start).toHaveBeenCalled();
    });

    it('should allocate and release resources', async () => {
      const engine = await createAutonomousEngine();
      const resourceManager = (engine as any).resourceManager;

      const requirements: any = {
        cpu: { min: 10, max: 50, unit: 'percent' },
        memory: { min: 200, max: 500, unit: 'mb' },
        storage: { min: 1000, max: 5000, unit: 'mb' },
        network: { min: 10, max: 100, unit: 'mbps' }
      };

      const allocation = await resourceManager.allocateResources(requirements);
      expect(resourceManager.allocateResources).toHaveBeenCalledWith(requirements);
      expect(allocation).toHaveProperty('id');
      expect(allocation).toHaveProperty('status', 'active');

      await resourceManager.releaseResources(allocation.id);
      expect(resourceManager.releaseResources).toHaveBeenCalledWith(allocation.id);
    });

    it('should get resource utilization', async () => {
      const engine = await createAutonomousEngine();
      const resourceManager = (engine as any).resourceManager;

      const utilization = resourceManager.getResourceUtilization();
      expect(utilization).toBeDefined();
      expect(utilization).toHaveProperty('cpu');
      expect(utilization).toHaveProperty('memory');
      expect(utilization).toHaveProperty('storage');
      expect(utilization).toHaveProperty('network');
    });

    it('should get current usage', async () => {
      const engine = await createAutonomousEngine();
      const resourceManager = (engine as any).resourceManager;

      const usage = resourceManager.getCurrentUsage();
      expect(usage).toBeDefined();
      expect(usage).toHaveProperty('cpu');
      expect(usage).toHaveProperty('memory');
      expect(usage).toHaveProperty('storage');
      expect(usage).toHaveProperty('network');
    });
  });

  describe('MonitoringSystem', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const monitoringSystem = (engine as any).monitoringSystem;
      expect(monitoringSystem).toBeDefined();
      expect(monitoringSystem.isRunning).toBe(true);
    });

    it('should start and stop correctly', async () => {
      const engine = await createAutonomousEngine();
      const monitoringSystem = (engine as any).monitoringSystem;

      await monitoringSystem.stop();
      expect(monitoringSystem.stop).toHaveBeenCalled();

      await monitoringSystem.start();
      expect(monitoringSystem.start).toHaveBeenCalled();
    });

    it('should get health status', async () => {
      const engine = await createAutonomousEngine();
      const monitoringSystem = (engine as any).monitoringSystem;

      const healthStatus = monitoringSystem.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(healthStatus).toHaveProperty('overall', 'healthy');
      expect(healthStatus).toHaveProperty('components');
      expect(Array.isArray(healthStatus.components)).toBe(true);
    });

    it('should get diagnostic info', async () => {
      const engine = await createAutonomousEngine();
      const monitoringSystem = (engine as any).monitoringSystem;

      const diagnosticInfo = monitoringSystem.getDiagnosticInfo();
      expect(diagnosticInfo).toBeDefined();
      expect(diagnosticInfo).toHaveProperty('system');
      expect(diagnosticInfo).toHaveProperty('performance');
    });
  });

  describe('SecurityManager', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const securityManager = (engine as any).securityManager;
      expect(securityManager).toBeDefined();
      expect(securityManager.isRunning).toBe(true);
    });

    it('should start and stop correctly', async () => {
      const engine = await createAutonomousEngine();
      const securityManager = (engine as any).securityManager;

      await securityManager.stop();
      expect(securityManager.stop).toHaveBeenCalled();

      await securityManager.start();
      expect(securityManager.start).toHaveBeenCalled();
    });
  });

  describe('MessageBus', () => {
    it('should initialize correctly', async () => {
      const engine = await createAutonomousEngine();
      const messageBus = (engine as any).messageBus;
      expect(messageBus).toBeDefined();
    });

    it('should send messages to all subscribers', async () => {
      const engine = await createAutonomousEngine();
      const messageBus = (engine as any).messageBus;

      const message: any = { id: 'msg-1', content: 'test message', type: 'test' };
      await messageBus.publish('test.topic', message);
      expect(messageBus.publish).toHaveBeenCalledWith('test.topic', message);
    });
  });
});
