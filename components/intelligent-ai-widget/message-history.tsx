/**
 * @fileoverview 消息历史组件 - 提供消息历史记录的加载和分页功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { ChevronDown, Search, Calendar, Filter, Download, Upload, Trash2 } from 'lucide-react';
import messageStorage, { StoredMessage, MessageFilter, PaginationOptions } from './message-storage';

interface MessageHistoryProps {
  onLoadMessages: (messages: StoredMessage[]) => void;
  className?: string;
}

interface TimeRangeOption {
  label: string;
  value: {
    startDate?: number;
    endDate?: number;
  };
}

const TIME_RANGES: TimeRangeOption[] = [
  { label: '全部时间', value: {} },
  { label: '今天', value: { startDate: new Date().setHours(0, 0, 0, 0) } },
  { label: '昨天', value: { 
    startDate: new Date().setDate(new Date().getDate() - 1),
    endDate: new Date().setHours(0, 0, 0, 0)
  }},
  { label: '近7天', value: { startDate: new Date().setDate(new Date().getDate() - 7) } },
  { label: '近30天', value: { startDate: new Date().setDate(new Date().getDate() - 30) } },
];

export const MessageHistory: React.FC<MessageHistoryProps> = ({
  onLoadMessages,
  className = ''
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<StoredMessage[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedTimeRange, setSelectedTimeRange] = React.useState(0);
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [showExportImport, setShowExportImport] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const pageSize = 20;

  const loadMessages = React.useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const timeRange = TIME_RANGES[selectedTimeRange].value;
      const filter: MessageFilter = {
        keyword: searchKeyword.trim() || undefined,
        role: selectedRole !== 'all' ? selectedRole as 'user' | 'assistant' | 'system' : undefined,
        startDate: timeRange.startDate,
        endDate: timeRange.endDate
      };

      const options: PaginationOptions = {
        page,
        pageSize,
        filter
      };

      const result = await messageStorage.getMessages(options);
      
      if (page === 1) {
        setMessages(result.data);
      } else {
        setMessages(prev => [...prev, ...result.data]);
      }
      
      setCurrentPage(result.page);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (error) {
      console.error('加载消息历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchKeyword, selectedTimeRange, selectedRole]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMessages(currentPage + 1);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadMessages(1);
  };

  const handleTimeRangeChange = (index: number) => {
    setSelectedTimeRange(index);
    setCurrentPage(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleLoadToChat = () => {
    onLoadMessages(messages);
  };

  const handleExport = async () => {
    try {
      const jsonData = await messageStorage.exportMessages();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yyc3-messages-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出消息失败:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await messageStorage.importMessages(text);
      alert(`成功导入 ${count} 条消息`);
      loadMessages(1);
    } catch (error) {
      console.error('导入消息失败:', error);
      alert('导入失败: ' + (error as Error).message);
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('确定要清空所有消息历史吗？此操作不可恢复。')) return;

    try {
      await messageStorage.clearMessages();
      setMessages([]);
      setCurrentPage(1);
      setHasMore(false);
      setTotal(0);
    } catch (error) {
      console.error('清空消息历史失败:', error);
    }
  };

  React.useEffect(() => {
    loadMessages(1);
  }, [loadMessages]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">消息历史</h3>
        
        {/* 搜索框 */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索消息内容..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            搜索
          </button>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>
            <button
              onClick={() => setShowExportImport(!showExportImport)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              导入/导出
            </button>
          </div>
          <div className="text-sm text-gray-500">
            共 {total} 条消息
          </div>
        </div>
      </div>

      {/* 筛选器面板 */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            {/* 时间范围 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                时间范围
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_RANGES.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeRangeChange(index)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedTimeRange === index
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 消息类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                消息类型
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'user', label: '用户' },
                  { value: 'assistant', label: '助手' },
                  { value: 'system', label: '系统' }
                ].map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleChange(role.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedRole === role.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 导入/导出面板 */}
      {showExportImport && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出消息
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              导入消息
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空历史
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="max-h-96 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="p-8 text-center text-gray-500">
            暂无消息记录
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* 消息类型标识 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                message.role === 'user' ? 'bg-indigo-600' :
                message.role === 'assistant' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {message.role === 'user' ? 'U' :
                 message.role === 'assistant' ? 'A' : 'S'}
              </div>

              {/* 消息内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.role === 'user' ? '用户' :
                     message.role === 'assistant' ? '助手' : '系统'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 truncate">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            加载中...
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-200 flex justify-between">
        <div className="text-sm text-gray-500">
          显示 {messages.length} / {total} 条消息
        </div>
        <div className="flex gap-2">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              加载更多
            </button>
          )}
          <button
            onClick={handleLoadToChat}
            disabled={messages.length === 0}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            加载到对话
          </button>
        </div>
      </div>
    </div>
  );
};

MessageHistory.displayName = 'MessageHistory';

export default MessageHistory;