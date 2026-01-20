/**
 * @fileoverview 懒加载的AI助手组件包装器
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-24
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

interface LazyAIWidgetProps {
  userId: string;
  initialPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onClose?: () => void;
}

const LazyAIWidget = React.lazy(() => import('./intelligent-ai-widget').then(module => ({ default: module.IntelligentAIWidget })));

const LazyAIWidgetWrapper: React.FC<LazyAIWidgetProps> = (props) => {
  return (
    <React.Suspense
      fallback={
        <div className="fixed bottom-4 right-4 w-96 h-14 bg-white rounded-lg shadow-2xl flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LazyAIWidget {...props} />
    </React.Suspense>
  );
};

export default LazyAIWidgetWrapper;
