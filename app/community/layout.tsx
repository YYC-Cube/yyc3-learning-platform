import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学习社区 | 言枢象限·语启未来',
  description: 'AI学习社区，与志同道合的学习者交流分享',
  openGraph: {
    title: '学习社区 | 言枢象限',
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
