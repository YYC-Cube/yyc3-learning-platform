/**
 * @fileoverview UI组件 · touch-card.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TouchCardProps {
  className?: string;
  children: ReactNode;
  header?: ReactNode;
  title?: string;
  description?: string;
  footer?: ReactNode;
  onClick?: () => void;
}

export function TouchCard({
  className,
  children,
  header,
  title,
  description,
  footer,
  onClick,
}: TouchCardProps) {
  return (
    <Card
      className={cn(
        'touch-feedback card-mobile-optimized transition-all duration-300',
        onClick ? 'cursor-pointer active:scale-98' : '',
        className
      )}
      onClick={onClick}
    >
      {(header || title || description) && (
        <CardHeader className="p-4 sm:p-6">
          {header}
          {title && <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-4 sm:p-6 pt-0">{children}</CardContent>
      {footer && <CardFooter className="p-4 sm:p-6 pt-0">{footer}</CardFooter>}
    </Card>
  );
}
