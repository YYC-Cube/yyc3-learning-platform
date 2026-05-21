/**
 * @fileoverview UI组件 · workflow-manager.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */

'use client';

import { Play, Plus, Trash2, Copy, Edit, ChevronRight, Clock, FolderOpen } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface WorkflowNode {
  id: string;
  type: 'start' | 'action' | 'condition' | 'loop' | 'end';
  name: string;
  description?: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'error';
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  lastExecuted?: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export interface WorkflowManagerProps {
  onWorkflowExecute?: (workflowId: string) => Promise<void>;
  onWorkflowCreate?: (workflow: Partial<Workflow>) => void;
  onWorkflowUpdate?: (workflowId: string, updates: Partial<Workflow>) => void;
  onWorkflowDelete?: (workflowId: string) => void;
}

interface WorkflowCardProps {
  workflow: Workflow;
  onExecute: (workflowId: string) => void;
  onEdit: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
  onDuplicate: (workflowId: string) => void;
}

interface WorkflowTemplateProps {
  name: string;
  description: string;
  icon: string;
  category: string;
  onUse: () => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  onWorkflowExecute,
  onWorkflowCreate,
  onWorkflowUpdate: _onWorkflowUpdate,
  onWorkflowDelete,
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [_selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [_executions, setExecutions] = useState<Map<string, WorkflowExecution>>(new Map());
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'templates'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);

    try {
      const defaultWorkflows: Workflow[] = [
        {
          id: 'wf-1',
          name: '每日报告生成',
          description: '自动收集数据并生成每日工作报告',
          status: 'active',
          nodes: [
            {
              id: 'node-1',
              type: 'start',
              name: '开始',
              config: {},
              position: { x: 100, y: 50 },
            },
            {
              id: 'node-2',
              type: 'action',
              name: '收集数据',
              description: '从各个数据源收集今日数据',
              config: { action: 'collect_data' },
              position: { x: 100, y: 150 },
            },
            {
              id: 'node-3',
              type: 'action',
              name: '生成报告',
              description: '基于收集的数据生成报告',
              config: { action: 'generate_report' },
              position: { x: 100, y: 250 },
            },
            {
              id: 'node-4',
              type: 'end',
              name: '结束',
              config: {},
              position: { x: 100, y: 350 },
            },
          ],
          connections: [
            { id: 'conn-1', from: 'node-1', to: 'node-2' },
            { id: 'conn-2', from: 'node-2', to: 'node-3' },
            { id: 'conn-3', from: 'node-3', to: 'node-4' },
          ],
          createdAt: new Date(Date.now() - 86400000 * 7),
          updatedAt: new Date(Date.now() - 86400000),
          executionCount: 42,
          lastExecuted: new Date(Date.now() - 86400000),
        },
        {
          id: 'wf-2',
          name: '自动备份流程',
          description: '定期备份重要数据到云存储',
          status: 'active',
          nodes: [
            {
              id: 'node-1',
              type: 'start',
              name: '开始',
              config: {},
              position: { x: 100, y: 50 },
            },
            {
              id: 'node-2',
              type: 'condition',
              name: '检查备份时间',
              description: '验证是否到达备份时间',
              config: { condition: 'is_backup_time' },
              position: { x: 100, y: 150 },
            },
            {
              id: 'node-3',
              type: 'action',
              name: '执行备份',
              description: '将数据备份到云存储',
              config: { action: 'backup_data' },
              position: { x: 100, y: 250 },
            },
            {
              id: 'node-4',
              type: 'end',
              name: '结束',
              config: {},
              position: { x: 100, y: 350 },
            },
          ],
          connections: [
            { id: 'conn-1', from: 'node-1', to: 'node-2' },
            { id: 'conn-2', from: 'node-2', to: 'node-3', condition: 'true' },
            { id: 'conn-3', from: 'node-3', to: 'node-4' },
          ],
          createdAt: new Date(Date.now() - 86400000 * 14),
          updatedAt: new Date(Date.now() - 86400000 * 2),
          executionCount: 128,
          lastExecuted: new Date(Date.now() - 3600000),
        },
        {
          id: 'wf-3',
          name: '客户跟进流程',
          description: '自动化客户跟进和提醒',
          status: 'draft',
          nodes: [
            {
              id: 'node-1',
              type: 'start',
              name: '开始',
              config: {},
              position: { x: 100, y: 50 },
            },
            {
              id: 'node-2',
              type: 'action',
              name: '发送欢迎邮件',
              description: '向新客户发送欢迎邮件',
              config: { action: 'send_welcome_email' },
              position: { x: 100, y: 150 },
            },
            {
              id: 'node-3',
              type: 'loop',
              name: '定期跟进',
              description: '每周发送跟进邮件',
              config: { interval: '7d' },
              position: { x: 100, y: 250 },
            },
            {
              id: 'node-4',
              type: 'end',
              name: '结束',
              config: {},
              position: { x: 100, y: 350 },
            },
          ],
          connections: [
            { id: 'conn-1', from: 'node-1', to: 'node-2' },
            { id: 'conn-2', from: 'node-2', to: 'node-3' },
            { id: 'conn-3', from: 'node-3', to: 'node-4' },
          ],
          createdAt: new Date(Date.now() - 86400000 * 3),
          updatedAt: new Date(Date.now() - 86400000),
          executionCount: 0,
        },
      ];

      setWorkflows(defaultWorkflows);
    } catch (error) {
      console.error('加载工作流失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWorkflowExecute = useCallback(
    async (workflowId: string) => {
      const workflow = workflows.find((w) => w.id === workflowId);
      if (!workflow) return;

      const execution: WorkflowExecution = {
        id: `exec-${Date.now()}`,
        workflowId,
        status: 'running',
        startTime: new Date(),
        logs: [],
      };

      setExecutions((prev) => new Map(prev).set(workflowId, execution));

      try {
        await onWorkflowExecute?.(workflowId);

        const updatedExecution: WorkflowExecution = {
          ...execution,
          status: 'completed',
          endTime: new Date(),
          logs: [
            {
              timestamp: new Date(),
              nodeId: workflow.nodes[0].id,
              nodeName: workflow.nodes[0].name,
              status: 'success',
              message: '工作流执行完成',
            },
          ],
        };

        setExecutions((prev) => new Map(prev).set(workflowId, updatedExecution));

        const updatedWorkflows = workflows.map((w) =>
          w.id === workflowId
            ? { ...w, executionCount: w.executionCount + 1, lastExecuted: new Date() }
            : w
        );
        setWorkflows(updatedWorkflows);
      } catch (error) {
        const failedExecution: WorkflowExecution = {
          ...execution,
          status: 'failed',
          endTime: new Date(),
          logs: [
            {
              timestamp: new Date(),
              nodeId: workflow.nodes[0].id,
              nodeName: workflow.nodes[0].name,
              status: 'error',
              message: error instanceof Error ? error.message : '执行失败',
            },
          ],
        };

        setExecutions((prev) => new Map(prev).set(workflowId, failedExecution));
      }
    },
    [workflows, onWorkflowExecute]
  );

  const handleWorkflowCreate = useCallback(() => {
    const newWorkflow: Partial<Workflow> = {
      name: '新工作流',
      description: '描述工作流的目的和功能',
      status: 'draft',
      nodes: [
        {
          id: 'node-1',
          type: 'start',
          name: '开始',
          config: {},
          position: { x: 100, y: 50 },
        },
        {
          id: 'node-2',
          type: 'end',
          name: '结束',
          config: {},
          position: { x: 100, y: 150 },
        },
      ],
      connections: [{ id: 'conn-1', from: 'node-1', to: 'node-2' }],
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
    };

    onWorkflowCreate?.(newWorkflow);
  }, [onWorkflowCreate]);

  const handleWorkflowDelete = useCallback(
    (workflowId: string) => {
      const updatedWorkflows = workflows.filter((w) => w.id !== workflowId);
      setWorkflows(updatedWorkflows);
      onWorkflowDelete?.(workflowId);
    },
    [workflows, onWorkflowDelete]
  );

  const handleWorkflowDuplicate = useCallback(
    (workflowId: string) => {
      const workflow = workflows.find((w) => w.id === workflowId);
      if (!workflow) return;

      const duplicated: Workflow = {
        ...workflow,
        id: `wf-${Date.now()}`,
        name: `${workflow.name} (副本)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        executionCount: 0,
        lastExecuted: undefined,
      };

      setWorkflows((prev) => [...prev, duplicated]);
    },
    [workflows]
  );

  const activeWorkflows = useMemo(
    () => workflows.filter((w) => w.status === 'active'),
    [workflows]
  );
  const draftWorkflows = useMemo(() => workflows.filter((w) => w.status === 'draft'), [workflows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">加载工作流...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">工作流管理</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              工作流列表
            </button>
            <button
              onClick={() => setViewMode('templates')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'templates'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              模板库
            </button>
            <button
              onClick={handleWorkflowCreate}
              className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新建</span>
            </button>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'list' && (
          <div className="space-y-6">
            {activeWorkflows.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Play className="w-4 h-4 mr-2 text-green-500" />
                  运行中的工作流 ({activeWorkflows.length})
                </h4>
                <div className="space-y-3">
                  {activeWorkflows.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onExecute={handleWorkflowExecute}
                      onEdit={() => setSelectedWorkflow(workflow)}
                      onDelete={handleWorkflowDelete}
                      onDuplicate={handleWorkflowDuplicate}
                    />
                  ))}
                </div>
              </div>
            )}

            {draftWorkflows.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Edit className="w-4 h-4 mr-2 text-gray-500" />
                  草稿工作流 ({draftWorkflows.length})
                </h4>
                <div className="space-y-3">
                  {draftWorkflows.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onExecute={handleWorkflowExecute}
                      onEdit={() => setSelectedWorkflow(workflow)}
                      onDelete={handleWorkflowDelete}
                      onDuplicate={handleWorkflowDuplicate}
                    />
                  ))}
                </div>
              </div>
            )}

            {workflows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">还没有工作流</p>
                <button
                  onClick={handleWorkflowCreate}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>创建第一个工作流</span>
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'templates' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">工作流模板</h4>
            <div className="grid grid-cols-2 gap-3">
              <WorkflowTemplate
                name="数据处理"
                description="自动化数据清洗、转换和加载流程"
                icon="🔄"
                category="数据"
                onUse={handleWorkflowCreate}
              />
              <WorkflowTemplate
                name="通知发送"
                description="定时发送通知和提醒"
                icon="📧"
                category="通信"
                onUse={handleWorkflowCreate}
              />
              <WorkflowTemplate
                name="文件同步"
                description="多位置文件同步和备份"
                icon="☁️"
                category="存储"
                onUse={handleWorkflowCreate}
              />
              <WorkflowTemplate
                name="报告生成"
                description="自动生成各类业务报告"
                icon="📊"
                category="分析"
                onUse={handleWorkflowCreate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

WorkflowManager.displayName = 'WorkflowManager';

const WorkflowCard: React.FC<WorkflowCardProps> = React.memo(
  ({ workflow, onExecute, onEdit, onDelete, onDuplicate }) => {
    const execution = useMemo(() => {
      const statusColors = {
        draft: 'bg-gray-100 text-gray-700',
        active: 'bg-green-100 text-green-700',
        paused: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-blue-100 text-blue-700',
        error: 'bg-red-100 text-red-700',
      };

      const statusLabels = {
        draft: '草稿',
        active: '运行中',
        paused: '已暂停',
        completed: '已完成',
        error: '错误',
      };

      return {
        color: statusColors[workflow.status],
        label: statusLabels[workflow.status],
      };
    }, [workflow.status]);

    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-1">{workflow.name}</h5>
            <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${execution.color}`}>
            {execution.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Play className="w-3 h-3" />
              <span>{workflow.executionCount} 次执行</span>
            </div>
            {workflow.lastExecuted && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(workflow.lastExecuted)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span>{workflow.nodes.length} 节点</span>
            <ChevronRight className="w-3 h-3" />
            <span>{workflow.connections.length} 连接</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExecute(workflow.id)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>执行</span>
          </button>
          <button
            onClick={() => onEdit(workflow.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDuplicate(workflow.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="复制"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(workflow.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    );
  }
);

WorkflowCard.displayName = 'WorkflowCard';

const WorkflowTemplate: React.FC<WorkflowTemplateProps> = React.memo(
  ({ name, description, icon, category, onUse }) => (
    <div
      className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition-all cursor-pointer"
      onClick={onUse}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h5 className="font-semibold text-gray-900 mb-1">{name}</h5>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-indigo-700">{category}</span>
    </div>
  )
);

WorkflowTemplate.displayName = 'WorkflowTemplate';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString();
}

export default WorkflowManager;
