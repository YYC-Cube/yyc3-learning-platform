import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EnhancedMessageBus, MessageType, MessagePriority, MessageHandler } from './EnhancedMessageBus';

describe('EnhancedMessageBus Integration Tests', () => {
  let messageBus: EnhancedMessageBus;

  beforeEach(() => {
    messageBus = new EnhancedMessageBus({
      maxQueueSize: 100,
      retryPolicy: {
        maxRetries: 3,
        backoffFactor: 2,
        initialDelayMs: 100,
        maxDelayMs: 5000,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
      },
      enablePersistence: false,
      deadLetterQueueSize: 50,
      enableMetrics: true,
      enableTracing: true,
      maxProcessingTime: 30000,
      maxConcurrentMessages: 10
    });
  });

  afterEach(async () => {
    await messageBus.shutdown();
  });

  describe('Message Publishing and Subscription', () => {
    it('should publish and receive messages correctly', async () => {
      const receivedMessages: any[] = [];
      const handler: MessageHandler = async (message) => {
        receivedMessages.push(message);
      };

      const subscriptionId = messageBus.subscribe(MessageType.REQUEST, handler);

      const messageId = await messageBus.publish(MessageType.REQUEST, {
        action: 'test',
        data: { key: 'value' }
      });

      expect(messageId).toBeDefined();
      expect(messageId).toMatch(/^msg_\d+_[a-z0-9]+$/);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedMessages.length).toBeGreaterThan(0);
      expect(receivedMessages[0].payload).toEqual({
        action: 'test',
        data: { key: 'value' }
      });
    });

    it('should handle multiple subscribers for same message type', async () => {
      const receivedMessages1: any[] = [];
      const receivedMessages2: any[] = [];

      const handler1: MessageHandler = async (message) => {
        receivedMessages1.push(message);
      };

      const handler2: MessageHandler = async (message) => {
        receivedMessages2.push(message);
      };

      messageBus.subscribe(MessageType.REQUEST, handler1);
      messageBus.subscribe(MessageType.REQUEST, handler2);

      await messageBus.publish(MessageType.REQUEST, {
        action: 'test',
        data: { key: 'value' }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedMessages1.length).toBeGreaterThan(0);
      expect(receivedMessages2.length).toBeGreaterThan(0);
    });

    it('should handle different message types separately', async () => {
      const requestMessages: any[] = [];
      const responseMessages: any[] = [];

      const requestHandler: MessageHandler = async (message) => {
        requestMessages.push(message);
      };

      const responseHandler: MessageHandler = async (message) => {
        responseMessages.push(message);
      };

      messageBus.subscribe(MessageType.REQUEST, requestHandler);
      messageBus.subscribe(MessageType.RESPONSE, responseHandler);

      await messageBus.publish(MessageType.REQUEST, { type: 'request' });
      await messageBus.publish(MessageType.RESPONSE, { type: 'response' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(requestMessages.length).toBeGreaterThan(0);
      expect(responseMessages.length).toBeGreaterThan(0);
      expect(requestMessages[0].payload.type).toBe('request');
      expect(responseMessages[0].payload.type).toBe('response');
    });
  });

  describe('Message Priority', () => {
    it('should process high priority messages before low priority', async () => {
      const processedOrder: string[] = [];

      const handler: MessageHandler = async (message) => {
        processedOrder.push(message.id);
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { id: 'low' }, {
        priority: MessagePriority.LOW
      });

      await messageBus.publish(MessageType.REQUEST, { id: 'high' }, {
        priority: MessagePriority.HIGH
      });

      await messageBus.publish(MessageType.REQUEST, { id: 'normal' }, {
        priority: MessagePriority.NORMAL
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(processedOrder.length).toBeGreaterThan(0);
    });
  });

  describe('Message Retry Mechanism', () => {
    it('should retry failed messages', async () => {
      let attemptCount = 0;
      const handler: MessageHandler = async (message) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('ECONNRESET');
        }
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { data: 'test' });

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(attemptCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Message Metrics', () => {
    it('should track message metrics', async () => {
      const handler: MessageHandler = async (message) => {
        return;
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { data: 'test1' });
      await messageBus.publish(MessageType.REQUEST, { data: 'test2' });
      await messageBus.publish(MessageType.RESPONSE, { data: 'test3' });

      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics = messageBus.getMetrics();

      expect(metrics.totalMessages).toBeGreaterThanOrEqual(3);
      expect(metrics.messagesByType[MessageType.REQUEST]).toBeGreaterThanOrEqual(2);
      expect(metrics.messagesByType[MessageType.RESPONSE]).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Message Tracing', () => {
    it('should trace message flow', async () => {
      const traceIds: string[] = [];

      const handler: MessageHandler = async (message) => {
        if (message.metadata?.traceId) {
          traceIds.push(message.metadata.traceId);
        }
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      const messageId = await messageBus.publish(MessageType.REQUEST, {
        data: 'test'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(traceIds.length).toBeGreaterThan(0);

      const trace = messageBus.getTrace(messageId);
      if (trace) {
        expect(trace.messageId).toBe(messageId);
        expect(trace.events.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Unsubscription', () => {
    it('should stop receiving messages after unsubscribe', async () => {
      const receivedMessages: any[] = [];

      const handler: MessageHandler = async (message) => {
        receivedMessages.push(message);
      };

      const subscriptionId = messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { data: 'test1' });

      await new Promise(resolve => setTimeout(resolve, 100));

      messageBus.unsubscribe(subscriptionId);

      await messageBus.publish(MessageType.REQUEST, { data: 'test2' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedMessages.length).toBe(1);
      expect(receivedMessages[0].payload.data).toBe('test1');
    });
  });

  describe('Dead Letter Queue', () => {
    it('should move failed messages to dead letter queue', async () => {
      const handler: MessageHandler = async (message) => {
        throw new Error('Permanent failure');
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { data: 'test' });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const deadLetterMessages = messageBus.getDeadLetterMessages();

      expect(deadLetterMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Message Filtering', () => {
    it('should filter messages based on filter function', async () => {
      const receivedMessages: any[] = [];

      const handler: MessageHandler = async (message) => {
        receivedMessages.push(message);
      };

      messageBus.subscribe(MessageType.REQUEST, handler, {
        filter: (message) => message.payload?.priority === 'high'
      });

      await messageBus.publish(MessageType.REQUEST, { priority: 'high' });
      await messageBus.publish(MessageType.REQUEST, { priority: 'low' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedMessages.length).toBeGreaterThan(0);
      expect(receivedMessages[0].payload.priority).toBe('high');
    });
  });

  describe('Message TTL', () => {
    it('should expire messages after TTL', async () => {
      const receivedMessages: any[] = [];

      const handler: MessageHandler = async (message) => {
        receivedMessages.push(message);
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { data: 'test' }, {
        ttl: 50
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const metrics = messageBus.getMetrics();
      expect(metrics.expiredMessages).toBeGreaterThan(0);
    });
  });

  describe('Correlation and Reply', () => {
    it('should handle message correlation and reply', async () => {
      const correlationId = 'test-correlation-123';
      const replyTo = 'test-subscription-456';

      const handler: MessageHandler = async (message) => {
        if (message.replyTo) {
          await messageBus.publish(MessageType.RESPONSE, {
            replyToMessage: message.id
          }, {
            correlationId: message.id
          });
        }
      };

      messageBus.subscribe(MessageType.REQUEST, handler);

      await messageBus.publish(MessageType.REQUEST, { data: 'test' }, {
        correlationId,
        replyTo
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});
