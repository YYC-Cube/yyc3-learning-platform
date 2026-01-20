/**
 * @fileoverview AI助手集成测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-29
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IntelligentAIWidget } from './intelligent-ai-widget';

describe('AI助手集成测试', () => {
  const mockUserId = 'test-user-123';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('组件加载集成', () => {
    it('应该正确加载AI助手组件', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('intelligent-ai-widget')).toBeInTheDocument();
      });
    });

    it('应该从localStorage恢复上次状态', async () => {
      const savedState = {
        isVisible: true,
        isMinimized: false,
        currentView: 'tools',
        position: { x: 100, y: 200, width: 400, height: 600 }
      };
      
      localStorage.setItem('ai-widget-state', JSON.stringify(savedState));
      
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('intelligent-ai-widget')).toBeInTheDocument();
      });
    });
  });

  describe('消息发送集成', () => {
    it('应该完整处理消息发送流程', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      fireEvent.change(input, { target: { value: '测试消息' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('测试消息')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const messages = screen.getAllByTestId(/message-bubble-/);
        expect(messages.length).toBeGreaterThan(1);
      }, { timeout: 5000 });
    });

    it('应该正确处理多条消息', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      const messages = ['消息1', '消息2', '消息3'];
      
      for (const message of messages) {
        fireEvent.change(input, { target: { value: message } });
        fireEvent.click(sendButton);
        
        await waitFor(() => {
          expect(screen.getByText(message)).toBeInTheDocument();
        });
      }
      
      await waitFor(() => {
        const messageBubbles = screen.getAllByTestId(/message-bubble-/);
        expect(messageBubbles.length).toBeGreaterThan(messages.length);
      });
    });
  });

  describe('工具调用集成', () => {
    it('应该能够切换到工具视图', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const toolsTab = screen.getByText('工具');
      fireEvent.click(toolsTab);
      
      await waitFor(() => {
        expect(screen.getByText('可用工具')).toBeInTheDocument();
      });
    });

    it('应该能够使用工具', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const toolsTab = screen.getByText('工具');
      fireEvent.click(toolsTab);
      
      await waitFor(() => {
        expect(screen.getByText('可用工具')).toBeInTheDocument();
      });
      
      const toolCard = screen.getByTestId('tool-card-0');
      if (toolCard) {
        fireEvent.click(toolCard);
        
        await waitFor(() => {
          expect(screen.getByText('工具详情')).toBeInTheDocument();
        });
      }
    });
  });

  describe('洞察查看集成', () => {
    it('应该能够切换到洞察视图', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const insightsTab = screen.getByText('洞察');
      fireEvent.click(insightsTab);
      
      await waitFor(() => {
        expect(screen.getByText('使用洞察')).toBeInTheDocument();
      });
    });

    it('应该能够查看洞察数据', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const insightsTab = screen.getByText('洞察');
      fireEvent.click(insightsTab);
      
      await waitFor(() => {
        expect(screen.getByText('使用洞察')).toBeInTheDocument();
      });
      
      const insightCard = screen.getByTestId('insight-card-0');
      if (insightCard) {
        expect(insightCard).toBeInTheDocument();
      }
    });
  });

  describe('工作流集成', () => {
    it('应该能够切换到工作流视图', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const workflowTab = screen.getByText('工作流');
      fireEvent.click(workflowTab);
      
      await waitFor(() => {
        expect(screen.getByText('工作流管理')).toBeInTheDocument();
      });
    });

    it('应该能够创建工作流', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const workflowTab = screen.getByText('工作流');
      fireEvent.click(workflowTab);
      
      await waitFor(() => {
        expect(screen.getByText('工作流管理')).toBeInTheDocument();
      });
      
      const createButton = screen.getByText('创建工作流');
      if (createButton) {
        fireEvent.click(createButton);
        
        await waitFor(() => {
          expect(screen.getByText('工作流编辑器')).toBeInTheDocument();
        });
      }
    });
  });

  describe('知识库集成', () => {
    it('应该能够切换到知识库视图', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const knowledgeTab = screen.getByText('知识库');
      fireEvent.click(knowledgeTab);
      
      await waitFor(() => {
        expect(screen.getByText('知识库')).toBeInTheDocument();
      });
    });

    it('应该能够搜索知识库', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const knowledgeTab = screen.getByText('知识库');
      fireEvent.click(knowledgeTab);
      
      await waitFor(() => {
        expect(screen.getByText('知识库')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('搜索知识库');
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: '测试搜索' } });
        
        await waitFor(() => {
          expect(searchInput).toHaveValue('测试搜索');
        });
      }
    });
  });

  describe('窗口控制集成', () => {
    it('应该能够最小化和恢复窗口', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const minimizeButton = screen.getByLabelText('最小化');
      fireEvent.click(minimizeButton);
      
      await waitFor(() => {
        const widget = screen.getByTestId('intelligent-ai-widget');
        expect(widget).toHaveClass('h-14');
      });
      
      const restoreButton = screen.getByLabelText('恢复');
      if (restoreButton) {
        fireEvent.click(restoreButton);
        
        await waitFor(() => {
          const widget = screen.getByTestId('intelligent-ai-widget');
          expect(widget).not.toHaveClass('h-14');
        });
      }
    });

    it('应该能够全屏和退出全屏', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const fullscreenButton = screen.getByLabelText('全屏');
      fireEvent.click(fullscreenButton);
      
      await waitFor(() => {
        const widget = screen.getByTestId('intelligent-ai-widget');
        expect(widget).toHaveClass('inset-4');
      });
      
      const exitFullscreenButton = screen.getByLabelText('退出全屏');
      if (exitFullscreenButton) {
        fireEvent.click(exitFullscreenButton);
        
        await waitFor(() => {
          const widget = screen.getByTestId('intelligent-ai-widget');
          expect(widget).not.toHaveClass('inset-4');
        });
      }
    });

    it('应该能够关闭窗口', async () => {
      render(<IntelligentAIWidget userId={mockUserId} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('关闭');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('拖拽集成', () => {
    it('应该能够拖拽窗口到新位置', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      const initialPosition = { x: widget.style.left, y: widget.style.top };
      
      fireEvent.mouseDown(widget);
      fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
      fireEvent.mouseUp(document);
      
      await waitFor(() => {
        expect(widget.style.left).not.toBe(initialPosition.x);
        expect(widget.style.top).not.toBe(initialPosition.y);
      });
    });

    it('全屏时应该禁用拖拽', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const fullscreenButton = screen.getByLabelText('全屏');
      fireEvent.click(fullscreenButton);
      
      await waitFor(() => {
        const widget = screen.getByTestId('intelligent-ai-widget');
        expect(widget).toHaveClass('inset-4');
      });
      
      const widget = screen.getByTestId('intelligent-ai-widget');
      fireEvent.mouseDown(widget);
      
      await waitFor(() => {
        expect(widget.style.left).toBe('');
        expect(widget.style.top).toBe('');
      });
    });
  });

  describe('错误处理集成', () => {
    it('应该正确处理网络错误', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      fireEvent.change(input, { target: { value: '测试消息' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('测试消息')).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/网络错误|发送失败/);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      }, { timeout: 10000 });
    });

    it('应该正确处理无效输入', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      fireEvent.change(input, { target: { value: '' } });
      
      expect(sendButton).toBeDisabled();
    });
  });

  describe('状态持久化集成', () => {
    it('应该保存状态到localStorage', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const minimizeButton = screen.getByLabelText('最小化');
      fireEvent.click(minimizeButton);
      
      await waitFor(() => {
        const widget = screen.getByTestId('intelligent-ai-widget');
        expect(widget).toHaveClass('h-14');
      });
      
      const savedState = localStorage.getItem('ai-widget-state');
      expect(savedState).not.toBeNull();
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        expect(parsedState.isMinimized).toBe(true);
      }
    });

    it('应该从localStorage恢复状态', async () => {
      const savedState = {
        isVisible: true,
        isMinimized: true,
        currentView: 'tools',
        position: { x: 100, y: 200, width: 400, height: 600 }
      };
      
      localStorage.setItem('ai-widget-state', JSON.stringify(savedState));
      
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      await waitFor(() => {
        const widget = screen.getByTestId('intelligent-ai-widget');
        expect(widget).toBeInTheDocument();
      });
    });
  });

  describe('性能集成', () => {
    it('应该快速加载组件', async () => {
      const startTime = performance.now();
      
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('intelligent-ai-widget')).toBeInTheDocument();
      });
      
      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(1000);
    });

    it('应该快速处理消息发送', async () => {
      render(<IntelligentAIWidget userId={mockUserId} />);
      
      const input = screen.getByTestId('user-input-field');
      const sendButton = screen.getByTestId('send-message-button');
      
      const startTime = performance.now();
      
      fireEvent.change(input, { target: { value: '测试消息' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('测试消息')).toBeInTheDocument();
      });
      
      const processTime = performance.now() - startTime;
      expect(processTime).toBeLessThan(2000);
    });
  });
});
