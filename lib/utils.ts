/**
 * @fileoverview CSS类名合并工具函数
 * @description 提供 clsx 和 tailwind-merge 的封装，用于安全地合并 Tailwind CSS 类名
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
