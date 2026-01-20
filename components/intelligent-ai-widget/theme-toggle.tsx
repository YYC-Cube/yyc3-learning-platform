/**
 * @fileoverview 主题切换按钮组件 - 提供明亮/暗黑模式切换功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from './theme-context';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleRef = React.useRef<HTMLDivElement>(null);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: '明亮', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: '暗黑', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: '跟随系统', icon: <Monitor className="w-4 h-4" /> }
  ];

  const getCurrentThemeIcon = () => {
    const currentTheme = themes.find(t => t.value === theme);
    return currentTheme?.icon || <Sun className="w-4 h-4" />;
  };

  const getCurrentThemeLabel = () => {
    const currentTheme = themes.find(t => t.value === theme);
    return currentTheme?.label || '明亮';
  };

  const handleThemeSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (toggleRef.current && !toggleRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="切换主题"
      >
        {getCurrentThemeIcon()}
        <span className="text-sm">{getCurrentThemeLabel()}</span>
      </button>

      {isOpen && (
        <div
          ref={toggleRef}
          className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="p-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeSelect(themeOption.value)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${theme === themeOption.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                {themeOption.icon}
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;