import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTheme } from '../contexts/ThemeContext';
import { PositionOptimizer, WidgetPosition } from '../systems/PositionOptimizer';
import { createLogger } from '../lib/logger';

const logger = createLogger('IntelligentAIWidget');
// ModelAdapter相关配置接口
interface ModelAdapterConfig {
  openAIModel: string;
  openAIKey: string;
  maxTokens?: number;
  temperature?: number;
}

// 为AgenticCore定义类型
interface AgenticCore {
  on(event: string, callback: (data: any) => void): void;
  processInput(input: any): Promise<any>;
  getSystemStatus(): any;
}

// 定义Agent配置接口
interface AgentConfig {
  maxConcurrentTasks: number;
  maxQueueSize: number;
  defaultTimeout: number;
  enableLearning: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  modelAdapterConfig?: ModelAdapterConfig;
}

// 定义组件状态接口
export interface WidgetState {
  id: string;
  isDragging: boolean;
  isResizing: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  view: 'chat' | 'settings' | 'about';
  position: WidgetPosition;
}

// 定义组件属性接口
interface IntelligentAIWidgetProps {
  id?: string;
  initialPosition?: string | WidgetPosition;
  initialView?: WidgetState['view'];
  userId?: string;
  agentConfig?: Partial<AgentConfig>;
  modelAdapterConfig?: ModelAdapterConfig;
}

export const IntelligentAIWidget: React.FC<IntelligentAIWidgetProps> = ({
  id = `widget-${Date.now()}`,
  initialPosition = 'bottom-right',
  initialView = 'chat',
  userId,
  agentConfig,
  modelAdapterConfig
}) => {
  const { theme } = useTheme();
  
  // 确定初始位置
  const getInitialPositionValue = () => {
    const optimizer = new PositionOptimizer();
    if (typeof initialPosition === 'string') {
      return optimizer.getInitialPosition(initialPosition);
    }
    // 如果是对象，确保它符合WidgetPosition接口
    return {
      ...optimizer.getInitialPosition('bottom-right'),
      ...initialPosition
    };
  };
  
  const [state, setState] = useState<WidgetState>({
    id,
    isDragging: false,
    isResizing: false,
    isMaximized: false,
    isMinimized: false,
    view: initialView,
    position: getInitialPositionValue()
  });

  const widgetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [agenticCore, setAgenticCore] = useState<AgenticCore | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean; timestamp: Date }>>([]);
  const [inputText, setInputText] = useState('');
  
  // 配置状态管理
  const [currentConfig, setCurrentConfig] = useState<ModelAdapterConfig>({
    openAIModel: modelAdapterConfig?.openAIModel || 'gpt-3.5-turbo',
    openAIKey: modelAdapterConfig?.openAIKey || '',
    maxTokens: modelAdapterConfig?.maxTokens || 8192,
    temperature: modelAdapterConfig?.temperature || 0.7
  });
  
  const [isConfigChanged, setIsConfigChanged] = useState(false);

  // 初始化AgenticCore
  useEffect(() => {
    // 加载保存的配置（如果有）
    const savedConfig = userId ? localStorage.getItem(`yyc3-config-${userId}`) : null;
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig) as ModelAdapterConfig;
        setCurrentConfig(parsedConfig);
        initializeAgenticCore(parsedConfig);
        return;
      } catch (error) {
        logger.error('解析保存的配置失败', error);
      }
    }
    
    // 使用默认配置初始化
    initializeAgenticCore({
      openAIModel: modelAdapterConfig?.openAIModel || 'gpt-3.5-turbo',
      openAIKey: modelAdapterConfig?.openAIKey || '',
      maxTokens: modelAdapterConfig?.maxTokens || 8192,
      temperature: modelAdapterConfig?.temperature || 0.7
    });

    return () => {
      // AgenticCore实例不需要手动销毁
    };
  }, [agentConfig, modelAdapterConfig, userId]);

  // 加载用户位置偏好
  useEffect(() => {
    if (userId) {
      const optimizer = new PositionOptimizer();
      optimizer.loadUserPreference(userId).then(savedPosition => {
        if (savedPosition) {
          setState(prev => ({ ...prev, position: savedPosition }));
        }
      });
    }
  }, [userId]);

  // 保存用户位置偏好
  useEffect(() => {
    if (userId && !state.isDragging && !state.isResizing) {
      const optimizer = new PositionOptimizer();
      optimizer.savePreference(userId, state.position);
    }
  }, [userId, state.position, state.isDragging, state.isResizing]);

  // 拖拽功能实现
  const [, drag] = useDrag({
    type: 'AI_WIDGET',
    item: { id: state.id, type: 'AI_WIDGET' },
    end: () => {
      setState(prev => ({ ...prev, isDragging: false }));
    }
  });

  const [, drop] = useDrop({
    accept: 'AI_WIDGET',
    drop: () => ({ id: state.id })
  });

  // 应用拖拽
  useEffect(() => {
    if (handleRef.current) {
      drag(handleRef.current);
    }
    if (widgetRef.current) {
      drop(widgetRef.current);
    }
  }, [drag, drop]);

  // 拖拽位置处理
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...state.position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setState(prev => ({
        ...prev,
        isDragging: true,
        position: {
          ...prev.position,
          x: startPosition.x + deltaX,
          y: startPosition.y + deltaY
        }
      }));
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, isDragging: false }));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 调整大小处理
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = state.position.width;
    const startHeight = state.position.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      setState(prev => ({
        ...prev,
        isResizing: true,
        position: {
          ...prev.position,
          width: startWidth + deltaX,
          height: startHeight + deltaY
        }
      }));
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, isResizing: false }));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 切换最大化/最小化
  const toggleMaximize = () => {
    setState(prev => ({ ...prev, isMaximized: !prev.isMaximized }));
  };

  const toggleMinimize = () => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  // 切换视图
  const switchView = (view: WidgetState['view']) => {
    setState(prev => ({ ...prev, view }));
  };

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      // 保存配置到本地存储（可选）
      if (userId) {
        localStorage.setItem(`yyc3-config-${userId}`, JSON.stringify(currentConfig));
      }
      
      // 重新初始化AgenticCore以应用新配置
      await initializeAgenticCore(currentConfig);
      
      setIsConfigChanged(false);
      
      // 显示保存成功消息
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        text: '配置已保存并应用',
        isUser: false,
        timestamp: new Date()
      }]);
      
      // 切换回聊天视图
      switchView('chat');
    } catch (error) {
      logger.error('保存配置失败', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: `保存配置失败: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  };
  
  // 初始化AgenticCore
  const initializeAgenticCore = async (config: ModelAdapterConfig) => {
    try {
      // 使用动态导入，避免构建时依赖问题
      const module = await import('@yyc3/autonomous-engine');
      const AgenticCore = module.AgenticCore;
      
      // 合并配置
      const agentConfig = {
        ...(agenticCore ? agenticCore.getSystemStatus() : {}),
        modelAdapterConfig: config
      };
      
      // 创建新的AgenticCore实例
      const core = new AgenticCore(agentConfig || {});
      setAgenticCore(core);

      // 设置事件监听器
      core.on('task:completed', (task: any) => {
        setMessages(prev => [...prev, {
          id: `task-${Date.now()}`,
          text: `任务完成: ${task.id} - ${task.result?.message || '任务已完成'}`,
          isUser: false,
          timestamp: new Date()
        }]);
      });

      core.on('task:failed', (task: any, error: any) => {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          text: `任务失败: ${task.id} - ${error.message || '未知错误'}`,
          isUser: false,
          timestamp: new Date()
        }]);
      });

      core.on('model-request-start', (_request: any) => {
      });

      core.on('model-request-completed', (_response: any) => {
      });

      core.on('model-request-error', (error: any) => {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          text: `AI模型错误: ${error.message || '未知错误'}`,
          isUser: false,
          timestamp: new Date()
        }]);
      });
    } catch (error) {
      logger.error('初始化AgenticCore失败', error);
      throw error;
    }
  };
  
  // 发送消息
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !agenticCore) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 使用AgenticCore处理消息
    agenticCore.processInput({
      text: inputText,
      context: {
        sessionId: id,
        userId: userId || 'anonymous',
        environment: 'web',
        permissions: ['read', 'write'],
        conversationHistory: messages.map(msg => ({
          id: msg.id,
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
          timestamp: msg.timestamp.getTime()
        })),
        workingMemory: {}
      }
    }).then((result: any) => {
      setMessages(prev => [...prev, {
        id: `agent-${Date.now()}`,
        text: result.message || '任务已启动',
        isUser: false,
        timestamp: new Date()
      }]);
    }).catch((error: Error) => {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: `处理消息时出错: ${error.message}`,
        isUser: false,
        timestamp: new Date()
      }]);
    });
  };

  // 计算组件样式
  const getWidgetStyle = (): React.CSSProperties => {
    if (state.isMaximized) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: state.position.zIndex + 1,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 0,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease'
      };
    }

    if (state.isMinimized) {
      return {
        position: 'fixed',
        left: state.position.x,
        bottom: 0,
        width: state.position.width,
        height: '50px',
        zIndex: state.position.zIndex,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      };
    }

    return {
      position: 'fixed',
      left: `${state.position.x}px`,
      top: `${state.position.y}px`,
      width: `${state.position.width}px`,
      height: `${state.position.height}px`,
      zIndex: state.isDragging || state.isResizing ? state.position.zIndex + 1 : state.position.zIndex,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      boxShadow: state.isDragging ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      transform: state.isDragging ? 'rotate(2deg)' : 'rotate(0deg)',
      transition: 'all 0.2s ease'
    };
  };

  // 渲染不同视图
  const renderView = () => {
    switch (state.view) {
      case 'settings':
        return (
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <h2>设置</h2>
            <div style={{ marginTop: '16px' }}>
              <h3>主题设置</h3>
              <p>当前主题: {theme.mode}</p>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3>位置设置</h3>
              <p>可以拖拽窗口改变位置</p>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3>AI模型设置</h3>
              <p>配置OpenAI API以启用智能功能</p>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>OpenAI API密钥:</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={currentConfig.openAIKey}
                  onChange={(e) => {
                    setCurrentConfig(prev => ({ ...prev, openAIKey: e.target.value }));
                    setIsConfigChanged(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.hover,
                    color: theme.colors.text
                  }}
                />
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>模型名称:</label>
                <select
                  value={currentConfig.openAIModel}
                  onChange={(e) => {
                    setCurrentConfig(prev => ({ ...prev, openAIModel: e.target.value }));
                    setIsConfigChanged(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.hover,
                    color: theme.colors.text
                  }}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                </select>
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>最大令牌数:</label>
                <input
                  type="number"
                  placeholder="8192"
                  value={currentConfig.maxTokens}
                  onChange={(e) => {
                    setCurrentConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 8192 }));
                    setIsConfigChanged(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.hover,
                    color: theme.colors.text
                  }}
                />
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>温度系数:</label>
                <input
                  type="number"
                  placeholder="0.7"
                  step="0.1"
                  min="0"
                  max="2"
                  value={currentConfig.temperature}
                  onChange={(e) => {
                    setCurrentConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }));
                    setIsConfigChanged(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.hover,
                    color: theme.colors.text
                  }}
                />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => {
                    // 重置配置为初始状态
                    setCurrentConfig({
                      openAIModel: modelAdapterConfig?.openAIModel || 'gpt-3.5-turbo',
                      openAIKey: modelAdapterConfig?.openAIKey || '',
                      maxTokens: modelAdapterConfig?.maxTokens || 8192,
                      temperature: modelAdapterConfig?.temperature || 0.7
                    });
                    setIsConfigChanged(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: 'transparent',
                    color: theme.colors.text,
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={!isConfigChanged}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: isConfigChanged ? theme.colors.accent : theme.colors.hover,
                    color: isConfigChanged ? '#ffffff' : theme.colors.text,
                    cursor: isConfigChanged ? 'pointer' : 'not-allowed',
                    opacity: isConfigChanged ? 1 : 0.7
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <h2>关于</h2>
            <p>YYC³可插拔式拖拽移动AI系统</p>
            <p>版本: 1.0.0</p>
            <p>基于五标五高五化设计理念</p>
          </div>
        );
      case 'chat':
      default:
        return (
          <>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map(message => (
                <div 
                  key={message.id}
                  style={{
                    alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: message.isUser ? theme.colors.accent : theme.colors.hover,
                    color: message.isUser ? '#ffffff' : theme.colors.text
                  }}
                >
                  <div>{message.text}</div>
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} style={{
              padding: '16px',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入消息..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '20px',
                  backgroundColor: theme.colors.hover,
                  color: theme.colors.text,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 20px',
                  backgroundColor: theme.colors.accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                发送
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <div
      ref={widgetRef}
      style={getWidgetStyle()}
    >
      {/* 标题栏 */}
      <div
        ref={handleRef}
        style={{
          padding: '12px 16px',
          borderBottom: state.isMinimized ? 'none' : `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'move',
          backgroundColor: state.isMinimized ? theme.colors.hover : 'transparent'
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: theme.colors.accent
          }} />
          <span style={{ fontWeight: 'bold' }}>YYC³ AI</span>
        </div>

        {!state.isMinimized && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 视图切换按钮 */}
            <button
              onClick={() => switchView('chat')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: state.view === 'chat' ? theme.colors.accent : 'transparent',
                color: state.view === 'chat' ? '#ffffff' : theme.colors.text,
                cursor: 'pointer'
              }}
            >
              聊天
            </button>
            <button
              onClick={() => switchView('settings')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: state.view === 'settings' ? theme.colors.accent : 'transparent',
                color: state.view === 'settings' ? '#ffffff' : theme.colors.text,
                cursor: 'pointer'
              }}
            >
              设置
            </button>

            {/* 操作按钮 */}
            <button
              onClick={toggleMinimize}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme.colors.text,
                cursor: 'pointer'
              }}
            >
              _
            </button>
            <button
              onClick={toggleMaximize}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme.colors.text,
                cursor: 'pointer'
              }}
            >
              □
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      {!state.isMinimized && renderView()}

      {/* 调整大小手柄 */}
      {!state.isMaximized && !state.isMinimized && (
        <div
          ref={resizeRef}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onMouseDown={handleResizeMouseDown}
        >
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: theme.colors.secondary,
            borderRadius: '2px',
            transform: 'rotate(45deg)'
          }} />
        </div>
      )}
    </div>
  );
};
