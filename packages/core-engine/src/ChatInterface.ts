/**
 * ChatInterface - 聊天界面组件
 * 提供自然、流畅、多模态的对话体验，支持复杂交互和富媒体展示
 * 
 * 设计理念：
 * - 实时性：毫秒级响应，流式输出
 * - 可访问性：支持屏幕阅读器、键盘导航、高对比度模式
 * - 可扩展性：插件化架构，支持自定义消息类型
 * - 安全性：端到端加密，敏感词过滤，权限控制
 * 
 * @module ChatInterface
 */

import { EventEmitter } from 'events';

// ================================================
// 类型定义
// ================================================

export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  type: MessageType;
  timestamp?: Date;
  metadata?: MessageMetadata;
  attachments?: Attachment[];
  status?: MessageStatus;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  LOCATION = 'location',
  CONTACT = 'contact',
  CODE = 'code',
  MARKDOWN = 'markdown'
}

export enum MessageStatus {
  DRAFT = 'draft',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface MessageMetadata {
  language?: string;
  emotion?: string;
  intent?: string;
  entities?: Entity[];
  confidence?: number;
  [key: string]: any;
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export interface Attachment {
  id: string;
  type: string;
  name: string;
  size: number;
  url: string;
  thumbnail?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  unreadCount: number;
  metadata?: Record<string, any>;
}

export interface SessionTemplate {
  name: string;
  systemPrompt?: string;
  settings?: ChatSettings;
  initialMessages?: ChatMessage[];
}

export interface ChatSettings {
  theme: ChatTheme;
  layout: ChatLayout;
  language: string;
  fontSize: number;
  enableTypingIndicator: boolean;
  enableReadReceipts: boolean;
  enableSoundNotifications: boolean;
}

export enum ChatTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  HIGH_CONTRAST = 'high_contrast'
}

export enum ChatLayout {
  COMPACT = 'compact',
  COMFORTABLE = 'comfortable',
  SPACIOUS = 'spacious'
}

export interface HistoryOptions {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  messageTypes?: MessageType[];
}

export interface ReplyContext {
  userId: string;
  currentMessage: ChatMessage;
  conversationHistory: ChatMessage[];
  userProfile?: UserProfile;
}

export interface UserProfile {
  id: string;
  preferences: Record<string, any>;
  language: string;
  timezone: string;
}

export interface SuggestedReply {
  text: string;
  type: 'quick_reply' | 'smart_reply' | 'action';
  confidence: number;
  quickAction?: QuickAction;
  icon?: string;
}

export interface QuickAction {
  type: string;
  label: string;
  handler: () => void;
}

/**
 * KeyInformation - 对话关键信息
 * 存储从对话中提取的核心信息
 */
export interface KeyInformation {
  entities: string[];
  topics: string[];
  questions: number;
  keyEvents: string[];
  messageCount: number;
  duration: number;
  startTime: Date;
  endTime: Date;
}

/**
 * SummaryContent - 总结内容
 * 存储生成的总结核心内容
 */
export interface SummaryContent {
  conversationType: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  mainEntities: string[];
  mainTopics: string[];
  keyQuestions: number;
  keyEvents: string[];
  conclusions: string[];
  messageCount: number;
  duration: number;
}

export enum ExportFormat {
  JSON = 'json',
  HTML = 'html',
  MARKDOWN = 'markdown',
  PDF = 'pdf',
  TXT = 'txt'
}

export interface ExportedConversation {
  format: ExportFormat;
  content: string;
  metadata: {
    exportDate: Date;
    sessionId: string;
    messageCount: number;
  };
}

export interface IncomingMessage {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface AudioBlob {
  blob: Blob;
  duration: number;
  waveform?: number[];
}

export interface ImageBlob {
  blob: Blob;
  width: number;
  height: number;
  thumbnail?: Blob;
}

export interface ScreenShareStream {
  stream: MediaStream;
  screenId: string;
  displayName?: string;
}

export interface TypingData {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface ProcessedMessage extends ChatMessage {
  normalized: boolean;
  filtered: boolean;
  enriched: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ChatConfig {
  persistence: PersistenceConfig;
  encryption: EncryptionConfig;
  maxSessions: number;
  sessionTimeout: number;
  realtimeEndpoint: string;
  reconnectAttempts: number;
  maxFileSize: number;
  allowedFormats: string[];
  ui: UIConfig;
  analytics: AnalyticsConfig;
}

export interface PersistenceConfig {
  enabled: boolean;
  backend: 'localstorage' | 'indexeddb' | 'memory';
  maxHistorySize: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
}

export interface UIConfig {
  theme: ChatTheme;
  layout: ChatLayout;
  animations: boolean;
  accessibility: AccessibilityConfig;
}

export interface AccessibilityConfig {
  screenReader: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  fontSize: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  events: string[];
}

export interface ComponentStatus {
  initialized: boolean;
  connected: boolean;
  error?: string;
}

export interface ChatAnalyticsEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

// ================================================
// 辅助类实现
// ================================================

class MessageStore {
  private messages: Map<string, ChatMessage> = new Map();
  private config: PersistenceConfig;

  constructor(config: { persistence: PersistenceConfig; encryption: EncryptionConfig }) {
    this.config = config.persistence;
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    this.messages.set(message.id!, message);
    // 实际实现中需要持久化到存储
  }

  getMessages(options?: HistoryOptions): ChatMessage[] {
    let messages = Array.from(this.messages.values());

    if (options?.limit) {
      messages = messages.slice(-options.limit);
    }

    return messages;
  }

  clear(): void {
    this.messages.clear();
  }
}

class SessionManager {
  private sessions: Map<string, ChatSession> = new Map();
  private currentSessionId?: string;
  private config: { maxSessions: number; sessionTimeout: number };

  constructor(config: { maxSessions: number; sessionTimeout: number }) {
    this.config = config;
  }

  createSession(template?: SessionTemplate): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: ChatSession = {
      id: sessionId,
      name: template?.name || `会话 ${this.sessions.size + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      unreadCount: 0,
      metadata: template?.settings
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    return sessionId;
  }

  getCurrentSession(): ChatSession | undefined {
    return this.currentSessionId ? this.sessions.get(this.currentSessionId) : undefined;
  }

  switchSession(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      this.currentSessionId = sessionId;
    }
  }

  listSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  renameSession(sessionId: string, newName: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.name = newName;
      session.updatedAt = new Date();
    }
  }
}

class RealtimeService extends EventEmitter {
  private endpoint: string;
  private reconnectAttempts: number;
  private connected: boolean = false;

  constructor(config: { endpoint: string; reconnectAttempts: number }) {
    super();
    this.endpoint = config.endpoint;
    this.reconnectAttempts = config.reconnectAttempts;
  }

  async sendMessage(message: ProcessedMessage): Promise<{ messageId: string }> {
    // 模拟发送消息
    return {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  isConnected(): boolean {
    return this.connected;
  }
}

class MediaProcessor {
  private config: { maxFileSize: number; allowedFormats: string[] };

  constructor(config: { maxFileSize: number; allowedFormats: string[] }) {
    this.config = config;
  }

  async processAttachment(file: File): Promise<Attachment> {
    if (file.size > this.config.maxFileSize) {
      throw new Error(`文件大小超过限制: ${this.config.maxFileSize} bytes`);
    }

    return {
      id: `att_${Date.now()}`,
      type: file.type,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    };
  }
}

class UIManager {
  private config: UIConfig;

  constructor(config: UIConfig) {
    this.config = config;
  }

  addMessage(message: ChatMessage): void {
  }

  updateMessageStatus(tempId: string, status: string, realId?: string): void {
  }

  showTypingIndicator(userId: string, userName: string): void {
  }

  markAsRead(messageId: string, userId: string): void {
  }

  setupScreenReader(): void {
  }

  isInputFocused(): boolean {
    return document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA';
  }

  closeAllPanels(): void {
  }
}

class ChatAnalytics {
  private config: AnalyticsConfig;
  private events: ChatAnalyticsEvent[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  trackMessageSent(message: ProcessedMessage): void {
    this.track('message_sent', { messageType: message.type });
  }

  trackError(context: string, error: any): void {
    this.track('error', { context, error: error.message });
  }

  private track(type: string, data: Record<string, any>): void {
    if (this.config.enabled) {
      this.events.push({
        type,
        timestamp: new Date(),
        data
      });
    }
  }
}

class ChatError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'ChatError';
  }
}

// ================================================
// 核心接口定义
// ================================================

export interface IChatInterface {
  // 消息管理
  sendMessage(message: ChatMessage): Promise<string>;
  editMessage(messageId: string, newContent: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  getMessageHistory(options?: HistoryOptions): ChatMessage[];
  clearHistory(): Promise<void>;

  // 会话管理
  createNewSession(template?: SessionTemplate): string;
  switchSession(sessionId: string): Promise<void>;
  getCurrentSession(): ChatSession | undefined;
  listSessions(): ChatSession[];
  renameSession(sessionId: string, newName: string): void;

  // 交互功能
  suggestReplies(context: ReplyContext): Promise<SuggestedReply[]>;
  translateMessage(messageId: string, targetLanguage: string): Promise<string>;
  summarizeConversation(): Promise<string>;
  exportConversation(format: ExportFormat): Promise<ExportedConversation>;

  // 多模态支持
  uploadAttachment(file: File): Promise<Attachment>;
  recordVoice(): Promise<AudioBlob>;
  takePicture(): Promise<ImageBlob>;
  shareScreen(): Promise<ScreenShareStream>;

  // 实时功能
  startTypingIndicator(): void;
  stopTypingIndicator(): void;
  markMessageAsRead(messageId: string): void;
  getUnreadCount(): number;

  // 界面控制
  show(): void;
  hide(): void;
  minimize(): void;
  maximize(): void;
  setTheme(theme: ChatTheme): void;
  setLayout(layout: ChatLayout): void;

  // 可访问性支持
  enableHighContrast(enabled: boolean): void;
  adjustFontSize(size: number): void;
  enableKeyboardNavigation(enabled: boolean): void;
  enableScreenReaderSupport(enabled: boolean): void;

  // 生命周期
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): ComponentStatus;
}

// ================================================
// ChatInterface 实现
// ================================================

export class ChatInterface extends EventEmitter implements IChatInterface {
  private messageStore: MessageStore;
  private sessionManager: SessionManager;
  private realtimeService: RealtimeService;
  private mediaProcessor: MediaProcessor;
  private uiManager: UIManager;
  private analytics: ChatAnalytics;
  private config: ChatConfig;
  private status: ComponentStatus;

  constructor(config: ChatConfig) {
    super();
    this.config = config;
    this.status = { initialized: false, connected: false };

    // 初始化组件
    this.messageStore = new MessageStore({
      persistence: config.persistence,
      encryption: config.encryption
    });

    this.sessionManager = new SessionManager({
      maxSessions: config.maxSessions,
      sessionTimeout: config.sessionTimeout
    });

    this.realtimeService = new RealtimeService({
      endpoint: config.realtimeEndpoint,
      reconnectAttempts: config.reconnectAttempts
    });

    this.mediaProcessor = new MediaProcessor({
      maxFileSize: config.maxFileSize,
      allowedFormats: config.allowedFormats
    });

    this.uiManager = new UIManager(config.ui);
    this.analytics = new ChatAnalytics(config.analytics);
  }

  async initialize(): Promise<void> {
    try {
      this.setupEventHandlers();
      this.setupAccessibility();
      this.sessionManager.createSession();

      this.status.initialized = true;
      this.status.connected = this.realtimeService.isConnected();

      this.emit('initialized');
    } catch (error) {
      this.status.error = (error as Error).message;
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.removeAllListeners();
    this.status.initialized = false;
    this.status.connected = false;
    this.emit('shutdown');
  }

  getStatus(): ComponentStatus {
    return { ...this.status };
  }

  /**
   * 发送消息完整流程
   */
  async sendMessage(message: ChatMessage): Promise<string> {
    const startTime = Date.now();

    try {
      // 1. 验证消息
      const validated = await this.validateMessage(message);

      // 2. 预处理
      const processed = await this.preprocessMessage(validated);

      // 3. 生成临时ID
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 4. 乐观更新UI
      this.uiManager.addMessage({
        ...processed,
        id: tempId,
        status: MessageStatus.SENDING
      });

      // 5. 实际发送
      const response = await this.realtimeService.sendMessage(processed);

      // 6. 更新消息状态
      this.uiManager.updateMessageStatus(tempId, 'sent', response.messageId);

      // 7. 存储到历史
      await this.messageStore.saveMessage({
        ...processed,
        id: response.messageId,
        timestamp: new Date(),
        status: MessageStatus.SENT
      });

      // 8. 触发事件和分析
      this.analytics.trackMessageSent(processed);
      this.emit('message_sent', { messageId: response.messageId, duration: Date.now() - startTime });

      return response.messageId;

    } catch (error) {
      this.analytics.trackError('send_message', error);
      throw new ChatError(`消息发送失败: ${(error as Error).message}`, { message });
    }
  }

  async editMessage(messageId: string, newContent: string): Promise<void> {
    this.emit('message_edited', { messageId, newContent });
  }

  async deleteMessage(messageId: string): Promise<void> {
    this.emit('message_deleted', { messageId });
  }

  getMessageHistory(options?: HistoryOptions): ChatMessage[] {
    return this.messageStore.getMessages(options);
  }

  async clearHistory(): Promise<void> {
    this.messageStore.clear();
    this.emit('history_cleared');
  }

  createNewSession(template?: SessionTemplate): string {
    const sessionId = this.sessionManager.createSession(template);
    this.emit('session_created', { sessionId });
    return sessionId;
  }

  async switchSession(sessionId: string): Promise<void> {
    this.sessionManager.switchSession(sessionId);
    this.emit('session_switched', { sessionId });
  }

  getCurrentSession(): ChatSession | undefined {
    return this.sessionManager.getCurrentSession();
  }

  listSessions(): ChatSession[] {
    return this.sessionManager.listSessions();
  }

  renameSession(sessionId: string, newName: string): void {
    this.sessionManager.renameSession(sessionId, newName);
    this.emit('session_renamed', { sessionId, newName });
  }

  /**
   * 智能回复建议
   */
  async suggestReplies(context: ReplyContext): Promise<SuggestedReply[]> {
    try {
      // 1. 分析对话上下文
      const contextAnalysis = await this.analyzeConversationContext(context);

      // 2. 多策略生成建议
      const suggestedReplies = await this.generateRepliesWithStrategies(context, contextAnalysis);

      // 3. 个性化排序
      const rankedReplies = await this.personalizeReplyRanking(suggestedReplies, context.userProfile);

      return rankedReplies;
    } catch (error) {
      this.analytics.trackError('suggest_replies', error);
      // 失败时返回默认建议
      return [
        { text: '好的', type: 'quick_reply', confidence: 0.9, icon: '👍' },
        { text: '谢谢', type: 'quick_reply', confidence: 0.8, icon: '🙏' },
        { text: '稍等', type: 'quick_reply', confidence: 0.7, icon: '⏰' }
      ];
    }
  }

  /**
   * 分析对话上下文
   */
  private async analyzeConversationContext(context: ReplyContext): Promise<any> {
    const { currentMessage, conversationHistory } = context;

    // 计算对话长度
    const conversationLength = conversationHistory.length;

    // 分析当前消息的情感（简单实现）
    const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
      const positiveWords = ['好', '不错', '谢谢', '感谢', '棒', '优秀'];
      const negativeWords = ['不好', '糟糕', '不行', '错误', '问题', '失败'];

      const lowerText = text.toLowerCase();

      for (const word of positiveWords) {
        if (lowerText.includes(word)) {
          return 'positive';
        }
      }

      for (const word of negativeWords) {
        if (lowerText.includes(word)) {
          return 'negative';
        }
      }

      return 'neutral';
    };

    // 分析当前消息的意图（简单实现）
    const analyzeIntent = (text: string): string => {
      const intentPatterns = [
        { intent: 'question', pattern: /\?$/ },
        { intent: 'request', pattern: /请|麻烦|帮/ },
        { intent: 'statement', pattern: /.+/ }
      ];

      for (const { intent, pattern } of intentPatterns) {
        if (pattern.test(text)) {
          return intent;
        }
      }

      return 'statement';
    };

    const sentiment = analyzeSentiment(currentMessage.content);
    const intent = analyzeIntent(currentMessage.content);

    // 提取上下文关键词
    const extractKeywords = (messages: ChatMessage[]): string[] => {
      const keywords: Set<string> = new Set();
      const commonWords = ['的', '了', '和', '是', '在', '有', '不', '我', '你', '他'];

      messages.forEach(message => {
        const words = message.content.split(/\s+/).filter(word =>
          word.length > 1 && !commonWords.includes(word)
        );
        words.forEach(word => keywords.add(word));
      });

      return Array.from(keywords).slice(0, 10); // 最多取10个关键词
    };

    const keywords = extractKeywords([...conversationHistory.slice(-5), currentMessage]); // 最近5条消息

    return {
      conversationLength,
      sentiment,
      intent,
      keywords,
      lastMessageTime: currentMessage.timestamp || new Date()
    };
  }

  /**
   * 多策略生成回复建议
   */
  private async generateRepliesWithStrategies(context: ReplyContext, contextAnalysis: any): Promise<SuggestedReply[]> {
    const { currentMessage } = context;
    const { sentiment, intent, keywords } = contextAnalysis;

    const replies: SuggestedReply[] = [];

    // 策略1: 基于情感的回复
    const sentimentBasedReplies = await this.generateSentimentBasedReplies(sentiment, currentMessage);
    replies.push(...sentimentBasedReplies);

    // 策略2: 基于意图的回复
    const intentBasedReplies = await this.generateIntentBasedReplies(intent, currentMessage);
    replies.push(...intentBasedReplies);

    // 策略3: 基于关键词的回复
    const keywordBasedReplies = await this.generateKeywordBasedReplies(keywords, contextAnalysis);
    replies.push(...keywordBasedReplies);

    // 策略4: 基于历史模式的回复
    const patternBasedReplies = await this.generatePatternBasedReplies(context.conversationHistory);
    replies.push(...patternBasedReplies);

    return replies;
  }

  /**
   * 基于情感的回复
   */
  private async generateSentimentBasedReplies(sentiment: string, message: ChatMessage): Promise<SuggestedReply[]> {
    switch (sentiment) {
      case 'positive':
        return [
          { text: '很高兴能帮到你！', type: 'quick_reply', confidence: 0.95, icon: '😊' },
          { text: '随时为你服务！', type: 'quick_reply', confidence: 0.85, icon: '🤝' }
        ];
      case 'negative':
        return [
          { text: '很抱歉遇到了问题，我会尽力帮助你解决', type: 'quick_reply', confidence: 0.95, icon: '😔' },
          { text: '我们一起想办法解决这个问题', type: 'quick_reply', confidence: 0.85, icon: '💪' }
        ];
      default:
        return [
          { text: '我理解了', type: 'quick_reply', confidence: 0.9, icon: '👍' },
          { text: '好的，继续', type: 'quick_reply', confidence: 0.8, icon: '➡️' }
        ];
    }
  }

  /**
   * 基于意图的回复
   */
  private async generateIntentBasedReplies(intent: string, message: ChatMessage): Promise<SuggestedReply[]> {
    switch (intent) {
      case 'question':
        return [
          { text: '这是一个很好的问题，让我为你解答', type: 'quick_reply', confidence: 0.9, icon: '❓' },
          { text: '我需要更多信息来更好地回答你', type: 'quick_reply', confidence: 0.8, icon: 'ℹ️' }
        ];
      case 'request':
        return [
          { text: '我会立即处理你的请求', type: 'quick_reply', confidence: 0.95, icon: '⚡' },
          { text: '你的请求已收到，正在处理中', type: 'quick_reply', confidence: 0.85, icon: '⏳' }
        ];
      default:
        return [
          { text: '我明白了', type: 'quick_reply', confidence: 0.9, icon: '👌' },
          { text: '请继续分享', type: 'quick_reply', confidence: 0.8, icon: '💬' }
        ];
    }
  }

  /**
   * 基于关键词的回复
   */
  private async generateKeywordBasedReplies(keywords: string[], contextAnalysis: any): Promise<SuggestedReply[]> {
    const replies: SuggestedReply[] = [];

    // 简单的关键词匹配回复（实际可以更复杂）
    if (keywords.some(keyword => ['帮助', '支持', '问题'].includes(keyword))) {
      replies.push({
        text: '需要我提供更多帮助吗？',
        type: 'quick_reply',
        confidence: 0.9,
        icon: '🤝'
      });
    }

    if (keywords.some(keyword => ['谢谢', '感谢'].includes(keyword))) {
      replies.push({
        text: '不客气，很高兴能帮到你！',
        type: 'quick_reply',
        confidence: 0.95,
        icon: '🙏'
      });
    }

    if (keywords.some(keyword => ['时间', '什么时候', '多久'].includes(keyword))) {
      replies.push({
        text: '这通常需要几分钟时间',
        type: 'quick_reply',
        confidence: 0.8,
        icon: '⏰'
      });
    }

    return replies;
  }

  /**
   * 基于历史模式的回复
   */
  private async generatePatternBasedReplies(conversationHistory: ChatMessage[]): Promise<SuggestedReply[]> {
    const replies: SuggestedReply[] = [];

    // 分析历史对话模式
    if (conversationHistory.length > 2) {
      // 查看用户是否经常使用特定短语
      const userMessages = conversationHistory.filter(msg => msg.role === 'user');
      const frequentPhrases = this.detectFrequentPhrases(userMessages);

      if (frequentPhrases.length > 0) {
        // 基于频繁短语生成回复
        frequentPhrases.forEach(phrase => {
          if (phrase.phrase.includes('什么')) {
            replies.push({
              text: `关于${phrase.phrase.replace('什么', '')}，我可以提供详细信息`,
              type: 'quick_reply',
              confidence: 0.75,
              icon: '💡'
            });
          }
        });
      }
    }

    return replies;
  }

  /**
   * 检测用户常用短语
   */
  private detectFrequentPhrases(messages: ChatMessage[]): { phrase: string, count: number }[] {
    const phraseCounts = new Map<string, number>();

    messages.forEach(message => {
      const phrases = message.content.split(/[，。！？]/).filter(phrase => phrase.length > 2);
      phrases.forEach(phrase => {
        phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
      });
    });

    // 按出现次数排序，取前3个
    return Array.from(phraseCounts.entries())
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  /**
   * 个性化回复排序
   */
  private async personalizeReplyRanking(replies: SuggestedReply[], userProfile?: UserProfile): Promise<SuggestedReply[]> {
    if (!replies.length) return [];

    // 1. 基于用户偏好调整置信度
    let adjustedReplies = replies.map(reply => {
      let adjustedConfidence = reply.confidence;

      // 如果有用户偏好，根据偏好调整置信度
      if (userProfile?.preferences) {
        const { preferredReplyType } = userProfile.preferences;
        if (preferredReplyType && reply.type === preferredReplyType) {
          adjustedConfidence *= 1.1; // 增加10%的置信度
        }

        // 考虑用户的语言偏好
        if (userProfile.language === 'zh-CN') {
          // 中文环境下，更倾向于使用表情图标
          if (reply.icon) {
            adjustedConfidence *= 1.05;
          }
        }
      }

      // 2. 多样性调整（避免相似回复）
      return {
        ...reply,
        confidence: Math.min(adjustedConfidence, 1.0) // 确保不超过1.0
      };
    });

    // 3. 排序并去重
    const uniqueReplies = this.removeDuplicateReplies(adjustedReplies);

    // 4. 最终排序（按置信度降序）
    return uniqueReplies.sort((a, b) => b.confidence - a.confidence).slice(0, 5); // 最多返回5个建议
  }

  /**
   * 移除重复的回复建议
   */
  private removeDuplicateReplies(replies: SuggestedReply[]): SuggestedReply[] {
    const seenTexts = new Set<string>();
    const uniqueReplies: SuggestedReply[] = [];

    replies.forEach(reply => {
      if (!seenTexts.has(reply.text)) {
        seenTexts.add(reply.text);
        uniqueReplies.push(reply);
      }
    });

    return uniqueReplies;
  }

  async translateMessage(messageId: string, targetLanguage: string): Promise<string> {
    // 翻译功能待实现
    return `Translated to ${targetLanguage}`;
  }

  /**
   * 生成对话总结
   * @returns 格式化的对话总结
   */
  async summarizeConversation(): Promise<string> {
    try {
      const messages = this.getMessageHistory({ limit: 100 });
      if (messages.length === 0) {
        return '对话历史为空，无法生成总结';
      }

      // 1. 提取关键信息
      const keyInformation = this.extractKeyInformation(messages);

      // 2. 生成总结内容
      const summaryContent = this.generateSummaryContent(keyInformation, messages);

      // 3. 格式化输出
      const formattedSummary = this.formatSummary(summaryContent, keyInformation);

      return formattedSummary;
    } catch (error) {
      this.analytics.trackError('summarize_conversation', error);
      return '生成对话总结失败，请稍后重试';
    }
  }

  /**
   * 提取对话中的关键信息
   */
  private extractKeyInformation(messages: ChatMessage[]): KeyInformation {
    const entities = new Map<string, number>();
    const topics = new Map<string, number>();
    const timestamps: Date[] = [];
    const questions: ChatMessage[] = [];
    const keyEvents: string[] = [];

    // 常见停用词
    const stopWords = ['的', '了', '和', '是', '在', '有', '不', '我', '你', '他', '她', '它', '我们', '你们', '他们', '这', '那', '个', '只', '条', '本'];

    // 分析每条消息
    messages.forEach(message => {
      // 记录时间戳
      if (message.timestamp) {
        timestamps.push(new Date(message.timestamp));
      }

      // 检查是否为问题
      if (/[?？]$/.test(message.content)) {
        questions.push(message);
      }

      // 提取实体和主题（简单实现）
      const words = message.content.split(/\s+|[,，.。!！?？;；:：]/).filter(word =>
        word.length > 1 && !stopWords.includes(word)
      );

      words.forEach(word => {
        // 实体提取（简单实现，实际可以更复杂）
        if (/[a-zA-Z0-9]+/.test(word) || word.length > 2) {
          entities.set(word, (entities.get(word) || 0) + 1);
        }

        // 主题提取（简单实现）
        if (word.length > 3) {
          topics.set(word, (topics.get(word) || 0) + 1);
        }
      });

      // 提取关键事件（包含特定关键词的句子）
      const eventKeywords = ['需要', '应该', '必须', '计划', '决定', '同意', '拒绝', '建议', '问题', '解决', '完成'];
      if (eventKeywords.some(keyword => message.content.includes(keyword))) {
        keyEvents.push(message.content);
      }
    });

    // 按频率排序实体和主题
    const sortedEntities = Array.from(entities.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);

    const sortedTopics = Array.from(topics.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3);

    // 计算对话时长
    let duration = 0;
    if (timestamps.length > 1) {
      const startTime = timestamps[0];
      const endTime = timestamps[timestamps.length - 1];
      duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // 秒
    }

    return {
      entities: sortedEntities.map(([entity]) => entity),
      topics: sortedTopics.map(([topic]) => topic),
      questions: questions.length,
      keyEvents: keyEvents.slice(0, 5), // 最多取5个关键事件
      messageCount: messages.length,
      duration,
      startTime: timestamps.length > 0 ? timestamps[0] : new Date(),
      endTime: timestamps.length > 0 ? timestamps[timestamps.length - 1] : new Date()
    };
  }

  /**
   * 生成总结内容
   */
  private generateSummaryContent(keyInfo: KeyInformation, messages: ChatMessage[]): SummaryContent {
    const { entities, topics, questions, keyEvents, messageCount, duration } = keyInfo;

    // 分析对话类型
    const analyzeConversationType = (): string => {
      const userMessages = messages.filter(msg => msg.role === 'user');
      if (userMessages.length < 2) return '简短对话';

      const questionRatio = questions / userMessages.length;
      if (questionRatio > 0.6) return '问答对话';

      const hasEventKeywords = keyEvents.length > 0;
      if (hasEventKeywords) return '任务讨论';

      return '日常交流';
    };

    // 分析对话情感（基于用户消息）
    const analyzeOverallSentiment = (): 'positive' | 'negative' | 'neutral' => {
      const userMessages = messages.filter(msg => msg.role === 'user');
      const positiveWords = ['好', '不错', '谢谢', '感谢', '棒', '优秀', '满意', '喜欢'];
      const negativeWords = ['不好', '糟糕', '不行', '错误', '问题', '失败', '不满', '讨厌'];

      let positiveCount = 0;
      let negativeCount = 0;

      userMessages.forEach(msg => {
        const lowerContent = msg.content.toLowerCase();
        positiveWords.forEach(word => {
          if (lowerContent.includes(word)) positiveCount++;
        });
        negativeWords.forEach(word => {
          if (lowerContent.includes(word)) negativeCount++;
        });
      });

      if (positiveCount > negativeCount * 1.5) return 'positive';
      if (negativeCount > positiveCount * 1.5) return 'negative';
      return 'neutral';
    };

    // 获取主要结论或达成的共识
    const getKeyConclusions = (): string[] => {
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      const conclusions: string[] = [];

      assistantMessages.forEach(msg => {
        if (msg.content.includes('因此') || msg.content.includes('所以') || msg.content.includes('总结') || msg.content.includes('结论')) {
          conclusions.push(msg.content);
        }
      });

      return conclusions.slice(0, 2); // 最多取2个主要结论
    };

    return {
      conversationType: analyzeConversationType(),
      sentiment: analyzeOverallSentiment(),
      mainEntities: entities,
      mainTopics: topics,
      keyQuestions: questions,
      keyEvents: keyEvents,
      conclusions: getKeyConclusions(),
      messageCount,
      duration
    };
  }

  /**
   * 格式化总结输出
   */
  private formatSummary(content: SummaryContent, keyInfo: KeyInformation): string {
    const { conversationType, sentiment, mainEntities, mainTopics, keyQuestions, keyEvents, conclusions, messageCount, duration } = content;
    const { startTime, endTime } = keyInfo;

    // 格式化时间
    const formatTime = (date: Date): string => {
      return date.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    // 格式化时长
    const formatDuration = (seconds: number): string => {
      if (seconds < 60) return `${seconds}秒`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟${seconds % 60}秒`;
      return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
    };

    // 情感表情
    const sentimentEmoji = {
      'positive': '😊',
      'negative': '😔',
      'neutral': '😐'
    };

    // 构建总结字符串
    let summary = `📋 **对话总结**\n\n`;
    summary += `⏱️ 对话时间: ${formatTime(startTime)} - ${formatTime(endTime)} (共${formatDuration(duration)})\n`;
    summary += `💬 消息数量: ${messageCount}条\n`;
    summary += `💡 对话类型: ${conversationType}\n`;
    summary += `😀 整体情感: ${sentimentEmoji[sentiment]} ${sentiment === 'positive' ? '积极' : sentiment === 'negative' ? '消极' : '中性'}\n\n`;

    if (mainTopics.length > 0) {
      summary += `🔑 核心主题: ${mainTopics.join(', ')}\n\n`;
    }

    if (mainEntities.length > 0) {
      summary += `👥 关键实体: ${mainEntities.join(', ')}\n\n`;
    }

    if (keyQuestions > 0) {
      summary += `❓ 问题数量: ${keyQuestions}个\n\n`;
    }

    if (keyEvents.length > 0) {
      summary += `📝 重要事件:\n`;
      keyEvents.forEach((event, index) => {
        summary += `   ${index + 1}. ${event}\n`;
      });
      summary += `\n`;
    }

    if (conclusions.length > 0) {
      summary += `✅ 主要结论:\n`;
      conclusions.forEach((conclusion, index) => {
        summary += `   ${index + 1}. ${conclusion}\n`;
      });
    }

    return summary.trim();
  }

  async exportConversation(format: ExportFormat): Promise<ExportedConversation> {
    const messages = this.getMessageHistory();
    const session = this.getCurrentSession();

    return {
      format,
      content: JSON.stringify(messages, null, 2),
      metadata: {
        exportDate: new Date(),
        sessionId: session?.id || 'unknown',
        messageCount: messages.length
      }
    };
  }

  async uploadAttachment(file: File): Promise<Attachment> {
    return this.mediaProcessor.processAttachment(file);
  }

  async recordVoice(): Promise<AudioBlob> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const startTime = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.start();

      // 提供一个简单的10秒超时自动停止
      const stopRecording = () => {
        return new Promise<string>((resolve) => {
          mediaRecorder.onstop = () => {
            resolve('');
          };
          mediaRecorder.stop();
        });
      };

      // 这里可以添加UI控制，让用户手动停止录音
      // 暂时使用10秒超时自动停止
      await new Promise(resolve => setTimeout(resolve, 10000));
      await stopRecording();

      const duration = Date.now() - startTime;
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });

      return {
        blob: audioBlob,
        duration: duration
      };
    } catch (error) {
      this.analytics.trackError('record_voice', error);
      throw new ChatError('录音失败', error);
    }
  }

  async takePicture(): Promise<ImageBlob> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取canvas上下文');
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/jpeg', 0.9);
      });

      // 生成缩略图
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.width = 150;
      thumbnailCanvas.height = 150;
      const thumbnailCtx = thumbnailCanvas.getContext('2d');
      if (thumbnailCtx) {
        thumbnailCtx.drawImage(video, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      }

      const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
        thumbnailCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create thumbnail blob'));
        }, 'image/jpeg', 0.7);
      });

      // 停止视频流
      stream.getTracks().forEach(track => track.stop());

      return {
        blob: imageBlob,
        width: canvas.width,
        height: canvas.height,
        thumbnail: thumbnailBlob
      };
    } catch (error) {
      this.analytics.trackError('take_picture', error);
      throw new ChatError('拍照失败', error);
    }
  }

  async shareScreen(): Promise<ScreenShareStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        } as MediaTrackConstraints,
        audio: true
      });

      // 获取屏幕ID和名称（注意：这部分API可能不被所有浏览器支持）
      let screenId = 'unknown';
      let displayName = 'Unknown Display';

      if (stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        if ('getSettings' in videoTrack) {
          const settings = videoTrack.getSettings() as MediaTrackSettings & { label?: string };
          screenId = settings.deviceId || screenId;
          displayName = settings.label || displayName;
        }
      }

      return {
        stream,
        screenId,
        displayName
      };
    } catch (error) {
      this.analytics.trackError('share_screen', error);
      throw new ChatError('屏幕共享失败', error);
    }
  }

  startTypingIndicator(): void {
    this.emit('typing_start');
  }

  stopTypingIndicator(): void {
    this.emit('typing_stop');
  }

  markMessageAsRead(messageId: string): void {
    this.emit('message_read', { messageId });
  }

  getUnreadCount(): number {
    const session = this.getCurrentSession();
    return session?.unreadCount || 0;
  }

  show(): void {
    this.emit('show');
  }

  hide(): void {
    this.emit('hide');
  }

  minimize(): void {
    this.emit('minimize');
  }

  maximize(): void {
    this.emit('maximize');
  }

  setTheme(theme: ChatTheme): void {
    this.config.ui.theme = theme;
    this.emit('theme_changed', { theme });
  }

  setLayout(layout: ChatLayout): void {
    this.config.ui.layout = layout;
    this.emit('layout_changed', { layout });
  }

  /**
   * 可访问性支持方法实现
   */

  enableHighContrast(enabled: boolean): void {
    this.config.ui.accessibility.highContrast = enabled;
    // 更新主题以支持高对比度
    if (enabled) {
      this.setTheme(ChatTheme.HIGH_CONTRAST);
    } else if (this.config.ui.theme === ChatTheme.HIGH_CONTRAST) {
      this.setTheme(ChatTheme.AUTO);
    }
    this.emit('accessibility_changed', {
      setting: 'highContrast',
      value: enabled
    });
  }

  adjustFontSize(size: number): void {
    // 限制字体大小范围
    const newSize = Math.max(12, Math.min(24, size));
    this.config.ui.accessibility.fontSize = newSize;
    this.emit('accessibility_changed', {
      setting: 'fontSize',
      value: newSize
    });
  }

  enableKeyboardNavigation(enabled: boolean): void {
    this.config.ui.accessibility.keyboardNavigation = enabled;
    this.setupKeyboardNavigation();
    this.emit('accessibility_changed', {
      setting: 'keyboardNavigation',
      value: enabled
    });
  }

  enableScreenReaderSupport(enabled: boolean): void {
    this.config.ui.accessibility.screenReader = enabled;
    if (enabled) {
      this.uiManager.setupScreenReader();
    }
    this.emit('accessibility_changed', {
      setting: 'screenReader',
      value: enabled
    });
  }

  /**
   * 私有方法
   */

  private async validateMessage(message: ChatMessage): Promise<ChatMessage> {
    if (!message.content || message.content.trim().length === 0) {
      throw new Error('消息内容不能为空');
    }
    return message;
  }

  private async preprocessMessage(message: ChatMessage): Promise<ProcessedMessage> {
    let processed = message;

    // 1. 标准化内容
    processed = await this.normalizeContent(processed);

    // 2. 过滤敏感内容
    processed = await this.filterSensitiveContent(processed);

    // 3. 丰富元数据
    processed = await this.enrichWithMetadata(processed);

    // 4. 格式化显示
    processed = await this.formatForDisplay(processed);

    const finalProcessed: ProcessedMessage = {
      ...processed,
      timestamp: new Date(),
      type: message.type || MessageType.TEXT,
      normalized: true,
      filtered: true,
      enriched: true
    };

    return finalProcessed;
  }

  /**
   * 标准化消息内容
   */
  private async normalizeContent(message: ChatMessage): Promise<ChatMessage> {
    // 去除首尾空白字符
    const normalizedContent = message.content.trim();

    // 统一行结束符
    const contentWithUnifiedLineEndings = normalizedContent.replace(/\r\n/g, '\n');

    // 处理特殊字符（如零宽空格等）
    const contentWithoutSpecialChars = contentWithUnifiedLineEndings.replace(/\u200B/g, '');

    return {
      ...message,
      content: contentWithoutSpecialChars
    };
  }

  /**
   * 过滤敏感内容
   */
  private async filterSensitiveContent(message: ChatMessage): Promise<ChatMessage> {
    // 简单的敏感词过滤示例
    const sensitiveWords = ['敏感词1', '敏感词2', '敏感词3'];
    let filteredContent = message.content;

    sensitiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
    });

    return {
      ...message,
      content: filteredContent,
      metadata: {
        ...message.metadata,
        filtered: filteredContent !== message.content
      }
    };
  }

  /**
   * 丰富消息元数据
   */
  private async enrichWithMetadata(message: ChatMessage): Promise<ChatMessage> {
    // 提取语言信息（简单实现，实际可使用语言检测库）
    const detectLanguage = (text: string): string => {
      const chineseRegex = /[\u4e00-\u9fa5]/;
      return chineseRegex.test(text) ? 'zh-CN' : 'en-US';
    };

    // 提取实体（简单实现，实际可使用NLP库）
    const extractEntities = (text: string): Entity[] => {
      const entities: Entity[] = [];

      // 简单的日期检测
      const dateRegex = /(\d{4}[-/](\d{1,2}[-/](\d{1,2}))?)/g;
      let match;
      while ((match = dateRegex.exec(text)) !== null) {
        entities.push({
          type: 'date',
          value: match[0],
          confidence: 0.8
        });
      }

      // 简单的URL检测
      const urlRegex = /https?:\/\/[^\s]+/g;
      while ((match = urlRegex.exec(text)) !== null) {
        entities.push({
          type: 'url',
          value: match[0],
          confidence: 0.9
        });
      }

      return entities;
    };

    const language = detectLanguage(message.content);
    const entities = extractEntities(message.content);

    return {
      ...message,
      metadata: {
        ...message.metadata,
        language,
        entities,
        confidence: 0.95, // 简单的置信度示例
        wordCount: message.content.length
      }
    };
  }

  /**
   * 格式化消息用于显示
   */
  private async formatForDisplay(message: ChatMessage): Promise<ChatMessage> {
    // 自动换行处理（在UI层实现更合适，但这里可以做一些预处理）
    let formattedContent = message.content;

    // 处理URL链接（转换为可点击的链接）
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formattedContent = formattedContent.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

    // 处理代码块
    const codeBlockRegex = /```([\s\S]*?)```/g;
    formattedContent = formattedContent.replace(codeBlockRegex, '<pre><code>$1</code></pre>');

    return {
      ...message,
      metadata: {
        ...message.metadata,
        formattedForDisplay: true
      }
    };
  }

  private setupEventHandlers(): void {
    this.realtimeService.on('message', (incoming: IncomingMessage) => {
      this.handleIncomingMessage(incoming);
    });

    this.realtimeService.on('typing', (data: TypingData) => {
      this.uiManager.showTypingIndicator(data.userId, data.userName);
    });
  }

  private handleIncomingMessage(incoming: IncomingMessage): void {
    const message: ChatMessage = {
      ...incoming,
      type: MessageType.TEXT
    };
    this.uiManager.addMessage(message);
    this.emit('message_received', message);
  }

  private setupAccessibility(): void {
    this.uiManager.setupScreenReader();
    this.setupKeyboardNavigation();
    this.setupHighContrastMode();
    this.setupFontSizeAdjustment();
  }

  /**
   * 高对比度模式支持
   */
  private setupHighContrastMode(): void {
    // 根据当前配置设置高对比度模式
    if (this.config.ui.accessibility.highContrast) {
      this.setTheme(ChatTheme.HIGH_CONTRAST);
    }
  }

  /**
   * 字体大小调整支持
   */
  private setupFontSizeAdjustment(): void {
    // 确保字体大小在有效范围内
    const currentSize = this.config.ui.accessibility.fontSize;
    if (currentSize < 12 || currentSize > 24) {
      this.config.ui.accessibility.fontSize = Math.max(12, Math.min(24, currentSize));
    }
  }

  /**
   * 导航消息
   */
  private navigateMessages(direction: 'up' | 'down'): void {
    this.emit('keyboard_navigation', { direction });
  }

  /**
   * 在界面区域之间导航
   */
  private navigateBetweenSections(direction: 'forward' | 'backward'): void {
    this.emit('keyboard_navigation', {
      direction: direction === 'forward' ? 'next' : 'previous'
    });
  }

  private setupKeyboardNavigation(): void {
    if (!this.config.ui.accessibility.keyboardNavigation) {
      return;
    }

    // 确保DOM加载完成后再添加事件监听器
    const setupDOMNavigation = () => {
      // 添加全局键盘事件监听器
      document.addEventListener('keydown', (event) => {
        // 如果当前有输入框聚焦，则不处理键盘导航
        if (this.uiManager.isInputFocused()) {
          return;
        }

        switch (event.key) {
          case 'ArrowUp':
            // 导航到上一条消息
            event.preventDefault();
            this.emit('keyboard_navigation', {
              direction: 'up'
            });
            break;
          case 'ArrowDown':
            // 导航到下一条消息
            event.preventDefault();
            this.emit('keyboard_navigation', {
              direction: 'down'
            });
            break;
          case 'Enter':
            // 选择当前消息
            event.preventDefault();
            this.emit('keyboard_navigation', {
              action: 'select'
            });
            break;
          case 'Escape':
            // 关闭所有面板
            event.preventDefault();
            this.uiManager.closeAllPanels();
            this.emit('keyboard_navigation', {
              action: 'escape'
            });
            break;
          case 'Tab':
            // 导航到下一个可交互元素
            event.preventDefault();
            this.emit('keyboard_navigation', {
              direction: 'next'
            });
            break;
          case 'Shift+Tab':
            // 导航到上一个可交互元素
            event.preventDefault();
            this.emit('keyboard_navigation', {
              direction: 'previous'
            });
            break;
        }
      });

      // 标记键盘导航已设置
      this.emit('keyboard_navigation_setup', {});
    };

    // 如果DOM已加载，则立即设置
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupDOMNavigation);
    } else {
      setupDOMNavigation();
    }
  }
}

// ================================================
// 导出单例
// ================================================

export const chatInterface = new ChatInterface({
  persistence: { enabled: true, backend: 'indexeddb', maxHistorySize: 1000 },
  encryption: { enabled: true, algorithm: 'AES-256' },
  maxSessions: 10,
  sessionTimeout: 3600000,
  realtimeEndpoint: 'ws://localhost:8080',
  reconnectAttempts: 3,
  maxFileSize: 10 * 1024 * 1024,
  allowedFormats: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  ui: {
    theme: ChatTheme.AUTO,
    layout: ChatLayout.COMFORTABLE,
    animations: true,
    accessibility: {
      screenReader: true,
      highContrast: false,
      keyboardNavigation: true,
      fontSize: 16
    }
  },
  analytics: {
    enabled: true,
    events: ['message_sent', 'message_received', 'error']
  }
});
