/**
 * @fileoverview 应用根布局组件
 * @description 提供应用的全局布局结构，包括主题配置、AI助手配置和响应式设计支持
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import BottomNav from "@/components/bottom-nav";
import AIAssistantProvider from "@/app/providers/AIAssistantProvider";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LazyAIWidgetWrapper from "@/components/intelligent-ai-widget/lazy-ai-widget";
import "./mobile-styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YanYu Smart Cloud³ Learning Platform - 言枢象限·语启未来",
  description: "万象归元于云枢，深栈智启新纪元 - 专业的AI应用开发学习平台",
  keywords: "AI学习, 人工智能, 云计算, 深度学习, YanYu Smart Cloud",
  authors: [{ name: "YanYu Smart Cloud³ Team" }],
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/yyc3-pwa-icon.png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YanYu Smart Cloud³",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="safe-area-inset" suppressHydrationWarning>
      <body className={`${inter.className} pb-20 md:pb-0`} suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange
        >
          <AIAssistantProvider>
            <ErrorBoundary>
              <PerformanceMonitor />
              <div className="min-h-screen">
                <main className="pb-20 md:pb-0">{children}</main>
                <BottomNav />
              </div>
            </ErrorBoundary>
          </AIAssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
