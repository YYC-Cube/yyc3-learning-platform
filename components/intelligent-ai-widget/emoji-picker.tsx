/**
 * @fileoverview 表情选择器组件 - 提供分类表情、搜索、快速访问功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { Smile, Search, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

interface EmojiCategory {
  name: string;
  emojis: string[];
}

interface RecentEmoji {
  emoji: string;
  timestamp: number;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: '常用',
    emojis: ['😀', '😂', '🥰', '😍', '🤔', '😢', '😡', '👍', '👎', '🎉', '❤️', '🔥', '✨', '👏', '🙏']
  },
  {
    name: '表情',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
      '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
      '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏',
      '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
      '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎',
      '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
      '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩',
      '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡'
    ]
  },
  {
    name: '手势',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
      '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵',
      '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅',
      '👄', '💋', '🩸'
    ]
  },
  {
    name: '符号',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
      '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️',
      '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋',
      '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️',
      '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐',
      '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
      '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯',
      '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅',
      '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯️', '💹', '❇️',
      '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️',
      '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮',
      '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒',
      '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣',
      '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️',
      '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️',
      '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀',
      '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽',
      '⏬', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️',
      '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '➰', '➿', '🔄', '🔃',
      '🎵', '🎶', '➕', '➖', '➗', '➰', '➿', '♾️', '💲', '💱', '™️', '©️',
      '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘',
      '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧',
      '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽',
      '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲'
    ]
  },
  {
    name: '动物',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
      '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
      '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛',
      '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
      '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
      '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪',
      '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐',
      '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢',
      '🦩', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥'
    ]
  },
  {
    name: '食物',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
      '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖',
      '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴',
      '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗',
      '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙',
      '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁',
      '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯',
      '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷',
      '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢',
      '🧂', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀',
      '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
      '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂',
      '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘'
    ]
  }
];

const EMOJIS_PER_PAGE = 48;
const MAX_RECENT_EMOJIS = 15;

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(0);
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(0);
  const [recentEmojis, setRecentEmojis] = React.useState<RecentEmoji[]>([]);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  const filteredEmojis = React.useMemo(() => {
    if (!searchKeyword.trim()) {
      return EMOJI_CATEGORIES[selectedCategory].emojis;
    }
    
    const keyword = searchKeyword.toLowerCase();
    return EMOJI_CATEGORIES.flatMap(category => 
      category.emojis.filter(emoji => 
        emoji.includes(keyword) || 
        EMOJI_CATEGORIES.find(c => c.emojis.includes(emoji))?.name.includes(keyword)
      )
    );
  }, [searchKeyword, selectedCategory]);

  const totalPages = Math.ceil(filteredEmojis.length / EMOJIS_PER_PAGE);
  const currentEmojis = filteredEmojis.slice(
    currentPage * EMOJIS_PER_PAGE,
    (currentPage + 1) * EMOJIS_PER_PAGE
  );

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    
    // 更新最近使用
    const newRecent: RecentEmoji = {
      emoji,
      timestamp: Date.now()
    };
    
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e.emoji !== emoji);
      return [newRecent, ...filtered].slice(0, MAX_RECENT_EMOJIS);
    });
  };

  const handleCategoryChange = (index: number) => {
    setSelectedCategory(index);
    setCurrentPage(0);
    setSearchKeyword('');
  };

  const handlePageChange = (delta: number) => {
    setCurrentPage(prev => Math.max(0, Math.min(totalPages - 1, prev + delta)));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchKeyword]);

  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="选择表情"
      >
        <Smile className="w-5 h-5 text-gray-500" />
      </button>

      {/* 表情选择器面板 */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          {/* 头部搜索 */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索表情..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 分类标签 */}
          {!searchKeyword && (
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => handleCategoryChange(-1)}
                className={`flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === -1 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                最近使用
              </button>
              {EMOJI_CATEGORIES.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryChange(index)}
                  className={`px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === index ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* 表情网格 */}
          <div className="p-3">
            {/* 最近使用的表情 */}
            {selectedCategory === -1 && recentEmojis.length > 0 && (
              <div className="grid grid-cols-8 gap-1">
                {recentEmojis.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(item.emoji)}
                    className="w-8 h-8 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors"
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* 搜索结果或分类表情 */}
            {currentEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-1">
                {currentEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                未找到相关表情
              </div>
            )}
          </div>

          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(-1)}
                disabled={currentPage === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                第 {currentPage + 1} / {totalPages} 页
              </span>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === totalPages - 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 底部统计 */}
          <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
            共 {filteredEmojis.length} 个表情
          </div>
        </div>
      )}
    </div>
  );
};

EmojiPicker.displayName = 'EmojiPicker';

export default EmojiPicker;