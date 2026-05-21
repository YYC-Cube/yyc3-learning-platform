/**
 * @fileoverview 工具函数/库 · date.ts
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
import { format, formatDistance, formatRelative } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: zhCN });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(d, new Date(), { locale: zhCN });
}

export function formatDateDistance(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true, locale: zhCN });
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}
