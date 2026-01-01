/**
 * ThemeManager - 主题和样式管理系统
 * 
 * 提供完整的主题管理和动态样式切换
 * 支持多主题、深色模式、自定义主题、平滑过渡
 * 
 * 特性:
 * - 预设主题和自定义主题
 * - 深色/浅色模式自动切换
 * - 主题继承和变量覆盖
 * - CSS变量动态更新
 * - 主题预览
 * - 用户偏好保存
 * 
 * @module ThemeManager
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('ThemeManager');

// ================================================
// 1. 类型定义
// ================================================

/**
 * 颜色值
 */
export type ColorValue = string;

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 颜色方案
 */
export interface ColorScheme {
  // 主色
  primary: ColorValue;
  primaryHover: ColorValue;
  primaryActive: ColorValue;
  
  // 次色
  secondary: ColorValue;
  secondaryHover: ColorValue;
  secondaryActive: ColorValue;
  
  // 背景色
  background: ColorValue;
  backgroundSecondary: ColorValue;
  backgroundTertiary: ColorValue;
  
  // 前景色（文本）
  foreground: ColorValue;
  foregroundSecondary: ColorValue;
  foregroundTertiary: ColorValue;
  
  // 边框色
  border: ColorValue;
  borderHover: ColorValue;
  
  // 状态色
  success: ColorValue;
  warning: ColorValue;
  error: ColorValue;
  info: ColorValue;
  
  // 阴影
  shadow: ColorValue;
  shadowHeavy: ColorValue;
}

/**
 * 字体方案
 */
export interface FontScheme {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * 间距方案
 */
export interface SpacingScheme {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

/**
 * 圆角方案
 */
export interface BorderRadiusScheme {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/**
 * 过渡方案
 */
export interface TransitionScheme {
  fast: string;
  normal: string;
  slow: string;
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

/**
 * 主题定义
 */
export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ColorScheme;
  fonts: FontScheme;
  spacing: SpacingScheme;
  borderRadius: BorderRadiusScheme;
  transitions: TransitionScheme;
  extends?: string; // 继承自其他主题
  custom?: Record<string, any>; // 自定义变量
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  defaultTheme: string;
  defaultMode: ThemeMode;
  enableTransitions: boolean;
  transitionDuration: number;
  persistPreference: boolean;
  autoDetectMode: boolean;
}

/**
 * 主题应用选项
 */
export interface ApplyThemeOptions {
  transition?: boolean;
  duration?: number;
  preview?: boolean;
}

// ================================================
// 2. 预设主题
// ================================================

/**
 * 预设主题定义
 */
const PRESET_THEMES: Record<string, Theme> = {
  'light': {
    id: 'light',
    name: 'Light',
    mode: 'light',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryActive: '#1d4ed8',
      secondary: '#8b5cf6',
      secondaryHover: '#7c3aed',
      secondaryActive: '#6d28d9',
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      backgroundTertiary: '#f3f4f6',
      foreground: '#111827',
      foregroundSecondary: '#4b5563',
      foregroundTertiary: '#9ca3af',
      border: '#e5e7eb',
      borderHover: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowHeavy: 'rgba(0, 0, 0, 0.2)'
    },
    fonts: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontFamilyMono: '"Fira Code", "Courier New", monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    transitions: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    }
  },
  
  'dark': {
    id: 'dark',
    name: 'Dark',
    mode: 'dark',
    extends: 'light',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      primaryActive: '#93c5fd',
      secondary: '#8b5cf6',
      secondaryHover: '#a78bfa',
      secondaryActive: '#c4b5fd',
      background: '#111827',
      backgroundSecondary: '#1f2937',
      backgroundTertiary: '#374151',
      foreground: '#f9fafb',
      foregroundSecondary: '#d1d5db',
      foregroundTertiary: '#9ca3af',
      border: '#374151',
      borderHover: '#4b5563',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowHeavy: 'rgba(0, 0, 0, 0.5)'
    },
    fonts: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontFamilyMono: '"Fira Code", "Courier New", monospace',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    transitions: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    }
  }
};

// ================================================
// 3. 主题管理器核心
// ================================================

/**
 * 主题管理器
 */
export class ThemeManager extends EventEmitter {
  private themes: Map<string, Theme> = new Map();
  private currentTheme: Theme | null = null;
  private currentMode: ThemeMode = 'auto';
  private config: ThemeConfig;
  private previewElement: HTMLStyleElement | null = null;
  
  constructor(config: Partial<ThemeConfig> = {}) {
    super();
    
    this.config = {
      defaultTheme: 'light',
      defaultMode: 'auto',
      enableTransitions: true,
      transitionDuration: 300,
      persistPreference: true,
      autoDetectMode: true,
      ...config
    };
    
    // 注册预设主题
    for (const [id, theme] of Object.entries(PRESET_THEMES)) {
      this.registerTheme(theme);
    }
    
    // 加载用户偏好
    if (this.config.persistPreference) {
      this.loadPreferences();
    }
    
    // 应用默认主题
    this.applyTheme(this.config.defaultTheme);
    
    // 监听系统主题变化
    if (this.config.autoDetectMode && this.currentMode === 'auto') {
      this.watchSystemTheme();
    }
  }
  
  /**
   * 注册主题
   */
  registerTheme(theme: Theme): void {
    // 如果主题继承自其他主题，合并配置
    if (theme.extends) {
      const baseTheme = this.themes.get(theme.extends);
      if (baseTheme) {
        theme = this.mergeThemes(baseTheme, theme);
      }
    }
    
    this.themes.set(theme.id, theme);
    this.emit('themeRegistered', { theme });
  }
  
  /**
   * 应用主题
   */
  applyTheme(themeId: string, options: ApplyThemeOptions = {}): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      logger.warn(`Theme "${themeId}" not found`);
      return;
    }
    
    // 如果是预览模式，使用临时样式
    if (options.preview) {
      this.previewTheme(theme, options);
      return;
    }
    
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;
    
    // 应用过渡效果
    if (options.transition !== false && this.config.enableTransitions) {
      this.enableTransition(options.duration);
    }
    
    // 应用CSS变量
    this.applyCSSVariables(theme);
    
    // 更新body类名
    this.updateBodyClasses(theme);
    
    // 保存偏好
    if (this.config.persistPreference) {
      this.savePreferences();
    }
    
    // 触发事件
    this.emit('themeChanged', { oldTheme, newTheme: theme });
  }
  
  /**
   * 设置主题模式（深色/浅色/自动）
   */
  setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    
    let themeId: string;
    if (mode === 'auto') {
      themeId = this.detectSystemTheme();
    } else {
      themeId = mode;
    }
    
    this.applyTheme(themeId);
    
    if (this.config.persistPreference) {
      this.savePreferences();
    }
    
    this.emit('modeChanged', { mode });
  }
  
  /**
   * 切换深色/浅色模式
   */
  toggleMode(): void {
    const newMode = this.getCurrentMode() === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }
  
  /**
   * 获取当前模式
   */
  getCurrentMode(): 'light' | 'dark' {
    if (this.currentMode === 'auto') {
      return this.detectSystemTheme() as 'light' | 'dark';
    }
    return this.currentMode;
  }
  
  /**
   * 获取所有主题
   */
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }
  
  /**
   * 自定义主题
   */
  customizeTheme(baseThemeId: string, customizations: Partial<Theme>): Theme {
    const baseTheme = this.themes.get(baseThemeId);
    if (!baseTheme) {
      throw new Error(`Base theme "${baseThemeId}" not found`);
    }
    
    const customTheme: Theme = {
      ...baseTheme,
      ...customizations,
      id: customizations.id || `custom-${Date.now()}`,
      name: customizations.name || `Custom ${baseTheme.name}`,
      colors: { ...baseTheme.colors, ...customizations.colors },
      fonts: { ...baseTheme.fonts, ...customizations.fonts },
      spacing: { ...baseTheme.spacing, ...customizations.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...customizations.borderRadius },
      transitions: { ...baseTheme.transitions, ...customizations.transitions }
    };
    
    this.registerTheme(customTheme);
    return customTheme;
  }
  
  /**
   * 预览主题
   */
  private previewTheme(theme: Theme, options: ApplyThemeOptions): void {
    // 创建临时样式元素
    if (!this.previewElement) {
      this.previewElement = document.createElement('style');
      this.previewElement.id = 'theme-preview';
      document.head.appendChild(this.previewElement);
    }
    
    const cssVars = this.generateCSSVariables(theme);
    this.previewElement.textContent = `:root { ${cssVars} }`;
    
    // 自动清除预览
    setTimeout(() => {
      this.clearPreview();
    }, options.duration || 5000);
  }
  
  /**
   * 清除预览
   */
  clearPreview(): void {
    if (this.previewElement) {
      this.previewElement.remove();
      this.previewElement = null;
      
      // 恢复当前主题
      if (this.currentTheme) {
        this.applyCSSVariables(this.currentTheme);
      }
    }
  }
  
  /**
   * 应用CSS变量
   */
  private applyCSSVariables(theme: Theme): void {
    const root = document.documentElement;
    const cssVars = this.generateCSSVariables(theme);
    
    // 解析并应用每个变量
    const vars = cssVars.split(';').filter(v => v.trim());
    for (const varDef of vars) {
      const [name, value] = varDef.split(':').map(s => s.trim());
      if (name && value) {
        root.style.setProperty(name, value);
      }
    }
  }
  
  /**
   * 生成CSS变量
   */
  private generateCSSVariables(theme: Theme): string {
    const vars: string[] = [];
    
    // 颜色变量
    for (const [key, value] of Object.entries(theme.colors)) {
      vars.push(`--color-${this.camelToKebab(key)}: ${value}`);
    }
    
    // 字体变量
    vars.push(`--font-family: ${theme.fonts.fontFamily}`);
    vars.push(`--font-family-mono: ${theme.fonts.fontFamilyMono}`);
    for (const [key, value] of Object.entries(theme.fonts.fontSize)) {
      vars.push(`--font-size-${key}: ${value}`);
    }
    for (const [key, value] of Object.entries(theme.fonts.fontWeight)) {
      vars.push(`--font-weight-${key}: ${value}`);
    }
    for (const [key, value] of Object.entries(theme.fonts.lineHeight)) {
      vars.push(`--line-height-${key}: ${value}`);
    }
    
    // 间距变量
    for (const [key, value] of Object.entries(theme.spacing)) {
      vars.push(`--spacing-${key}: ${value}`);
    }
    
    // 圆角变量
    for (const [key, value] of Object.entries(theme.borderRadius)) {
      vars.push(`--border-radius-${key}: ${value}`);
    }
    
    // 过渡变量
    vars.push(`--transition-fast: ${theme.transitions.fast}`);
    vars.push(`--transition-normal: ${theme.transitions.normal}`);
    vars.push(`--transition-slow: ${theme.transitions.slow}`);
    for (const [key, value] of Object.entries(theme.transitions.easing)) {
      vars.push(`--easing-${key}: ${value}`);
    }
    
    // 自定义变量
    if (theme.custom) {
      for (const [key, value] of Object.entries(theme.custom)) {
        vars.push(`--${this.camelToKebab(key)}: ${value}`);
      }
    }
    
    return vars.join('; ');
  }
  
  /**
   * 更新body类名
   */
  private updateBodyClasses(theme: Theme): void {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme.mode}`);
    document.body.setAttribute('data-theme', theme.id);
  }
  
  /**
   * 启用过渡效果
   */
  private enableTransition(duration?: number): void {
    const dur = duration || this.config.transitionDuration;
    const root = document.documentElement;
    
    root.style.setProperty('--theme-transition-duration', `${dur}ms`);
    root.classList.add('theme-transitioning');
    
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, dur);
  }
  
  /**
   * 合并主题
   */
  private mergeThemes(base: Theme, override: Theme): Theme {
    return {
      ...base,
      ...override,
      colors: { ...base.colors, ...override.colors },
      fonts: { ...base.fonts, ...override.fonts },
      spacing: { ...base.spacing, ...override.spacing },
      borderRadius: { ...base.borderRadius, ...override.borderRadius },
      transitions: { ...base.transitions, ...override.transitions }
    };
  }
  
  /**
   * 检测系统主题
   */
  private detectSystemTheme(): string {
    if (typeof window === 'undefined') return 'light';
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return darkModeQuery.matches ? 'dark' : 'light';
  }
  
  /**
   * 监听系统主题变化
   */
  private watchSystemTheme(): void {
    if (typeof window === 'undefined') return;
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      if (this.currentMode === 'auto') {
        const themeId = e.matches ? 'dark' : 'light';
        this.applyTheme(themeId);
      }
    });
  }
  
  /**
   * 保存偏好
   */
  private savePreferences(): void {
    try {
      const prefs = {
        themeId: this.currentTheme?.id,
        mode: this.currentMode
      };
      localStorage.setItem('theme-preferences', JSON.stringify(prefs));
    } catch (error) {
      logger.warn('Failed to save theme preferences:', error);
    }
  }
  
  /**
   * 加载偏好
   */
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('theme-preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.mode) {
          this.currentMode = prefs.mode;
        }
        // 主题将在初始化时应用
      }
    } catch (error) {
      logger.warn('Failed to load theme preferences:', error);
    }
  }
  
  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }
  
  /**
   * 导出主题为JSON
   */
  exportTheme(themeId: string): string {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme "${themeId}" not found`);
    }
    return JSON.stringify(theme, null, 2);
  }
  
  /**
   * 从JSON导入主题
   */
  importTheme(themeJson: string): Theme {
    try {
      const theme = JSON.parse(themeJson) as Theme;
      this.registerTheme(theme);
      return theme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error}`);
    }
  }
  
  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearPreview();
    this.removeAllListeners();
  }
}

// ================================================
// 4. 导出单例
// ================================================

/**
 * 默认主题管理器实例
 */
export const themeManager = new ThemeManager();
