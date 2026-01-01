/**
 * @file intelligent-ai-widget.tsx
 * @description 智能AI交互界面组件，提供聊天、工具、洞察、工作流和知识等功能
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 */

"use client";

import { BarChart3, BookOpen, Loader2, Maximize2, MessageSquare, Minimize2, Minus, Send, Workflow, Wrench, X } from 'lucide-react';
import * as React from 'react';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { AgentContext, AgenticCore, UserInput } from '../../packages/autonomous-engine/src/core/AgenticCore';

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
  currentView: 'chat' | 'tools' | 'insights' | 'workflow' | 'knowledge';
  mode: 'floating' | 'docked';
  position: WidgetPosition;
  isDragging: boolean;
  isResizing: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
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

// ==================== 主组件 ====================

export const IntelligentAIWidget: React.FC<IntelligentAIWidgetProps> = ({
  userId,
  initialPosition = 'bottom-right',
  onClose
}) => {
  // 状态管理
  const [state, setState] = useState<WidgetState>({
    isVisible: true,
    isMinimized: false,
    isFullscreen: false,
    currentView: 'chat',
    mode: 'floating',
    position: { x: 0, y: 0, width: 400, height: 600 }, // 初始位置，将在useEffect中更新
    isDragging: false,
    isResizing: false
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是YYC³智能助手，有什么可以帮助你的吗？',
      timestamp: Date.now()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const agentEngineRef = useRef<AgenticCore | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化智能引擎和位置
  useEffect(() => {
    agentEngineRef.current = new AgenticCore({
      maxConcurrentTasks: 5,
      enableLearning: true,
      logLevel: 'info'
    });

    // 初始化位置（仅在客户端）
    if (typeof window !== 'undefined') {
      const initialPos = getInitialPosition(initialPosition);
      setState((prev: WidgetState) => ({ ...prev, position: initialPos }));
    }

    return () => {
      // 清理
    };
  }, [initialPosition]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setState((prev: WidgetState) => ({ ...prev, isVisible: !prev.isVisible }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // ==================== 拖拽处理 ====================

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (state.isFullscreen || state.isMinimized) return;

    dragStartPos.current = {
      x: e.clientX - state.position.x,
      y: e.clientY - state.position.y
    };

    setState((prev: WidgetState) => ({ ...prev, isDragging: true }));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!state.isDragging || !dragStartPos.current) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    // 边界检查
    const maxX = window.innerWidth - state.position.width;
    const maxY = window.innerHeight - state.position.height;

    setState((prev: WidgetState) => ({
      ...prev,
      position: {
        ...prev.position,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }
    }));
  }, [state.isDragging, state.position.width, state.position.height]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    setState((prev: WidgetState) => ({ ...prev, isDragging: false }));
    dragStartPos.current = null;
  }, []);

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp]);

  // ==================== 消息处理 ====================

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

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
      setMessages(prev => prev.map((m: Message) =>
        m.id === userMessage.id ? { ...m, status: 'sent' } : m
      ));

      // 添加助手回复
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response?.message || '收到了你的消息，正在处理中...',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 如果有建议，添加系统消息
      if (response?.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: `建议: ${response.suggestions.join(', ')}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }

    } catch (error: unknown) {
      logger.error('发送消息失败', error);
      setMessages(prev => prev.map((m: Message) =>
        m.id === userMessage.id ? { ...m, status: 'error' } : m
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  // ==================== UI控制 ====================

  const toggleMinimize = () => {
    setState((prev: WidgetState) => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const toggleFullscreen = () => {
    setState((prev: WidgetState) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const closeWidget = () => {
    setState((prev: WidgetState) => ({ ...prev, isVisible: false }));
    onClose?.();
  };

  const switchView = (view: WidgetState['currentView']) => {
    setState((prev: WidgetState) => ({ ...prev, currentView: view }));
  };

  // ==================== 渲染 ====================

  if (!state.isVisible) return null;

  const widgetClasses = `
    fixed bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300
    ${state.isDragging ? 'cursor-grabbing' : 'cursor-default'}
    ${state.isFullscreen ? 'inset-4' : ''}
    ${state.isMinimized ? 'h-14' : ''}
  `;

  const widgetStyle: CSSProperties = state.isFullscreen
    ? { zIndex: 9999 }
    : {
      left: state.position.x,
      top: state.position.y,
      width: state.position.width,
      height: state.isMinimized ? 56 : state.position.height,
      zIndex: 9999
    };

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
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-semibold">YYC³ 智能助手</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMinimize}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            {state.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={closeWidget}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            data-testid="widget-toggle-button"
            aria-label="Toggle AI Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      {!state.isMinimized && (
        <>
          {/* 导航标签 */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <NavTab
              icon={<MessageSquare className="w-4 h-4" />}
              label="对话"
              active={state.currentView === 'chat'}
              onClick={() => switchView('chat')}
            />
            <NavTab
              icon={<Wrench className="w-4 h-4" />}
              label="工具"
              active={state.currentView === 'tools'}
              onClick={() => switchView('tools')}
            />
            <NavTab
              icon={<BarChart3 className="w-4 h-4" />}
              label="洞察"
              active={state.currentView === 'insights'}
              onClick={() => switchView('insights')}
            />
            <NavTab
              icon={<Workflow className="w-4 h-4" />}
              label="工作流"
              active={state.currentView === 'workflow'}
              onClick={() => switchView('workflow')}
            />
            <NavTab
              icon={<BookOpen className="w-4 h-4" />}
              label="知识库"
              active={state.currentView === 'knowledge'}
              onClick={() => switchView('knowledge')}
            />
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ height: 'calc(100% - 112px)' }} data-testid="widget-content">
            {state.currentView === 'chat' && (
              <>
                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message: Message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入框 */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isProcessing}
                      data-testid="user-input-field"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isProcessing || !inputValue.trim()}
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

            {state.currentView === 'tools' && (
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold mb-4">可用工具</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ToolCard icon="🔍" title="搜索" description="智能搜索功能" />
                  <ToolCard icon="📊" title="分析" description="数据分析工具" />
                  <ToolCard icon="✍️" title="写作" description="AI写作助手" />
                  <ToolCard icon="🎨" title="设计" description="创意设计工具" />
                </div>
              </div>
            )}

            {state.currentView === 'insights' && (
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold mb-4">使用洞察</h3>
                <div className="space-y-4">
                  <InsightCard
                    title="今日活跃度"
                    value="85%"
                    trend="+12%"
                    positive={true}
                  />
                  <InsightCard
                    title="任务完成率"
                    value="92%"
                    trend="+5%"
                    positive={true}
                  />
                </div>
              </div>
            )}

            {state.currentView === 'workflow' && (
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold mb-4">工作流管理</h3>
                <p className="text-gray-500">工作流功能开发中...</p>
              </div>
            )}

            {state.currentView === 'knowledge' && (
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold mb-4">知识库</h3>
                <p className="text-gray-500">知识库功能开发中...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ==================== 子组件 ====================

const NavTab: React.FC<NavTabProps> = ({ icon, label, active, onClick }) => (
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
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[80%] px-4 py-2 rounded-lg
          ${isUser
            ? 'bg-indigo-600 text-white'
            : isSystem
              ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
              : 'bg-gray-100 text-gray-900'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
    <div className="text-3xl mb-2">{icon}</div>
    <h4 className="font-semibold text-gray-900">{title}</h4>
    <p className="text-xs text-gray-600 mt-1">{description}</p>
  </div>
);

const InsightCard: React.FC<InsightCardProps> = ({ title, value, trend, positive }) => (
  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{title}</span>
      <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {trend}
      </span>
    </div>
    <div className="text-2xl font-bold text-indigo-600 mt-2">{value}</div>
  </div>
);

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
