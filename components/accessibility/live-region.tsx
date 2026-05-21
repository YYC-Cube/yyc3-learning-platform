/**
 * @fileoverview UI组件 · live-region.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}

export function LiveRegion({ message, politeness = 'polite', atomic = true }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      regionRef.current.textContent = message;
    }
  }, [message]);

  return <div ref={regionRef} aria-live={politeness} aria-atomic={atomic} className="sr-only" />;
}
