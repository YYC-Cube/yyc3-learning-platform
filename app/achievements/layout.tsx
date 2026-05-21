import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '成就系统 | 言枢象限·语启未来',
  description: '解锁学习成就、收集徽章、追踪里程碑，激励持续学习',
  openGraph: {
    title: '学习成就 | 言枢象限',
    description: '你的学习荣誉殿堂',
  },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
