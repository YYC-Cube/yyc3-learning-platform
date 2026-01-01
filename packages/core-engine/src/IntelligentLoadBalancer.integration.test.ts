import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { IntelligentLoadBalancer, LoadBalancingStrategy } from './IntelligentLoadBalancer';
import { ServiceInstance, ServiceStatus, ServiceType } from './ServiceDiscovery';

describe('IntelligentLoadBalancer Integration Tests', () => {
  let loadBalancer: IntelligentLoadBalancer;
  let mockServiceDiscovery: any;
  let mockServices: ServiceInstance[] = [];

  beforeEach(() => {
    mockServices = [
      {
        id: 'service-1',
        name: 'test-service-1',
        type: ServiceType.AI_ENGINE,
        host: 'localhost',
        port: 3001,
        protocol: 'http' as const,
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' as const },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['ai', 'engine'],
        version: '1.0.0',
        registeredAt: Date.now(),
        lastHeartbeat: Date.now()
      },
      {
        id: 'service-2',
        name: 'test-service-2',
        type: ServiceType.AI_ENGINE,
        host: 'localhost',
        port: 3002,
        protocol: 'http' as const,
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-west-1', environment: 'development' as const },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['ai', 'engine'],
        version: '1.0.0',
        registeredAt: Date.now(),
        lastHeartbeat: Date.now()
      },
      {
        id: 'service-3',
        name: 'test-service-3',
        type: ServiceType.AI_ENGINE,
        host: 'localhost',
        port: 3003,
        protocol: 'http' as const,
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'eu-west-1', environment: 'development' as const },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['ai', 'engine'],
        version: '1.0.0',
        registeredAt: Date.now(),
        lastHeartbeat: Date.now()
      }
    ] as ServiceInstance[];

    mockServiceDiscovery = {
      discover: jest.fn().mockImplementation(() => Promise.resolve(mockServices))
    } as any;

    loadBalancer = new IntelligentLoadBalancer(mockServiceDiscovery, {
      strategy: LoadBalancingStrategy.LEAST_CONNECTIONS,
      healthCheckEnabled: false,
      enableMetrics: true,
      enableAdaptive: true,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 3,
      stickySessionEnabled: true,
      maxConnectionsPerService: 100,
      requestTimeout: 3000
    });
  });

  afterEach(async () => {
    await loadBalancer.destroy();
    jest.clearAllMocks();
  });

  describe('Service Selection', () => {
    it('should select a service using round_robin strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.ROUND_ROBIN);

      const selectedServices: ServiceInstance[] = [];
      for (let i = 0; i < 6; i++) {
        const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);
        expect(service).toBeDefined();
        if (service) {
          selectedServices.push(service);
        }
      }

      expect(selectedServices.length).toBe(6);
      expect(selectedServices[0].id).toBe('service-1');
      expect(selectedServices[1].id).toBe('service-2');
      expect(selectedServices[2].id).toBe('service-3');
      expect(selectedServices[3].id).toBe('service-1');
    });

    it('should select a service using least_connections strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.LEAST_CONNECTIONS);

      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(service1).toBeDefined();

      loadBalancer.recordResponse(service1!.id, true, 100);

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(service2).toBeDefined();
      expect(service2!.id).toBe(service1!.id);
    });

    it('should select a service using random strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.RANDOM);

      const selectedServices: string[] = [];
      for (let i = 0; i < 20; i++) {
        const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);
        expect(service).toBeDefined();
        if (service) {
          selectedServices.push(service.id);
        }
      }

      const uniqueServices = new Set(selectedServices);
      expect(uniqueServices.size).toBeGreaterThan(1);
    });

    it('should select a service using ip_hash strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.IP_HASH);

      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE, { clientIp: '192.168.1.1' });
      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE, { clientIp: '192.168.1.1' });
      const service3 = await loadBalancer.selectService(ServiceType.AI_ENGINE, { clientIp: '192.168.1.2' });

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service3).toBeDefined();

      expect(service1!.id).toBe(service2!.id);
      expect(service3!.id).not.toBe(service1!.id);
    });

    it('should select a service using consistent_hash strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.CONSISTENT_HASH);

      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE, { requestId: 'request-1' });
      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE, { requestId: 'request-1' });
      const service3 = await loadBalancer.selectService(ServiceType.AI_ENGINE, { requestId: 'request-2' });

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service3).toBeDefined();

      expect(service1!.id).toBe(service2!.id);
    });

    it('should select a service using least_response_time strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.LEAST_RESPONSE_TIME);

      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service1!.id, true, 100);

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service2!.id, true, 200);

      const service3 = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      expect(service3).toBeDefined();
      expect(service3!.id).toBe(service1!.id);
    });

    it('should select a service using adaptive strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.ADAPTIVE);

      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service1!.id, true, 1000);

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service2!.id, true, 2000);

      const service3 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service3!.id, true, 50);

      const service4 = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      expect(service4).toBeDefined();
      expect(service4!.id).toBe(service3!.id);
    });

    it('should exclude specified service IDs', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE, {
        excludeServiceIds: ['service-1']
      });

      expect(service).toBeDefined();
      expect(service!.id).not.toBe('service-1');
    });

    it('should return null when no healthy services are available', async () => {
      mockServiceDiscovery.discover.mockResolvedValue([]);

      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      expect(service).toBeNull();
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit breaker after threshold failures', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(service).toBeDefined();

      for (let i = 0; i < 3; i++) {
        loadBalancer.recordResponse(service!.id, false, 100);
      }

      const circuitBreakerState = loadBalancer.getCircuitBreakerState(service!.id);
      expect(circuitBreakerState?.isOpen).toBe(true);

      const metrics = loadBalancer.getMetrics();
      expect(metrics.circuitBreakerTrips).toBe(1);
    });

    it('should not select service with open circuit breaker', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(service).toBeDefined();

      for (let i = 0; i < 3; i++) {
        loadBalancer.recordResponse(service!.id, false, 100);
      }

      const nextService = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(nextService).toBeDefined();
      expect(nextService!.id).not.toBe(service!.id);
    });

    it('should reset circuit breaker after timeout', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(service).toBeDefined();

      for (let i = 0; i < 3; i++) {
        loadBalancer.recordResponse(service!.id, false, 100);
      }

      const circuitBreakerState = loadBalancer.getCircuitBreakerState(service!.id);
      expect(circuitBreakerState?.isOpen).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 70000));

      const nextService = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      expect(nextService).toBeDefined();
    }, 80000);
  });

  describe('Sticky Sessions', () => {
    it('should route same session to same service', async () => {
      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE, {
        sessionId: 'session-1'
      });

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE, {
        sessionId: 'session-1'
      });

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service1!.id).toBe(service2!.id);
    });

    it('should route different sessions to potentially different services', async () => {
      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE, {
        sessionId: 'session-1'
      });

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE, {
        sessionId: 'session-2'
      });

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
    });
  });

  describe('Metrics Collection', () => {
    it('should track total requests', async () => {
      await loadBalancer.selectService(ServiceType.AI_ENGINE);
      await loadBalancer.selectService(ServiceType.AI_ENGINE);
      await loadBalancer.selectService(ServiceType.AI_ENGINE);

      const metrics = loadBalancer.getMetrics();
      expect(metrics.totalRequests).toBe(3);
    });

    it('should track successful and failed requests', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      loadBalancer.recordResponse(service!.id, true, 100);
      loadBalancer.recordResponse(service!.id, true, 150);
      loadBalancer.recordResponse(service!.id, false, 200);

      const metrics = loadBalancer.getMetrics();
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
    });

    it('should track requests by service', async () => {
      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service1!.id, true, 100);

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service2!.id, true, 200);

      const metrics = loadBalancer.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.requestsByService.size).toBeGreaterThan(0);
      expect(metrics.requestsByService.get(service1!.id)).toBeGreaterThanOrEqual(1);
    });

    it('should track requests by strategy', async () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.ROUND_ROBIN);
      await loadBalancer.selectService(ServiceType.AI_ENGINE);
      await loadBalancer.selectService(ServiceType.AI_ENGINE);

      loadBalancer.updateStrategy(LoadBalancingStrategy.RANDOM);
      await loadBalancer.selectService(ServiceType.AI_ENGINE);

      const metrics = loadBalancer.getMetrics();
      expect(metrics.requestsByStrategy.get(LoadBalancingStrategy.ROUND_ROBIN)).toBe(2);
      expect(metrics.requestsByStrategy.get(LoadBalancingStrategy.RANDOM)).toBe(1);
    });

    it('should track average response time', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      loadBalancer.recordResponse(service!.id, true, 100);
      loadBalancer.recordResponse(service!.id, true, 200);
      loadBalancer.recordResponse(service!.id, true, 300);

      const metrics = loadBalancer.getMetrics();
      expect(metrics.averageResponseTime).toBeCloseTo(200);
    });

    it('should track retries', async () => {
      const metrics = loadBalancer.getMetrics();
      expect(metrics.retries).toBe(0);
    });
  });

  describe('Load Metrics', () => {
    it('should track load metrics per service', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service!.id, true, 100);

      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      loadBalancer.recordResponse(service2!.id, true, 150);

      const loadMetrics = loadBalancer.getLoadMetrics(service!.id);
      expect(loadMetrics).toBeDefined();
      expect(loadMetrics?.totalRequests).toBeGreaterThanOrEqual(1);
      expect(loadMetrics?.successfulRequests).toBeGreaterThanOrEqual(1);
      expect(loadMetrics?.activeConnections).toBe(0);
    });

    it('should track active connections', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      const loadMetrics = loadBalancer.getLoadMetrics(service!.id);
      expect(loadMetrics?.activeConnections).toBe(1);

      loadBalancer.recordResponse(service!.id, true, 100);

      const updatedMetrics = loadBalancer.getLoadMetrics(service!.id);
      expect(updatedMetrics?.activeConnections).toBe(0);
    });

    it('should track last response time', async () => {
      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      loadBalancer.recordResponse(service!.id, true, 100);
      loadBalancer.recordResponse(service!.id, true, 200);

      const loadMetrics = loadBalancer.getLoadMetrics(service!.id);
      expect(loadMetrics?.lastResponseTime).toBe(200);
    });

    it('should get all load metrics', async () => {
      const service1 = await loadBalancer.selectService(ServiceType.AI_ENGINE);
      const service2 = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      loadBalancer.recordResponse(service1!.id, true, 100);
      loadBalancer.recordResponse(service2!.id, true, 150);

      const allMetrics = loadBalancer.getAllLoadMetrics();
      expect(allMetrics.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Request Execution', () => {
    it('should execute request successfully', async () => {
      const requestFn = jest.fn<(service: ServiceInstance) => Promise<{ result: string }>>()
        .mockResolvedValue({ result: 'success' });

      const result = await loadBalancer.executeRequest(
        ServiceType.AI_ENGINE,
        requestFn
      );

      expect(result).toEqual({ result: 'success' });
      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const requestFn = jest.fn<(service: ServiceInstance) => Promise<{ result: string }>>()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ result: 'success' });

      const result = await loadBalancer.executeRequest(
        ServiceType.AI_ENGINE,
        requestFn
      );

      expect(result).toEqual({ result: 'success' });
      expect(requestFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const requestFn = jest.fn<(service: ServiceInstance) => Promise<{ result: string }>>()
        .mockRejectedValue(new Error('Network error'));

      await expect(
        loadBalancer.executeRequest(ServiceType.AI_ENGINE, requestFn)
      ).rejects.toThrow('Network error');

      expect(requestFn).toHaveBeenCalledTimes(4);
    }, 10000);

    it('should respect request timeout', async () => {
      const loadBalancerWithTimeout = new IntelligentLoadBalancer(mockServiceDiscovery, {
        strategy: LoadBalancingStrategy.LEAST_CONNECTIONS,
        healthCheckEnabled: false,
        enableMetrics: false,
        enableAdaptive: false,
        circuitBreakerEnabled: false,
        stickySessionEnabled: false,
        maxConnectionsPerService: 100,
        requestTimeout: 100,
        maxRetries: 0
      });

      const requestFn = jest.fn<(service: ServiceInstance) => Promise<{ result: string }>>()
        .mockImplementation(
          () => new Promise(() => { })
        );

      await expect(
        loadBalancerWithTimeout.executeRequest(ServiceType.AI_ENGINE, requestFn)
      ).rejects.toThrow('Request timeout');
    }, 5000);
  });

  describe('Strategy Updates', () => {
    it('should update load balancing strategy', () => {
      loadBalancer.updateStrategy(LoadBalancingStrategy.ROUND_ROBIN);

      const eventSpy = jest.fn();
      loadBalancer.on('strategy:changed', eventSpy);

      loadBalancer.updateStrategy(LoadBalancingStrategy.RANDOM);

      expect(eventSpy).toHaveBeenCalledWith({
        strategy: LoadBalancingStrategy.RANDOM,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Event Emission', () => {
    it('should emit service:selected event', async () => {
      const eventSpy = jest.fn();
      loadBalancer.on('service:selected', eventSpy);

      await loadBalancer.selectService(ServiceType.AI_ENGINE);

      expect(eventSpy).toHaveBeenCalledWith({
        serviceId: expect.any(String),
        serviceType: ServiceType.AI_ENGINE,
        strategy: expect.any(String),
        timestamp: expect.any(Number)
      });
    });

    it('should emit circuit:opened event', async () => {
      const eventSpy = jest.fn();
      loadBalancer.on('circuit:opened', eventSpy);

      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      for (let i = 0; i < 3; i++) {
        loadBalancer.recordResponse(service!.id, false, 100);
      }

      expect(eventSpy).toHaveBeenCalledWith({
        serviceId: service!.id,
        timestamp: expect.any(Number)
      });
    });

    it('should emit circuit:closed event', async () => {
      const eventSpy = jest.fn();
      loadBalancer.on('circuit:closed', eventSpy);

      const service = await loadBalancer.selectService(ServiceType.AI_ENGINE);

      for (let i = 0; i < 3; i++) {
        loadBalancer.recordResponse(service!.id, false, 100);
      }

      await new Promise(resolve => setTimeout(resolve, 70000));

      await loadBalancer.selectService(ServiceType.AI_ENGINE);

      expect(eventSpy).toHaveBeenCalled();
    }, 80000);

    it('should emit metrics:updated event', async () => {
      const eventSpy = jest.fn();
      loadBalancer.on('metrics:updated', eventSpy);

      await new Promise(resolve => setTimeout(resolve, 65000));

      expect(eventSpy).toHaveBeenCalled();
    }, 75000);
  });

  describe('Cleanup', () => {
    it('should destroy load balancer and clear resources', async () => {
      await loadBalancer.selectService(ServiceType.AI_ENGINE);
      await loadBalancer.selectService(ServiceType.AI_ENGINE);

      await loadBalancer.destroy();

      const metrics = loadBalancer.getMetrics();
      expect(metrics.totalRequests).toBe(2);

      const allMetrics = loadBalancer.getAllLoadMetrics();
      expect(allMetrics.size).toBe(0);
    });
  });
});
