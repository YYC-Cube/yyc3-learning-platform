import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '数据分析 | 言枢象限·语启未来',
  description: '学习数据可视化分析，包含学习时长、课程完成率、技能分布等详细统计',
  openGraph: {
    title: '学习数据分析 | 言枢象限',
    description: '用数据驱动你的学习成长',
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
