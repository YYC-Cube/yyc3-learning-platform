/**
 * YYC³ 企业网关 - 统一入口和低代码配置
 * 合并: enterprise-ai-widget + widget-ui + tool-registry + API网关功能
 * 专注: 企业AI助手配置、部署、管理
 */

import { EventEmitter } from 'events';
import { EnterpriseAIEngine } from '../../yyc3-ai-engine/src/EnterpriseAIEngine';
import { EnterpriseDataService } from '../../yyc3-data-service/src/EnterpriseDataService';
import { createLogger } from '../../yyc3-ai-engine/src/utils/logger';

const logger = createLogger('EnterpriseGateway');

// 企业网关接口
export interface IEnterpriseGateway extends EventEmitter {
  readonly status: 'initializing' | 'ready' | 'error';
  readonly config: GatewayConfig;

  // AI助手配置
  createAssistant(config: AssistantConfig): Promise<Assistant>;
  updateAssistant(id: string, config: Partial<AssistantConfig>): Promise<boolean>;
  deleteAssistant(id: string): Promise<boolean>;
  getAssistant(id: string): Promise<Assistant>;
  listAssistants(filters?: AssistantFilters): Promise<Assistant[]>;

  // 低代码配置
  createAssistantFromTemplate(templateId: string, customizations: any): Promise<Assistant>;
  getTemplates(): Promise<Template[]>;
  validateConfig(config: AssistantConfig): Promise<ValidationResult>;

  // 部署管理
  deployAssistant(id: string, deploymentConfig: DeploymentConfig): Promise<Deployment>;
  getDeploymentStatus(id: string): Promise<DeploymentStatus>;
  scaleDeployment(id: string, replicas: number): Promise<boolean>;

  // 用户管理
  authenticateUser(credentials: UserCredentials): Promise<AuthToken>;
  authorizeUser(token: string, requiredPermissions: string[]): Promise<boolean>;
  getUserProfile(userId: string): Promise<UserProfile>;

  // API路由
  handleRequest(request: GatewayRequest): Promise<GatewayResponse>;
}

// 企业网关实现
export class EnterpriseGateway extends EventEmitter implements IEnterpriseGateway {
  private _status: IEnterpriseGateway['status'] = 'initializing';
  private _config: GatewayConfig;
  private _aiEngine: EnterpriseAIEngine;
  private _dataService: EnterpriseDataService;
  private _authService: AuthService;
  private _templateRegistry: TemplateRegistry;

  constructor(config: GatewayConfig) {
    super();
    this._config = config;
    this.initialize();
  }

  get status(): IEnterpriseGateway['status'] {
    return this._status;
  }

  get config(): GatewayConfig {
    return this._config;
  }

  private async initialize(): Promise<void> {
    try {
      this._status = 'initializing';
      this.emit('initializing');

      // 初始化核心服务
      this._aiEngine = new EnterpriseAIEngine(this._config.ai);
      this._dataService = new EnterpriseDataService(this._config.data);
      this._authService = new AuthService(this._config.auth);
      this._templateRegistry = new TemplateRegistry();

      // 加载企业模板
      await this._templateRegistry.loadTemplates();

      this._status = 'ready';
      this.emit('ready');

      // 启动HTTP服务器
      this.startHTTPServer();
    } catch (error) {
      this._status = 'error';
      this.emit('error', error);
      console.error('企业网关初始化失败:', error);
    }
  }

  // AI助手配置管理
  async createAssistant(config: AssistantConfig): Promise<Assistant> {
    this.validateConnection();

    try {
      // 验证配置
      const validation = await this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }

      // 创建AI助手实例
      const assistant: Assistant = {
        id: `assistant_${Date.now()}`,
        config,
        status: 'created',
        created_at: new Date(),
        updated_at: new Date(),
        deployment: null,
        usage: {
          total_conversations: 0,
          total_users: 0,
          last_activity: null,
        },
      };

      // 保存到数据库
      await this._dataService.store('assistant', assistant);

      // 预热AI引擎
      await this._aiEngine.chat({
        content: 'Initialize assistant',
        userId: 'system',
        scenario: config.scenario || 'general',
      });

      this.emit('assistant-created', assistant);
      return assistant;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async updateAssistant(id: string, updates: Partial<AssistantConfig>): Promise<boolean> {
    this.validateConnection();

    try {
      const assistant = await this.getAssistant(id);
      if (!assistant) {
        throw new Error(`AI助手不存在: ${id}`);
      }

      // 验证新配置
      const newConfig = { ...assistant.config, ...updates };
      const validation = await this.validateConfig(newConfig);
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }

      // 更新助手
      assistant.config = newConfig;
      assistant.updated_at = new Date();

      const success = await this._dataService.update('assistant', id, assistant);

      if (success && assistant.deployment) {
        // 如果助手已部署，触发重新部署
        await this.undeployAssistant(id);
        await this.deployAssistant(id, assistant.deployment.config);
      }

      this.emit('assistant-updated', { id, updates });
      return success;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async deleteAssistant(id: string): Promise<boolean> {
    this.validateConnection();

    try {
      const assistant = await this.getAssistant(id);
      if (!assistant) {
        return false;
      }

      // 如果已部署，先停止部署
      if (assistant.deployment) {
        await this.undeployAssistant(id);
      }

      // 从数据库删除
      const success = await this._dataService.delete('assistant', id);

      this.emit('assistant-deleted', { id });
      return success;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async getAssistant(id: string): Promise<Assistant | null> {
    try {
      return await this._dataService.retrieve('assistant', id);
    } catch (error) {
      return null;
    }
  }

  async listAssistants(filters?: AssistantFilters): Promise<Assistant[]> {
    try {
      // 这里应该实现数据库查询过滤
      // 简化实现
      const assistants = await this._dataService.getMetrics('assistants', filters);
      return assistants;
    } catch (error) {
      this.emit('error', error);
      return [];
    }
  }

  // 低代码配置功能
  async createAssistantFromTemplate(templateId: string, customizations: any): Promise<Assistant> {
    try {
      const template = await this._templateRegistry.getTemplate(templateId);
      if (!template) {
        throw new Error(`模板不存在: ${templateId}`);
      }

      // 基于模板创建配置
      const config = this.applyTemplateCustomizations(template, customizations);

      // 创建助手
      const assistant = await this.createAssistant(config);

      // 应用模板的初始化数据
      if (template.initialData) {
        await this.applyInitialData(assistant.id, template.initialData);
      }

      this.emit('assistant-created-from-template', { assistant, templateId });
      return assistant;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async getTemplates(): Promise<Template[]> {
    return await this._templateRegistry.listTemplates();
  }

  async validateConfig(config: AssistantConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本配置验证
    if (!config.name || config.name.trim().length === 0) {
      errors.push('助手名称不能为空');
    }

    if (!config.scenario) {
      errors.push('必须指定使用场景');
    }

    if (config.capabilities && Object.keys(config.capabilities).length === 0) {
      warnings.push('未配置任何AI能力');
    }

    // AI配置验证
    if (config.ai) {
      if (config.ai.provider === 'openai' && !this._config.ai.openai?.apiKey) {
        errors.push('OpenAI API密钥未配置');
      }

      if (config.ai.provider === 'anthropic' && !this._config.ai.anthropic?.apiKey) {
        errors.push('Anthropic API密钥未配置');
      }
    }

    // 集成配置验证
    if (config.integrations) {
      for (const [integration, config] of Object.entries(config.integrations)) {
        if (config.enabled) {
          switch (integration) {
            case 'wechat':
              if (!config.appId || !config.appSecret) {
                errors.push('微信集成需要appId和appSecret');
              }
              break;
            case 'dingtalk':
              if (!config.appKey || !config.appSecret) {
                errors.push('钉钉集成需要appKey和appSecret');
              }
              break;
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 部署管理
  async deployAssistant(id: string, deploymentConfig: DeploymentConfig): Promise<Deployment> {
    this.validateConnection();

    try {
      const assistant = await this.getAssistant(id);
      if (!assistant) {
        throw new Error(`AI助手不存在: ${id}`);
      }

      const deployment: Deployment = {
        id: `deployment_${Date.now()}`,
        assistantId: id,
        config: deploymentConfig,
        status: 'deploying',
        created_at: new Date(),
        endpoints: [],
        resources: {
          cpu: deploymentConfig.resources?.cpu || '500m',
          memory: deploymentConfig.resources?.memory || '512Mi',
          replicas: deploymentConfig.replicas || 1,
        },
      };

      // 保存部署信息
      await this._dataService.store('deployment', deployment);

      // 更新助手状态
      assistant.deployment = deployment;
      assistant.status = 'deploying';
      await this._dataService.update('assistant', id, assistant);

      // 执行部署
      await this.executeDeployment(deployment);

      this.emit('assistant-deployed', { assistant, deployment });
      return deployment;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async getDeploymentStatus(id: string): Promise<DeploymentStatus> {
    try {
      const deployment = await this._dataService.retrieve('deployment', id);
      if (!deployment) {
        throw new Error(`部署不存在: ${id}`);
      }

      return {
        id: deployment.id,
        status: deployment.status,
        endpoints: deployment.endpoints,
        resources: deployment.resources,
        healthChecks: await this.performHealthChecks(deployment),
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async scaleDeployment(id: string, replicas: number): Promise<boolean> {
    try {
      const deployment = await this._dataService.retrieve('deployment', id);
      if (!deployment) {
        throw new Error(`部署不存在: ${id}`);
      }

      deployment.resources.replicas = replicas;
      deployment.status = 'scaling';

      await this._dataService.update('deployment', id, deployment);

      // 执行扩缩容
      await this.executeScaling(deployment, replicas);

      this.emit('deployment-scaled', { id, replicas });
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // 用户管理
  async authenticateUser(credentials: UserCredentials): Promise<AuthToken> {
    return await this._authService.authenticate(credentials);
  }

  async authorizeUser(token: string, requiredPermissions: string[]): Promise<boolean> {
    return await this._authService.authorize(token, requiredPermissions);
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    return await this._dataService.getUserProfile(userId);
  }

  // API请求处理
  async handleRequest(request: GatewayRequest): Promise<GatewayResponse> {
    try {
      const startTime = Date.now();

      // 身份验证
      if (this.requiresAuth(request.path)) {
        const token = this.extractToken(request);
        if (
          !token ||
          !(await this.authorizeUser(token, this.getRequiredPermissions(request.path)))
        ) {
          return {
            status: 401,
            body: { error: '未授权访问' },
            headers: { 'Content-Type': 'application/json' },
          };
        }
      }

      // 路由处理
      let response: GatewayResponse;

      switch (request.method) {
        case 'GET':
          response = await this.handleGETRequest(request);
          break;
        case 'POST':
          response = await this.handlePOSTRequest(request);
          break;
        case 'PUT':
          response = await this.handlePUTRequest(request);
          break;
        case 'DELETE':
          response = await this.handleDELETERequest(request);
          break;
        default:
          response = {
            status: 405,
            body: { error: '方法不允许' },
            headers: { 'Content-Type': 'application/json' },
          };
      }

      // 记录请求日志
      const duration = Date.now() - startTime;
      this.emit('request-handled', { request, response, duration });

      return response;
    } catch (error) {
      this.emit('error', error);
      return {
        status: 500,
        body: { error: '服务器内部错误' },
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }

  // 私有方法
  private validateConnection(): void {
    if (this._status !== 'ready') {
      throw new Error('企业网关未就绪');
    }
  }

  private applyTemplateCustomizations(template: Template, customizations: any): AssistantConfig {
    const config = { ...template.defaultConfig };

    // 应用自定义配置
    if (customizations.name) config.name = customizations.name;
    if (customizations.description) config.description = customizations.description;
    if (customizations.scenario) config.scenario = customizations.scenario;
    if (customizations.capabilities) {
      config.capabilities = { ...config.capabilities, ...customizations.capabilities };
    }
    if (customizations.integrations) {
      config.integrations = { ...config.integrations, ...customizations.integrations };
    }
    if (customizations.ui) {
      config.ui = { ...config.ui, ...customizations.ui };
    }

    return config;
  }

  private async applyInitialData(assistantId: string, initialData: any): Promise<void> {
    for (const [type, data] of Object.entries(initialData)) {
      await this._dataService.store(type as any, {
        assistantId,
        ...data,
      });
    }
  }

  private async executeDeployment(deployment: Deployment): Promise<void> {
    // 模拟部署过程
    deployment.status = 'running';
    deployment.endpoints = [
      `https://api.yyc3.ai/assistants/${deployment.assistantId}`,
      `wss://api.yyc3.ai/assistants/${deployment.assistantId}/ws`,
    ];

    await this._dataService.update('deployment', deployment.id, deployment);
  }

  private async executeScaling(deployment: Deployment, replicas: number): Promise<void> {
    // 模拟扩缩容过程
    deployment.status = 'running';
    deployment.resources.replicas = replicas;

    await this._dataService.update('deployment', deployment.id, deployment);
  }

  private async performHealthChecks(deployment: Deployment): Promise<HealthCheck[]> {
    // 模拟健康检查
    return [
      {
        name: 'api-endpoint',
        status: 'healthy',
        lastCheck: new Date(),
        responseTime: 150,
      },
      {
        name: 'websocket-endpoint',
        status: 'healthy',
        lastCheck: new Date(),
        responseTime: 80,
      },
    ];
  }

  private async undeployAssistant(id: string): Promise<void> {
    const assistant = await this.getAssistant(id);
    if (assistant?.deployment) {
      assistant.deployment.status = 'stopped';
      assistant.status = 'stopped';

      await this._dataService.update('deployment', assistant.deployment.id, assistant.deployment);
      await this._dataService.update('assistant', id, assistant);
    }
  }

  private requiresAuth(path: string): boolean {
    const publicPaths = ['/health', '/login', '/templates'];
    return !publicPaths.some((p) => path.startsWith(p));
  }

  private extractToken(request: GatewayRequest): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private getRequiredPermissions(path: string): string[] {
    const permissionMap: Record<string, string[]> = {
      '/assistants': ['assistant:read'],
      '/assistants/create': ['assistant:create'],
      '/assistants/*/update': ['assistant:update'],
      '/assistants/*/delete': ['assistant:delete'],
      '/deployments': ['deployment:read'],
      '/deployments/create': ['deployment:create'],
    };

    for (const [pattern, permissions] of Object.entries(permissionMap)) {
      if (this.pathMatches(path, pattern)) {
        return permissions;
      }
    }

    return [];
  }

  private pathMatches(path: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(path);
  }

  private async handleGETRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const path = request.path;

    if (path === '/health') {
      return {
        status: 200,
        body: { status: 'healthy', timestamp: new Date() },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (path === '/templates') {
      const templates = await this.getTemplates();
      return {
        status: 200,
        body: { templates },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (path.startsWith('/assistants/')) {
      const id = path.split('/')[2];
      const assistant = await this.getAssistant(id);
      if (assistant) {
        return {
          status: 200,
          body: { assistant },
          headers: { 'Content-Type': 'application/json' },
        };
      }
    }

    return {
      status: 404,
      body: { error: '资源不存在' },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  private async handlePOSTRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const path = request.path;

    if (path === '/assistants/create') {
      const config = JSON.parse(request.body as string);
      const assistant = await this.createAssistant(config);
      return {
        status: 201,
        body: { assistant },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (path === '/assistants/create-from-template') {
      const { templateId, customizations } = JSON.parse(request.body as string);
      const assistant = await this.createAssistantFromTemplate(templateId, customizations);
      return {
        status: 201,
        body: { assistant },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return {
      status: 404,
      body: { error: '接口不存在' },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  private async handlePUTRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const path = request.path;

    if (path.startsWith('/assistants/') && path.endsWith('/update')) {
      const id = path.split('/')[2];
      const updates = JSON.parse(request.body as string);
      const success = await this.updateAssistant(id, updates);
      return {
        status: 200,
        body: { success },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return {
      status: 404,
      body: { error: '接口不存在' },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  private async handleDELETERequest(request: GatewayRequest): Promise<GatewayResponse> {
    const path = request.path;

    if (path.startsWith('/assistants/') && path.endsWith('/delete')) {
      const id = path.split('/')[2];
      const success = await this.deleteAssistant(id);
      return {
        status: 200,
        body: { success },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return {
      status: 404,
      body: { error: '接口不存在' },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  private startHTTPServer(): void {
    // 启动HTTP服务器（简化实现）
  }
}

// 辅助服务类
export class AuthService {
  constructor(config: any) {}

  async authenticate(credentials: UserCredentials): Promise<AuthToken> {
    // 身份验证实现
    return {
      token: 'jwt_token_example',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      permissions: ['assistant:read', 'assistant:create'],
    };
  }

  async authorize(token: string, requiredPermissions: string[]): Promise<boolean> {
    // 授权验证实现
    return true;
  }
}

export class TemplateRegistry {
  private templates: Map<string, Template> = new Map();

  async loadTemplates(): Promise<void> {
    // 加载企业服务模板
    const enterpriseTemplates: Template[] = [
      {
        id: 'hr-assistant',
        name: 'HR助手',
        description: '专业的人力资源管理AI助手',
        category: 'hr',
        icon: '👥',
        defaultConfig: {
          name: 'HR助手',
          scenario: 'hr',
          capabilities: {
            hr: {
              recruitment: true,
              employeeService: true,
              training: true,
              performance: false,
            },
          },
          ai: {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.7,
          },
          integrations: {
            wechat: { enabled: true },
            dingtalk: { enabled: true },
          },
          ui: {
            theme: 'light',
            brandColor: '#2196F3',
            avatar: '👥',
          },
        },
        initialData: {
          knowledge: [
            {
              title: '招聘流程指南',
              content: '公司招聘流程和最佳实践...',
              category: 'hr',
              tags: ['招聘', '流程'],
            },
            {
              title: '员工福利政策',
              content: '公司员工福利详细介绍...',
              category: 'hr',
              tags: ['福利', '政策'],
            },
          ],
        },
      },
      {
        id: 'process-assistant',
        name: '流程助手',
        description: '业务流程自动化AI助手',
        category: 'operations',
        icon: '⚙️',
        defaultConfig: {
          name: '流程助手',
          scenario: 'operations',
          capabilities: {
            operations: {
              workflow: true,
              approval: true,
              documentation: true,
              compliance: false,
            },
          },
          ai: {
            provider: 'claude',
            model: 'claude-3-sonnet',
            temperature: 0.5,
          },
        },
      },
      {
        id: 'knowledge-assistant',
        name: '知识助手',
        description: '企业知识管理和查询AI助手',
        category: 'knowledge',
        icon: '📚',
        defaultConfig: {
          name: '知识助手',
          scenario: 'knowledge',
          capabilities: {
            knowledge: {
              qa: true,
              search: true,
              recommendations: true,
              learning: false,
            },
          },
          ai: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
          },
        },
      },
    ];

    enterpriseTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  async getTemplate(id: string): Promise<Template | null> {
    return this.templates.get(id) || null;
  }

  async listTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }
}

// 类型定义
export interface GatewayConfig {
  ai: any;
  data: any;
  auth: any;
  server: {
    port: number;
    host: string;
  };
}

export interface AssistantConfig {
  name: string;
  description?: string;
  scenario: string;
  capabilities?: any;
  ai?: {
    provider?: 'openai' | 'claude' | 'local';
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  integrations?: {
    wechat?: { enabled: boolean; appId?: string; appSecret?: string };
    dingtalk?: { enabled: boolean; appKey?: string; appSecret?: string };
    api?: { enabled: boolean; endpoints?: string[] };
  };
  ui?: {
    theme?: 'light' | 'dark' | 'auto';
    brandColor?: string;
    logo?: string;
    avatar?: string;
    customCSS?: string;
  };
}

export interface Assistant {
  id: string;
  config: AssistantConfig;
  status: 'created' | 'deploying' | 'running' | 'stopped' | 'error';
  created_at: Date;
  updated_at: Date;
  deployment?: Deployment;
  usage: {
    total_conversations: number;
    total_users: number;
    last_activity: Date | null;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  defaultConfig: AssistantConfig;
  initialData?: any;
}

export interface Deployment {
  id: string;
  assistantId: string;
  config: DeploymentConfig;
  status: 'deploying' | 'running' | 'scaling' | 'stopped' | 'error';
  created_at: Date;
  endpoints: string[];
  resources: {
    cpu: string;
    memory: string;
    replicas: number;
  };
}

export interface DeploymentConfig {
  target: 'local' | 'docker' | 'cloud';
  replicas?: number;
  resources?: {
    cpu?: string;
    memory?: string;
  };
  environment?: Record<string, string>;
}

export interface DeploymentStatus {
  id: string;
  status: string;
  endpoints: string[];
  resources: {
    cpu: string;
    memory: string;
    replicas: number;
  };
  healthChecks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: Date;
  responseTime?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AssistantFilters {
  status?: string;
  scenario?: string;
  category?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  permissions: string[];
}

export interface GatewayRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers: Record<string, string>;
  body?: string | object;
  query?: Record<string, string>;
}

export interface GatewayResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}
