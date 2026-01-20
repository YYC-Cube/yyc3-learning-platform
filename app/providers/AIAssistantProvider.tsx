"use client";

import LazyAIWidgetWrapper from '@/components/intelligent-ai-widget/lazy-ai-widget';
import { useEffect, useState } from 'react';
import { AIWidgetProvider, useAIWidget } from './AIWidgetContext';
import { logger } from '@/lib/logger';

function AIAssistantContent({ children }: { children: React.ReactNode }) {
  const { showWidget } = useAIWidget();
  const [userId, setUserId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      try {
        const storedUserId = localStorage.getItem('userId') || `user_${Date.now()}`;
        setUserId(storedUserId);
        localStorage.setItem('userId', storedUserId);
      } catch (error) {
        logger.error('AIAssistantProvider: localStorage error', error);
        const fallbackUserId = `user_${Date.now()}`;
        setUserId(fallbackUserId);
      }
    }
  }, []);

  return (
    <>
      {children}
      {isMounted && showWidget && userId && (
        <LazyAIWidgetWrapper
          userId={userId}
          initialPosition="bottom-right"
        />
      )}
    </>
  );
}

export default function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  return (
    <AIWidgetProvider>
      <AIAssistantContent>{children}</AIAssistantContent>
    </AIWidgetProvider>
  );
}
