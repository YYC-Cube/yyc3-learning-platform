/**
 * YYC³ UI组件展示页面
 * @description 展示所有优化后的UI组件
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function UIShowcasePage() {
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* 页面标题 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-yyc bg-clip-text text-transparent">
            YYC³ UI 组件库
          </h1>
          <p className="text-muted-foreground">
            统一的设计系统 · 现代化的用户界面 · 无障碍体验
          </p>
        </div>

        <Separator />

        {/* 按钮组件 */}
        <Card>
          <CardHeader>
            <CardTitle>按钮 Buttons</CardTitle>
            <CardDescription>各种样式和尺寸的按钮组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 按钮变体 */}
            <div>
              <h3 className="mb-3 font-semibold">按钮变体</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
                <Button variant="gradient">Gradient</Button>
              </div>
            </div>

            {/* 按钮尺寸 */}
            <div>
              <h3 className="mb-3 font-semibold">按钮尺寸</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* 图标按钮 */}
            <div>
              <h3 className="mb-3 font-semibold">图标按钮</h3>
              <div className="flex flex-wrap gap-3">
                <Button size="icon-sm" variant="outline">
                  <CheckCircle2 />
                </Button>
                <Button size="icon" variant="outline">
                  <InfoIcon />
                </Button>
                <Button size="icon-lg" variant="outline">
                  <AlertCircle />
                </Button>
              </div>
            </div>

            {/* 加载状态 */}
            <div>
              <h3 className="mb-3 font-semibold">加载状态</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 2000);
                  }}
                >
                  {loading ? '加载中...' : '点击加载'}
                </Button>
                <Button variant="outline" loading={loading}>
                  Processing
                </Button>
              </div>
            </div>

            {/* 圆角变体 */}
            <div>
              <h3 className="mb-3 font-semibold">圆角变体</h3>
              <div className="flex flex-wrap gap-3">
                <Button rounded="none">None</Button>
                <Button rounded="sm">Small</Button>
                <Button rounded="default">Default</Button>
                <Button rounded="lg">Large</Button>
                <Button rounded="full">Full</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 输入组件 */}
        <Card>
          <CardHeader>
            <CardTitle>输入框 Inputs</CardTitle>
            <CardDescription>各种类型的输入框组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input id="email" type="email" placeholder="请输入邮箱" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="请输入密码" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">搜索</Label>
              <Input id="search" type="search" placeholder="搜索课程..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">禁用状态</Label>
              <Input id="disabled" placeholder="禁用输入框" disabled />
            </div>
          </CardContent>
        </Card>

        {/* 徽章和标签 */}
        <Card>
          <CardHeader>
            <CardTitle>徽章 Badges</CardTitle>
            <CardDescription>各种样式的标签徽章</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge className="bg-success text-white">Success</Badge>
              <Badge className="bg-warning text-white">Warning</Badge>
              <Badge className="bg-info text-white">Info</Badge>
              <Badge className="bg-gradient-yyc text-white">Gradient</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 复选框和开关 */}
        <Card>
          <CardHeader>
            <CardTitle>复选框 & 开关</CardTitle>
            <CardDescription>选择控件组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">复选框</h3>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">接受条款和条件</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="marketing" />
                <Label htmlFor="marketing">接收营销邮件</Label>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">开关</h3>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">启用通知</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="darkmode" />
                <Label htmlFor="darkmode">深色模式</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提示和警告 */}
        <Card>
          <CardHeader>
            <CardTitle>提示信息 Alerts</CardTitle>
            <CardDescription>各种类型的提示信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>提示</AlertTitle>
              <AlertDescription>
                这是一个普通的提示信息，用于显示一般性通知。
              </AlertDescription>
            </Alert>
            <Alert className="border-success text-success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>成功</AlertTitle>
              <AlertDescription>
                操作已成功完成！您的更改已保存。
              </AlertDescription>
            </Alert>
            <Alert className="border-warning text-warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                请注意，此操作可能会影响您的数据。
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>
                抱歉，发生了一个错误。请稍后重试。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 进度条 */}
        <Card>
          <CardHeader>
            <CardTitle>进度条 Progress</CardTitle>
            <CardDescription>显示任务进度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>课程进度</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>学习目标</span>
                <span className="text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="[&>div]:bg-success" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>项目完成度</span>
                <span className="text-muted-foreground">100%</span>
              </div>
              <Progress value={100} className="[&>div]:bg-gradient-yyc" />
            </div>
          </CardContent>
        </Card>

        {/* 标签页 */}
        <Card>
          <CardHeader>
            <CardTitle>标签页 Tabs</CardTitle>
            <CardDescription>内容分组展示</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="analytics">分析</TabsTrigger>
                <TabsTrigger value="settings">设置</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <h3 className="text-lg font-semibold">课程概览</h3>
                <p className="text-muted-foreground">
                  这里展示课程的基本信息和统计数据。
                </p>
              </TabsContent>
              <TabsContent value="analytics" className="space-y-4">
                <h3 className="text-lg font-semibold">学习分析</h3>
                <p className="text-muted-foreground">
                  查看您的学习进度和成绩分析。
                </p>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4">
                <h3 className="text-lg font-semibold">课程设置</h3>
                <p className="text-muted-foreground">
                  自定义您的学习偏好和通知设置。
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 页脚 */}
        <Card className="glass-effect">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                © 2025 YanYu Smart Cloud³. 保留所有权利。
              </p>
              <p className="text-xs text-muted-foreground">
                万象归元于云枢，深栈智启新纪元
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
