/**
 * @fileoverview 消息存储服务 - 使用IndexedDB实现消息持久化存储
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'read' | 'error';
  files?: StoredFileInfo[];
  avatar?: string;
}

export interface StoredFileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status?: 'uploading' | 'uploaded' | 'error';
}

export interface MessageFilter {
  role?: 'user' | 'assistant' | 'system';
  startDate?: number;
  endDate?: number;
  keyword?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  filter?: MessageFilter;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

class MessageStorageService {
  private static instance: MessageStorageService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'YYC3MessageDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'messages';
  private readonly SYNC_STORE_NAME = 'sync';

  private constructor() {}

  public static getInstance(): MessageStorageService {
    if (!MessageStorageService.instance) {
      MessageStorageService.instance = new MessageStorageService();
    }
    return MessageStorageService.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(new Error('无法打开IndexedDB'));
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建消息存储
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const messageStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
          messageStore.createIndex('role', 'role', { unique: false });
          messageStore.createIndex('timestamp_role', ['timestamp', 'role'], { unique: false });
        }

        // 创建同步状态存储
        if (!db.objectStoreNames.contains(this.SYNC_STORE_NAME)) {
          const syncStore = db.createObjectStore(this.SYNC_STORE_NAME, { keyPath: 'key' });
          syncStore.createIndex('lastSyncTime', 'lastSyncTime', { unique: false });
        }
      };
    });
  }

  async addMessage(message: StoredMessage): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(message);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('添加消息失败'));
    });
  }

  async addMessages(messages: StoredMessage[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      messages.forEach((message) => {
        store.add(message);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('批量添加消息失败'));
    });
  }

  async updateMessage(messageId: string, updates: Partial<StoredMessage>): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(messageId);

      request.onsuccess = () => {
        const message = request.result;
        if (message) {
          const updatedMessage = { ...message, ...updates };
          const updateRequest = store.put(updatedMessage);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('更新消息失败'));
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('获取消息失败'));
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(messageId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除消息失败'));
    });
  }

  async clearMessages(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('清空消息失败'));
    });
  }

  async getMessage(messageId: string): Promise<StoredMessage | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(messageId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('获取消息失败'));
    });
  }

  async getMessages(options: PaginationOptions): Promise<PaginatedResult<StoredMessage>> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      
      let messages: StoredMessage[] = [];
      let total = 0;
      
      // 获取所有消息
      const getAllRequest = index.getAll();
      
      getAllRequest.onsuccess = () => {
        let allMessages = getAllRequest.result as StoredMessage[];
        
        // 应用筛选条件
        if (options.filter) {
          if (options.filter.role) {
            allMessages = allMessages.filter(m => m.role === options.filter.role);
          }
          
          if (options.filter.startDate) {
            allMessages = allMessages.filter(m => m.timestamp >= options.filter.startDate!);
          }
          
          if (options.filter.endDate) {
            allMessages = allMessages.filter(m => m.timestamp <= options.filter.endDate!);
          }
          
          if (options.filter.keyword) {
            const keyword = options.filter.keyword.toLowerCase();
            allMessages = allMessages.filter(m => 
              m.content.toLowerCase().includes(keyword)
            );
          }
        }
        
        // 按时间戳降序排序
        allMessages.sort((a, b) => b.timestamp - a.timestamp);
        
        total = allMessages.length;
        
        // 分页
        const startIndex = (options.page - 1) * options.pageSize;
        const endIndex = startIndex + options.pageSize;
        messages = allMessages.slice(startIndex, endIndex);
        
        resolve({
          data: messages,
          total,
          page: options.page,
          pageSize: options.pageSize,
          hasMore: endIndex < total
        });
      };
      
      getAllRequest.onerror = () => reject(new Error('获取消息列表失败'));
    });
  }

  async searchMessages(keyword: string, limit: number = 50): Promise<StoredMessage[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      
      const getAllRequest = index.getAll();
      
      getAllRequest.onsuccess = () => {
        const allMessages = getAllRequest.result as StoredMessage[];
        const lowerKeyword = keyword.toLowerCase();
        
        const filteredMessages = allMessages
          .filter(m => m.content.toLowerCase().includes(lowerKeyword))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        
        resolve(filteredMessages);
      };
      
      getAllRequest.onerror = () => reject(new Error('搜索消息失败'));
    });
  }

  async getMessagesByTimeRange(
    startDate: number,
    endDate: number
  ): Promise<StoredMessage[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      
      const getAllRequest = index.getAll();
      
      getAllRequest.onsuccess = () => {
        const allMessages = getAllRequest.result as StoredMessage[];
        
        const filteredMessages = allMessages
          .filter(m => m.timestamp >= startDate && m.timestamp <= endDate)
          .sort((a, b) => b.timestamp - a.timestamp);
        
        resolve(filteredMessages);
      };
      
      getAllRequest.onerror = () => reject(new Error('按时间范围获取消息失败'));
    });
  }

  async getMessageCount(): Promise<number> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取消息数量失败'));
    });
  }

  async getLastSyncTime(): Promise<number> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SYNC_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.SYNC_STORE_NAME);
      const request = store.get('lastSync');

      request.onsuccess = () => {
        resolve(request.result?.lastSyncTime || 0);
      };
      request.onerror = () => resolve(0);
    });
  }

  async updateLastSyncTime(timestamp: number): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SYNC_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.SYNC_STORE_NAME);
      const request = store.put({
        key: 'lastSync',
        lastSyncTime: timestamp
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('更新同步时间失败'));
    });
  }

  async exportMessages(): Promise<string> {
    const messages = await this.getMessages({ page: 1, pageSize: 10000 });
    return JSON.stringify(messages.data, null, 2);
  }

  async importMessages(jsonData: string): Promise<number> {
    try {
      const messages = JSON.parse(jsonData) as StoredMessage[];
      await this.addMessages(messages);
      return messages.length;
    } catch (error) {
      throw new Error('导入消息失败：' + (error as Error).message);
    }
  }
}

export const messageStorage = MessageStorageService.getInstance();
export default messageStorage;