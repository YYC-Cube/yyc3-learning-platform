import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI练习 | 言枢象限·语启未来',
  description: 'AI知识练习与技能巩固，包含多种题型和难度级别',
  openGraph: {
    title: 'AI练习 | 言枢象限',
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
