import { EventEmitter } from 'events';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('ServiceDiscovery');

export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export enum ServiceType {
  AI_ENGINE = 'ai_engine',
  MODEL_ADAPTER = 'model_adapter',
  CACHE_SERVICE = 'cache_service',
  MESSAGE_BUS = 'message_bus',
  DATABASE = 'database',
  STORAGE = 'storage',
  API_GATEWAY = 'api_gateway',
  AUTH_SERVICE = 'auth_service',
  WORKER = 'worker',
  SCHEDULER = 'scheduler'
}

export interface ServiceInstance {
  id: string;
  name: string;
  type: ServiceType;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc' | 'ws' | 'wss';
  status: ServiceStatus;
  metadata: ServiceMetadata;
  healthCheck: HealthCheckConfig;
  tags: string[];
  version: string;
  registeredAt: number;
  lastHeartbeat: number;
}

export interface ServiceMetadata {
  region?: string;
  zone?: string;
  datacenter?: string;
  environment?: 'development' | 'staging' | 'production';
  capabilities?: string[];
  resources?: ResourceInfo;
  custom?: Record<string, any>;
}

export interface ResourceInfo {
  cpu: number;
  memory: number;
  disk: number;
  network?: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  endpoint?: string;
  unhealthyThreshold: number;
  healthyThreshold: number;
}

export interface ServiceQuery {
  type?: ServiceType;
  name?: string;
  status?: ServiceStatus;
  tags?: string[];
  region?: string;
  environment?: string;
  version?: string;
  customFilter?: (service: ServiceInstance) => boolean;
}

export interface ServiceDiscoveryConfig {
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  serviceTTL?: number;
  enableHealthCheck?: boolean;
  healthCheckInterval?: number;
  enablePersistence?: boolean;
  persistencePath?: string;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  cacheTTL?: number;
}

export interface ServiceDiscoveryMetrics {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  registrationCount: number;
  deregistrationCount: number;
  heartbeatCount: number;
  healthCheckCount: number;
}

export class ServiceDiscovery extends EventEmitter {
  private services: Map<string, ServiceInstance> = new Map();
  private servicesByType: Map<ServiceType, Set<string>> = new Map();
  private servicesByTag: Map<string, Set<string>> = new Map();
  private queryCache: Map<string, { result: ServiceInstance[]; timestamp: number }> = new Map();
  private config: Required<ServiceDiscoveryConfig>;
  private metrics: ServiceDiscoveryMetrics;
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();
  private healthCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private metricsTimer?: NodeJS.Timeout;
  private cacheCleanupTimer?: NodeJS.Timeout;
  private startTime: number;

  constructor(config: ServiceDiscoveryConfig = {}) {
    super();
    this.config = {
      heartbeatInterval: config.heartbeatInterval || 30000,
      heartbeatTimeout: config.heartbeatTimeout || 90000,
      serviceTTL: config.serviceTTL || 120000,
      enableHealthCheck: config.enableHealthCheck !== false,
      healthCheckInterval: config.healthCheckInterval || 10000,
      enablePersistence: config.enablePersistence || false,
      persistencePath: config.persistencePath || './services.json',
      enableMetrics: config.enableMetrics !== false,
      enableCaching: config.enableCaching !== false,
      cacheTTL: config.cacheTTL || 5000
    };

    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();

    if (this.config.enablePersistence) {
      this.loadServices();
    }

    this.startHeartbeatMonitoring();
    this.startHealthChecks();
    this.startMetricsCollection();
    this.startCacheCleanup();
  }

  private initializeMetrics(): ServiceDiscoveryMetrics {
    return {
      totalServices: 0,
      healthyServices: 0,
      unhealthyServices: 0,
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      registrationCount: 0,
      deregistrationCount: 0,
      heartbeatCount: 0,
      healthCheckCount: 0
    };
  }

  async register(service: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat'>): Promise<string> {
    const serviceInstance: ServiceInstance = {
      ...service,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now()
    };

    const serviceId = serviceInstance.id;

    if (this.services.has(serviceId)) {
      await this.update(serviceId, serviceInstance);
      return serviceId;
    }

    this.services.set(serviceId, serviceInstance);

    this.addToIndex(serviceInstance);

    this.metrics.totalServices++;
    this.metrics.registrationCount++;

    if (serviceInstance.status === ServiceStatus.HEALTHY) {
      this.metrics.healthyServices++;
    } else {
      this.metrics.unhealthyServices++;
    }

    this.emit('service:registered', serviceInstance);

    if (this.config.enablePersistence) {
      await this.saveServices();
    }

    return serviceId;
  }

  async deregister(serviceId: string): Promise<boolean> {
    const service = this.services.get(serviceId);
    if (!service) {
      return false;
    }

    this.services.delete(serviceId);
    this.removeFromIndex(service);

    this.metrics.totalServices--;
    this.metrics.deregistrationCount++;

    if (service.status === ServiceStatus.HEALTHY) {
      this.metrics.healthyServices--;
    } else {
      this.metrics.unhealthyServices--;
    }

    this.clearHeartbeatTimer(serviceId);
    this.clearHealthCheckTimer(serviceId);

    this.emit('service:deregistered', service);

    if (this.config.enablePersistence) {
      await this.saveServices();
    }

    return true;
  }

  async update(serviceId: string, updates: Partial<ServiceInstance>): Promise<boolean> {
    const service = this.services.get(serviceId);
    if (!service) {
      return false;
    }

    const oldType = service.type;
    const oldTags = [...service.tags];

    Object.assign(service, updates);

    if (service.type !== oldType || !this.arraysEqual(service.tags, oldTags)) {
      this.removeFromIndex({ ...service, type: oldType, tags: oldTags });
      this.addToIndex(service);
    }

    this.emit('service:updated', service);

    if (this.config.enablePersistence) {
      await this.saveServices();
    }

    return true;
  }

  async discover(query: ServiceQuery = {}): Promise<ServiceInstance[]> {
    const startTime = Date.now();
    this.metrics.totalQueries++;

    const cacheKey = this.generateCacheKey(query);

    if (this.config.enableCaching) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
        this.metrics.successfulQueries++;
        this.metrics.cacheHitRate = this.metrics.successfulQueries / this.metrics.totalQueries;
        const queryTime = Date.now() - startTime;
        this.updateAverageQueryTime(queryTime);
        return cached.result;
      }
    }

    try {
      const results = this.performQuery(query);

      if (this.config.enableCaching) {
        this.queryCache.set(cacheKey, {
          result: results,
          timestamp: Date.now()
        });
      }

      this.metrics.successfulQueries++;
      const queryTime = Date.now() - startTime;
      this.updateAverageQueryTime(queryTime);

      return results;
    } catch (error) {
      this.metrics.failedQueries++;
      logger.error('[ServiceDiscovery] Query failed:', error);
      throw error;
    }
  }

  async discoverOne(query: ServiceQuery = {}): Promise<ServiceInstance | null> {
    const results = await this.discover(query);
    if (results.length === 0) {
      return null;
    }

    return results[0];
  }

  async discoverByType(type: ServiceType, options: { healthyOnly?: boolean } = {}): Promise<ServiceInstance[]> {
    const query: ServiceQuery = { type };
    if (options.healthyOnly) {
      query.status = ServiceStatus.HEALTHY;
    }
    return this.discover(query);
  }

  async discoverByName(name: string, options: { healthyOnly?: boolean } = {}): Promise<ServiceInstance[]> {
    const query: ServiceQuery = { name };
    if (options.healthyOnly) {
      query.status = ServiceStatus.HEALTHY;
    }
    return this.discover(query);
  }

  async discoverByTag(tag: string, options: { healthyOnly?: boolean } = {}): Promise<ServiceInstance[]> {
    const query: ServiceQuery = { tags: [tag] };
    if (options.healthyOnly) {
      query.status = ServiceStatus.HEALTHY;
    }
    return this.discover(query);
  }

  async heartbeat(serviceId: string): Promise<boolean> {
    const service = this.services.get(serviceId);
    if (!service) {
      return false;
    }

    service.lastHeartbeat = Date.now();
    this.metrics.heartbeatCount++;

    this.resetHeartbeatTimer(serviceId);

    this.emit('service:heartbeat', service);
    return true;
  }

  async healthCheck(serviceId: string): Promise<ServiceStatus> {
    const service = this.services.get(serviceId);
    if (!service) {
      return ServiceStatus.UNKNOWN;
    }

    this.metrics.healthCheckCount++;

    if (!service.healthCheck.enabled) {
      return service.status;
    }

    try {
      const isHealthy = await this.performHealthCheck(service);
      const newStatus = isHealthy ? ServiceStatus.HEALTHY : ServiceStatus.UNHEALTHY;

      if (service.status !== newStatus) {
        const oldStatus = service.status;
        service.status = newStatus;

        if (oldStatus === ServiceStatus.HEALTHY) {
          this.metrics.healthyServices--;
        } else if (oldStatus === ServiceStatus.UNHEALTHY) {
          this.metrics.unhealthyServices--;
        }

        if (newStatus === ServiceStatus.HEALTHY) {
          this.metrics.healthyServices++;
        } else {
          this.metrics.unhealthyServices++;
        }

        this.emit('service:status_changed', { service, oldStatus, newStatus });
      }

      return service.status;
    } catch (error) {
      logger.error(`[ServiceDiscovery] Health check failed for ${service.name}:`, error);
      return ServiceStatus.UNKNOWN;
    }
  }

  getService(serviceId: string): ServiceInstance | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): ServiceInstance[] {
    return Array.from(this.services.values());
  }

  getServicesByType(type: ServiceType): ServiceInstance[] {
    const serviceIds = this.servicesByType.get(type);
    if (!serviceIds) {
      return [];
    }
    return Array.from(serviceIds)
      .map(id => this.services.get(id))
      .filter((service): service is ServiceInstance => service !== undefined);
  }

  getServicesByTag(tag: string): ServiceInstance[] {
    const serviceIds = this.servicesByTag.get(tag);
    if (!serviceIds) {
      return [];
    }
    return Array.from(serviceIds)
      .map(id => this.services.get(id))
      .filter((service): service is ServiceInstance => service !== undefined);
  }

  getMetrics(): ServiceDiscoveryMetrics {
    return { ...this.metrics };
  }

  async shutdown(): Promise<void> {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    if (this.cacheCleanupTimer) {
      clearInterval(this.cacheCleanupTimer);
    }

    for (const timer of this.heartbeatTimers.values()) {
      clearTimeout(timer);
    }
    this.heartbeatTimers.clear();

    for (const timer of this.healthCheckTimers.values()) {
      clearTimeout(timer);
    }
    this.healthCheckTimers.clear();

    if (this.config.enablePersistence) {
      await this.saveServices();
    }

    this.removeAllListeners();
  }

  private performQuery(query: ServiceQuery): ServiceInstance[] {
    let results = Array.from(this.services.values());

    if (query.type) {
      results = results.filter(s => s.type === query.type);
    }

    if (query.name) {
      results = results.filter(s => s.name === query.name);
    }

    if (query.status) {
      results = results.filter(s => s.status === query.status);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(s =>
        query.tags!.every(tag => s.tags.includes(tag))
      );
    }

    if (query.region) {
      results = results.filter(s => s.metadata.region === query.region);
    }

    if (query.environment) {
      results = results.filter(s => s.metadata.environment === query.environment);
    }

    if (query.version) {
      results = results.filter(s => s.version === query.version);
    }

    if (query.customFilter) {
      results = results.filter(query.customFilter);
    }

    return results;
  }

  private addToIndex(service: ServiceInstance): void {
    if (!this.servicesByType.has(service.type)) {
      this.servicesByType.set(service.type, new Set());
    }
    this.servicesByType.get(service.type)!.add(service.id);

    for (const tag of service.tags) {
      if (!this.servicesByTag.has(tag)) {
        this.servicesByTag.set(tag, new Set());
      }
      this.servicesByTag.get(tag)!.add(service.id);
    }
  }

  private removeFromIndex(service: ServiceInstance): void {
    const servicesByType = this.servicesByType.get(service.type);
    if (servicesByType) {
      servicesByType.delete(service.id);
    }

    for (const tag of service.tags) {
      const servicesByTag = this.servicesByTag.get(tag);
      if (servicesByTag) {
        servicesByTag.delete(service.id);
      }
    }
  }

  private startHeartbeatMonitoring(): void {
    const checkHeartbeats = async () => {
      const now = Date.now();
      const expiredServices: string[] = [];

      for (const [serviceId, service] of this.services.entries()) {
        if (now - service.lastHeartbeat > this.config.heartbeatTimeout) {
          expiredServices.push(serviceId);
        }
      }

      for (const serviceId of expiredServices) {
        const service = this.services.get(serviceId);
        if (service) {
          logger.warn(`[ServiceDiscovery] Service ${service.name} heartbeat timeout`);
          await this.healthCheck(serviceId);
        }
      }
    };

    setInterval(checkHeartbeats, this.config.heartbeatInterval);
  }

  private startHealthChecks(): void {
    if (!this.config.enableHealthCheck) {
      return;
    }

    const performHealthChecks = async () => {
      for (const serviceId of this.services.keys()) {
        await this.healthCheck(serviceId);
      }
    };

    setInterval(performHealthChecks, this.config.healthCheckInterval);
  }

  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) {
      return;
    }

    this.metricsTimer = setInterval(() => {
      this.updateMetrics();
    }, 60000);
  }

  private startCacheCleanup(): void {
    if (!this.config.enableCaching) {
      return;
    }

    this.cacheCleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.queryCache.entries()) {
        if (now - cached.timestamp > this.config.cacheTTL) {
          this.queryCache.delete(key);
        }
      }
    }, this.config.cacheTTL);
  }

  private resetHeartbeatTimer(serviceId: string): void {
    this.clearHeartbeatTimer(serviceId);

    const timer = setTimeout(async () => {
      const service = this.services.get(serviceId);
      if (service) {
        console.warn(`[ServiceDiscovery] Service ${service.name} missed heartbeat`);
        await this.healthCheck(serviceId);
      }
    }, this.config.heartbeatTimeout);

    this.heartbeatTimers.set(serviceId, timer);
  }

  private clearHeartbeatTimer(serviceId: string): void {
    const timer = this.heartbeatTimers.get(serviceId);
    if (timer) {
      clearTimeout(timer);
      this.heartbeatTimers.delete(serviceId);
    }
  }

  private clearHealthCheckTimer(serviceId: string): void {
    const timer = this.healthCheckTimers.get(serviceId);
    if (timer) {
      clearTimeout(timer);
      this.healthCheckTimers.delete(serviceId);
    }
  }

  private async performHealthCheck(service: ServiceInstance): Promise<boolean> {
    if (!service.healthCheck.endpoint) {
      return true;
    }

    try {
      const url = `${service.protocol}://${service.host}:${service.port}${service.healthCheck.endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), service.healthCheck.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      return response.ok;
    } catch (error) {
      console.error(`[ServiceDiscovery] Health check failed for ${service.name}:`, error);
      return false;
    }
  }

  private generateCacheKey(query: ServiceQuery): string {
    const parts: string[] = [];

    if (query.type) parts.push(`type:${query.type}`);
    if (query.name) parts.push(`name:${query.name}`);
    if (query.status) parts.push(`status:${query.status}`);
    if (query.tags) parts.push(`tags:${query.tags.sort().join(',')}`);
    if (query.region) parts.push(`region:${query.region}`);
    if (query.environment) parts.push(`env:${query.environment}`);
    if (query.version) parts.push(`version:${query.version}`);

    return parts.join('|');
  }

  private updateAverageQueryTime(queryTime: number): void {
    const total = this.metrics.averageQueryTime * (this.metrics.successfulQueries - 1);
    this.metrics.averageQueryTime = (total + queryTime) / this.metrics.successfulQueries;
  }

  private updateMetrics(): void {
    const uptime = Date.now() - this.startTime;
  }

  private async saveServices(): Promise<void> {
    try {
      const services = Array.from(this.services.values());
      const data = JSON.stringify(services, null, 2);
      await this.writeFile(this.config.persistencePath, data);
    } catch (error) {
      console.error('[ServiceDiscovery] Failed to save services:', error);
    }
  }

  private async loadServices(): Promise<void> {
    try {
      const data = await this.readFile(this.config.persistencePath);
      if (!data) {
        return;
      }

      const services: ServiceInstance[] = JSON.parse(data);
      for (const service of services) {
        this.services.set(service.id, service);
        this.addToIndex(service);

        this.metrics.totalServices++;
        if (service.status === ServiceStatus.HEALTHY) {
          this.metrics.healthyServices++;
        } else {
          this.metrics.unhealthyServices++;
        }

        this.resetHeartbeatTimer(service.id);
      }
    } catch (error) {
      console.error('[ServiceDiscovery] Failed to load services:', error);
    }
  }

  private async writeFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      fs.writeFile(path, content, 'utf8', (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async readFile(path: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      fs.readFile(path, 'utf8', (err: Error, data: string) => {
        if (err) {
          if (err.message.includes('ENOENT')) {
            resolve(null);
          } else {
            reject(err);
          }
        } else {
          resolve(data);
        }
      });
    });
  }

  private arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const setA = new Set(a);
    const setB = new Set(b);
    if (setA.size !== setB.size) {
      return false;
    }
    for (const item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }
    return true;
  }
}

export { ServiceDiscovery as ServiceRegistry };
