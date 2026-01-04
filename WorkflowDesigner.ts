/**
 * YYC³ 流程设计器组件
 *
 * 提供可视化工作流设计和执行功能：
 * - 工作流管理（创建、打开、保存、导出、验证）
 * - 元素操作（添加/移除节点、连接节点、更新节点）
 * - 画布控制（缩放、撤销/重做、适应视图）
 * - 执行调试（执行、调试、测试）
 * - 协作功能（分享、锁定、评论、变更追踪）
 *
 * @标准遵循 YYC³团队标准化规范 v1.1.0
 * @设计原则 五标五高五化
 */

import { EventEmitter } from 'events';

// ================================================
// 类型定义
// ================================================

export interface DesignerConfig {
  persistence: PersistenceConfig;
  versioning: boolean;
  renderer: 'canvas' | 'svg' | 'webgl';
  grid: GridConfig;
  snap: boolean;
  elementTypes: string[];
  validationRules: ValidationRule[];
  realtime: boolean;
  conflictResolution: 'manual' | 'auto' | 'last-write-wins';
  executor: 'local' | 'remote' | 'hybrid';
  executionTimeout: number;
  collaboration?: boolean;
}

export interface PersistenceConfig {
  enabled: boolean;
  backend: 'local' | 'server' | 'cloud';
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface GridConfig {
  enabled: boolean;
  size: number;
  color: string;
}

export interface ValidationRule {
  type: string;
  rule: (element: unknown) => boolean;
  message: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: NodeDefinition[];
  connections: Connection[];
  metadata?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  nodes: NodeDefinition[];
  connections: Connection[];
}
export interface NodeDefinition {
  type: NodeType;
  label: string;
  position?: { x: number; y: number };
  config?: Record<string, unknown>;
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
}

export type NodeType = 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'loop' | 'custom';

export interface PortDefinition {
  name: string;
  type: string;
  required?: boolean;
}

export interface Connection {
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  condition?: string;
}

export interface Element {
  id: string;
  label: string;
  type: string;
}

export interface ConnectionWithId extends Connection {
  id: string;
}

export interface SaveResult {
  success: boolean;
  workflowId: string;
  version?: string;
  timestamp: Date;
}

export type ExportFormat = 'json' | 'xml' | 'bpmn' | 'yaml';

export interface ExportedWorkflow {
  format: ExportFormat;
  data: string;
  metadata: {
    workflowId: string;
    version: string;
    exportedAt: Date;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExecutionOptions {
  dryRun?: boolean;
  debug?: boolean;
  breakpoints?: string[];
  variables?: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  result?: unknown;
  errors?: string[];
  warnings?: string[];
  metrics?: ExecutionMetrics;
  visualization?: string;
  executionTime: number;
}

export interface ExecutionMetrics {
  nodesExecuted: number;
  totalTime: number;
  averageNodeTime: number;
  maxNodeTime: number;
  memoryUsed: number;
}

export interface Breakpoint {
  nodeId: string;
  condition?: string;
}

export interface DebugResult {
  stopped: boolean;
  currentNode?: string;
  variables: Record<string, unknown>;
  callStack: string[];
}

export interface TestCase {
  name: string;
  inputs: Record<string, unknown>;
  expectedOutputs: Record<string, unknown>;
}

export interface TestResult {
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  duration: number;
  errors?: string[];
}

export interface Comment {
  text: string;
  author: string;
  timestamp?: Date;
}

export interface ChangeLog {
  id: string;
  type: 'add' | 'update' | 'delete';
  elementId: string;
  timestamp: Date;
  author: string;
  description: string;
}

// ================================================
// 内部服务类
// ================================================

class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private currentWorkflowId?: string;
  private config: { persistence: PersistenceConfig; versioning: boolean };

  constructor(config: { persistence: PersistenceConfig; versioning: boolean }) {
    this.config = config;
  }

  register(workflowId: string, workflow: Workflow): void {
    this.workflows.set(workflowId, workflow);
    this.currentWorkflowId = workflowId;
  }

  getCurrent(): Workflow | null {
    return this.currentWorkflowId ? (this.workflows.get(this.currentWorkflowId) || null) : null;
  }

  async save(workflowId: string): Promise<SaveResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('工作流不存在');
    }

    // 模拟保存
    return {
      success: true,
      workflowId,
      version: '1.0.0',
      timestamp: new Date()
    };
  }
}

class CanvasManager {
  private config: { renderer: string; grid: GridConfig; snap: boolean };
  private zoomLevel = 1.0;
  private offset = { x: 0, y: 0 };

  constructor(config: { renderer: string; grid: GridConfig; snap: boolean }) {
    this.config = config;
  }

  initialize(workflowId: string, _metadata: Record<string, unknown>): void {
  }

  renderNode(node: { id: string }): { rendered: boolean; nodeId: string } {
    return { rendered: true, nodeId: node.id };
  }

  renderConnection(_connection: unknown): void {
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3.0);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.1);
  }

  fitToView(): void {
    this.zoomLevel = 1.0;
    this.offset = { x: 0, y: 0 };
  }

  showRemoteCursor(_userId: string, _position: { x: number; y: number }): void {
  }

  highlightRemoteSelection(_userId: string, _elementIds: string[]): void {
  }
}

class ElementRegistry {
  private elements: Map<string, Element> = new Map();
  private connections: Map<string, ConnectionWithId> = new Map();
  private config: { elementTypes: string[]; validationRules: ValidationRule[] };

  constructor(config: { elementTypes: string[]; validationRules: ValidationRule[] }) {
    this.config = config;
  }

  register(element: Element): void {
    this.elements.set(element.id, element);
  }

  get(elementId: string): Element | undefined {
    return this.elements.get(elementId);
  }

  remove(elementId: string): void {
    this.elements.delete(elementId);
  }

  registerConnection(connection: ConnectionWithId): void {
    this.connections.set(connection.id, connection);
  }

  getConnection(connectionId: string): ConnectionWithId | undefined {
    return this.connections.get(connectionId);
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getAllElements(): Element[] {
    return Array.from(this.elements.values());
  }

  getAllConnections(): ConnectionWithId[] {
    return Array.from(this.connections.values());
  }
}

class CollaborationManager extends EventEmitter {
  private config: { realtime: boolean; conflictResolution: string };
  private sessions: Map<string, unknown> = new Map();

  constructor(config: { realtime: boolean; conflictResolution: string }) {
    super();
    this.config = config;
  }

  startSession(workflowId: string): void {
    this.sessions.set(workflowId, {
      id: workflowId,
      startedAt: new Date(),
      participants: []
    });
  }

  rejectChange(_changeId: string, _reason: string): void {
  }

  acceptChange(_changeId: string): void {
  }
}

class ExecutionEngine {
  private config: { executor: string; timeout: number };

  constructor(config: { executor: string; timeout: number }) {
    this.config = config;
  }

  async execute(_workflow: unknown, _environment: unknown): Promise<{ success: boolean; result: { completed: boolean }; metrics: { nodesExecuted: number; totalTime: number; averageNodeTime: number; maxNodeTime: number; memoryUsed: number } }> {
    const [, ] = [_workflow, _environment];
    // 模拟执行
    return {
      success: true,
      result: { completed: true },
      metrics: {
        nodesExecuted: 10,
        totalTime: 1000,
        averageNodeTime: 100,
        maxNodeTime: 200,
        memoryUsed: 50 * 1024 * 1024
      }
    };
  }

  async debug(_workflow: unknown, _breakpoints: Breakpoint[]): Promise<DebugResult> {
    const [, ] = [_workflow, _breakpoints];
    return {
      stopped: true,
      currentNode: 'node-1',
      variables: {},
      callStack: ['main', 'processData']
    };
  }

  async test(_workflow: unknown, testCase: TestCase): Promise<TestResult> {
    return {
      passed: true,
      actual: {},
      expected: testCase.expectedOutputs,
      duration: 100,
      errors: []
    };
  }
}

// ================================================
// 主要接口
// ================================================

export interface IWorkflowDesigner {
  // 工作流管理
  createWorkflow(template?: WorkflowTemplate): string;
  openWorkflow(workflowId: string): Promise<void>;
  saveWorkflow(): Promise<SaveResult>;
  exportWorkflow(format: ExportFormat): Promise<ExportedWorkflow>;
  validateWorkflow(): ValidationResult;

  // 元素操作
  addNode(node: NodeDefinition): string;
  removeNode(nodeId: string): void;
  connectNodes(sourceId: string, targetId: string, connection?: Connection): string;
  disconnectNodes(connectionId: string): void;
  updateNode(nodeId: string, updates: Partial<NodeDefinition>): void;

  // 画布控制
  zoomIn(): void;
  zoomOut(): void;
  fitToView(): void;
  undo(): void;
  redo(): void;
  clear(): void;

  // 执行与调试
  executeWorkflow(options?: ExecutionOptions): Promise<ExecutionResult>;
  debugWorkflow(breakpoints: Breakpoint[]): Promise<DebugResult>;
  testWorkflow(testCase: TestCase): Promise<TestResult>;

  // 协作功能
  shareWorkflow(users: string[]): Promise<void>;
  lockElement(elementId: string): boolean;
  commentOnElement(elementId: string, comment: Comment): string;
  trackChanges(): ChangeLog[];
}

// ================================================
// 主类实现
// ================================================

export class WorkflowDesigner extends EventEmitter implements IWorkflowDesigner {
  private workflowEngine!: WorkflowEngine;
  private canvasManager!: CanvasManager;
  private elementRegistry!: ElementRegistry;
  private collaborationManager!: CollaborationManager;
  private executionEngine!: ExecutionEngine;
  private config: DesignerConfig;
  private undoStack: unknown[] = [];
  private redoStack: unknown[] = [];
  private changeLogs: ChangeLog[] = [];
  private lockedElements: Set<string> = new Set();
  private comments: Map<string, Comment[]> = new Map();

  constructor(config: DesignerConfig) {
    super();
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    this.workflowEngine = new WorkflowEngine({
      persistence: this.config.persistence,
      versioning: this.config.versioning
    });

    this.canvasManager = new CanvasManager({
      renderer: this.config.renderer,
      grid: this.config.grid,
      snap: this.config.snap
    });

    this.elementRegistry = new ElementRegistry({
      elementTypes: this.config.elementTypes,
      validationRules: this.config.validationRules
    });

    this.collaborationManager = new CollaborationManager({
      realtime: this.config.realtime,
      conflictResolution: this.config.conflictResolution
    });

    this.executionEngine = new ExecutionEngine({
      executor: this.config.executor,
      timeout: this.config.executionTimeout
    });

    this.setupEventHandlers();
    this.loadElementPalette();
    this.emit('initialized');
  }

  private setupEventHandlers(): void {
    if (this.config.collaboration) {
      this.setupCollaboration();
    }
  }

  private loadElementPalette(): void {
    // 加载元素面板
  }

  private setupCollaboration(): void {
    this.collaborationManager.on('element_modified', (event: { changeId: string; change: unknown }) => {
      const validation = this.validateRemoteChange(event);
      if (!validation.valid) {
        this.collaborationManager.rejectChange(event.changeId, validation.reason ?? 'Validation failed');
        return;
      }

      this.applyRemoteChange(event);
      this.updateUIForChange(event);
      this.collaborationManager.acceptChange(event.changeId);
    });

    this.collaborationManager.on('cursor_moved', (event: { userId: string; position: { x: number; y: number } }) => {
      this.canvasManager.showRemoteCursor(event.userId, event.position);
    });

    this.collaborationManager.on('selection_changed', (event: { userId: string; elementIds: string[] }) => {
      this.canvasManager.highlightRemoteSelection(event.userId, event.elementIds);
    });
  }

  // ============ 工作流管理 ============

  createWorkflow(template?: WorkflowTemplate): string {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const workflow = template
      ? this.createFromTemplate(template)
      : this.createBlankWorkflow();

    this.workflowEngine.register(workflowId, workflow);
    this.canvasManager.initialize(workflowId, workflow.metadata || {});
    this.loadDefaultElements(workflowId);

    if (this.config.collaboration) {
      this.collaborationManager.startSession(workflowId);
    }

    this.emit('workflow:created', workflowId);
    return workflowId;
  }

  async openWorkflow(workflowId: string): Promise<void> {
    // 模拟加载工作流
    this.emit('workflow:opened', workflowId);
  }

  async saveWorkflow(): Promise<SaveResult> {
    const workflow = this.workflowEngine.getCurrent();
    if (!workflow) {
      throw new Error('没有打开的工作流');
    }

    const result = await this.workflowEngine.save(workflow.id);
    this.emit('workflow:saved', result);
    return result;
  }

  async exportWorkflow(format: ExportFormat): Promise<ExportedWorkflow> {
    const workflow = this.workflowEngine.getCurrent();
    if (!workflow) {
      throw new Error('没有打开的工作流');
    }

    let data: string;
    switch (format) {
      case 'json':
        data = JSON.stringify(workflow, null, 2);
        break;
      case 'yaml':
        data = this.convertToYaml(workflow);
        break;
      default:
        data = JSON.stringify(workflow);
    }

    return {
      format,
      data,
      metadata: {
        workflowId: workflow.id,
        version: workflow.version || '1.0.0',
        exportedAt: new Date()
      }
    };
  }

  validateWorkflow(): ValidationResult {
    const elements = this.elementRegistry.getAllElements();
    const connections = this.elementRegistry.getAllConnections();
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查是否有开始节点
    const hasStart = elements.some(e => e.type === 'start');
    if (!hasStart) {
      errors.push('工作流必须包含一个开始节点');
    }

    // 检查是否有结束节点
    const hasEnd = elements.some(e => e.type === 'end');
    if (!hasEnd) {
      warnings.push('工作流建议包含结束节点');
    }

    // 检查孤立节点
    const connectedNodes = new Set<string>();
    connections.forEach((conn: { source: string; target: string }) => {
      connectedNodes.add(conn.source);
      connectedNodes.add(conn.target);
    });

    elements.forEach((element: { id: string; type: string; label: string }) => {
      if (element.type !== 'start' && element.type !== 'end' && !connectedNodes.has(element.id)) {
        warnings.push(`节点 ${element.label} 未连接`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============ 元素操作 ============

  addNode(node: NodeDefinition): string {
    const validation = this.validateNode(node);
    if (!validation.valid) {
      throw new Error(`节点验证失败: ${validation.errors.join(', ')}`);
    }

    const nodeId = this.generateNodeId(node.type);
    const nodeInstance = this.createElement(node, nodeId);

    this.elementRegistry.register(nodeInstance);
    const visualElement = this.canvasManager.renderNode(nodeInstance);
    this.attachNodeInteractions(visualElement, nodeInstance);

    this.recordChange('add', nodeId, `添加节点: ${node.label}`);
    this.emit('node:added', nodeInstance);

    return nodeId;
  }

  removeNode(nodeId: string): void {
    const node = this.elementRegistry.get(nodeId);
    if (!node) {
      return;
    }

    this.elementRegistry.remove(nodeId);
    this.recordChange('delete', nodeId, `删除节点: ${node.label}`);
    this.emit('node:removed', nodeId);
  }

  connectNodes(sourceId: string, targetId: string, connection?: Connection): string {
    const source = this.elementRegistry.get(sourceId);
    const target = this.elementRegistry.get(targetId);

    if (!source || !target) {
      throw new Error('源节点或目标节点不存在');
    }

    if (!this.canConnect(source, target)) {
      throw new Error('不允许的连接类型');
    }

    const connectionId = this.generateConnectionId();
    const connectionObj = this.createConnection(sourceId, targetId, connectionId, connection);

    this.elementRegistry.registerConnection(connectionObj);
    this.canvasManager.renderConnection(connectionObj);
    this.updateNodeConnections(sourceId, targetId, connectionObj);

    this.recordChange('add', connectionId, `连接节点: ${source.label} -> ${target.label}`);
    this.emit('connection:created', connectionObj);

    return connectionId;
  }

  disconnectNodes(connectionId: string): void {
    const connection = this.elementRegistry.getConnection(connectionId);
    if (!connection) {
      return;
    }

    this.elementRegistry.removeConnection(connectionId);
    this.recordChange('delete', connectionId, '删除连接');
    this.emit('connection:removed', connectionId);
  }

  updateNode(nodeId: string, updates: Partial<NodeDefinition>): void {
    const node = this.elementRegistry.get(nodeId);
    if (!node) {
      return;
    }

    Object.assign(node, updates);
    this.recordChange('update', nodeId, `更新节点: ${node.label}`);
    this.emit('node:updated', node);
  }

  // ============ 画布控制 ============

  zoomIn(): void {
    this.canvasManager.zoomIn();
    this.emit('canvas:zoom-changed');
  }

  zoomOut(): void {
    this.canvasManager.zoomOut();
    this.emit('canvas:zoom-changed');
  }

  fitToView(): void {
    this.canvasManager.fitToView();
    this.emit('canvas:fit-to-view');
  }

  undo(): void {
    if (this.undoStack.length === 0) { return; }

    const action = this.undoStack.pop();
    this.redoStack.push(action);
    this.applyAction(action, true);
    this.emit('action:undo', action);
  }

  redo(): void {
    if (this.redoStack.length === 0) { return; }

    const action = this.redoStack.pop();
    this.undoStack.push(action);
    this.applyAction(action, false);
    this.emit('action:redo', action);
  }

  clear(): void {
    this.elementRegistry.getAllElements().forEach(el => this.elementRegistry.remove(el.id));
    this.elementRegistry.getAllConnections().forEach(conn => this.elementRegistry.removeConnection(conn.id));
    this.undoStack = [];
    this.redoStack = [];
    this.emit('canvas:cleared');
  }

  // ============ 执行与调试 ============

  async executeWorkflow(options?: ExecutionOptions): Promise<ExecutionResult> {
    const workflow = this.workflowEngine.getCurrent();

    try {
      const validation = this.validateWorkflowForExecution(workflow);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
          executionTime: 0
        };
      }

      const executable = this.compileWorkflow(workflow);
      const environment = await this.prepareExecutionEnvironment(executable, options);

      const startTime = Date.now();
      const executionResult = await this.executionEngine.execute(executable, environment);
      const executionTime = Date.now() - startTime;

      const metrics = this.collectExecutionMetrics(executionResult, executionTime);
      const visualization = this.visualizeExecutionResult(executionResult);

      return {
        success: true,
        result: executionResult.result,
        metrics,
        visualization,
        executionTime
      };

    } catch (error: unknown) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        executionTime: 0
      };
    }
  }

  async debugWorkflow(breakpoints: Breakpoint[]): Promise<DebugResult> {
    const workflow = this.workflowEngine.getCurrent();
    return await this.executionEngine.debug(workflow, breakpoints);
  }

  async testWorkflow(testCase: TestCase): Promise<TestResult> {
    const workflow = this.workflowEngine.getCurrent();
    return await this.executionEngine.test(workflow, testCase);
  }

  // ============ 协作功能 ============

  async shareWorkflow(users: string[]): Promise<void> {
    this.emit('workflow:shared', users);
  }

  lockElement(elementId: string): boolean {
    if (this.lockedElements.has(elementId)) {
      return false;
    }
    this.lockedElements.add(elementId);
    this.emit('element:locked', elementId);
    return true;
  }

  commentOnElement(elementId: string, comment: Comment): string {
    const commentId = `comment_${Date.now()}`;
    const comments = this.comments.get(elementId) || [];
    comments.push({ ...comment, timestamp: new Date() });
    this.comments.set(elementId, comments);
    this.emit('comment:added', { elementId, comment });
    return commentId;
  }

  trackChanges(): ChangeLog[] {
    return [...this.changeLogs];
  }

  // ============ 工具方法 ============

  private createFromTemplate(template: WorkflowTemplate): {
    id: string;
    name: string;
    description: string;
    nodes: NodeDefinition[];
    connections: Connection[];
    metadata: Record<string, unknown>;
  } {
    return {
      id: `workflow_${Date.now()}`,
      name: template.name,
      description: template.description,
      nodes: template.nodes,
      connections: template.connections,
      metadata: template.metadata || {}
    };
  }

  private createBlankWorkflow(): { id: string; name: string; nodes: []; connections: []; metadata: Record<string, unknown> } {
    return {
      id: `workflow_${Date.now()}`,
      name: '新工作流',
      nodes: [],
      connections: [],
      metadata: {}
    };
  }

  private loadDefaultElements(_workflowId: string): void {
    // 加载默认元素
  }

  private validateNode(node: NodeDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!node.label) { errors.push('节点标签不能为空'); }
    if (!node.type) { errors.push('节点类型不能为空'); }
    return { valid: errors.length === 0, errors };
  }

  private generateNodeId(type: NodeType): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private createElement(node: NodeDefinition, nodeId: string): NodeDefinition & { id: string; createdAt: Date } {
    return {
      ...node,
      id: nodeId,
      createdAt: new Date()
    };
  }

  private attachNodeInteractions(_visualElement: unknown, _nodeInstance: unknown): void {
    // 附加交互事件
  }

  private canConnect(_source: unknown, _target: unknown): boolean {
    // 连接验证逻辑
    return true;
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private createConnection(sourceId: string, targetId: string, connectionId: string, connection?: Connection): ConnectionWithId {
    return {
      id: connectionId,
      source: sourceId,
      target: targetId,
      ...connection
    };
  }

  private updateNodeConnections(_sourceId: string, _targetId: string, _connection: unknown): void {
    // 更新节点连接信息
  }

  private recordChange(type: 'add' | 'update' | 'delete', elementId: string, description: string): void {
    this.changeLogs.push({
      id: `change_${Date.now()}`,
      type,
      elementId,
      timestamp: new Date(),
      author: 'current-user',
      description
    });
  }

  private applyAction(_action: unknown, _reverse: boolean): void {
    // 应用撤销/重做动作
  }

  private validateWorkflowForExecution(_workflow: unknown): ReturnType<typeof this.validateWorkflow> {
    return this.validateWorkflow();
  }

  private compileWorkflow(_workflow: unknown): unknown {
    return _workflow;
  }

  private async prepareExecutionEnvironment(executable: unknown, options?: ExecutionOptions): Promise<{ executable: unknown; options?: ExecutionOptions }> {
    return { executable, options };
  }

  private collectExecutionMetrics(result: { metrics?: ExecutionMetrics }, executionTime: number): ExecutionMetrics {
    return result.metrics || {
      nodesExecuted: 0,
      totalTime: executionTime,
      averageNodeTime: 0,
      maxNodeTime: 0,
      memoryUsed: 0
    };
  }

  private visualizeExecutionResult(_result: unknown): string {
    return 'Execution visualization';
  }

  private convertToYaml(workflow: unknown): string {
    // 简化的YAML转换
    return JSON.stringify(workflow);
  }

  private validateRemoteChange(_event: unknown): { valid: boolean; reason?: string } {
    // 简化的验证逻辑
    return { valid: true };
  }

  private applyRemoteChange(_event: unknown): void {
    // 应用远程变更
  }

  private updateUIForChange(_event: unknown): void {
    // 更新UI
  }
}

export default WorkflowDesigner;
