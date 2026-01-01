/**
 * @file 全局主题配置
 * @description 统一的UI主题配置系统，包含颜色、字体、间距、动画等
 * @module theme-config
 * @author YYC³
 * @version 1.0.0
 */

/**
 * 颜色系统 - 基于 Tailwind CSS 设计令牌
 */
export const colors = {
  primary: {
    50: 'hsl(217, 91%, 95%)',
    100: 'hsl(217, 91%, 90%)',
    200: 'hsl(217, 91%, 80%)',
    300: 'hsl(217, 91%, 70%)',
    400: 'hsl(217, 91%, 60%)',
    500: 'hsl(217, 91%, 50%)',
    600: 'hsl(217, 91%, 45%)',
    700: 'hsl(217, 91%, 40%)',
    800: 'hsl(217, 91%, 30%)',
    900: 'hsl(217, 91%, 20%)',
  },
  success: {
    light: 'hsl(142, 76%, 36%)',
    DEFAULT: 'hsl(142, 71%, 45%)',
    dark: 'hsl(142, 76%, 26%)',
  },
  warning: {
    light: 'hsl(38, 92%, 50%)',
    DEFAULT: 'hsl(25, 95%, 53%)',
    dark: 'hsl(25, 95%, 43%)',
  },
  error: {
    light: 'hsl(0, 84%, 60%)',
    DEFAULT: 'hsl(0, 84%, 50%)',
    dark: 'hsl(0, 84%, 40%)',
  },
  info: {
    light: 'hsl(199, 89%, 48%)',
    DEFAULT: 'hsl(199, 89%, 38%)',
    dark: 'hsl(199, 89%, 28%)',
  },
} as const

/**
 * 间距系统 - 8px 基准
 */
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
} as const

/**
 * 字体系统
 */
export const typography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ].join(', '),
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"SF Mono"',
      'Menlo',
      'Consolas',
      '"Liberation Mono"',
      'monospace',
    ].join(', '),
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

/**
 * 边框圆角
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const

/**
 * 阴影系统
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const

/**
 * 动画配置
 */
export const animation = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

/**
 * 断点系统 - 响应式设计
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Z-index 层级系统
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

/**
 * 表单控件尺寸
 */
export const controlSizes = {
  sm: {
    height: '2rem',      // 32px
    padding: '0.5rem',   // 8px
    fontSize: '0.875rem', // 14px
  },
  md: {
    height: '2.5rem',    // 40px
    padding: '0.75rem',  // 12px
    fontSize: '1rem',    // 16px
  },
  lg: {
    height: '3rem',      // 48px
    padding: '1rem',     // 16px
    fontSize: '1.125rem', // 18px
  },
} as const

/**
 * 响应式容器最大宽度
 */
export const containerMaxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const

/**
 * 导出完整主题配置
 */
export const themeConfig = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  controlSizes,
  containerMaxWidth,
} as const

export type ThemeConfig = typeof themeConfig
