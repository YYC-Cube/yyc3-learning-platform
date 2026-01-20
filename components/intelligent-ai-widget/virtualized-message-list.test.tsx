/**
 * @fileoverview VirtualizedMessageList组件单元测试
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-28
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VirtualizedMessageList from './virtualized-message-list';
import type { Message } from './intelligent-ai-widget';

const mockMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
  id: `message-${i}`,
  role: i % 3 === 0 ? 'user' : i % 3 === 1 ? 'assistant' : 'system',
  content: `测试消息 ${i}`,
  timestamp: Date.now() - (100 - i) * 1000,
}));

describe('VirtualizedMessageList', () => {
  const mockHeight = 400;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初始渲染', () => {
    it('应该正确渲染组件', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      expect(screen.getByTestId('virtualized-message-list')).toBeInTheDocument();
    });

    it('应该渲染可见的消息', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const visibleMessages = screen.getAllByTestId(/message-bubble-/);
      expect(visibleMessages.length).toBeGreaterThan(0);
      expect(visibleMessages.length).toBeLessThan(mockMessages.length);
    });

    it('应该正确设置容器高度', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      expect(container).toHaveStyle({ height: `${mockHeight}px` });
    });
  });

  describe('虚拟化渲染', () => {
    it('应该只渲染可见区域的消息', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const visibleMessages = screen.getAllByTestId(/message-bubble-/);
      const expectedVisibleCount = Math.ceil(mockHeight / 80) + 5;
      
      expect(visibleMessages.length).toBeLessThanOrEqual(expectedVisibleCount);
    });

    it('应该正确计算虚拟化偏移', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      const content = container.querySelector('[style*="translateY"]');
      
      expect(content).toBeInTheDocument();
    });

    it('应该处理空消息列表', () => {
      render(<VirtualizedMessageList messages={[]} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });
  });

  describe('滚动性能', () => {
    it('应该能够滚动查看更多消息', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      const initialVisibleCount = screen.getAllByTestId(/message-bubble-/).length;
      
      fireEvent.scroll(container, { target: { scrollTop: 1000 } });
      
      const scrolledVisibleCount = screen.getAllByTestId(/message-bubble-/).length;
      expect(scrolledVisibleCount).not.toBe(initialVisibleCount);
    });

    it('应该正确处理滚动到顶部', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      
      fireEvent.scroll(container, { target: { scrollTop: 0 } });
      
      const firstMessage = screen.getByText('测试消息 99');
      expect(firstMessage).toBeInTheDocument();
    });

    it('应该正确处理滚动到底部', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      
      fireEvent.scroll(container, { target: { scrollTop: 99999 } });
      
      const lastMessage = screen.getByText('测试消息 0');
      expect(lastMessage).toBeInTheDocument();
    });
  });

  describe('消息更新', () => {
    it('应该正确处理新消息添加', () => {
      const { rerender } = render(
        <VirtualizedMessageList messages={mockMessages.slice(0, 10)} height={mockHeight} />
      );
      
      const newMessages = [...mockMessages.slice(0, 10), {
        id: 'new-message',
        role: 'user',
        content: '新消息',
        timestamp: Date.now(),
      }];
      
      rerender(<VirtualizedMessageList messages={newMessages} height={mockHeight} />);
      
      expect(screen.getByText('新消息')).toBeInTheDocument();
    });

    it('应该正确处理消息删除', () => {
      const { rerender } = render(
        <VirtualizedMessageList messages={mockMessages.slice(0, 10)} height={mockHeight} />
      );
      
      const filteredMessages = mockMessages.slice(0, 10).filter(m => m.id !== 'message-5');
      
      rerender(<VirtualizedMessageList messages={filteredMessages} height={mockHeight} />);
      
      expect(screen.queryByText('测试消息 5')).not.toBeInTheDocument();
    });

    it('应该正确处理消息更新', () => {
      const { rerender } = render(
        <VirtualizedMessageList messages={mockMessages.slice(0, 10)} height={mockHeight} />
      );
      
      const updatedMessages = mockMessages.slice(0, 10).map(m =>
        m.id === 'message-5' ? { ...m, content: '更新后的消息' } : m
      );
      
      rerender(<VirtualizedMessageList messages={updatedMessages} height={mockHeight} />);
      
      expect(screen.getByText('更新后的消息')).toBeInTheDocument();
    });
  });

  describe('消息样式', () => {
    it('应该正确显示用户消息', () => {
      const userMessages = mockMessages.filter(m => m.role === 'user');
      
      render(<VirtualizedMessageList messages={userMessages} height={mockHeight} />);
      
      userMessages.forEach(message => {
        const messageElement = screen.getByText(message.content);
        expect(messageElement).toBeInTheDocument();
      });
    });

    it('应该正确显示助手消息', () => {
      const assistantMessages = mockMessages.filter(m => m.role === 'assistant');
      
      render(<VirtualizedMessageList messages={assistantMessages} height={mockHeight} />);
      
      assistantMessages.forEach(message => {
        const messageElement = screen.getByText(message.content);
        expect(messageElement).toBeInTheDocument();
      });
    });

    it('应该正确显示系统消息', () => {
      const systemMessages = mockMessages.filter(m => m.role === 'system');
      
      render(<VirtualizedMessageList messages={systemMessages} height={mockHeight} />);
      
      systemMessages.forEach(message => {
        const messageElement = screen.getByText(message.content);
        expect(messageElement).toBeInTheDocument();
      });
    });
  });

  describe('性能优化', () => {
    it('应该使用虚拟化减少渲染数量', () => {
      const startTime = performance.now();
      
      render(<VirtualizedMessageList messages={mockMessages} height={mockHeight} />);
      
      const renderTime = performance.now() - startTime;
      const visibleMessages = screen.getAllByTestId(/message-bubble-/);
      
      expect(visibleMessages.length).toBeLessThan(mockMessages.length);
      expect(renderTime).toBeLessThan(100);
    });

    it('应该正确处理大量消息', () => {
      const largeMessageList = Array.from({ length: 1000 }, (_, i) => ({
        id: `message-${i}`,
        role: i % 3 === 0 ? 'user' : i % 3 === 1 ? 'assistant' : 'system',
        content: `测试消息 ${i}`,
        timestamp: Date.now() - (1000 - i) * 1000,
      }));
      
      const startTime = performance.now();
      render(<VirtualizedMessageList messages={largeMessageList} height={mockHeight} />);
      const renderTime = performance.now() - startTime;
      
      const visibleMessages = screen.getAllByTestId(/message-bubble-/);
      
      expect(visibleMessages.length).toBeLessThan(20);
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('边界情况', () => {
    it('应该处理null消息', () => {
      render(<VirtualizedMessageList messages={null as any} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      expect(container).toBeInTheDocument();
    });

    it('应该处理undefined消息', () => {
      render(<VirtualizedMessageList messages={undefined as any} height={mockHeight} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      expect(container).toBeInTheDocument();
    });

    it('应该处理零高度', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={0} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      expect(container).toBeInTheDocument();
    });

    it('应该处理负高度', () => {
      render(<VirtualizedMessageList messages={mockMessages} height={-100} />);
      
      const container = screen.getByTestId('virtualized-message-list');
      expect(container).toBeInTheDocument();
    });
  });
});
