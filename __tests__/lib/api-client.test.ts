/**
 * @fileoverview API客户端模块测试
 * @description 测试api-client的所有HTTP方法和错误处理
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

// Mock env module
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  },
}));

// Mock logger module
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ApiClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET请求', () => {
    it('应该发送GET请求并返回数据', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.get<{ message: string }>('/test');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('应该支持自定义选项', async () => {
      const mockData = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.get('/test', {
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
    });

    it('应该在响应失败时抛出错误', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Not Found' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow('Not Found');
    });

    it('应该在网络错误时抛出错误', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });
  });

  describe('POST请求', () => {
    it('应该发送POST请求并返回数据', async () => {
      const mockData = { success: true };
      const postData = { name: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.post('/test', postData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockData);
    });

    it('应该支持不发送数据的POST请求', async () => {
      const mockData = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.post('/test');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(undefined),
      });
    });
  });

  describe('PUT请求', () => {
    it('应该发送PUT请求并返回数据', async () => {
      const mockData = { updated: true };
      const putData = { id: 1, name: 'updated' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.put('/test/1', putData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(putData),
      });
      expect(result).toEqual(mockData);
    });

    it('应该支持自定义headers', async () => {
      const mockData = { updated: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.put('/test/1', { name: 'test' }, {
        headers: {
          'X-Custom-Header': 'value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value',
        },
        body: JSON.stringify({ name: 'test' }),
      });
    });
  });

  describe('DELETE请求', () => {
    it('应该发送DELETE请求并返回数据', async () => {
      const mockData = { deleted: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('应该支持DELETE请求的额外选项', async () => {
      const mockData = { deleted: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.delete('/test/1', {
        headers: {
          'Authorization': 'Bearer token',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
    });
  });

  describe('通用请求方法', () => {
    it('应该正确合并自定义headers', async () => {
      const mockData = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.get('/test', {
        headers: {
          'X-Custom': 'value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom': 'value',
          }),
        })
      );
    });

    it('应该覆盖默认Content-Type', async () => {
      const mockData = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.get('/test', {
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'text/plain',
          }),
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该记录API请求失败日志', async () => {
      const { logger } = await import('@/lib/logger');
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'API Error' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow('API Error');
      expect(logger.error).toHaveBeenCalledWith(
        'API request failed',
        expect.any(Error)
      );
    });

    it('应该处理JSON解析错误', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow('Invalid JSON');
    });

    it('应该在错误响应没有message时使用默认错误信息', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Some error' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow('Request failed');
    });
  });

  describe('类型安全', () => {
    it('应该正确处理泛型类型', async () => {
      interface User {
        id: number;
        name: string;
      }

      const mockUser: User = { id: 1, name: 'Test User' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await apiClient.get<User>('/user/1');

      expect(result).toEqual(mockUser);
      // TypeScript should infer the type correctly
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test User');
    });

    it('应该处理不同的响应类型', async () => {
      const stringResponse = 'string data';
      const objectResponse = { key: 'value' };
      const arrayResponse = [1, 2, 3];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => objectResponse,
      } as Response);

      const result = await apiClient.get<{ key: string }>('/test');
      expect(result).toEqual(objectResponse);
    });
  });

  describe('baseURL配置', () => {
    it('应该使用env中的API URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.any(Object)
      );
    });
  });
});
