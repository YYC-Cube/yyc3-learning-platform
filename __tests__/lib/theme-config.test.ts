import { describe, it, expect } from 'vitest';
import { themeConfig, brandTheme, useBrandTheme } from '@/components/theme-provider/index';

describe('theme-config', () => {
  describe('themeConfig', () => {
    it('should have correct default configuration', () => {
      expect(themeConfig.attribute).toBe('class');
      expect(themeConfig.defaultTheme).toBe('system');
      expect(themeConfig.enableSystem).toBe(true);
      expect(themeConfig.storageKey).toBe('yanyu-theme');
      expect(themeConfig.themes).toEqual(['light', 'dark', 'system']);
    });
  });

  describe('brandTheme', () => {
    it('should have light and dark themes', () => {
      expect(brandTheme).toHaveProperty('light');
      expect(brandTheme).toHaveProperty('dark');
    });

    it('should have gradient configurations', () => {
      expect(brandTheme.light.gradient).toBeDefined();
      expect(brandTheme.light.gradient.brand).toBeDefined();
      expect(brandTheme.dark.gradient).toBeDefined();
    });

    it('should have primary color in both themes', () => {
      expect(brandTheme.light.primary).toBeDefined();
      expect(brandTheme.dark.primary).toBeDefined();
    });
  });
});
