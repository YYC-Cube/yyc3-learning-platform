import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '专业考试 | 言枢象限·语启未来',
  description: 'AI大模型专业综合考试，检验你的AI知识深度与广度',
  openGraph: {
    title: 'AI专业考试 | 言枢象限',
  },
};

export default function ProfessionalExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
