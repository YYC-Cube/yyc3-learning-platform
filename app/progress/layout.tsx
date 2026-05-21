import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学习进度 | 言枢象限·语启未来',
  description: '查看个人学习进度、课程完成情况和能力成长曲线',
  openGraph: {
    title: '学习进度 | 言枢象限',
    description: '追踪你的AI学习之旅',
  },
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
