/**
 * @fileoverview 主题上下文 - 提供主题切换和偏好保存功能
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const THEME_STORAGE_KEY = 'yyc3-theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY
}) => {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    
    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 初始化主题
  React.useEffect(() => {
    const loadTheme = () => {
      if (typeof window === 'undefined') return;

      // 从本地存储加载主题
      const savedTheme = localStorage.getItem(storageKey) as Theme | null;
      
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        const systemTheme = getSystemTheme();
        setResolvedTheme(systemTheme);
        applyTheme(systemTheme);
      }
    };

    loadTheme();

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolvedTheme);
        applyTheme(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, storageKey]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider;