/**
 * @file intelligent-ai-widget.tsx
 * @description 智能AI交互界面组件，提供聊天、工具、洞察、工作流和知识等功能
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 */

"use client";

import { logger } from '@/lib/logger';
import { BarChart3, BookOpen, Loader2, Maximize2, MessageSquare, Minimize2, Minus, Send, Workflow, Wrench, X } from 'lucide-react';
import * as React from 'react';
import { CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';
import { AgentContext, AgenticCore, UserInput } from '../../packages/autonomous-engine/src/core/AgenticCore';
import FileUpload, { UploadedFile } from './file-upload';
import InsightsDashboard from './insights-dashboard';
import KnowledgeBase from './knowledge-base';
import MessageHistory from './message-history';
import messageStorage, { StoredMessage } from './message-storage';
import ToolboxPanel from './toolbox-panel';
import VirtualizedMessageList from './virtualized-message-list';
import WorkflowManager from './workflow-manager';

export interface ToolExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
  timestamp: Date;
}

// ==================== 类型定义 ====================

interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetState {
  isVisible: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  currentView: 'chat' | 'tools' | 'insights' | 'workflow' | 'knowledge' | 'history';
  mode: 'floating' | 'docked';
  position: WidgetPosition;
  isDragging: boolean;
  isResizing: boolean;
}

export interface AppState {
  widget: WidgetState;
  messages: Message[];
  inputValue: string;
  isProcessing: boolean;
  selectedFiles: FileInfo[];
}

export type AppAction =
  | { type: 'SET_WIDGET_STATE'; payload: Partial<WidgetState> }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'RESET_INPUT' }
  | { type: 'SET_SELECTED_FILES'; payload: FileInfo[] }
  | { type: 'ADD_SELECTED_FILE'; payload: FileInfo }
  | { type: 'REMOVE_SELECTED_FILE'; payload: string };

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error' | 'read';
  files?: FileInfo[];
  avatar?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status?: 'uploading' | 'uploaded' | 'error';
}

interface IntelligentAIWidgetProps {
  userId: string;
  initialPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onClose?: () => void;
}

interface NavTabProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface MessageBubbleProps {
  message: Message;
}

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
}

interface InsightCardProps {
  title: string;
  value: string;
  trend: string;
  positive: boolean;
}

// ==================== Reducer ====================

export const initialState: AppState = {
  widget: {
    isVisible: true,
    isMinimized: false,
    isFullscreen: false,
    currentView: 'chat',
    mode: 'floating',
    position: { x: 0, y: 0, width: 400, height: 600 },
    isDragging: false,
    isResizing: false
  },
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是YYC³智能助手，有什么可以帮助你的吗？',
      timestamp: Date.now()
    }
  ],
  inputValue: '',
  isProcessing: false,
  selectedFiles: [],
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WIDGET_STATE':
      return {
        ...state,
        widget: { ...state.widget, ...action.payload }
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };

    case 'SET_INPUT_VALUE':
      return {
        ...state,
        inputValue: action.payload
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };

    case 'RESET_INPUT':
      return {
        ...state,
        inputValue: '',
        selectedFiles: []
      };

    case 'SET_SELECTED_FILES':
      return {
        ...state,
        selectedFiles: action.payload
      };

    case 'ADD_SELECTED_FILE':
      return {
        ...state,
        selectedFiles: [...state.selectedFiles, action.payload]
      };

    case 'REMOVE_SELECTED_FILE':
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter(file => file.id !== action.payload)
      };

    default:
      return state;
  }
}

// ==================== 主组件 ====================

export const IntelligentAIWidget: React.FC<IntelligentAIWidgetProps> = ({
  userId,
  initialPosition = 'bottom-right',
  onClose
}) => {
  const [state, dispatch] = React.useReducer(appReducer, initialState);
  const { widget, messages, inputValue, isProcessing, selectedFiles } = state;

  // Refs
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizeStartPos = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const agentEngineRef = useRef<AgenticCore | null>(null);

  // 初始化智能引擎和位置
  useEffect(() => {
    agentEngineRef.current = new AgenticCore({
      maxConcurrentTasks: 5,
      enableLearning: true,
      logLevel: 'info'
    });

    // 初始化消息存储
    messageStorage.initialize().catch((error) => {
      console.error('初始化消息存储失败:', error);
    });

    // 初始化位置（仅在客户端）
    if (typeof window !== 'undefined') {
      const initialPos = getInitialPosition(initialPosition);
      dispatch({ type: 'SET_WIDGET_STATE', payload: { position: initialPos } });
    }

    return () => {
      // 清理
    };
  }, [initialPosition]);

  // ==================== 拖拽处理 ====================

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (widget.isFullscreen || widget.isMinimized) return;

    dragStartPos.current = {
      x: e.clientX - widget.position.x,
      y: e.clientY - widget.position.y
    };

    dispatch({ type: 'SET_WIDGET_STATE', payload: { isDragging: true } });
  }, [widget.isFullscreen, widget.isMinimized, widget.position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!widget.isDragging || !dragStartPos.current) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    // 边界检查
    const maxX = window.innerWidth - widget.position.width;
    const maxY = window.innerHeight - widget.position.height;

    dispatch({
      type: 'SET_WIDGET_STATE',
      payload: {
        position: {
          ...widget.position,
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        }
      }
    });
  }, [widget.isDragging, widget.position]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: { isDragging: false } });
    dragStartPos.current = null;
  }, []);

  // ==================== 调整大小处理 ====================

  const handleResizeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (widget.isFullscreen || widget.isMinimized) return;

    e.preventDefault();
    e.stopPropagation();

    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: widget.position.width,
      height: widget.position.height
    };

    dispatch({ type: 'SET_WIDGET_STATE', payload: { isResizing: true } });
  }, [widget.isFullscreen, widget.isMinimized, widget.position]);

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!widget.isResizing || !resizeStartPos.current) return;

    const deltaX = e.clientX - resizeStartPos.current.x;
    const deltaY = e.clientY - resizeStartPos.current.y;

    const newWidth = Math.max(300, Math.min(800, resizeStartPos.current.width + deltaX));
    const newHeight = Math.max(400, Math.min(900, resizeStartPos.current.height + deltaY));

    dispatch({
      type: 'SET_WIDGET_STATE',
      payload: {
        position: {
          ...widget.position,
          width: newWidth,
          height: newHeight
        }
      }
    });
  }, [widget.isResizing, widget.position]);

  const handleResizeMouseUp = useCallback((e: MouseEvent) => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: { isResizing: false } });
    resizeStartPos.current = null;
  }, []);

  // ==================== 位置记忆 ====================

  const savePositionToStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const positionData = {
        position: widget.position,
        isMinimized: widget.isMinimized,
        isFullscreen: widget.isFullscreen
      };
      localStorage.setItem('yyc3-widget-position', JSON.stringify(positionData));
    }
  }, [widget.position, widget.isMinimized, widget.isFullscreen]);

  const loadPositionFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('yyc3-widget-position');
      if (savedData) {
        try {
          const positionData = JSON.parse(savedData);
          return positionData;
        } catch (error) {
          console.error('加载保存的位置失败:', error);
          return null;
        }
      }
    }
    return null;
  }, []);

  // 保存位置到本地存储
  useEffect(() => {
    if (!widget.isDragging && !widget.isResizing) {
      savePositionToStorage();
    }
  }, [widget.position, widget.isMinimized, widget.isFullscreen, savePositionToStorage]);

  // 加载保存的位置
  useEffect(() => {
    const savedPosition = loadPositionFromStorage();
    if (savedPosition) {
      dispatch({ type: 'SET_WIDGET_STATE', payload: savedPosition });
    }
  }, [loadPositionFromStorage]);

  useEffect(() => {
    if (widget.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [widget.isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (widget.isResizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [widget.isResizing, handleResizeMouseMove, handleResizeMouseUp]);

  // ==================== 文件处理 ====================

  const handleFileUpload = (files: UploadedFile[]) => {
    // 将上传的文件转换为FileInfo格式
    const newFiles: FileInfo[] = files.map((file) => ({
      id: file.id,
      name: file.file.name,
      type: file.file.type,
      size: file.file.size,
      url: file.url,
      status: file.status === 'completed' ? 'uploaded' : 'uploading'
    }));

    dispatch({ type: 'SET_SELECTED_FILES', payload: [...selectedFiles, ...newFiles] });
  };

  const handleFileRemove = (fileId: string) => {
    dispatch({ type: 'REMOVE_SELECTED_FILE', payload: fileId });
  };

  const removeFile = (fileId: string) => {
    dispatch({ type: 'REMOVE_SELECTED_FILE', payload: fileId });
  };

  // ==================== 消息历史处理 ====================

  const handleLoadHistoryMessages = (historyMessages: StoredMessage[]) => {
    // 将历史消息转换为当前消息格式
    const convertedMessages: Message[] = historyMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      status: msg.status,
      files: msg.files,
      avatar: msg.avatar
    }));

    dispatch({ type: 'SET_MESSAGES', payload: convertedMessages });
    dispatch({ type: 'SET_WIDGET_STATE', payload: { currentView: 'chat' } });
  };

  // ==================== 工具处理 ====================

  const handleToolExecute = useCallback(async (toolId: string, parameters?: Record<string, unknown>): Promise<ToolExecutionResult> => {
    const startTime = Date.now();

    try {
      const toolMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `正在执行工具: ${toolId}...`,
        timestamp: Date.now(),
        status: 'sending'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: toolMessage });

      const context: AgentContext = {
        sessionId: `session_${userId}_${Date.now()}`,
        userId,
        environment: 'web',
        permissions: ['read', 'write', 'execute'],
        conversationHistory: messages,
        workingMemory: {
          toolId,
          parameters
        }
      };

      const input: UserInput = {
        text: `执行工具: ${toolId}`,
        context
      };

      const response = await agentEngineRef.current?.processInput(input);

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: toolMessage.id, updates: { status: 'sent', content: response?.message || `工具 ${toolId} 执行完成` } }
      });

      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response?.message || `工具 ${toolId} 执行成功`,
        timestamp: Date.now()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: resultMessage });

      await messageStorage.addMessage(toolMessage);
      await messageStorage.addMessage(resultMessage);

      return {
        success: true,
        output: response,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('工具执行失败', error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `工具 ${toolId} 执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
        status: 'error'
      };

      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      await messageStorage.addMessage(errorMessage);

      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }, [userId, messages]);

  const handleToolPin = useCallback((toolId: string, pinned: boolean) => {
    console.log(`工具 ${toolId} ${pinned ? '已固定' : '已取消固定'}`);
  }, []);

  // ==================== 消息处理 ====================

  const handleSendMessage = useCallback(async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      status: 'sending',
      files: selectedFiles
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'RESET_INPUT' });
    dispatch({ type: 'SET_PROCESSING', payload: true });

    // 保存消息到存储
    try {
      await messageStorage.addMessage(userMessage);
    } catch (error) {
      console.error('保存消息失败:', error);
    }

    try {
      const context: AgentContext = {
        sessionId: `session_${userId}_${Date.now()}`,
        userId,
        environment: 'web',
        permissions: ['read', 'write'],
        conversationHistory: messages,
        workingMemory: {}
      };

      const input: UserInput = {
        text: inputValue,
        context
      };

      const response = await agentEngineRef.current?.processInput(input);

      // 更新用户消息状态
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: userMessage.id, updates: { status: 'sent' } }
      });

      // 添加助手回复
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response?.message || '收到了你的消息，正在处理中...',
        timestamp: Date.now()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

      // 保存助手回复到存储
      try {
        await messageStorage.addMessage(assistantMessage);
      } catch (error) {
        console.error('保存消息失败:', error);
      }

      // 如果有建议，添加系统消息
      if (response?.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: `建议: ${response.suggestions.join(', ')}`,
          timestamp: Date.now()
        };
        dispatch({ type: 'ADD_MESSAGE', payload: suggestionsMessage });

        // 保存系统消息到存储
        try {
          await messageStorage.addMessage(suggestionsMessage);
        } catch (error) {
          console.error('保存消息失败:', error);
        }
      }

    } catch (error: unknown) {
      logger.error('发送消息失败', error);
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: userMessage.id, updates: { status: 'error' } }
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [inputValue, selectedFiles, isProcessing, messages, userId]);

  // ==================== 键盘快捷键 ====================

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // 打开/关闭浮窗
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      dispatch({ type: 'SET_WIDGET_STATE', payload: { isVisible: !widget.isVisible } });
    }

    // 如果浮窗不可见或最小化，不处理其他快捷键
    if (!widget.isVisible || widget.isMinimized) return;

    // 发送消息
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }

    // 关闭浮窗
    if (e.key === 'Escape') {
      e.preventDefault();
      dispatch({ type: 'SET_WIDGET_STATE', payload: { isVisible: false } });
    }

    // 编辑上一条消息
    if (e.key === 'ArrowUp' && !inputValue.trim()) {
      e.preventDefault();
      const lastUserMessage = messages
        .filter(m => m.role === 'user')
        .pop();

      if (lastUserMessage) {
        dispatch({ type: 'SET_INPUT_VALUE', payload: lastUserMessage.content });
      }
    }

    // 切换视图
    if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      e.preventDefault();
      const viewIndex = parseInt(e.key) - 1;
      const views: Array<'chat' | 'tools' | 'insights' | 'workflow' | 'knowledge' | 'history'> =
        ['chat', 'tools', 'insights', 'workflow', 'knowledge', 'history'];

      if (viewIndex < views.length) {
        dispatch({ type: 'SET_WIDGET_STATE', payload: { currentView: views[viewIndex] } });
      }
    }

    // 快速切换到聊天视图
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      dispatch({ type: 'SET_WIDGET_STATE', payload: { currentView: 'chat' } });
    }

    // 快速切换到历史视图
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      dispatch({ type: 'SET_WIDGET_STATE', payload: { currentView: 'history' } });
    }

    // 最小化/恢复
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      e.preventDefault();
      dispatch({ type: 'SET_WIDGET_STATE', payload: { isMinimized: !widget.isMinimized } });
    }

    // 全屏/恢复
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      dispatch({ type: 'SET_WIDGET_STATE', payload: { isFullscreen: !widget.isFullscreen } });
    }
  }, [widget.isVisible, widget.isMinimized, inputValue, messages, handleSendMessage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // ==================== UI控制 ====================

  const toggleMinimize = useCallback(() => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: { isMinimized: !widget.isMinimized } });
  }, [widget.isMinimized]);

  const toggleFullscreen = useCallback(() => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: { isFullscreen: !widget.isFullscreen } });
  }, [widget.isFullscreen]);

  const closeWidget = useCallback(() => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: { isVisible: false } });
    onClose?.();
  }, [onClose]);

  const switchView = useCallback((view: WidgetState['currentView']) => {
    dispatch({ type: 'SET_WIDGET_STATE', payload: { currentView: view } });
  }, []);

  // ==================== 渲染 ====================

  const widgetClasses = useMemo(() => `
    fixed bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300
    ${widget.isDragging ? 'cursor-grabbing' : 'cursor-default'}
    ${widget.isFullscreen ? 'inset-4' : ''}
    ${widget.isMinimized ? 'h-14' : ''}
  `, [widget.isDragging, widget.isFullscreen, widget.isMinimized]);

  const widgetStyle = useMemo((): CSSProperties => widget.isFullscreen
    ? { zIndex: 9999 }
    : {
      left: widget.position.x,
      top: widget.position.y,
      width: widget.isMinimized ? Math.max(widget.position.width, 300) : widget.position.width,
      height: widget.isMinimized ? 56 : widget.position.height,
      zIndex: 9999
    }, [widget.isFullscreen, widget.position]);

  if (!widget.isVisible) return null;

  return (
    <div
      ref={widgetRef}
      className={widgetClasses}
      style={widgetStyle}
      data-testid="intelligent-ai-widget"
    >
      {/* 标题栏 */}
      <div
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="font-semibold">
            {widget.isMinimized ? 'YYC³' : 'YYC³ 智能助手'}
          </span>
          {!widget.isMinimized && messages.length > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {messages.filter(m => m.role === 'user').length} 条消息
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMinimize}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title={widget.isMinimized ? '展开' : '最小化'}
          >
            {widget.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title={widget.isFullscreen ? '退出全屏' : '全屏'}
          >
            {widget.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={closeWidget}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            data-testid="widget-toggle-button"
            aria-label="Toggle AI Assistant"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 最小化状态下的快速操作 */}
      {widget.isMinimized && (
        <div className="px-4 py-2 flex items-center justify-between bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>处理中...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>点击展开继续对话</span>
              </>
            )}
          </div>
          <button
            onClick={() => switchView('chat')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            快速回复
          </button>
        </div>
      )}

      {/* 主内容区 */}
      {!widget.isMinimized && (
        <>
          {/* 导航标签 */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <NavTab
              icon={<MessageSquare className="w-4 h-4" />}
              label="对话"
              active={widget.currentView === 'chat'}
              onClick={() => switchView('chat')}
            />
            <NavTab
              icon={<Wrench className="w-4 h-4" />}
              label="工具"
              active={widget.currentView === 'tools'}
              onClick={() => switchView('tools')}
            />
            <NavTab
              icon={<BarChart3 className="w-4 h-4" />}
              label="洞察"
              active={widget.currentView === 'insights'}
              onClick={() => switchView('insights')}
            />
            <NavTab
              icon={<Workflow className="w-4 h-4" />}
              label="工作流"
              active={widget.currentView === 'workflow'}
              onClick={() => switchView('workflow')}
            />
            <NavTab
              icon={<BookOpen className="w-4 h-4" />}
              label="知识库"
              active={widget.currentView === 'knowledge'}
              onClick={() => switchView('knowledge')}
            />
            <NavTab
              icon={<MessageSquare className="w-4 h-4" />}
              label="历史"
              active={widget.currentView === 'history'}
              onClick={() => switchView('history')}
            />
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ height: 'calc(100% - 112px)' }} data-testid="widget-content">
            {widget.currentView === 'chat' && (
              <>
                {/* 虚拟化消息列表 */}
                <VirtualizedMessageList messages={messages} height={400} />

                {/* 输入框 */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* 文件上传组件 */}
                  <FileUpload
                    onUpload={handleFileUpload}
                    onRemove={handleFileRemove}
                    className="mb-3"
                  />

                  {/* 消息输入和发送按钮 */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: 'SET_INPUT_VALUE', payload: e.target.value })}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isProcessing}
                      data-testid="user-input-field"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isProcessing || (!inputValue.trim() && !selectedFiles.length)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      data-testid="send-message-button"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {widget.currentView === 'tools' && (
              <ToolboxPanel
                onToolExecute={handleToolExecute}
                onToolPin={handleToolPin}
              />
            )}

            {widget.currentView === 'insights' && (
              <InsightsDashboard
                onPeriodChange={(period) => {
                  console.log('切换洞察周期:', period);
                }}
                onRecommendationAction={(recommendationId) => {
                  console.log('执行建议:', recommendationId);
                }}
              />
            )}

            {widget.currentView === 'workflow' && (
              <WorkflowManager
                onWorkflowExecute={async (workflowId) => {
                  console.log('执行工作流:', workflowId);
                }}
                onWorkflowCreate={(workflow) => {
                  console.log('创建工作流:', workflow);
                }}
                onWorkflowUpdate={(workflowId, updates) => {
                  console.log('更新工作流:', workflowId, updates);
                }}
                onWorkflowDelete={(workflowId) => {
                  console.log('删除工作流:', workflowId);
                }}
              />
            )}

            {widget.currentView === 'knowledge' && (
              <KnowledgeBase
                onItemClick={(item) => {
                  console.log('查看知识:', item);
                }}
                onItemCreate={(item) => {
                  console.log('创建知识:', item);
                }}
                onItemUpdate={(itemId, updates) => {
                  console.log('更新知识:', itemId, updates);
                }}
                onItemDelete={(itemId) => {
                  console.log('删除知识:', itemId);
                }}
              />
            )}

            {widget.currentView === 'history' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <MessageHistory onLoadMessages={handleLoadHistoryMessages} />
              </div>
            )}
          </div>
        </>
      )}

      {/* 调整大小手柄 */}
      {!widget.isMinimized && !widget.isFullscreen && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-indigo-500/20 rounded-bl-lg"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #6366f1 50%)'
          }}
        />
      )}
    </div>
  );
};

IntelligentAIWidget.displayName = 'IntelligentAIWidget';

export const IntelligentAIWidgetMemo = React.memo(IntelligentAIWidget);

export default IntelligentAIWidgetMemo;

// ==================== 子组件 ====================

const NavTab: React.FC<NavTabProps> = React.memo(({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors
      ${active
        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
));

NavTab.displayName = 'NavTab';

const ToolCard: React.FC<ToolCardProps> = React.memo(({ icon, title, description }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
    <div className="text-3xl mb-2">{icon}</div>
    <h4 className="font-semibold text-gray-900">{title}</h4>
    <p className="text-xs text-gray-600 mt-1">{description}</p>
  </div>
));

ToolCard.displayName = 'ToolCard';

const InsightCard: React.FC<InsightCardProps> = React.memo(({ title, value, trend, positive }) => (
  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{title}</span>
      <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {trend}
      </span>
    </div>
    <div className="text-2xl font-bold text-indigo-600 mt-2">{value}</div>
  </div>
));

InsightCard.displayName = 'InsightCard';

// ==================== 辅助函数 ====================

function getInitialPosition(position: string): WidgetPosition {
  const width = 400;
  const height = 600;
  const padding = 20;

  switch (position) {
    case 'bottom-right':
      return {
        x: window.innerWidth - width - padding,
        y: window.innerHeight - height - padding,
        width,
        height
      };
    case 'bottom-left':
      return {
        x: padding,
        y: window.innerHeight - height - padding,
        width,
        height
      };
    case 'top-right':
      return {
        x: window.innerWidth - width - padding,
        y: padding,
        width,
        height
      };
    case 'top-left':
      return {
        x: padding,
        y: padding,
        width,
        height
      };
    default:
      return {
        x: window.innerWidth - width - padding,
        y: window.innerHeight - height - padding,
        width,
        height
      };
  }
}
