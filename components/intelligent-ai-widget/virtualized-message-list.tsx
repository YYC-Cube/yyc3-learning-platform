/**
 * @fileoverview 虚拟化消息列表组件 - 优化长列表渲染性能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-24
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { User, Bot, Check, Clock, AlertCircle } from 'lucide-react';

interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status?: 'uploading' | 'uploaded' | 'error';
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'read' | 'error';
  files?: FileInfo[];
  avatar?: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const getStatusIcon = () => {
    if (!isUser) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-indigo-300" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'read':
        return (
          <div className="flex items-center gap-0.5">
            <Check className="w-3 h-3 text-indigo-300" />
            <Check className="w-3 h-3 text-indigo-300" />
          </div>
        );
      case 'sent':
      default:
        return <Check className="w-3 h-3 text-indigo-300" />;
    }
  };

  const getAvatar = () => {
    const avatarSize = 'w-10 h-10';
    
    if (message.avatar) {
      return (
        <img
          src={message.avatar}
          alt={isUser ? '用户头像' : '助手头像'}
          className={`${avatarSize} rounded-full object-cover border-2 border-white shadow-md`}
        />
      );
    }
    
    if (isUser) {
      return (
        <div className={`${avatarSize} bg-indigo-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
          <User className="w-5 h-5" />
        </div>
      );
    }
    
    if (isSystem) {
      return (
        <div className={`${avatarSize} bg-yellow-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
          <Bot className="w-5 h-5" />
        </div>
      );
    }
    
    return (
      <div className={`${avatarSize} bg-gray-400 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
        <Bot className="w-5 h-5" />
      </div>
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderFiles = () => {
    if (!message.files || message.files.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1">
        {message.files.map((file) => (
          <div
            key={file.id}
            className={`
              flex items-center gap-2 p-2 rounded text-xs
              ${isUser ? 'bg-white/20' : 'bg-gray-100'}
            `}
          >
            <div className="w-4 h-4">📄</div>
            <div className="flex-1 truncate">{file.name}</div>
            <div className="opacity-70">
              {Math.round(file.size / 1024)}KB
            </div>
            {file.status === 'uploading' && (
              <div className="text-yellow-400">上传中...</div>
            )}
            {file.status === 'error' && (
              <div className="text-red-400">上传失败</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && getAvatar()}
      <div
        className={`
          max-w-[80%] p-4 rounded-lg shadow-sm relative
          ${isUser
            ? 'bg-indigo-600 text-white'
            : isSystem
              ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
              : 'bg-white text-gray-900 border border-gray-200'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap mb-2">{message.content}</p>
        {renderFiles()}
        <div className={`flex items-center gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
      {isUser && getAvatar()}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

interface VirtualizedMessageListProps {
  messages: Message[];
  height?: number;
}

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  height = 400,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const lastMessageIdRef = React.useRef<string | null>(null);

  // 更准确的消息大小估计
  const estimateSize = React.useCallback((index: number) => {
    const message = messages[index];
    if (!message) return 100;
    
    // 根据消息内容长度估计高度
    const contentLength = message.content.length;
    const baseHeight = 100; // 基础高度（头像40px、时间戳、状态图标等）
    const contentHeight = Math.ceil(contentLength / 100) * 20; // 每100个字符约20px
    
    // 添加文件显示所需的额外高度
    const fileHeight = message.files ? message.files.length * 50 : 0;
    
    return Math.max(baseHeight + fileHeight, contentHeight);
  }, [messages]);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 10, // 增加预渲染数量以减少白屏
    scrollMargin: 200, // 滚动边距，提前渲染即将进入视口的项目
  });

  // 当有新消息时自动滚动到底部
  React.useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessageId = messages[messages.length - 1].id;
    if (lastMessageId !== lastMessageIdRef.current && parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
      lastMessageIdRef.current = lastMessageId;
    }
  }, [messages.length]);

  return (
    <div
      ref={parentRef}
      style={{
        height: `${height}px`,
        overflow: 'auto',
      }}
      className="p-4 space-y-4"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="flex items-center justify-center"
            >
              <MessageBubble message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

VirtualizedMessageList.displayName = 'VirtualizedMessageList';

export default VirtualizedMessageList;
