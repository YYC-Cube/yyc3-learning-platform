/**
 * @fileoverview UI组件 · toolbox-panel.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */

'use client';

import { Search, Star, Clock, Grid, List, Zap, BookOpen, Play } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  author: string;
  tags: string[];
  status: 'active' | 'inactive' | 'maintenance';
  usageCount: number;
  lastUsed?: Date;
  isPinned: boolean;
  config?: Record<string, any>;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface ToolFilter {
  category?: string;
  status?: string;
  searchQuery?: string;
}

export interface ToolboxPanelProps {
  onToolExecute?: (toolId: string, parameters?: any) => Promise<ToolExecutionResult>;
  onToolPin?: (toolId: string, pinned: boolean) => void;
}

interface ToolCardProps {
  tool: Tool;
  onExecute: (tool: Tool) => void;
  onPin: (toolId: string, pinned: boolean) => void;
  onOpenConfig?: (tool: Tool) => void;
}

interface ToolCategoryProps {
  name: string;
  icon: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export const ToolboxPanel: React.FC<ToolboxPanelProps> = ({ onToolExecute, onToolPin }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [_filter, _setFilter] = useState<ToolFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [_executingTool, setExecutingTool] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = useCallback(async () => {
    const defaultTools: Tool[] = [
      {
        id: 'search',
        name: '智能搜索',
        description: '基于AI的智能搜索工具，支持多语言和多模态搜索',
        icon: '🔍',
        category: 'search',
        version: '1.0.0',
        author: 'YYC³',
        tags: ['搜索', 'AI', '多模态'],
        status: 'active',
        usageCount: 156,
        lastUsed: new Date(),
        isPinned: true,
      },
      {
        id: 'analysis',
        name: '数据分析',
        description: '强大的数据分析工具，支持统计分析和可视化',
        icon: '📊',
        category: 'analysis',
        version: '1.2.0',
        author: 'YYC³',
        tags: ['分析', '可视化', '统计'],
        status: 'active',
        usageCount: 89,
        lastUsed: new Date(Date.now() - 86400000),
        isPinned: true,
      },
      {
        id: 'writing',
        name: 'AI写作助手',
        description: '智能写作辅助工具，支持多种文体和语言',
        icon: '✍️',
        category: 'writing',
        version: '2.0.0',
        author: 'YYC³',
        tags: ['写作', 'AI', '创作'],
        status: 'active',
        usageCount: 234,
        lastUsed: new Date(Date.now() - 172800000),
        isPinned: false,
      },
      {
        id: 'design',
        name: '创意设计',
        description: 'AI驱动的创意设计工具，支持图像生成和编辑',
        icon: '🎨',
        category: 'design',
        version: '1.5.0',
        author: 'YYC³',
        tags: ['设计', 'AI', '图像'],
        status: 'active',
        usageCount: 67,
        lastUsed: new Date(Date.now() - 259200000),
        isPinned: false,
      },
      {
        id: 'code',
        name: '代码助手',
        description: '智能代码生成和优化工具，支持多种编程语言',
        icon: '💻',
        category: 'development',
        version: '1.8.0',
        author: 'YYC³',
        tags: ['代码', '开发', 'AI'],
        status: 'active',
        usageCount: 312,
        lastUsed: new Date(Date.now() - 345600000),
        isPinned: true,
      },
      {
        id: 'translate',
        name: '智能翻译',
        description: '多语言翻译工具，支持实时翻译和文档翻译',
        icon: '🌐',
        category: 'translation',
        version: '1.3.0',
        author: 'YYC³',
        tags: ['翻译', '语言', 'AI'],
        status: 'active',
        usageCount: 145,
        lastUsed: new Date(Date.now() - 432000000),
        isPinned: false,
      },
      {
        id: 'calendar',
        name: '日程管理',
        description: '智能日程管理工具，支持自动安排和提醒',
        icon: '📅',
        category: 'productivity',
        version: '1.1.0',
        author: 'YYC³',
        tags: ['日程', '管理', 'AI'],
        status: 'active',
        usageCount: 78,
        lastUsed: new Date(Date.now() - 518400000),
        isPinned: false,
      },
      {
        id: 'notes',
        name: '智能笔记',
        description: 'AI驱动的笔记管理工具，支持自动整理和搜索',
        icon: '📝',
        category: 'productivity',
        version: '1.4.0',
        author: 'YYC³',
        tags: ['笔记', '管理', 'AI'],
        status: 'active',
        usageCount: 198,
        lastUsed: new Date(Date.now() - 604800000),
        isPinned: true,
      },
    ];

    setTools(defaultTools);
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { count: number; icon: string }>();

    tools.forEach((tool) => {
      const existing = categoryMap.get(tool.category);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(tool.category, { count: 1, icon: tool.icon });
      }
    });

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      icon: data.icon,
      count: data.count,
    }));
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools
      .filter((tool) => {
        if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
          return false;
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.usageCount - a.usageCount;
      });
  }, [tools, selectedCategory, searchQuery]);

  const handleToolExecute = useCallback(
    async (tool: Tool) => {
      setExecutingTool(tool.id);

      try {
        const result = await onToolExecute?.(tool.id, tool.config);

        if (result?.success) {
          const updatedTools = tools.map((t) =>
            t.id === tool.id ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() } : t
          );
          setTools(updatedTools);
        }
      } catch (error) {
        console.error('工具执行失败:', error);
      } finally {
        setExecutingTool(null);
      }
    },
    [tools, onToolExecute]
  );

  const handleToolPin = useCallback(
    (toolId: string, pinned: boolean) => {
      const updatedTools = tools.map((tool) =>
        tool.id === toolId ? { ...tool, isPinned: pinned } : tool
      );
      setTools(updatedTools);
      onToolPin?.(toolId, pinned);
    },
    [tools, onToolPin]
  );

  const suggestedTools = useMemo(() => {
    return tools
      .filter((tool) => !tool.isPinned)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);
  }, [tools]);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title={viewMode === 'grid' ? '列表视图' : '网格视图'}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2">
          <ToolCategory
            name="全部"
            icon="📦"
            count={tools.length}
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {categories.map((category) => (
            <ToolCategory
              key={category.name}
              name={category.name}
              icon={category.icon}
              count={category.count}
              active={selectedCategory === category.name}
              onClick={() => setSelectedCategory(category.name)}
            />
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 固定工具 */}
        {tools.filter((t) => t.isPinned).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              固定工具
            </h3>
            <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {tools
                .filter((t) => t.isPinned)
                .map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onExecute={handleToolExecute}
                    onPin={handleToolPin}
                  />
                ))}
            </div>
          </div>
        )}

        {/* 推荐工具 */}
        {suggestedTools.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-orange-500" />
              推荐工具
            </h3>
            <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {suggestedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onExecute={handleToolExecute}
                  onPin={handleToolPin}
                />
              ))}
            </div>
          </div>
        )}

        {/* 所有工具 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
            所有工具
          </h3>
          <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onExecute={handleToolExecute}
                onPin={handleToolPin}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ToolboxPanel.displayName = 'ToolboxPanel';

const ToolCard: React.FC<ToolCardProps> = React.memo(({ tool, onExecute, onPin }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isHovered ? 'border-indigo-300 shadow-md' : 'border-gray-200 hover:border-indigo-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-3xl">{tool.icon}</div>
        <button
          type="button"
          title={tool.isPinned ? '取消置顶' : '置顶'}
          onClick={(e) => {
            e.stopPropagation();
            onPin(tool.id, !tool.isPinned);
          }}
          className={`p-1 rounded transition-colors ${
            tool.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <Star className={`w-4 h-4 ${tool.isPinned ? 'fill-current' : ''}`} />
        </button>
      </div>

      <h4 className="font-semibold text-gray-900 mb-1">{tool.name}</h4>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tool.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{tool.usageCount} 次使用</span>
        </div>

        <button
          onClick={() => onExecute(tool)}
          className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Play className="w-3 h-3" />
          <span>运行</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {tool.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';

const ToolCategory: React.FC<ToolCategoryProps> = React.memo(
  ({ name, icon, count, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <span>{icon}</span>
      <span>{name}</span>
      <span className={`ml-1 px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-300'}`}>
        {count}
      </span>
    </button>
  )
);

ToolCategory.displayName = 'ToolCategory';

export default ToolboxPanel;
