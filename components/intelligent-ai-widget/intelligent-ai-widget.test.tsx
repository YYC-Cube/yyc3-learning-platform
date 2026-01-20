/**
 * @fileoverview IntelligentAIWidget组件单元测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-28
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntelligentAIWidget } from './intelligent-ai-widget';

describe('IntelligentAIWidget', () => {
  const mockUserId = 'test-user-123';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初始渲染', () => {
    it('应该正确渲染组件', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      expect(screen.getByTestId('intelligent-ai-widget')).toBeInTheDocument();
    });

    it('应该显示标题栏', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      expect(screen.getByText('YYC³ 智能助手')).toBeInTheDocument();
    });

    it('应该显示初始消息', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      expect(screen.getByText('你好！我是YYC³智能助手，有什么可以帮助你的吗？')).toBeInTheDocument();
    });

    it('应该显示所有导航标签', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      expect(screen.getByText('对话')).toBeInTheDocument();
      expect(screen.getByText('工具')).toBeInTheDocument();
      expect(screen.getByText('洞察')).toBeInTheDocument();
      expect(screen.getByText('工作流')).toBeInTheDocument();
      expect(screen.getByText('知识库')).toBeInTheDocument();
    });
  });

  describe('消息发送', () => {
    it('应该能够发送消息', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      fireEvent.change(input, { target: { value: '测试消息' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('测试消息')).toBeInTheDocument();
      });
    });

    it('应该禁用空消息发送', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const sendButton = screen.getByTestId('send-message-button');
      
      expect(sendButton).toBeDisabled();
    });

    it('发送时应该显示加载状态', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      fireEvent.change(input, { target: { value: '测试消息' } });
      fireEvent.click(sendButton);
      
      expect(sendButton).toBeDisabled();
    });
  });

  describe('视图切换', () => {
    it('应该能够切换到工具视图', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const toolsTab = screen.getByText('工具');
      fireEvent.click(toolsTab);
      
      expect(screen.getByText('可用工具')).toBeInTheDocument();
    });

    it('应该能够切换到洞察视图', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const insightsTab = screen.getByText('洞察');
      fireEvent.click(insightsTab);
      
      expect(screen.getByText('使用洞察')).toBeInTheDocument();
    });

    it('应该能够切换到工作流视图', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const workflowTab = screen.getByText('工作流');
      fireEvent.click(workflowTab);
      
      expect(screen.getByText('工作流管理')).toBeInTheDocument();
    });

    it('应该能够切换到知识库视图', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const knowledgeTab = screen.getByText('知识库');
      fireEvent.click(knowledgeTab);
      
      expect(screen.getByText('知识库')).toBeInTheDocument();
    });
  });

  describe('窗口控制', () => {
    it('应该能够最小化窗口', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const minimizeButton = screen.getByLabelText('最小化');
      fireEvent.click(minimizeButton);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      expect(widget).toHaveClass('h-14');
    });

    it('应该能够全屏显示', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const fullscreenButton = screen.getByLabelText('全屏');
      fireEvent.click(fullscreenButton);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      expect(widget).toHaveClass('inset-4');
    });

    it('应该能够关闭窗口', () => {
      render(<IntelligentAIWidget userId={mockUserId} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('关闭');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('键盘快捷键', () => {
    it('应该响应Ctrl+K快捷键', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      expect(widget).toBeInTheDocument();
      
      fireEvent.keyDown(document, { ctrlKey: true, key: 'k' });
      
      expect(widget).not.toBeInTheDocument();
    });
  });

  describe('拖拽功能', () => {
    it('应该能够拖拽窗口', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      const initialPosition = { x: widget.style.left, y: widget.style.top };
      
      fireEvent.mouseDown(widget);
      fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
      fireEvent.mouseUp(document);
      
      expect(widget.style.left).not.toBe(initialPosition.x);
      expect(widget.style.top).not.toBe(initialPosition.y);
    });

    it('全屏时应该禁用拖拽', () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const fullscreenButton = screen.getByLabelText('全屏');
      fireEvent.click(fullscreenButton);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      fireEvent.mouseDown(widget);
      
      expect(widget.style.left).toBe('');
      expect(widget.style.top).toBe('');
    });
  });

  describe('响应式布局', () => {
    it('应该在移动设备上正确显示', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      expect(widget).toBeInTheDocument();
    });

    it('应该在桌面设备上正确显示', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      expect(widget).toBeInTheDocument();
    });
  });
});
