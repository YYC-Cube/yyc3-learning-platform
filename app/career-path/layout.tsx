import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '职业路径 | 言枢象限·语启未来',
  description: 'AI职业发展路径规划，从学习者到AI工程师的成长之路',
  openGraph: {
    title: 'AI职业路径 | 言枢象限',
  },
};

export default function CareerPathLayout({ children }: { children: React.ReactNode }) {
  return children;
}
