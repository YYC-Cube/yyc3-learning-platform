/**
 * @file knowledge-base.tsx
 * @description 知识库组件，提供知识管理、检索和学习功能
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 */

"use client";

import { Search, Plus, BookOpen, FileText, Tag, Clock, Star, FolderOpen, ChevronRight, TrendingUp, Lightbulb } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'document' | 'note' | 'faq';
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  isFavorite: boolean;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface KnowledgeSearchResult {
  item: KnowledgeItem;
  relevance: number;
  highlights: string[];
}

export interface KnowledgeBaseProps {
  onItemClick?: (item: KnowledgeItem) => void;
  onItemCreate?: (item: Partial<KnowledgeItem>) => void;
  onItemUpdate?: (itemId: string, updates: Partial<KnowledgeItem>) => void;
  onItemDelete?: (itemId: string) => void;
}

interface KnowledgeCardProps {
  item: KnowledgeItem;
  onClick: (item: KnowledgeItem) => void;
  onFavorite: (itemId: string, favorite: boolean) => void;
}

interface CategoryCardProps {
  category: KnowledgeCategory;
  onClick: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  onItemClick,
  onItemCreate,
  onItemUpdate,
  onItemDelete
}) => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledgeData();
  }, []);

  const loadKnowledgeData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [loadedItems, loadedCategories] = await Promise.all([
        loadKnowledgeItems(),
        loadKnowledgeCategories()
      ]);

      setItems(loadedItems);
      setCategories(loadedCategories);
    } catch (error) {
      console.error('加载知识库数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter(item => item.tags.includes(selectedTag));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.views - a.views;
    });
  }, [items, selectedCategory, selectedTag, searchQuery]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  const popularItems = useMemo(() => {
    return items
      .filter(item => item.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);
  }, [items]);

  const recentItems = useMemo(() => {
    return items
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 6);
  }, [items]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTag('');
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(tag);
    setSelectedCategory('all');
  }, []);

  const handleItemClick = useCallback((item: KnowledgeItem) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemFavorite = useCallback((itemId: string, favorite: boolean) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, isFavorite: favorite, likes: favorite ? item.likes + 1 : item.likes - 1 } : item
    );
    setItems(updatedItems);
    onItemUpdate?.(itemId, { isFavorite: favorite });
  }, [items, onItemUpdate]);

  const handleItemCreate = useCallback(() => {
    const newItem: Partial<KnowledgeItem> = {
      title: '新知识条目',
      content: '在此输入知识内容...',
      type: 'note',
      category: '未分类',
      tags: [],
      author: '当前用户',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      isFavorite: false
    };

    onItemCreate?.(newItem);
  }, [onItemCreate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">加载知识库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索知识库..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            onClick={handleItemCreate}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新建</span>
          </button>
        </div>

        {/* 分类和标签 */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>全部</span>
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full ${
                selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-300'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* 标签 */}
        {allTags.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Tag className="w-3 h-3 text-gray-500" />
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery || selectedCategory !== 'all' || selectedTag ? (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              搜索结果 ({filteredItems.length})
            </h4>
            {filteredItems.length > 0 ? (
              <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {filteredItems.map(item => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    onClick={handleItemClick}
                    onFavorite={handleItemFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">没有找到相关内容</p>
                <p className="text-sm text-gray-500">尝试使用不同的关键词或分类</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 热门知识 */}
            {popularItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                  热门知识
                </h4>
                <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {popularItems.map(item => (
                    <KnowledgeCard
                      key={item.id}
                      item={item}
                      onClick={handleItemClick}
                      onFavorite={handleItemFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 最新知识 */}
            {recentItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                  最新知识
                </h4>
                <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {recentItems.map(item => (
                    <KnowledgeCard
                      key={item.id}
                      item={item}
                      onClick={handleItemClick}
                      onFavorite={handleItemFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 分类浏览 */}
            {categories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2 text-purple-500" />
                  分类浏览
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onClick={() => handleCategorySelect(category.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

KnowledgeBase.displayName = 'KnowledgeBase';

const KnowledgeCard: React.FC<KnowledgeCardProps> = React.memo(({ item, onClick, onFavorite }) => {
  const typeIcons = {
    article: '📄',
    document: '📋',
    note: '📝',
    faq: '❓'
  };

  const typeLabels = {
    article: '文章',
    document: '文档',
    note: '笔记',
    faq: 'FAQ'
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{typeIcons[item.type]}</span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {typeLabels[item.type]}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(item.id, !item.isFavorite);
          }}
          className={`p-1 rounded transition-colors ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
        >
          <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <h5 className="font-semibold text-gray-900 mb-1">{item.title}</h5>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.content}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
        {item.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(item.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{item.views} 次浏览</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3" />
          <span>{item.likes}</span>
        </div>
      </div>
    </div>
  );
});

KnowledgeCard.displayName = 'KnowledgeCard';

const CategoryCard: React.FC<CategoryCardProps> = React.memo(({ category, onClick }) => (
  <div
    className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition-all cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-3xl">{category.icon}</span>
      <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-indigo-700">
        {category.count}
      </span>
    </div>
    <h5 className="font-semibold text-gray-900 mb-1">{category.name}</h5>
    <p className="text-xs text-gray-600 line-clamp-2">{category.description}</p>
  </div>
));

CategoryCard.displayName = 'CategoryCard';

async function loadKnowledgeItems(): Promise<KnowledgeItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: 'kb-1',
      title: '如何使用AI助手',
      content: 'AI助手可以帮助您完成各种任务，包括文本生成、数据分析、代码编写等。通过简单的对话界面，您可以快速获得所需帮助。',
      type: 'article',
      category: '使用指南',
      tags: ['AI', '助手', '使用'],
      author: 'YYC³',
      createdAt: new Date(Date.now() - 86400000 * 30),
      updatedAt: new Date(Date.now() - 86400000 * 7),
      views: 1256,
      likes: 89,
      isFavorite: true
    },
    {
      id: 'kb-2',
      title: '工具使用技巧',
      content: '掌握工具的使用技巧可以大大提高工作效率。本文将介绍常用工具的高级功能和最佳实践。',
      type: 'article',
      category: '使用指南',
      tags: ['工具', '技巧', '效率'],
      author: 'YYC³',
      createdAt: new Date(Date.now() - 86400000 * 20),
      updatedAt: new Date(Date.now() - 86400000 * 5),
      views: 892,
      likes: 67,
      isFavorite: false
    },
    {
      id: 'kb-3',
      title: '工作流创建步骤',
      content: '创建工作流需要遵循以下步骤：1. 定义目标 2. 设计流程 3. 配置节点 4. 测试执行 5. 部署上线。',
      type: 'document',
      category: '工作流',
      tags: ['工作流', '创建', '步骤'],
      author: 'YYC³',
      createdAt: new Date(Date.now() - 86400000 * 15),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      views: 634,
      likes: 45,
      isFavorite: true
    },
    {
      id: 'kb-4',
      title: '数据洞察解读',
      content: '数据洞察可以帮助您了解使用情况和趋势。本指南将详细解释各项指标的含义和优化建议。',
      type: 'article',
      category: '数据分析',
      tags: ['洞察', '数据', '分析'],
      author: 'YYC³',
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      views: 521,
      likes: 38,
      isFavorite: false
    },
    {
      id: 'kb-5',
      title: '常见问题解答',
      content: 'Q: 如何重置密码？A: 在设置页面点击重置密码按钮，按照提示操作即可。Q: 如何联系客服？A: 点击帮助按钮即可找到联系方式。',
      type: 'faq',
      category: 'FAQ',
      tags: ['FAQ', '问题', '解答'],
      author: 'YYC³',
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000),
      views: 1089,
      likes: 76,
      isFavorite: true
    },
    {
      id: 'kb-6',
      title: '快捷键大全',
      content: 'Ctrl+K: 打开/关闭浮窗 Ctrl+Enter: 发送消息 Esc: 关闭浮窗 Arrow Up: 编辑上一条消息 Ctrl+1-6: 切换视图',
      type: 'document',
      category: '快捷键',
      tags: ['快捷键', '操作', '效率'],
      author: 'YYC³',
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 86400000),
      views: 445,
      likes: 32,
      isFavorite: false
    }
  ];
}

async function loadKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      id: '使用指南',
      name: '使用指南',
      icon: '📖',
      count: 2,
      description: '学习如何使用各项功能'
    },
    {
      id: '工作流',
      name: '工作流',
      icon: '⚙️',
      count: 1,
      description: '工作流创建和管理'
    },
    {
      id: '数据分析',
      name: '数据分析',
      icon: '📊',
      count: 1,
      description: '数据洞察和优化建议'
    },
    {
      id: 'FAQ',
      name: 'FAQ',
      icon: '❓',
      count: 1,
      description: '常见问题解答'
    },
    {
      id: '快捷键',
      name: '快捷键',
      icon: '⌨️',
      count: 1,
      description: '提高效率的快捷键'
    }
  ];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString();
}

export default KnowledgeBase;
