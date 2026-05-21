'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, type ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface LinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  children,
  className,
  ref,
  ...props
}: LinkButtonProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  return (
    <Link
      href={href}
      ref={ref}
      data-slot="link-button"
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <Button asChild {...props}>
        <span className="inline-flex items-center justify-center gap-2 w-full">{children}</span>
      </Button>
    </Link>
  );
}

LinkButton.displayName = 'LinkButton';
