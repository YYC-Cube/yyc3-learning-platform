import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '团队协作 | 言枢象限·语启未来',
  description: '学习团队管理与协作，共同进步',
  openGraph: {
    title: '团队协作 | 言枢象限',
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
