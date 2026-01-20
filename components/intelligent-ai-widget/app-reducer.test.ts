/**
 * @fileoverview appReducer单元测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-28
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import { appReducer, initialState, AppState, AppAction } from './intelligent-ai-widget';

describe('appReducer', () => {
  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      const state = appReducer(undefined, { type: 'INIT' } as any);
      
      expect(state).toEqual(initialState);
    });

    it('应该包含widget状态', () => {
      const state = appReducer(undefined, { type: 'INIT' } as any);
      
      expect(state.widget).toBeDefined();
      expect(state.widget.isVisible).toBe(true);
      expect(state.widget.isMinimized).toBe(false);
      expect(state.widget.isFullscreen).toBe(false);
      expect(state.widget.currentView).toBe('chat');
      expect(state.widget.mode).toBe('floating');
    });

    it('应该包含messages状态', () => {
      const state = appReducer(undefined, { type: 'INIT' } as any);
      
      expect(state.messages).toBeDefined();
      expect(state.messages.length).toBe(1);
      expect(state.messages[0].role).toBe('assistant');
    });

    it('应该包含inputValue状态', () => {
      const state = appReducer(undefined, { type: 'INIT' } as any);
      
      expect(state.inputValue).toBeDefined();
      expect(state.inputValue).toBe('');
    });

    it('应该包含isProcessing状态', () => {
      const state = appReducer(undefined, { type: 'INIT' } as any);
      
      expect(state.isProcessing).toBeDefined();
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('SET_WIDGET_STATE', () => {
    it('应该更新widget状态', () => {
      const action: AppAction = {
        type: 'SET_WIDGET_STATE',
        payload: { isVisible: false }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.widget.isVisible).toBe(false);
      expect(state.messages).toEqual(initialState.messages);
      expect(state.inputValue).toEqual(initialState.inputValue);
      expect(state.isProcessing).toEqual(initialState.isProcessing);
    });

    it('应该合并多个widget属性', () => {
      const action: AppAction = {
        type: 'SET_WIDGET_STATE',
        payload: {
          isVisible: false,
          isMinimized: true,
          currentView: 'tools' as const
        }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.widget.isVisible).toBe(false);
      expect(state.widget.isMinimized).toBe(true);
      expect(state.widget.currentView).toBe('tools');
    });

    it('应该更新position', () => {
      const newPosition = { x: 100, y: 200, width: 400, height: 600 };
      const action: AppAction = {
        type: 'SET_WIDGET_STATE',
        payload: { position: newPosition }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.widget.position).toEqual(newPosition);
    });

    it('应该更新isDragging', () => {
      const action: AppAction = {
        type: 'SET_WIDGET_STATE',
        payload: { isDragging: true }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.widget.isDragging).toBe(true);
    });
  });

  describe('SET_MESSAGES', () => {
    it('应该替换所有消息', () => {
      const newMessages = [
        { id: '1', role: 'user' as const, content: '消息1', timestamp: Date.now() },
        { id: '2', role: 'assistant' as const, content: '消息2', timestamp: Date.now() }
      ];
      const action: AppAction = {
        type: 'SET_MESSAGES',
        payload: newMessages
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages).toEqual(newMessages);
      expect(state.messages.length).toBe(2);
    });

    it('应该处理空消息数组', () => {
      const action: AppAction = {
        type: 'SET_MESSAGES',
        payload: []
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages).toEqual([]);
      expect(state.messages.length).toBe(0);
    });
  });

  describe('ADD_MESSAGE', () => {
    it('应该添加新消息到末尾', () => {
      const newMessage = { id: 'new', role: 'user' as const, content: '新消息', timestamp: Date.now() };
      const action: AppAction = {
        type: 'ADD_MESSAGE',
        payload: newMessage
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages.length).toBe(initialState.messages.length + 1);
      expect(state.messages[state.messages.length - 1]).toEqual(newMessage);
    });

    it('应该保留原有消息', () => {
      const newMessage = { id: 'new', role: 'user' as const, content: '新消息', timestamp: Date.now() };
      const action: AppAction = {
        type: 'ADD_MESSAGE',
        payload: newMessage
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages.slice(0, -1)).toEqual(initialState.messages);
    });

    it('应该处理多条消息添加', () => {
      const messagesToAdd = [
        { id: '1', role: 'user' as const, content: '消息1', timestamp: Date.now() },
        { id: '2', role: 'assistant' as const, content: '消息2', timestamp: Date.now() }
      ];
      
      let state = initialState;
      messagesToAdd.forEach(message => {
        const action: AppAction = { type: 'ADD_MESSAGE', payload: message };
        state = appReducer(state, action);
      });
      
      expect(state.messages.length).toBe(initialState.messages.length + messagesToAdd.length);
    });
  });

  describe('UPDATE_MESSAGE', () => {
    it('应该更新指定ID的消息', () => {
      const messageId = initialState.messages[0].id;
      const action: AppAction = {
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, updates: { status: 'sent' as const } }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages[0].status).toBe('sent');
    });

    it('应该合并更新内容', () => {
      const messageId = initialState.messages[0].id;
      const action: AppAction = {
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, updates: { status: 'sent' as const, content: '更新内容' } }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages[0].status).toBe('sent');
      expect(state.messages[0].content).toBe('更新内容');
    });

    it('应该不更新不存在的消息', () => {
      const action: AppAction = {
        type: 'UPDATE_MESSAGE',
        payload: { id: 'non-existent', updates: { status: 'sent' as const } }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.messages).toEqual(initialState.messages);
    });

    it('应该处理多个更新', () => {
      const messageId = initialState.messages[0].id;
      
      let state = initialState;
      state = appReducer(state, { type: 'UPDATE_MESSAGE', payload: { id: messageId, updates: { status: 'sending' } } });
      state = appReducer(state, { type: 'UPDATE_MESSAGE', payload: { id: messageId, updates: { status: 'sent' } } });
      
      expect(state.messages[0].status).toBe('sent');
    });
  });

  describe('SET_INPUT_VALUE', () => {
    it('应该更新inputValue', () => {
      const newValue = '新输入值';
      const action: AppAction = {
        type: 'SET_INPUT_VALUE',
        payload: newValue
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.inputValue).toBe(newValue);
    });

    it('应该处理空字符串', () => {
      const action: AppAction = {
        type: 'SET_INPUT_VALUE',
        payload: ''
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.inputValue).toBe('');
    });

    it('应该处理长文本', () => {
      const longText = 'A'.repeat(1000);
      const action: AppAction = {
        type: 'SET_INPUT_VALUE',
        payload: longText
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.inputValue).toBe(longText);
    });
  });

  describe('SET_PROCESSING', () => {
    it('应该设置isProcessing为true', () => {
      const action: AppAction = {
        type: 'SET_PROCESSING',
        payload: true
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.isProcessing).toBe(true);
    });

    it('应该设置isProcessing为false', () => {
      const action: AppAction = {
        type: 'SET_PROCESSING',
        payload: false
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.isProcessing).toBe(false);
    });

    it('应该不影响其他状态', () => {
      const action: AppAction = {
        type: 'SET_PROCESSING',
        payload: true
      };
      
      const state = appReducer(initialState, action);
      
      expect(state.widget).toEqual(initialState.widget);
      expect(state.messages).toEqual(initialState.messages);
      expect(state.inputValue).toEqual(initialState.inputValue);
    });
  });

  describe('RESET_INPUT', () => {
    it('应该重置inputValue为空字符串', () => {
      const modifiedState = {
        ...initialState,
        inputValue: '测试输入'
      };
      const action: AppAction = {
        type: 'RESET_INPUT'
      };
      
      const state = appReducer(modifiedState, action);
      
      expect(state.inputValue).toBe('');
    });

    it('应该不影响其他状态', () => {
      const modifiedState = {
        ...initialState,
        inputValue: '测试输入'
      };
      const action: AppAction = {
        type: 'RESET_INPUT'
      };
      
      const state = appReducer(modifiedState, action);
      
      expect(state.widget).toEqual(initialState.widget);
      expect(state.messages).toEqual(initialState.messages);
      expect(state.isProcessing).toEqual(initialState.isProcessing);
    });
  });

  describe('不可变性', () => {
    it('应该返回新的状态对象', () => {
      const action: AppAction = {
        type: 'SET_WIDGET_STATE',
        payload: { isVisible: false }
      };
      
      const state = appReducer(initialState, action);
      
      expect(state).not.toBe(initialState);
    });

    it('不应该修改原始状态', () => {
      const action: AppAction = {
        type: 'SET_WIDGET_STATE',
        payload: { isVisible: false }
      };
      
      const originalWidget = initialState.widget;
      appReducer(initialState, action);
      
      expect(initialState.widget).toEqual(originalWidget);
    });
  });

  describe('复杂场景', () => {
    it('应该处理消息发送流程', () => {
      let state = initialState;
      
      const userMessage = { id: '1', role: 'user' as const, content: '用户消息', timestamp: Date.now() };
      state = appReducer(state, { type: 'ADD_MESSAGE', payload: userMessage });
      
      const processingAction: AppAction = { type: 'SET_PROCESSING', payload: true };
      state = appReducer(state, processingAction);
      
      expect(state.isProcessing).toBe(true);
      expect(state.messages.length).toBe(2);
    });

    it('应该处理消息接收流程', () => {
      let state = initialState;
      
      const assistantMessage = { id: '2', role: 'assistant' as const, content: '助手回复', timestamp: Date.now() };
      state = appReducer(state, { type: 'ADD_MESSAGE', payload: assistantMessage });
      
      const processingAction: AppAction = { type: 'SET_PROCESSING', payload: false };
      state = appReducer(state, processingAction);
      
      const resetInputAction: AppAction = { type: 'RESET_INPUT' };
      state = appReducer(state, resetInputAction);
      
      expect(state.isProcessing).toBe(false);
      expect(state.inputValue).toBe('');
      expect(state.messages.length).toBe(2);
    });

    it('应该处理视图切换流程', () => {
      let state = initialState;
      
      state = appReducer(state, { type: 'SET_WIDGET_STATE', payload: { currentView: 'tools' as const } });
      expect(state.widget.currentView).toBe('tools');
      
      state = appReducer(state, { type: 'SET_WIDGET_STATE', payload: { currentView: 'insights' as const } });
      expect(state.widget.currentView).toBe('insights');
      
      state = appReducer(state, { type: 'SET_WIDGET_STATE', payload: { currentView: 'chat' as const } });
      expect(state.widget.currentView).toBe('chat');
    });
  });
});
