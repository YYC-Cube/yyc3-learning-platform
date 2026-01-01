import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ServiceDiscovery, ServiceStatus, ServiceType, ServiceInstance } from './ServiceDiscovery';

describe('ServiceDiscovery Integration Tests', () => {
  let serviceDiscovery: ServiceDiscovery;

  beforeEach(() => {
    serviceDiscovery = new ServiceDiscovery({
      heartbeatInterval: 5000,
      heartbeatTimeout: 15000,
      serviceTTL: 30000,
      enableHealthCheck: true,
      healthCheckInterval: 10000,
      enablePersistence: false,
      enableMetrics: true,
      enableCaching: true,
      cacheTTL: 5000
    });
  });

  afterEach(async () => {
    await serviceDiscovery.shutdown();
  });

  describe('Service Registration', () => {
    it('should register a service successfully', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-1',
        name: 'test-service',
        type: ServiceType.AI_ENGINE,
        host: 'localhost',
        port: 3000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: {
          region: 'us-east-1',
          environment: 'development',
          capabilities: ['inference', 'training']
        },
        healthCheck: {
          enabled: false,
          interval: 10000,
          timeout: 5000,
          unhealthyThreshold: 3,
          healthyThreshold: 2
        },
        tags: ['ai', 'engine'],
        version: '1.0.0'
      };

      const serviceId = await serviceDiscovery.register(service);

      expect(serviceId).toBe('service-1');

      const registeredService = serviceDiscovery.getService(serviceId);
      expect(registeredService).toBeDefined();
      expect(registeredService?.name).toBe('test-service');
    });

    it('should update an existing service', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-2',
        name: 'test-service-2',
        type: ServiceType.MODEL_ADAPTER,
        host: 'localhost',
        port: 3001,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: {
          region: 'us-east-1',
          environment: 'development'
        },
        healthCheck: {
          enabled: false,
          interval: 10000,
          timeout: 5000,
          unhealthyThreshold: 3,
          healthyThreshold: 2
        },
        tags: ['model', 'adapter'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      const updated = await serviceDiscovery.update('service-2', {
        status: ServiceStatus.DEGRADED,
        version: '1.1.0'
      });

      expect(updated).toBe(true);

      const retrievedService = serviceDiscovery.getService('service-2');
      expect(retrievedService?.status).toBe(ServiceStatus.DEGRADED);
      expect(retrievedService?.version).toBe('1.1.0');
    });

    it('should deregister a service', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-3',
        name: 'test-service-3',
        type: ServiceType.CACHE_SERVICE,
        host: 'localhost',
        port: 3002,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: {
          region: 'us-east-1',
          environment: 'development'
        },
        healthCheck: {
          enabled: false,
          interval: 10000,
          timeout: 5000,
          unhealthyThreshold: 3,
          healthyThreshold: 2
        },
        tags: ['cache'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      const deregistered = await serviceDiscovery.deregister('service-3');

      expect(deregistered).toBe(true);

      const retrievedService = serviceDiscovery.getService('service-3');
      expect(retrievedService).toBeUndefined();
    });
  });

  describe('Service Discovery', () => {
    beforeEach(async () => {
      const services: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'>[] = [
        {
          id: 'service-4',
          name: 'ai-engine-1',
          type: ServiceType.AI_ENGINE,
          host: 'localhost',
          port: 4000,
          protocol: 'http',
          status: ServiceStatus.HEALTHY,
          metadata: { region: 'us-east-1', environment: 'production' },
          healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
          tags: ['ai', 'engine', 'production'],
          version: '1.0.0'
        },
        {
          id: 'service-5',
          name: 'ai-engine-2',
          type: ServiceType.AI_ENGINE,
          host: 'localhost',
          port: 4001,
          protocol: 'http',
          status: ServiceStatus.HEALTHY,
          metadata: { region: 'us-west-1', environment: 'production' },
          healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
          tags: ['ai', 'engine', 'production'],
          version: '1.0.0'
        },
        {
          id: 'service-6',
          name: 'model-adapter-1',
          type: ServiceType.MODEL_ADAPTER,
          host: 'localhost',
          port: 4002,
          protocol: 'http',
          status: ServiceStatus.UNHEALTHY,
          metadata: { region: 'us-east-1', environment: 'production' },
          healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
          tags: ['model', 'adapter'],
          version: '1.0.0'
        }
      ];

      for (const service of services) {
        await serviceDiscovery.register(service);
      }
    });

    it('should discover services by type', async () => {
      const services = await serviceDiscovery.discoverByType(ServiceType.AI_ENGINE);

      expect(services.length).toBe(2);
      expect(services.every(s => s.type === ServiceType.AI_ENGINE)).toBe(true);
    });

    it('should discover services by name', async () => {
      const services = await serviceDiscovery.discoverByName('ai-engine-1');

      expect(services.length).toBe(1);
      expect(services[0].name).toBe('ai-engine-1');
    });

    it('should discover services by tag', async () => {
      const services = await serviceDiscovery.discoverByTag('production');

      expect(services.length).toBe(2);
      expect(services.every(s => s.tags.includes('production'))).toBe(true);
    });

    it('should filter services by status', async () => {
      const healthyServices = await serviceDiscovery.discoverByType(ServiceType.AI_ENGINE, {
        healthyOnly: true
      });

      expect(healthyServices.length).toBe(2);
      expect(healthyServices.every(s => s.status === ServiceStatus.HEALTHY)).toBe(true);
    });

    it('should use custom filter', async () => {
      const services = await serviceDiscovery.discover({
        customFilter: (service) => service.port >= 4001
      });

      expect(services.length).toBe(2);
      expect(services.every(s => s.port >= 4001)).toBe(true);
    });

    it('should cache query results', async () => {
      const services1 = await serviceDiscovery.discoverByType(ServiceType.AI_ENGINE);
      const services2 = await serviceDiscovery.discoverByType(ServiceType.AI_ENGINE);

      expect(services1).toEqual(services2);

      const metrics = serviceDiscovery.getMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });
  });

  describe('Service Heartbeat', () => {
    it('should handle service heartbeat', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-7',
        name: 'test-service-7',
        type: ServiceType.MESSAGE_BUS,
        host: 'localhost',
        port: 5000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['message', 'bus'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      const initialService = serviceDiscovery.getService('service-7');
      const initialHeartbeat = initialService?.lastHeartbeat || 0;

      await new Promise(resolve => setTimeout(resolve, 100));

      const heartbeatResult = await serviceDiscovery.heartbeat('service-7');

      expect(heartbeatResult).toBe(true);

      const updatedService = serviceDiscovery.getService('service-7');
      expect(updatedService?.lastHeartbeat).toBeGreaterThan(initialHeartbeat);
    });
  });

  describe('Service Health Check', () => {
    it('should perform health check on service', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-8',
        name: 'test-service-8',
        type: ServiceType.DATABASE,
        host: 'localhost',
        port: 6000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: {
          enabled: false,
          interval: 10000,
          timeout: 5000,
          unhealthyThreshold: 3,
          healthyThreshold: 2
        },
        tags: ['database'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      const status = await serviceDiscovery.healthCheck('service-8');

      expect(status).toBeDefined();
      expect([ServiceStatus.HEALTHY, ServiceStatus.UNHEALTHY, ServiceStatus.UNKNOWN]).toContain(status);
    });
  });

  describe('Service Metrics', () => {
    it('should track service metrics', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-9',
        name: 'test-service-9',
        type: ServiceType.STORAGE,
        host: 'localhost',
        port: 7000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['storage'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      await serviceDiscovery.discoverByType(ServiceType.STORAGE);
      await serviceDiscovery.discoverByType(ServiceType.STORAGE);
      await serviceDiscovery.discoverByType(ServiceType.STORAGE);

      const metrics = serviceDiscovery.getMetrics();

      expect(metrics.totalServices).toBe(1);
      expect(metrics.healthyServices).toBe(1);
      expect(metrics.totalQueries).toBeGreaterThan(0);
      expect(metrics.successfulQueries).toBeGreaterThan(0);
      expect(metrics.registrationCount).toBe(1);
    });
  });

  describe('Service Events', () => {
    it('should emit service registered event', async () => {
      const registeredEvents: any[] = [];

      serviceDiscovery.on('service:registered', (event) => {
        registeredEvents.push(event);
      });

      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-10',
        name: 'test-service-10',
        type: ServiceType.API_GATEWAY,
        host: 'localhost',
        port: 8000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['api', 'gateway'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      expect(registeredEvents.length).toBeGreaterThan(0);
      expect(registeredEvents[0].id).toBe('service-10');
    });

    it('should emit service deregistered event', async () => {
      const deregisteredEvents: any[] = [];

      serviceDiscovery.on('service:deregistered', (event) => {
        deregisteredEvents.push(event);
      });

      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-11',
        name: 'test-service-11',
        type: ServiceType.AUTH_SERVICE,
        host: 'localhost',
        port: 9000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['auth'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);
      await serviceDiscovery.deregister('service-11');

      expect(deregisteredEvents.length).toBeGreaterThan(0);
      expect(deregisteredEvents[0].id).toBe('service-11');
    });

    it('should emit service updated event', async () => {
      const updatedEvents: any[] = [];

      serviceDiscovery.on('service:updated', (event) => {
        updatedEvents.push(event);
      });

      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-12',
        name: 'test-service-12',
        type: ServiceType.WORKER,
        host: 'localhost',
        port: 10000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['worker'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);
      await serviceDiscovery.update('service-12', { status: ServiceStatus.DEGRADED });

      expect(updatedEvents.length).toBeGreaterThan(0);
      expect(updatedEvents[0].status).toBe(ServiceStatus.DEGRADED);
    });
  });

  describe('Service Indexing', () => {
    it('should index services by type', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-13',
        name: 'test-service-13',
        type: ServiceType.SCHEDULER,
        host: 'localhost',
        port: 11000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['scheduler'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      const servicesByType = serviceDiscovery.getServicesByType(ServiceType.SCHEDULER);

      expect(servicesByType.length).toBe(1);
      expect(servicesByType[0].id).toBe('service-13');
    });

    it('should index services by tag', async () => {
      const service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'> = {
        id: 'service-14',
        name: 'test-service-14',
        type: ServiceType.AI_ENGINE,
        host: 'localhost',
        port: 12000,
        protocol: 'http',
        status: ServiceStatus.HEALTHY,
        metadata: { region: 'us-east-1', environment: 'development' },
        healthCheck: { enabled: false, interval: 10000, timeout: 5000, unhealthyThreshold: 3, healthyThreshold: 2 },
        tags: ['ai', 'engine', 'test'],
        version: '1.0.0'
      };

      await serviceDiscovery.register(service);

      const servicesByTag = serviceDiscovery.getServicesByTag('test');

      expect(servicesByTag.length).toBe(1);
      expect(servicesByTag[0].id).toBe('service-14');
    });
  });
});
