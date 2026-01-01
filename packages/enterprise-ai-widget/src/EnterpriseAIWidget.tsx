"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import {
  X, Minus, Maximize2, Minimize2, MessageSquare, Wrench, BarChart3,
  Workflow, BookOpen, Settings, Send, Loader2, Sparkles, Shield, Zap,
  Brain, Target, Database, Users, TrendingUp, AlertTriangle, CheckCircle,
  Activity, Layers, Globe, Lightbulb, ChevronRight, MoreVertical, Bell,
  Search, Filter, Download, Upload, RefreshCw, Eye, EyeOff, Lock, Unlock,
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Share2, Copy,
  Edit, Trash2, Archive, Star, Flag, MessageCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';

// 集成YYC³核心系统
import { AutonomousAIEngine } from '@/packages/autonomous-engine/src/core/AutonomousAIEngine';
import { ModelAdapter } from '@/packages/model-adapter/src/ModelAdapter';
import { LearningSystem } from '@/packages/learning-system/src/LearningSystem';
import { createFiveDimensionalManagement } from '@/packages/five-dimensional-management/src/index';

// ==================== 类型定义 ====================

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetState {
  isVisible: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  currentView: 'chat' | 'insights' | 'workflow' | 'knowledge' | 'analytics' | 'goals' | 'settings';
  mode: 'floating' | 'docked' | 'sidebar';
  position: WidgetPosition;
  isDragging: boolean;
  isResizing: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  soundEnabled: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error' | 'processing';
  metadata?: {
    model?: string;
    confidence?: number;
    tokens?: number;
    processingTime?: number;
    source?: 'chat' | 'workflow' | 'analytics' | 'knowledge';
    attachments?: MessageAttachment[];
    actions?: MessageAction[];
  };
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'data' | 'chart' | 'code' | 'file';
  name: string;
  url: string;
  size?: number;
  preview?: string;
}

export interface MessageAction {
  id: string;
  type: 'approve' | 'reject' | 'modify' | 'execute' | 'schedule' | 'delegate' | 'escalate';
  label: string;
  icon?: React.ReactNode;
  handler: () => void;
}

export interface EnterpriseAIWidgetProps {
  userId: string;
  organizationId: string;
  initialPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  mode?: 'floating' | 'docked' | 'sidebar';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  features?: {
    chat?: boolean;
    insights?: boolean;
    workflow?: boolean;
    knowledge?: boolean;
    analytics?: boolean;
    goals?: boolean;
    settings?: boolean;
  };
  integrations?: {
    autonomousEngine?: boolean;
    modelAdapter?: boolean;
    learningSystem?: boolean;
    fiveDimensionalManagement?: boolean;
  };
  onClose?: () => void;
  onMessage?: (message: Message) => void;
  onAction?: (action: string, data: any) => void;
  onError?: (error: Error) => void;
}

// ==================== Reducer for Complex State Management ====================

type WidgetAction =
  | { type: 'SET_VISIBILITY'; payload: boolean }
  | { type: 'SET_MINIMIZED'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_VIEW'; payload: WidgetState['currentView'] }
  | { type: 'SET_POSITION'; payload: Partial<WidgetPosition> }
  | { type: 'SET_THEME'; payload: WidgetState['theme'] }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'RESET_STATE' };

const widgetReducer = (state: WidgetState, action: WidgetAction): WidgetState => {
  switch (action.type) {
    case 'SET_VISIBILITY':
      return { ...state, isVisible: action.payload };
    case 'SET_MINIMIZED':
      return { ...state, isMinimized: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_POSITION':
      return { ...state, position: { ...state.position, ...action.payload } };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notifications: !state.notifications };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

const initialState: WidgetState = {
  isVisible: true,
  isMinimized: false,
  isFullscreen: false,
  currentView: 'chat',
  mode: 'floating',
  position: { x: 20, y: 20, width: 400, height: 600 },
  isDragging: false,
  isResizing: false,
  theme: 'auto',
  language: 'en',
  notifications: true,
  soundEnabled: true
};

// ==================== Enterprise AI Widget Component ====================

export const EnterpriseAIWidget: React.FC<EnterpriseAIWidgetProps> = ({
  userId,
  organizationId,
  initialPosition = 'bottom-right',
  mode = 'floating',
  theme = 'auto',
  language = 'en',
  features = {
    chat: true,
    insights: true,
    workflow: true,
    knowledge: true,
    analytics: true,
    goals: true,
    settings: true
  },
  integrations = {
    autonomousEngine: true,
    modelAdapter: true,
    learningSystem: true,
    fiveDimensionalManagement: true
  },
  onClose,
  onMessage,
  onAction,
  onError
}) => {
  // ==================== State Management ====================

  const [state, dispatch] = useReducer(widgetReducer, {
    ...initialState,
    mode,
    theme,
    language,
    position: getInitialPosition(initialPosition)
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    engine: 'online' as 'online' | 'offline' | 'loading',
    models: 'online' as 'online' | 'offline' | 'loading',
    learning: 'online' as 'online' | 'offline' | 'loading',
    management: 'online' as 'online' | 'offline' | 'loading'
  });

  // ==================== Refs ====================

  const widgetRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // ==================== Core Systems Initialization ====================

  const coreSystems = useMemo(() => {
    const systems: any = {};

    if (integrations.autonomousEngine) {
      systems.engine = new AutonomousAIEngine({
        userId,
        organizationId,
        capabilities: ['reasoning', 'planning', 'execution', 'learning']
      });
    }

    if (integrations.modelAdapter) {
      systems.adapter = new ModelAdapter({
        defaultModel: 'gpt-4',
        fallbackModels: ['claude-3', 'gemini-pro'],
        optimizationEnabled: true
      });
    }

    if (integrations.learningSystem) {
      systems.learning = new LearningSystem({
        userId,
        learningRate: 0.01,
        memoryLimit: 10000
      });
    }

    if (integrations.fiveDimensionalManagement) {
      systems.management = createFiveDimensionalManagement();
    }

    return systems;
  }, [userId, organizationId, integrations]);

  // ==================== Effects ====================

  useEffect(() => {
    initializeCoreSystems();
    return () => {
      cleanupCoreSystems();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleGlobalEvents = (event: any) => {
      if (event.key === 'Escape' && state.isVisible) {
        dispatch({ type: 'SET_VISIBILITY', payload: false });
      }
    };

    document.addEventListener('keydown', handleGlobalEvents);
    return () => document.removeEventListener('keydown', handleGlobalEvents);
  }, [state.isVisible]);

  // ==================== Core Systems Management ====================

  const initializeCoreSystems = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, engine: 'loading' }));

      if (coreSystems.engine) {
        await coreSystems.engine.initialize();
      }

      if (coreSystems.adapter) {
        await coreSystems.adapter.initialize();
      }

      if (coreSystems.learning) {
        await coreSystems.learning.start();
      }

      if (coreSystems.management) {
        await coreSystems.management.initialize();
        await coreSystems.management.start();
      }

      setSystemStatus({
        engine: 'online',
        models: 'online',
        learning: 'online',
        management: 'online'
      });

      // Add welcome message
      addSystemMessage('Enterprise AI Assistant initialized successfully. All systems operational.');

    } catch (error) {
      console.error('Failed to initialize core systems:', error);
      setSystemStatus({
        engine: 'offline',
        models: 'offline',
        learning: 'offline',
        management: 'offline'
      });

      addSystemMessage('System initialization failed. Please check your configuration.', 'error');
      onError?.(error as Error);
    }
  };

  const cleanupCoreSystems = async () => {
    try {
      if (coreSystems.engine) {
        await coreSystems.engine.shutdown();
      }
      if (coreSystems.adapter) {
        await coreSystems.adapter.shutdown();
      }
      if (coreSystems.learning) {
        await coreSystems.learning.stop();
      }
      if (coreSystems.management) {
        await coreSystems.management.shutdown();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // ==================== Message Management ====================

  const addSystemMessage = (content: string, type: 'info' | 'error' | 'success' = 'info') => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'system',
      content,
      timestamp: Date.now(),
      status: 'sent',
      metadata: {
        source: 'system',
        confidence: type === 'error' ? 0 : 1
      }
    };

    setMessages(prev => [...prev, message]);
    onMessage?.(message);
  };

  const sendMessage = async (content: string, options?: any) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      status: 'sent',
      metadata: {
        source: 'chat'
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Process message through autonomous engine
      let response: string;

      if (coreSystems.engine) {
        const result = await coreSystems.engine.processMessage(content, {
          userId,
          context: getLastNMessages(5),
          capabilities: getAvailableCapabilities()
        });
        response = result.response;
      } else {
        response = "AI Engine is not available. Please check system configuration.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        status: 'sent',
        metadata: {
          source: 'chat',
          model: coreSystems.adapter?.getCurrentModel() || 'unknown',
          confidence: 0.85,
          processingTime: Date.now() - userMessage.timestamp
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      onMessage?.(assistantMessage);

      // Learn from interaction
      if (coreSystems.learning) {
        await coreSystems.learning.recordInteraction(userMessage, assistantMessage);
      }

    } catch (error) {
      console.error('Error processing message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: Date.now(),
        status: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      onError?.(error as Error);
    } finally {
      setIsTyping(false);
    }
  };

  const getLastNMessages = (n: number): Message[] => {
    return messages.slice(-n);
  };

  const getAvailableCapabilities = () => {
    const capabilities = [];
    if (coreSystems.engine) capabilities.push('reasoning', 'planning');
    if (coreSystems.adapter) capabilities.push('multimodel');
    if (coreSystems.learning) capabilities.push('learning', 'memory');
    if (coreSystems.management) capabilities.push('analytics', 'goals', 'insights');
    return capabilities;
  };

  // ==================== UI Interactions ====================

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (state.mode !== 'floating') return;

    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };

    dispatch({ type: 'SET_POSITION', payload: { isDragging: true } as any });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!state.isDragging || !dragStartRef.current) return;

    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;

    dispatch({
      type: 'SET_POSITION',
      payload: { x: Math.max(0, newX), y: Math.max(0, newY) }
    });
  };

  const handleDragEnd = () => {
    dispatch({ type: 'SET_POSITION', payload: { isDragging: false } as any });
    dragStartRef.current = null;
  };

  // ==================== Render Helper Functions ====================

  const getInitialPosition = (position: string): WidgetPosition => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const width = 400;
    const height = 600;

    switch (position) {
      case 'bottom-right':
        return { x: screenWidth - width - 20, y: screenHeight - height - 20, width, height };
      case 'bottom-left':
        return { x: 20, y: screenHeight - height - 20, width, height };
      case 'top-right':
        return { x: screenWidth - width - 20, y: 20, width, height };
      case 'top-left':
        return { x: 20, y: 20, width, height };
      case 'center':
        return {
          x: (screenWidth - width) / 2,
          y: (screenHeight - height) / 2,
          width,
          height
        };
      default:
        return { x: screenWidth - width - 20, y: screenHeight - height - 20, width, height };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'loading': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'offline': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // ==================== Main Render ====================

  if (!state.isVisible) return null;

  return (
    <div className="enterprise-ai-widget fixed inset-0 pointer-events-none z-50">
      <div
        ref={widgetRef}
        className={`
          absolute bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-out pointer-events-auto
          ${state.isFullscreen ? 'inset-0 rounded-none' : ''}
          ${state.isMinimized ? 'h-14' : ''}
          ${state.isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        style={{
          left: state.isFullscreen ? 0 : state.position.x,
          top: state.isFullscreen ? 0 : state.position.y,
          width: state.isFullscreen ? '100%' : state.position.width,
          height: state.isFullscreen ? '100%' : state.position.height
        }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl cursor-grab"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">Enterprise AI Assistant</h3>
              <div className="flex items-center gap-2 text-xs opacity-90">
                {Object.entries(systemStatus).map(([key, status]) => (
                  <div key={key} className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            {state.notifications && (
              <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            )}

            {/* View Selector */}
            {!state.isMinimized && (
              <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                {features.chat && (
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'chat' })}
                    className={`p-1 rounded ${state.currentView === 'chat' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  >
                    <MessageSquare className="w-3 h-3" />
                  </button>
                )}
                {features.insights && (
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'insights' })}
                    className={`p-1 rounded ${state.currentView === 'insights' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  >
                    <BarChart3 className="w-3 h-3" />
                  </button>
                )}
                {features.analytics && (
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'analytics' })}
                    className={`p-1 rounded ${state.currentView === 'analytics' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                  </button>
                )}
                {features.goals && (
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'goals' })}
                    className={`p-1 rounded ${state.currentView === 'goals' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  >
                    <Target className="w-3 h-3" />
                  </button>
                )}
                {features.settings && (
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'settings' })}
                    className={`p-1 rounded ${state.currentView === 'settings' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch({ type: 'SET_MINIMIZED', payload: !state.isMinimized })}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              {!state.isMinimized && (
                <button
                  onClick={() => dispatch({ type: 'SET_FULLSCREEN', payload: !state.isFullscreen })}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {state.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {!state.isMinimized && (
          <div className="flex flex-col h-full">
            {/* View Content */}
            <div className="flex-1 overflow-hidden">
              {state.currentView === 'chat' && features.chat && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div
                    ref={messageContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isTyping && (
                      <div className="flex gap-2 items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          AI is thinking...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isTyping}
                      />
                      <button
                        onClick={() => sendMessage(inputValue)}
                        disabled={isTyping || !inputValue.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {state.currentView === 'insights' && features.insights && (
                <InsightsView coreSystems={coreSystems} />
              )}

              {state.currentView === 'analytics' && features.analytics && (
                <AnalyticsView coreSystems={coreSystems} />
              )}

              {state.currentView === 'goals' && features.goals && (
                <GoalsView coreSystems={coreSystems} />
              )}

              {state.currentView === 'settings' && features.settings && (
                <SettingsView
                  state={state}
                  dispatch={dispatch}
                  coreSystems={coreSystems}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== Sub-Components ====================

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={`
        flex gap-2 max-w-[80%]
        ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}
        ${isSystem ? 'mx-auto' : ''}
      `}
    >
      <div
        className={`
          px-4 py-2 rounded-lg text-sm
          ${isUser ? 'bg-blue-500 text-white' : ''}
          ${isSystem ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' : ''}
          ${!isUser && !isSystem ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' : ''}
        `}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {message.metadata && (
          <div className="mt-2 text-xs opacity-70 space-y-1">
            {message.metadata.model && (
              <div>Model: {message.metadata.model}</div>
            )}
            {message.metadata.confidence && (
              <div>Confidence: {Math.round(message.metadata.confidence * 100)}%</div>
            )}
            {message.metadata.processingTime && (
              <div>Time: {message.metadata.processingTime}ms</div>
            )}
          </div>
        )}

        <div className="mt-1 text-xs opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const InsightsView: React.FC<{ coreSystems: any }> = ({ coreSystems }) => (
  <div className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <Lightbulb className="w-5 h-5 text-yellow-500" />
      <h3 className="text-lg font-semibold">AI Insights</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium mb-2">System Performance</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>AI Engine:</span>
            <span className="text-green-600">Optimal</span>
          </div>
          <div className="flex justify-between">
            <span>Response Time:</span>
            <span>245ms</span>
          </div>
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span>94.2%</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h4 className="font-medium mb-2">Learning Progress</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Interactions:</span>
            <span>1,247</span>
          </div>
          <div className="flex justify-between">
            <span>Learned Patterns:</span>
            <span>89</span>
          </div>
          <div className="flex justify-between">
            <span>Improvement Rate:</span>
            <span>+12.3%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsView: React.FC<{ coreSystems: any }> = ({ coreSystems }) => (
  <div className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <BarChart3 className="w-5 h-5 text-purple-500" />
      <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">98.5%</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
      </div>
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="text-2xl font-bold text-green-600">1.2K</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Daily Users</div>
      </div>
      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">4.7</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
      </div>
      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">89ms</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
      </div>
    </div>

    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="font-medium mb-4">Recent Activity</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>All systems operational</span>
          <span className="text-gray-500 text-xs ml-auto">2 min ago</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>New learning patterns detected</span>
          <span className="text-gray-500 text-xs ml-auto">15 min ago</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Model optimization completed</span>
          <span className="text-gray-500 text-xs ml-auto">1 hour ago</span>
        </div>
      </div>
    </div>
  </div>
);

const GoalsView: React.FC<{ coreSystems: any }> = ({ coreSystems }) => (
  <div className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <Target className="w-5 h-5 text-red-500" />
      <h3 className="text-lg font-semibold">Goals & Objectives</h3>
    </div>

    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Increase Customer Satisfaction</h4>
          <span className="text-sm text-green-600">78%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Target: 90% by end of Q4
        </p>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Reduce Response Time</h4>
          <span className="text-sm text-blue-600">92%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Target: &lt;200ms average response
        </p>
      </div>
    </div>
  </div>
);

const SettingsView: React.FC<{
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
  coreSystems: any;
}> = ({ state, dispatch, coreSystems }) => (
  <div className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <Settings className="w-5 h-5 text-gray-500" />
      <h3 className="text-lg font-semibold">Settings</h3>
    </div>

    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Appearance</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Theme</span>
            <select
              value={state.theme}
              onChange={(e) => dispatch({ type: 'SET_THEME', payload: e.target.value as any })}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Notifications</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Enable notifications</span>
            <input
              type="checkbox"
              checked={state.notifications}
              onChange={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS' })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span>Sound effects</span>
            <input
              type="checkbox"
              checked={state.soundEnabled}
              onChange={() => dispatch({ type: 'TOGGLE_SOUND' })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">System Information</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>Version: 2.0.0</div>
          <div>User ID: {typeof window !== 'undefined' ? window.location?.pathname?.split('/')?.[1] || 'unknown' : 'unknown'}</div>
          <div>Systems: {Object.keys(coreSystems).length} active</div>
        </div>
      </div>
    </div>
  </div>
);

export default EnterpriseAIWidget;