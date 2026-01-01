"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { AccessibleButton } from "@/components/accessibility/accessible-button"
import { LiveRegion } from "@/components/accessibility/live-region"
import { Eye, Volume2, Keyboard, MousePointer } from "lucide-react"

export default function AccessibilityPage() {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    fontSize: [16],
    colorScheme: "auto",
    soundEnabled: true,
    focusIndicator: true,
  })

  const [announcements, setAnnouncements] = useState("")

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setAnnouncements(`设置已更新：${key}`)
  }

  return (
    <ResponsiveLayout
      title="无障碍访问设置"
      user={{ name: "张同学", avatar: "/placeholder.svg?height=40&width=40", level: "中级工程师" }}
    >
      <LiveRegion message={announcements} />

      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">无障碍访问设置</h1>
          <p className="text-gray-600">自定义您的学习体验，让系统更适合您的需求</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 视觉设置 */}
          <section aria-labelledby="visual-settings">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  <span id="visual-settings">视觉设置</span>
                </CardTitle>
                <CardDescription>调整视觉显示以提高可读性</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    高对比度模式
                  </Label>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                    aria-describedby="high-contrast-desc"
                  />
                </div>
                <p id="high-contrast-desc" className="text-xs text-gray-500">
                  增强文字和背景的对比度，提高可读性
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="large-text" className="text-sm font-medium">
                    大字体模式
                  </Label>
                  <Switch
                    id="large-text"
                    checked={settings.largeText}
                    onCheckedChange={(checked) => updateSetting("largeText", checked)}
                    aria-describedby="large-text-desc"
                  />
                </div>
                <p id="large-text-desc" className="text-xs text-gray-500">
                  使用更大的字体大小，便于阅读
                </p>

                <div className="space-y-2">
                  <Label htmlFor="font-size" className="text-sm font-medium">
                    字体大小：{settings.fontSize[0]}px
                  </Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={settings.fontSize}
                    onValueChange={(value) => updateSetting("fontSize", value)}
                    aria-describedby="font-size-desc"
                    className="w-full"
                  />
                  <p id="font-size-desc" className="text-xs text-gray-500">
                    调整系统字体大小
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-scheme" className="text-sm font-medium">
                    颜色主题
                  </Label>
                  <Select value={settings.colorScheme} onValueChange={(value) => updateSetting("colorScheme", value)}>
                    <SelectTrigger id="color-scheme" aria-describedby="color-scheme-desc">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">自动</SelectItem>
                      <SelectItem value="light">浅色模式</SelectItem>
                      <SelectItem value="dark">深色模式</SelectItem>
                    </SelectContent>
                  </Select>
                  <p id="color-scheme-desc" className="text-xs text-gray-500">
                    选择适合您的颜色主题
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 交互设置 */}
          <section aria-labelledby="interaction-settings">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Keyboard className="h-5 w-5 text-green-600" aria-hidden="true" />
                  <span id="interaction-settings">交互设置</span>
                </CardTitle>
                <CardDescription>自定义交互方式和导航选项</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion" className="text-sm font-medium">
                    减少动画效果
                  </Label>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                    aria-describedby="reduced-motion-desc"
                  />
                </div>
                <p id="reduced-motion-desc" className="text-xs text-gray-500">
                  减少页面动画和过渡效果
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-nav" className="text-sm font-medium">
                    键盘导航增强
                  </Label>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                    aria-describedby="keyboard-nav-desc"
                  />
                </div>
                <p id="keyboard-nav-desc" className="text-xs text-gray-500">
                  增强键盘导航功能和焦点指示器
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-indicator" className="text-sm font-medium">
                    焦点指示器
                  </Label>
                  <Switch
                    id="focus-indicator"
                    checked={settings.focusIndicator}
                    onCheckedChange={(checked) => updateSetting("focusIndicator", checked)}
                    aria-describedby="focus-indicator-desc"
                  />
                </div>
                <p id="focus-indicator-desc" className="text-xs text-gray-500">
                  显示明显的焦点指示器
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 音频设置 */}
          <section aria-labelledby="audio-settings">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-purple-600" aria-hidden="true" />
                  <span id="audio-settings">音频设置</span>
                </CardTitle>
                <CardDescription>配置音频反馈和屏幕阅读器支持</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled" className="text-sm font-medium">
                    音效反馈
                  </Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                    aria-describedby="sound-enabled-desc"
                  />
                </div>
                <p id="sound-enabled-desc" className="text-xs text-gray-500">
                  启用操作音效反馈
                </p>

                <div className="flex items-center justify-between">
                  <Label htmlFor="screen-reader" className="text-sm font-medium">
                    屏幕阅读器优化
                  </Label>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                    aria-describedby="screen-reader-desc"
                  />
                </div>
                <p id="screen-reader-desc" className="text-xs text-gray-500">
                  优化屏幕阅读器体验
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 快捷键说明 */}
          <section aria-labelledby="shortcuts-info">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MousePointer className="h-5 w-5 text-orange-600" aria-hidden="true" />
                  <span id="shortcuts-info">键盘快捷键</span>
                </CardTitle>
                <CardDescription>常用的键盘快捷键</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="font-medium">Tab</dt>
                    <dd className="text-gray-600">下一个元素</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Shift + Tab</dt>
                    <dd className="text-gray-600">上一个元素</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Enter / Space</dt>
                    <dd className="text-gray-600">激活按钮</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Esc</dt>
                    <dd className="text-gray-600">关闭对话框</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Alt + M</dt>
                    <dd className="text-gray-600">打开菜单</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <AccessibleButton
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setAnnouncements("设置已保存")}
          >
            保存设置
          </AccessibleButton>
          <AccessibleButton
            variant="outline"
            size="lg"
            onClick={() => {
              setSettings({
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                screenReader: false,
                keyboardNavigation: true,
                fontSize: [16],
                colorScheme: "auto",
                soundEnabled: true,
                focusIndicator: true,
              })
              setAnnouncements("设置已重置为默认值")
            }}
          >
            重置为默认
          </AccessibleButton>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
