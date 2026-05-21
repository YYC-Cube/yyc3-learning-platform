import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI考试测评 | 言枢象限·语启未来',
  description: 'AI知识考试与能力测评，包含GPT基础、提示词工程、多模态AI等多维度考核',
  openGraph: {
    title: 'AI考试测评 | 言枢象限',
    description: '全面评估AI知识掌握程度',
  },
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
