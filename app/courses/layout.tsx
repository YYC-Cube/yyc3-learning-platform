import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '课程中心 | 言枢象限·语启未来',
  description: '浏览AI学习平台课程，涵盖提示词工程、多模态AI、GPT模型等前沿技术课程',
  openGraph: {
    title: 'AI课程中心 | 言枢象限',
    description: '专业的AI应用开发学习课程',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
