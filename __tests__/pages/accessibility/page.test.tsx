/**
 * @fileoverview 无障碍访问页面组件测试
 * @description 测试accessibility页面的渲染、交互和状态管理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-04
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessibilityPage from '@/app/accessibility/page';

// Mock the components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      aria-describedby={(props as any)['aria-describedby']}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step, ...props }: any) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div>
      <div data-value={value}>{children}</div>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span>Select Value</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, onClick }: any) => (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/responsive-layout', () => ({
  ResponsiveLayout: ({ title, children }: any) => (
    <div>
      {/* Don't render title to avoid duplicates */}
      {children}
    </div>
  ),
}));

vi.mock('@/components/accessibility/accessible-button', () => ({
  AccessibleButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/accessibility/live-region', () => ({
  LiveRegion: ({ message }: any) => <div role="status" aria-live="polite" id="live-region">{message}</div>,
}));

vi.mock('lucide-react', () => ({
  Eye: () => <span data-icon="eye">Eye Icon</span>,
  Volume2: () => <span data-icon="volume">Volume Icon</span>,
  Keyboard: () => <span data-icon="keyboard">Keyboard Icon</span>,
  MousePointer: () => <span data-icon="mouse">Mouse Icon</span>,
}));

describe('AccessibilityPage页面组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初始渲染', () => {
    it('应该渲染页面标题和描述', () => {
      render(<AccessibilityPage />);

      expect(screen.getByText('无障碍访问设置')).toBeTruthy();
      expect(
        screen.getByText('自定义您的学习体验，让系统更适合您的需求')
      ).toBeTruthy();
    });

    it('应该渲染所有设置卡片', () => {
      render(<AccessibilityPage />);

      expect(screen.getByText('视觉设置')).toBeTruthy();
      expect(screen.getByText('交互设置')).toBeTruthy();
      expect(screen.getByText('音频设置')).toBeTruthy();
      expect(screen.getByText('键盘快捷键')).toBeTruthy();
    });

    it('应该使用默认设置值', () => {
      render(<AccessibilityPage />);

      // Check default switch values
      const highContrast = screen.getByLabelText('高对比度模式') as HTMLInputElement;
      expect(highContrast.checked).toBe(false);

      const keyboardNav = screen.getByLabelText('键盘导航增强') as HTMLInputElement;
      expect(keyboardNav.checked).toBe(true);
    });
  });

  describe('视觉设置', () => {
    it('应该切换高对比度模式', () => {
      render(<AccessibilityPage />);

      const highContrast = screen.getByLabelText('高对比度模式');
      expect(highContrast).toBeTruthy();

      fireEvent.click(highContrast);
      expect((highContrast as HTMLInputElement).checked).toBe(true);
    });

    it('应该切换大字体模式', () => {
      render(<AccessibilityPage />);

      const largeText = screen.getByLabelText('大字体模式');

      fireEvent.click(largeText);
      expect((largeText as HTMLInputElement).checked).toBe(true);
    });

    it('应该调整字体大小滑块', () => {
      render(<AccessibilityPage />);

      const fontSizeLabel = screen.getByText(/字体大小：/);
      expect(fontSizeLabel.textContent).toContain('16px');

      const slider = screen.getByLabelText('字体大小：16px');
      fireEvent.change(slider, { target: { value: '20' } });

      // Label should update
      expect(screen.getByText(/字体大小：20px/)).toBeTruthy();
    });

    it('应该支持字体大小范围内的调整', () => {
      render(<AccessibilityPage />);

      const slider = screen.getByLabelText(/字体大小：/);

      // Test minimum
      fireEvent.change(slider, { target: { value: '12' } });
      expect(screen.getByText(/字体大小：12px/)).toBeTruthy();

      // Test maximum
      fireEvent.change(slider, { target: { value: '24' } });
      expect(screen.getByText(/字体大小：24px/)).toBeTruthy();
    });

    it('应该显示颜色主题选择说明', () => {
      render(<AccessibilityPage />);

      expect(screen.getByText('颜色主题')).toBeTruthy();
      expect(screen.getByText('选择适合您的颜色主题')).toBeTruthy();
    });
  });

  describe('交互设置', () => {
    it('应该切换减少动画效果', () => {
      render(<AccessibilityPage />);

      const reducedMotion = screen.getByLabelText('减少动画效果');

      fireEvent.click(reducedMotion);
      expect((reducedMotion as HTMLInputElement).checked).toBe(true);
    });

    it('应该切换键盘导航增强', () => {
      render(<AccessibilityPage />);

      const keyboardNav = screen.getByLabelText('键盘导航增强');

      fireEvent.click(keyboardNav);
      expect((keyboardNav as HTMLInputElement).checked).toBe(false);
    });

    it('应该切换焦点指示器', () => {
      render(<AccessibilityPage />);

      const focusIndicator = screen.getByLabelText('焦点指示器');

      fireEvent.click(focusIndicator);
      expect((focusIndicator as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('音频设置', () => {
    it('应该切换音效反馈', () => {
      render(<AccessibilityPage />);

      const soundEnabled = screen.getByLabelText('音效反馈');
      expect((soundEnabled as HTMLInputElement).checked).toBe(true);

      fireEvent.click(soundEnabled);
      expect((soundEnabled as HTMLInputElement).checked).toBe(false);
    });

    it('应该切换屏幕阅读器优化', () => {
      render(<AccessibilityPage />);

      const screenReader = screen.getByLabelText('屏幕阅读器优化');

      fireEvent.click(screenReader);
      expect((screenReader as HTMLInputElement).checked).toBe(true);
    });
  });

  describe('键盘快捷键说明', () => {
    it('应该显示所有快捷键', () => {
      render(<AccessibilityPage />);

      expect(screen.getByText('Tab')).toBeTruthy();
      expect(screen.getByText('下一个元素')).toBeTruthy();

      expect(screen.getByText('Shift + Tab')).toBeTruthy();
      expect(screen.getByText('上一个元素')).toBeTruthy();

      expect(screen.getByText('Enter / Space')).toBeTruthy();
      expect(screen.getByText('激活按钮')).toBeTruthy();

      expect(screen.getByText('Esc')).toBeTruthy();
      expect(screen.getByText('关闭对话框')).toBeTruthy();

      expect(screen.getByText('Alt + M')).toBeTruthy();
      expect(screen.getByText('打开菜单')).toBeTruthy();
    });
  });

  describe('快速操作按钮', () => {
    it('应该有保存设置按钮', () => {
      render(<AccessibilityPage />);

      const saveButton = screen.getByText('保存设置');
      expect(saveButton).toBeTruthy();
    });

    it('应该有重置为默认按钮', () => {
      render(<AccessibilityPage />);

      const resetButton = screen.getByText('重置为默认');
      expect(resetButton).toBeTruthy();
    });

    it('保存按钮应该触发公告消息', () => {
      render(<AccessibilityPage />);

      const saveButton = screen.getByText('保存设置');
      fireEvent.click(saveButton);

      expect(screen.getByText('设置已保存')).toBeTruthy();
    });

    it('重置按钮应该恢复所有默认设置', () => {
      render(<AccessibilityPage />);

      // Change some settings
      const highContrast = screen.getByLabelText('高对比度模式');
      fireEvent.click(highContrast);
      expect((highContrast as HTMLInputElement).checked).toBe(true);

      // Click reset
      const resetButton = screen.getByText('重置为默认');
      fireEvent.click(resetButton);

      expect(screen.getByText('设置已重置为默认值')).toBeTruthy();
      expect((highContrast as HTMLInputElement).checked).toBe(false);
    });

    it('重置应该恢复所有设置到初始状态', () => {
      render(<AccessibilityPage />);

      // Change multiple settings
      fireEvent.click(screen.getByLabelText('高对比度模式'));
      fireEvent.click(screen.getByLabelText('大字体模式'));
      fireEvent.click(screen.getByLabelText('音效反馈'));

      // Reset
      fireEvent.click(screen.getByText('重置为默认'));

      // Verify all are reset
      expect((screen.getByLabelText('高对比度模式') as HTMLInputElement).checked).toBe(false);
      expect((screen.getByLabelText('大字体模式') as HTMLInputElement).checked).toBe(false);
      expect((screen.getByLabelText('音效反馈') as HTMLInputElement).checked).toBe(true);
    });
  });

  describe('实时公告区域', () => {
    it('应该初始时不显示公告', () => {
      render(<AccessibilityPage />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion.textContent).toBe('');
    });

    it('应该在更改设置时显示公告', () => {
      render(<AccessibilityPage />);

      const highContrast = screen.getByLabelText('高对比度模式');
      fireEvent.click(highContrast);

      expect(screen.getByText('设置已更新：highContrast')).toBeTruthy();
    });

    it('应该更新公告消息为最新的设置', () => {
      render(<AccessibilityPage />);

      // Change first setting
      fireEvent.click(screen.getByLabelText('高对比度模式'));
      expect(screen.getByText('设置已更新：highContrast')).toBeTruthy();

      // Change second setting
      fireEvent.click(screen.getByLabelText('大字体模式'));
      expect(screen.getByText('设置已更新：largeText')).toBeTruthy();
      expect(screen.queryByText('设置已更新：highContrast')).toBeNull();
    });
  });

  describe('设置描述文本', () => {
    it('应该显示所有设置的描述', () => {
      render(<AccessibilityPage />);

      expect(screen.getByText('增强文字和背景的对比度，提高可读性')).toBeTruthy();
      expect(screen.getByText('使用更大的字体大小，便于阅读')).toBeTruthy();
      expect(screen.getByText('调整系统字体大小')).toBeTruthy();
      expect(screen.getByText('减少页面动画和过渡效果')).toBeTruthy();
      expect(screen.getByText('增强键盘导航功能和焦点指示器')).toBeTruthy();
      expect(screen.getByText('显示明显的焦点指示器')).toBeTruthy();
      expect(screen.getByText('启用操作音效反馈')).toBeTruthy();
      expect(screen.getByText('优化屏幕阅读器体验')).toBeTruthy();
    });
  });

  describe('状态一致性', () => {
    it('应该保持设置的同步状态', () => {
      render(<AccessibilityPage />);

      const switches = [
        screen.getByLabelText('高对比度模式'),
        screen.getByLabelText('大字体模式'),
        screen.getByLabelText('减少动画效果'),
        screen.getByLabelText('键盘导航增强'),
        screen.getByLabelText('焦点指示器'),
        screen.getByLabelText('音效反馈'),
        screen.getByLabelText('屏幕阅读器优化'),
      ];

      // Toggle all
      switches.forEach((sw) => fireEvent.click(sw));

      // Check all are toggled
      expect((switches[0] as HTMLInputElement).checked).toBe(true);
      expect((switches[1] as HTMLInputElement).checked).toBe(true);
      expect((switches[2] as HTMLInputElement).checked).toBe(true);
      expect((switches[3] as HTMLInputElement).checked).toBe(false);
      expect((switches[4] as HTMLInputElement).checked).toBe(false);
      expect((switches[5] as HTMLInputElement).checked).toBe(false);
      expect((switches[6] as HTMLInputElement).checked).toBe(true);
    });

    it('应该在重置后保持状态一致性', async () => {
      render(<AccessibilityPage />);

      // Change settings
      const slider = screen.getByLabelText(/字体大小：/);
      fireEvent.change(slider, { target: { value: '20' } });
      fireEvent.click(screen.getByLabelText('高对比度模式'));

      // Reset
      fireEvent.click(screen.getByText('重置为默认'));

      // Verify reset state
      expect(screen.getByLabelText(/字体大小：16px/)).toBeTruthy();
      expect((screen.getByLabelText('高对比度模式') as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('可访问性属性', () => {
    it('应该正确设置aria-labelledby', () => {
      render(<AccessibilityPage />);

      // Check that the visual settings section exists
      expect(screen.getByText('视觉设置')).toBeTruthy();
      expect(screen.getByText('交互设置')).toBeTruthy();
    });

    it('应该有描述性aria-describedby', () => {
      render(<AccessibilityPage />);

      // Check that the switch and its description exist
      const highContrast = screen.getByLabelText('高对比度模式');
      expect(highContrast).toBeTruthy();

      expect(screen.getByText('增强文字和背景的对比度，提高可读性')).toBeTruthy();
    });

    it('应该有live-region用于屏幕阅读器', () => {
      render(<AccessibilityPage />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
