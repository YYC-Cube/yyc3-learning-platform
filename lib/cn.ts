/**
 * @fileoverview 工具函数/库 · cn.ts
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
