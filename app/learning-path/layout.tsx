import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学习路径 | 言枢象限·语启未来',
  description: 'AI学习路径规划，从入门到精通的系统化学习路线',
  openGraph: {
    title: 'AI学习路径 | 言枢象限',
    description: '系统化的AI学习路线图',
  },
};

export default function LearningPathLayout({ children }: { children: React.ReactNode }) {
  return children;
}
