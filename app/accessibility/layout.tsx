import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '无障碍功能 | 言枢象限·语启未来',
  description: '平台无障碍功能说明与辅助工具',
  openGraph: {
    title: '无障碍功能 | 言枢象限',
  },
};

export default function AccessibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
