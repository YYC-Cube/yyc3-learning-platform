"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface AIWidgetContextType {
  showWidget: boolean;
  toggleWidget: () => void;
  openWidget: () => void;
  closeWidget: () => void;
}

const AIWidgetContext = createContext<AIWidgetContextType | undefined>(undefined);

export function AIWidgetProvider({ children }: { children: ReactNode }) {
  const [showWidget, setShowWidget] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      try {
        const widgetPreference = localStorage.getItem('showAIWidget');
        if (widgetPreference !== null) {
          setShowWidget(widgetPreference === 'true');
        }
      } catch (error) {
        logger.error('AIWidgetProvider: localStorage error', error);
      }
    }
  }, []);

  const toggleWidget = () => {
    const newValue = !showWidget;
    setShowWidget(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showAIWidget', String(newValue));
    }
  };

  const openWidget = () => {
    setShowWidget(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showAIWidget', 'true');
    }
  };

  const closeWidget = () => {
    setShowWidget(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showAIWidget', 'false');
    }
  };

  return (
    <AIWidgetContext.Provider value={{ showWidget, toggleWidget, openWidget, closeWidget }}>
      {children}
    </AIWidgetContext.Provider>
  );
}

export function useAIWidget() {
  const context = useContext(AIWidgetContext);
  if (context === undefined) {
    throw new Error('useAIWidget must be used within an AIWidgetProvider');
  }
  return context;
}
