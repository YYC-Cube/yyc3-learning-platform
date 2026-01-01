import { EventEmitter } from 'events';
import { ServiceInstance, ServiceType, ServiceStatus } from './ServiceDiscovery';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('IntelligentLoadBalancer');

export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  RANDOM = 'random',
  IP_HASH = 'ip_hash',
  CONSISTENT_HASH = 'consistent_hash',
  LEAST_RESPONSE_TIME = 'least_response_time',
  ADAPTIVE = 'adaptive'
}

export interface ServiceLoadMetrics {
  serviceId: string;
  activeConnections: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastResponseTime: number;
  cpuUsage?: number;
  memoryUsage?: number;
  networkIn?: number;
  networkOut?: number;
  lastUpdated: number;
}

export interface LoadBalancerConfig {
  strategy?: LoadBalancingStrategy;
  healthCheckEnabled?: boolean;
  healthCheckInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableMetrics?: boolean;
  enableAdaptive?: boolean;
  adaptiveThreshold?: number;
  circuitBreakerEnabled?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
  stickySessionEnabled?: boolean;
  stickySessionTimeout?: number;
  maxConnectionsPerService?: number;
  connectionTimeout?: number;
  requestTimeout?: number;
}

export interface LoadBalancerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsByService: Map<string, number>;
  requestsByStrategy: Map<LoadBalancingStrategy, number>;
  averageResponseTime: number;
  circuitBreakerTrips: number;
  retries: number;
  startTime: number;
}

export interface LoadBalancerEvent {
  serviceId: string;
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'retry' | 'circuit_breaker';
  data?: any;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  lastFailureTime: number;
  failureCount: number;
  lastStateChange: number;
}

export class IntelligentLoadBalancer extends EventEmitter {
  private serviceDiscovery: any;
  private config: Required<LoadBalancerConfig>;
  private metrics: LoadBalancerMetrics;
  private loadMetrics: Map<string, ServiceLoadMetrics> = new Map();
  private roundRobinIndex: Map<string, number> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private stickySessions: Map<string, string> = new Map();
  private connections: Map<string, Set<string>> = new Map();
  private metricsTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private startTime: number;

  constructor(serviceDiscovery: any, config: LoadBalancerConfig = {}) {
    super();
    this.serviceDiscovery = serviceDiscovery;
    this.config = {
      strategy: config.strategy || LoadBalancingStrategy.LEAST_CONNECTIONS,
      healthCheckEnabled: config.healthCheckEnabled !== false,
      healthCheckInterval: config.healthCheckInterval || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      enableMetrics: config.enableMetrics !== false,
      enableAdaptive: config.enableAdaptive || false,
      adaptiveThreshold: config.adaptiveThreshold || 0.8,
      circuitBreakerEnabled: config.circuitBreakerEnabled || false,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000,
      stickySessionEnabled: config.stickySessionEnabled || false,
      stickySessionTimeout: config.stickySessionTimeout || 1800000,
      maxConnectionsPerService: config.maxConnectionsPerService || 1000,
      connectionTimeout: config.connectionTimeout || 30000,
      requestTimeout: config.requestTimeout || 60000
    };

    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();

    this.startMetricsCollection();
    this.startHealthChecks();
  }

  private initializeMetrics(): LoadBalancerMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      requestsByService: new Map(),
      requestsByStrategy: new Map(),
      averageResponseTime: 0,
      circuitBreakerTrips: 0,
      retries: 0,
      startTime: Date.now()
    };
  }

  async selectService(
    serviceType: ServiceType,
    options?: {
      sessionId?: string;
      clientIp?: string;
      requestId?: string;
      excludeServiceIds?: string[];
    }
  ): Promise<ServiceInstance | null> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      let services = await this.serviceDiscovery.discover({
        type: serviceType,
        status: ServiceStatus.HEALTHY
      });

      if (options?.excludeServiceIds) {
        services = services.filter((s: ServiceInstance) => !options.excludeServiceIds!.includes(s.id));
      }

      if (services.length === 0) {
        logger.warn(`No healthy services available for type: ${serviceType}`);
        this.metrics.failedRequests++;
        return null;
      }

      let selectedService: ServiceInstance | null;

      if (this.config.stickySessionEnabled && options?.sessionId) {
        const stickyServiceId = this.stickySessions.get(options.sessionId);
        if (stickyServiceId) {
          const stickyService = services.find((s: ServiceInstance) => s.id === stickyServiceId);
          if (stickyService) {
            const circuitBreaker = this.circuitBreakers.get(stickyService.id);
            if (!circuitBreaker || !circuitBreaker.isOpen) {
              selectedService = stickyService;
            } else {
              selectedService = await this.selectServiceWithStrategy(services, serviceType, options);
            }
          } else {
            selectedService = await this.selectServiceWithStrategy(services, serviceType, options);
          }
        } else {
          selectedService = await this.selectServiceWithStrategy(services, serviceType, options);
        }
      } else {
        selectedService = await this.selectServiceWithStrategy(services, serviceType, options);
      }

      if (!selectedService) {
        this.metrics.failedRequests++;
        return null;
      }

      if (this.config.stickySessionEnabled && options?.sessionId) {
        this.stickySessions.set(options.sessionId, selectedService.id);
      }

      this.recordRequest(selectedService.id);
      this.emit('service:selected', {
        serviceId: selectedService.id,
        serviceType,
        strategy: this.config.strategy,
        timestamp: Date.now()
      });

      const selectionTime = Date.now() - startTime;
      this.updateAverageResponseTime(selectionTime);

      return selectedService;
    } catch (error) {
      logger.error('Error selecting service', error);
      this.metrics.failedRequests++;
      return null;
    }
  }

  private async selectServiceWithStrategy(
    services: ServiceInstance[],
    serviceType: ServiceType,
    options?: {
      sessionId?: string;
      clientIp?: string;
      requestId?: string;
      excludeServiceIds?: string[];
    }
  ): Promise<ServiceInstance | null> {
    let selectedService: ServiceInstance | null;

    switch (this.config.strategy) {
      case LoadBalancingStrategy.ROUND_ROBIN:
        selectedService = this.roundRobinSelect(services, serviceType);
        break;
      case LoadBalancingStrategy.LEAST_CONNECTIONS:
        selectedService = this.leastConnectionsSelect(services);
        break;
      case LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
        selectedService = this.weightedRoundRobinSelect(services, serviceType);
        break;
      case LoadBalancingStrategy.RANDOM:
        selectedService = this.randomSelect(services);
        break;
      case LoadBalancingStrategy.IP_HASH:
        selectedService = this.ipHashSelect(services, options?.clientIp);
        break;
      case LoadBalancingStrategy.CONSISTENT_HASH:
        selectedService = this.consistentHashSelect(services, options?.requestId);
        break;
      case LoadBalancingStrategy.LEAST_RESPONSE_TIME:
        selectedService = this.leastResponseTimeSelect(services);
        break;
      case LoadBalancingStrategy.ADAPTIVE:
        selectedService = this.adaptiveSelect(services);
        break;
      default:
        selectedService = this.leastConnectionsSelect(services);
    }

    if (!selectedService) {
      return null;
    }

    if (this.config.circuitBreakerEnabled) {
      const circuitBreaker = this.circuitBreakers.get(selectedService.id);
      if (circuitBreaker?.isOpen) {
        if (Date.now() - circuitBreaker.lastStateChange > this.config.circuitBreakerTimeout) {
          this.resetCircuitBreaker(selectedService.id);
        } else {
          logger.warn(`Circuit breaker open for service: ${selectedService.id}, trying alternative`);
          const availableServices = services.filter((s: ServiceInstance) => s.id !== selectedService!.id);
          if (availableServices.length > 0) {
            selectedService = this.selectAlternativeService(availableServices, serviceType, options);
          } else {
            logger.warn('No alternative services available');
            return null;
          }
        }
      }
    }

    return selectedService;
  }

  private selectAlternativeService(
    services: ServiceInstance[],
    serviceType: ServiceType,
    options?: {
      sessionId?: string;
      clientIp?: string;
      requestId?: string;
      excludeServiceIds?: string[];
    }
  ): ServiceInstance {
    switch (this.config.strategy) {
      case LoadBalancingStrategy.ROUND_ROBIN:
        return this.roundRobinSelect(services, serviceType);
      case LoadBalancingStrategy.LEAST_CONNECTIONS:
        return this.leastConnectionsSelect(services);
      case LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
        return this.weightedRoundRobinSelect(services, serviceType);
      case LoadBalancingStrategy.RANDOM:
        return this.randomSelect(services);
      case LoadBalancingStrategy.IP_HASH:
        return this.ipHashSelect(services, options?.clientIp);
      case LoadBalancingStrategy.CONSISTENT_HASH:
        return this.consistentHashSelect(services, options?.requestId);
      case LoadBalancingStrategy.LEAST_RESPONSE_TIME:
        return this.leastResponseTimeSelect(services);
      case LoadBalancingStrategy.ADAPTIVE:
        return this.adaptiveSelect(services);
      default:
        return this.leastConnectionsSelect(services);
    }
  }

  private roundRobinSelect(services: ServiceInstance[], serviceType: ServiceType): ServiceInstance {
    const currentIndex = this.roundRobinIndex.get(serviceType) || 0;
    const selectedService = services[currentIndex % services.length];
    this.roundRobinIndex.set(serviceType, (currentIndex + 1) % services.length);
    return selectedService;
  }

  private leastConnectionsSelect(services: ServiceInstance[]): ServiceInstance {
    return services.reduce((min, service) => {
      const metrics = this.loadMetrics.get(service.id);
      const connections = metrics?.activeConnections || 0;
      const minConnections = this.loadMetrics.get(min.id)?.activeConnections || 0;
      return connections < minConnections ? service : min;
    });
  }

  private weightedRoundRobinSelect(services: ServiceInstance[], serviceType: ServiceType): ServiceInstance {
    const weights = services.map(service => {
      const metrics = this.loadMetrics.get(service.id);
      const score = this.calculateServiceScore(service, metrics);
      return { service, weight: Math.max(1, Math.floor(score * 10)) };
    });

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    const currentIndex = this.roundRobinIndex.get(serviceType) || 0;
    const targetIndex = currentIndex % totalWeight;

    let cumulativeWeight = 0;
    for (const { service, weight } of weights) {
      cumulativeWeight += weight;
      if (targetIndex < cumulativeWeight) {
        this.roundRobinIndex.set(serviceType, (currentIndex + 1) % totalWeight);
        return service;
      }
    }

    return services[0];
  }

  private randomSelect(services: ServiceInstance[]): ServiceInstance {
    const index = Math.floor(Math.random() * services.length);
    return services[index];
  }

  private ipHashSelect(services: ServiceInstance[], clientIp?: string): ServiceInstance {
    if (!clientIp) {
      return this.randomSelect(services);
    }

    const hash = this.hashString(clientIp);
    const index = hash % services.length;
    return services[index];
  }

  private consistentHashSelect(services: ServiceInstance[], requestId?: string): ServiceInstance {
    if (!requestId) {
      return this.randomSelect(services);
    }

    const hash = this.hashString(requestId);
    const index = hash % services.length;
    return services[index];
  }

  private leastResponseTimeSelect(services: ServiceInstance[]): ServiceInstance {
    return services.reduce((min, service) => {
      const metrics = this.loadMetrics.get(service.id);
      const responseTime = metrics?.averageResponseTime || Infinity;
      const minResponseTime = this.loadMetrics.get(min.id)?.averageResponseTime || Infinity;
      return responseTime < minResponseTime ? service : min;
    });
  }

  private adaptiveSelect(services: ServiceInstance[]): ServiceInstance {
    const scoredServices = services.map(service => {
      const metrics = this.loadMetrics.get(service.id);
      const score = this.calculateServiceScore(service, metrics);
      return { service, score };
    });

    scoredServices.sort((a, b) => b.score - a.score);

    const threshold = scoredServices[0].score * this.config.adaptiveThreshold;
    const eligibleServices = scoredServices.filter(s => s.score >= threshold);

    if (eligibleServices.length === 1) {
      return eligibleServices[0].service;
    }

    return this.randomSelect(eligibleServices.map(s => s.service));
  }

  private calculateServiceScore(service: ServiceInstance, metrics?: ServiceLoadMetrics): number {
    let score = 1.0;

    if (!metrics) {
      return score;
    }

    const connectionFactor = 1 - (metrics.activeConnections / this.config.maxConnectionsPerService);
    score *= Math.max(0.1, connectionFactor);

    const successRate = metrics.totalRequests > 0
      ? metrics.successfulRequests / metrics.totalRequests
      : 1.0;
    score *= successRate;

    const responseTimeFactor = metrics.averageResponseTime > 0
      ? 1 / (1 + metrics.averageResponseTime / 1000)
      : 1.0;
    score *= responseTimeFactor;

    if (metrics.cpuUsage !== undefined) {
      const cpuFactor = 1 - (metrics.cpuUsage / 100);
      score *= Math.max(0.1, cpuFactor);
    }

    if (metrics.memoryUsage !== undefined) {
      const memoryFactor = 1 - (metrics.memoryUsage / 100);
      score *= Math.max(0.1, memoryFactor);
    }

    return score;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private recordRequest(serviceId: string): void {
    let metrics = this.loadMetrics.get(serviceId);
    if (!metrics) {
      metrics = {
        serviceId,
        activeConnections: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastResponseTime: 0,
        lastUpdated: Date.now()
      };
      this.loadMetrics.set(serviceId, metrics);
    }

    metrics.totalRequests++;
    metrics.activeConnections++;
    metrics.lastUpdated = Date.now();

    const count = this.metrics.requestsByService.get(serviceId) || 0;
    this.metrics.requestsByService.set(serviceId, count + 1);

    const strategyCount = this.metrics.requestsByStrategy.get(this.config.strategy) || 0;
    this.metrics.requestsByStrategy.set(this.config.strategy, strategyCount + 1);
  }

  recordResponse(serviceId: string, success: boolean, responseTime: number): void {
    const metrics = this.loadMetrics.get(serviceId);
    if (!metrics) {
      return;
    }

    metrics.activeConnections--;
    metrics.lastResponseTime = responseTime;
    metrics.lastUpdated = Date.now();

    if (success) {
      metrics.successfulRequests++;
      this.metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      this.metrics.failedRequests++;

      if (this.config.circuitBreakerEnabled) {
        this.handleFailure(serviceId);
      }
    }

    const totalResponses = metrics.successfulRequests + metrics.failedRequests;
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;

    this.updateAverageResponseTime(responseTime);
  }

  private handleFailure(serviceId: string): void {
    let circuitBreaker = this.circuitBreakers.get(serviceId);
    if (!circuitBreaker) {
      circuitBreaker = {
        isOpen: false,
        lastFailureTime: 0,
        failureCount: 0,
        lastStateChange: 0
      };
      this.circuitBreakers.set(serviceId, circuitBreaker);
    }

    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = Date.now();

    if (circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
      circuitBreaker.isOpen = true;
      circuitBreaker.lastStateChange = Date.now();
      this.metrics.circuitBreakerTrips++;
      this.emit('circuit:opened', { serviceId, timestamp: Date.now() });
      logger.warn(`[IntelligentLoadBalancer] Circuit breaker opened for service: ${serviceId}`);
    }
  }

  private resetCircuitBreaker(serviceId: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceId);
    if (circuitBreaker) {
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
      circuitBreaker.lastStateChange = Date.now();
      this.emit('circuit:closed', { serviceId, timestamp: Date.now() });
    }
  }

  private updateAverageResponseTime(responseTime: number): void {
    const totalResponses = this.metrics.successfulRequests + this.metrics.failedRequests;
    if (totalResponses > 0) {
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;
    }
  }

  async executeRequest<T>(
    serviceType: ServiceType,
    requestFn: (service: ServiceInstance) => Promise<T>,
    options?: {
      sessionId?: string;
      clientIp?: string;
      requestId?: string;
      excludeServiceIds?: string[];
    }
  ): Promise<T | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      const service = await this.selectService(serviceType, options);

      if (!service) {
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
          this.metrics.retries++;
          continue;
        }
        throw new Error('No healthy services available');
      }

      const startTime = Date.now();

      try {
        const result = await Promise.race([
          requestFn(service),
          this.timeout(this.config.requestTimeout)
        ]);

        const responseTime = Date.now() - startTime;
        this.recordResponse(service.id, true, responseTime);

        return result;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        this.recordResponse(service.id, false, responseTime);
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
          this.metrics.retries++;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLoadMetrics(serviceId: string): ServiceLoadMetrics | undefined {
    return this.loadMetrics.get(serviceId);
  }

  getAllLoadMetrics(): Map<string, ServiceLoadMetrics> {
    return new Map(this.loadMetrics);
  }

  getMetrics(): LoadBalancerMetrics {
    return { ...this.metrics };
  }

  getCircuitBreakerState(serviceId: string): CircuitBreakerState | undefined {
    return this.circuitBreakers.get(serviceId);
  }

  updateStrategy(strategy: LoadBalancingStrategy): void {
    this.config.strategy = strategy;
    this.emit('strategy:changed', { strategy, timestamp: Date.now() });
  }

  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) {
      return;
    }

    this.metricsTimer = setInterval(() => {
      this.emit('metrics:updated', this.getMetrics());
    }, 60000);
  }

  private startHealthChecks(): void {
    if (!this.config.healthCheckEnabled) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      const services = await this.serviceDiscovery.discover();
      for (const service of services) {
        const metrics = this.loadMetrics.get(service.id);
        if (metrics && metrics.activeConnections === 0 && metrics.totalRequests === 0) {
          this.loadMetrics.delete(service.id);
        }
      }
    }, this.config.healthCheckInterval);
  }

  async destroy(): Promise<void> {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.loadMetrics.clear();
    this.roundRobinIndex.clear();
    this.circuitBreakers.clear();
    this.stickySessions.clear();
    this.connections.clear();

    this.removeAllListeners();
  }
}
