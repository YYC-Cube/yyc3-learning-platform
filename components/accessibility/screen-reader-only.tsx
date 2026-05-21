/**
 * @fileoverview UI组件 · screen-reader-only.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
import type React from 'react';
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  id?: string;
}

export function ScreenReaderOnly({ children, id }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only" id={id}>
      {children}
    </span>
  );
}
