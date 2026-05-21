import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '个人资料 | 言枢象限·语启未来',
  description: '管理个人资料、学习偏好和账户设置',
  openGraph: {
    title: '个人资料 | 言枢象限',
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
