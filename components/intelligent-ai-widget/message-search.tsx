/**
 * @fileoverview 消息搜索组件 - 提供关键词搜索、时间筛选、结果高亮功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { Search, Calendar, Filter, Clock, MessageSquare, ChevronRight, X } from 'lucide-react';
import messageStorage, { StoredMessage, MessageFilter } from './message-storage';

interface MessageSearchProps {
  onResultSelect?: (message: StoredMessage) => void;
  className?: string;
}

interface TimeRangeOption {
  label: string;
  value: {
    startDate?: number;
    endDate?: number;
  };
}

interface SearchHighlightProps {
  text: string;
  highlight: string;
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

// 搜索结果高亮组件
const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, highlight }) => {
  if (!highlight.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export const MessageSearch: React.FC<MessageSearchProps> = ({
  onResultSelect,
  className = ''
}) => {
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<StoredMessage[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState(0);
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const searchTimeoutRef = React.useRef<number | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSearch = React.useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const timeRange = TIME_RANGES[selectedTimeRange].value;
      const filter: MessageFilter = {
        keyword: keyword.trim(),
        role: selectedRole !== 'all' ? selectedRole as 'user' | 'assistant' | 'system' : undefined,
        startDate: timeRange.startDate,
        endDate: timeRange.endDate
      };

      const results = await messageStorage.searchMessages(keyword.trim(), 50);
      
      // 应用时间筛选
      let filteredResults = results;
      if (timeRange.startDate) {
        filteredResults = filteredResults.filter(m => m.timestamp >= timeRange.startDate!);
      }
      if (timeRange.endDate) {
        filteredResults = filteredResults.filter(m => m.timestamp <= timeRange.endDate!);
      }
      if (selectedRole !== 'all') {
        filteredResults = filteredResults.filter(m => m.role === selectedRole);
      }
      
      setSearchResults(filteredResults);
      
      // 更新搜索历史
      if (keyword.trim() && !searchHistory.includes(keyword.trim())) {
        setSearchHistory(prev => [keyword.trim(), ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('搜索消息失败:', error);
    } finally {
      setIsSearching(false);
    }
  }, [selectedTimeRange, selectedRole, searchHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    setShowHistory(value.trim() === '');
    
    // 防抖搜索
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = window.setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleTimeRangeChange = (index: number) => {
    setSelectedTimeRange(index);
    handleSearch(searchKeyword);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    handleSearch(searchKeyword);
  };

  const handleHistorySelect = (keyword: string) => {
    setSearchKeyword(keyword);
    setShowHistory(false);
    handleSearch(keyword);
    searchInputRef.current?.focus();
  };

  const handleResultClick = (message: StoredMessage) => {
    if (onResultSelect) {
      onResultSelect(message);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return diffDays + '天前';
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const getMessagePreview = (message: StoredMessage, maxLength: number = 100): string => {
    if (message.content.length <= maxLength) return message.content;
    return message.content.substring(0, maxLength) + '...';
  };

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 搜索输入区 */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchKeyword}
            onChange={handleInputChange}
            onFocus={() => setShowHistory(searchKeyword.trim() === '')}
            placeholder="搜索消息内容..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchKeyword && (
            <button
              onClick={() => {
                setSearchKeyword('');
                setSearchResults([]);
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 搜索历史 */}
        {showHistory && searchHistory.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">搜索历史</span>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                清除
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {searchHistory.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(keyword)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <div className="text-sm text-gray-500">
            {searchResults.length > 0 && `找到 ${searchResults.length} 条结果`}
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
                <MessageSquare className="inline w-4 h-4 mr-1" />
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

      {/* 搜索结果 */}
      <div className="max-h-96 overflow-y-auto">
        {isSearching && (
          <div className="p-8 text-center text-gray-500">
            搜索中...
          </div>
        )}

        {!isSearching && searchKeyword && searchResults.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            未找到相关消息
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div>
            {searchResults.map((message) => (
              <div
                key={message.id}
                onClick={() => handleResultClick(message)}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* 消息类型标识 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${
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
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <SearchHighlight text={getMessagePreview(message)} highlight={searchKeyword} />
                    </p>
                  </div>

                  {/* 箭头 */}
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      {searchResults.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center text-xs text-gray-500">
          搜索结果仅显示最近50条匹配消息
        </div>
      )}
    </div>
  );
};

MessageSearch.displayName = 'MessageSearch';

export default MessageSearch;