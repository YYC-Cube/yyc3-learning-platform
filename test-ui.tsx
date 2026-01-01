import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AccessibleButton } from '@/components/accessibility/accessible-button';

// 测试UI组件系统的功能
export default function TestUI() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">UI组件系统测试</h1>
      
      <div className="space-y-8">
        {/* 测试Button组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Button组件测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">默认按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="destructive">危险按钮</Button>
              <Button size="sm">小按钮</Button>
              <Button size="lg">大按钮</Button>
              <Button loading>加载中按钮</Button>
              <Button asChild>
                <a href="#">作为链接的按钮</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 测试AccessibleButton组件 */}
        <Card>
          <CardHeader>
            <CardTitle>AccessibleButton组件测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <AccessibleButton>普通无障碍按钮</AccessibleButton>
              <AccessibleButton loading>加载中无障碍按钮</AccessibleButton>
              <AccessibleButton asChild>
                <a href="#">作为链接的无障碍按钮</a>
              </AccessibleButton>
            </div>
          </CardContent>
        </Card>

        {/* 测试Input组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Input组件测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="请输入文本" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
