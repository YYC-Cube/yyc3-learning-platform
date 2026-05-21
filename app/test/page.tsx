/**
 * @fileoverview 页面组件 · page.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

import { ResponsiveLayout } from '@/components/responsive-layout';

export default function TestPage() {
  const currentUser = {
    name: '测试用户',
    avatar: '/placeholder.svg',
    level: '初级',
  };

  return (
    <ResponsiveLayout title="测试页面" user={currentUser}>
      <div>
        <h1>测试页面</h1>
        <p>这是一个测试页面</p>
      </div>
    </ResponsiveLayout>
  );
}
