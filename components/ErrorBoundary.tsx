/**
 * @fileoverview 全局错误边界组件
 * @description 捕获React应用中的JavaScript错误，记录错误信息并显示友好的错误界面
 * @author YYC³
 * @version 1.0.0
 * @created 2025-12-19
 * @modified 2025-12-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { logError, getUserMessage } from '@/lib/error-handler.client';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider, Toast } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo
    });

    // 记录错误信息使用全局错误日志函数
    logError(error, {
      context: 'ErrorBoundary',
      componentStack: errorInfo.componentStack
    });

    // 显示错误通知 - 直接使用控制台输出，因为类组件中useToast的使用比较复杂
    // 在实际生产环境中，可以集成第三方错误监控服务
    logger.error('应用发生错误', error.message || '未知错误');
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 自定义回退界面
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">应用发生错误</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {this.state.error?.message || '很抱歉，应用发生了意外错误。'}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  重新加载应用
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  返回上一页
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <details className="cursor-pointer text-left">
                    <summary className="font-medium">查看详细错误信息</summary>
                    <pre className="mt-2 p-3 overflow-auto rounded bg-muted text-xs">
                      {this.state.error.stack?.split('\n').map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap">{line}</div>
                      ))}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // 正常渲染子组件和全局Toaster
    return (
      <>
        {this.props.children}
        <Toaster />
      </>
    );
  }
}
