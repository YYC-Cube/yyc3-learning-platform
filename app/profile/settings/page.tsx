"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Bell,
  Clock,
  Download,
  Trash2,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Mail,
  MessageSquare,
  Database,
  AlertCircle,
  Save,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { AccessibleButton } from "@/components/accessibility/accessible-button"

export default function SettingsPage() {
  const [currentUser] = useState({
    name: "YanYu同学",
    email: "yanyu@smartcloud.com",
    avatar: "/placeholder.svg?height=80&width=80&text=YY",
    level: "中级AI工程师",
  })

  // 密码修改状态
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "changing" | "success" | "error">("idle")

  // 通知偏好设置
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    courseUpdates: true,
    examReminders: true,
    achievementNotifications: true,
    weeklyProgress: true,
    communityMessages: true,
    systemAnnouncements: true,
    marketingEmails: false,
  })

  // 学习提醒配置
  const [studyReminders, setStudyReminders] = useState({
    enabled: true,
    dailyReminder: true,
    weeklyGoal: true,
    streakReminder: true,
    reminderTime: "19:00",
    reminderDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    goalHoursPerWeek: 10,
    breakReminder: true,
    breakInterval: 30,
  })

  // 数据导出状态
  const [exportStatus, setExportStatus] = useState<"idle" | "preparing" | "ready" | "error">("idle")
  const [exportData, setExportData] = useState({
    includeProfile: true,
    includeCourses: true,
    includeProgress: true,
    includeNotes: true,
    includeCertificates: true,
    format: "json",
  })

  // 账户注销状态
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [setting]: value }))
  }

  const handleStudyReminderChange = (setting: string, value: any) => {
    setStudyReminders((prev) => ({ ...prev, [setting]: value }))
  }

  const handleReminderDayToggle = (day: string) => {
    setStudyReminders((prev) => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(day)
        ? prev.reminderDays.filter((d) => d !== day)
        : [...prev.reminderDays, day],
    }))
  }

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus("error")
      return
    }

    setPasswordStatus("changing")
    // 模拟密码修改
    setTimeout(() => {
      setPasswordStatus("success")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setPasswordStatus("idle"), 3000)
    }, 2000)
  }

  const handleDataExport = async () => {
    setExportStatus("preparing")
    // 模拟数据准备过程
    setTimeout(() => {
      setExportStatus("ready")
      // 实际应用中这里会触发文件下载
      setTimeout(() => setExportStatus("idle"), 5000)
    }, 3000)
  }

  const handleAccountDelete = async () => {
    if (deleteConfirmation !== "删除我的账户") {
      return
    }
    // 实际删除逻辑
    alert("账户删除功能已确认（演示模式）")
  }

  const weekDays = [
    { key: "monday", label: "周一" },
    { key: "tuesday", label: "周二" },
    { key: "wednesday", label: "周三" },
    { key: "thursday", label: "周四" },
    { key: "friday", label: "周五" },
    { key: "saturday", label: "周六" },
    { key: "sunday", label: "周日" },
  ]

  return (
    <ResponsiveLayout title="账户设置" user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面状态提示 */}
        {passwordStatus === "success" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">✅ 密码修改成功！</span>
            </div>
          </div>
        )}

        {passwordStatus === "error" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">❌ 密码修改失败，请检查输入</span>
            </div>
          </div>
        )}

        {exportStatus === "ready" && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              <span className="font-medium">📦 数据导出已准备完成，可以下载了！</span>
            </div>
          </div>
        )}

        {/* 返回按钮和页面标题 */}
        <div className="flex items-center space-x-4">
          <AccessibleButton variant="outline" size="sm" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回资料
            </Link>
          </AccessibleButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">账户设置</h1>
            <p className="text-gray-600">管理您的账户安全和偏好设置</p>
          </div>
        </div>

        {/* 密码修改 */}
        <Card className="shadow-lg border-2 border-red-100 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-red-700" />
              <span>密码修改</span>
            </CardTitle>
            <CardDescription>定期更换密码以保护账户安全</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">当前密码</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="请输入当前密码"
                    className="border-2 border-gray-200 focus:border-red-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="请输入新密码"
                    className="border-2 border-gray-200 focus:border-red-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>密码要求：</p>
                  <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                    <li>至少8个字符</li>
                    <li>包含大小写字母</li>
                    <li>包含数字和特殊字符</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="请再次输入新密码"
                    className="border-2 border-gray-200 focus:border-red-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <AccessibleButton
              onClick={handlePasswordSubmit}
              loading={passwordStatus === "changing"}
              loadingText="修改中..."
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              <Key className="h-4 w-4 mr-2" />
              修改密码
            </AccessibleButton>
          </CardContent>
        </Card>

        {/* 通知偏好设置 */}
        <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-700" />
              <span>通知偏好设置</span>
            </CardTitle>
            <CardDescription>控制您接收通知的方式和内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 通知方式 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                通知方式
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">邮件通知</span>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">推送通知</span>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">短信通知</span>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 通知内容 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">通知内容</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "courseUpdates", label: "课程更新", desc: "新课程发布和内容更新" },
                  { key: "examReminders", label: "考试提醒", desc: "考试时间和截止日期提醒" },
                  { key: "achievementNotifications", label: "成就通知", desc: "获得徽章和证书时通知" },
                  { key: "weeklyProgress", label: "学习周报", desc: "每周学习进度总结" },
                  { key: "communityMessages", label: "社区消息", desc: "讨论回复和私信通知" },
                  { key: "systemAnnouncements", label: "系统公告", desc: "重要系统更新和维护通知" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <div>
                      <span className="text-sm font-medium">{item.label}</span>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 学习提醒配置 */}
        <Card className="shadow-lg border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-700" />
              <span>学习提醒配置</span>
            </CardTitle>
            <CardDescription>设置个性化的学习提醒和目标</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基础提醒设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                <div>
                  <span className="text-sm font-medium">启用学习提醒</span>
                  <p className="text-xs text-gray-500">开启后将按设定时间提醒您学习</p>
                </div>
                <Switch
                  checked={studyReminders.enabled}
                  onCheckedChange={(checked) => handleStudyReminderChange("enabled", checked)}
                />
              </div>

              {studyReminders.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>提醒时间</Label>
                      <Select
                        value={studyReminders.reminderTime}
                        onValueChange={(value) => handleStudyReminderChange("reminderTime", value)}
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-green-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">上午 8:00</SelectItem>
                          <SelectItem value="12:00">中午 12:00</SelectItem>
                          <SelectItem value="18:00">下午 6:00</SelectItem>
                          <SelectItem value="19:00">晚上 7:00</SelectItem>
                          <SelectItem value="20:00">晚上 8:00</SelectItem>
                          <SelectItem value="21:00">晚上 9:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>每周学习目标（小时）</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={studyReminders.goalHoursPerWeek}
                        onChange={(e) => handleStudyReminderChange("goalHoursPerWeek", Number.parseInt(e.target.value))}
                        className="border-2 border-gray-200 focus:border-green-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>提醒日期</Label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.key}
                          onClick={() => handleReminderDayToggle(day.key)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            studyReminders.reminderDays.includes(day.key)
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                      <div>
                        <span className="text-sm font-medium">连续学习提醒</span>
                        <p className="text-xs text-gray-500">提醒保持学习连续性</p>
                      </div>
                      <Switch
                        checked={studyReminders.streakReminder}
                        onCheckedChange={(checked) => handleStudyReminderChange("streakReminder", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                      <div>
                        <span className="text-sm font-medium">休息提醒</span>
                        <p className="text-xs text-gray-500">长时间学习时提醒休息</p>
                      </div>
                      <Switch
                        checked={studyReminders.breakReminder}
                        onCheckedChange={(checked) => handleStudyReminderChange("breakReminder", checked)}
                      />
                    </div>
                  </div>

                  {studyReminders.breakReminder && (
                    <div className="space-y-2">
                      <Label>休息间隔（分钟）</Label>
                      <Select
                        value={studyReminders.breakInterval.toString()}
                        onValueChange={(value) => handleStudyReminderChange("breakInterval", Number.parseInt(value))}
                      >
                        <SelectTrigger className="border-2 border-gray-200 focus:border-green-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15分钟</SelectItem>
                          <SelectItem value="30">30分钟</SelectItem>
                          <SelectItem value="45">45分钟</SelectItem>
                          <SelectItem value="60">60分钟</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 数据导出功能 */}
        <Card className="shadow-lg border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-700" />
              <span>数据导出功能</span>
            </CardTitle>
            <CardDescription>导出您的学习数据和个人信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">选择导出内容</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "includeProfile", label: "个人资料", desc: "基本信息、头像、简介等" },
                  { key: "includeCourses", label: "课程数据", desc: "已学课程、收藏课程等" },
                  { key: "includeProgress", label: "学习进度", desc: "学习时长、完成度等" },
                  { key: "includeNotes", label: "学习笔记", desc: "课程笔记和心得" },
                  { key: "includeCertificates", label: "证书记录", desc: "获得的证书和成就" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <div>
                      <span className="text-sm font-medium">{item.label}</span>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={exportData[item.key as keyof typeof exportData] as boolean}
                      onCheckedChange={(checked) => setExportData((prev) => ({ ...prev, [item.key]: checked }))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>导出格式</Label>
                <Select
                  value={exportData.format}
                  onValueChange={(value) => setExportData((prev) => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON 格式</SelectItem>
                    <SelectItem value="csv">CSV 格式</SelectItem>
                    <SelectItem value="pdf">PDF 报告</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">数据导出说明</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>数据导出可能需要几分钟时间</li>
                    <li>导出的数据包含您的所有个人信息</li>
                    <li>请妥善保管导出的数据文件</li>
                    <li>数据导出链接24小时内有效</li>
                  </ul>
                </div>
              </div>
            </div>

            <AccessibleButton
              onClick={handleDataExport}
              loading={exportStatus === "preparing"}
              loadingText="准备中..."
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {exportStatus === "preparing" ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {exportStatus === "ready" ? "下载数据" : "开始导出"}
            </AccessibleButton>
          </CardContent>
        </Card>

        {/* 账户注销选项 */}
        <Card className="shadow-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>危险操作</span>
            </CardTitle>
            <CardDescription className="text-red-600">以下操作不可逆转，请谨慎操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-2">账户注销说明</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>注销后将永久删除您的所有数据</li>
                    <li>包括学习进度、证书、笔记等</li>
                    <li>此操作无法撤销</li>
                    <li>建议在注销前先导出重要数据</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <AccessibleButton
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                申请注销账户
              </AccessibleButton>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation" className="text-red-700 font-medium">
                    请输入"删除我的账户"以确认注销
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="删除我的账户"
                    className="border-2 border-red-300 focus:border-red-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <AccessibleButton
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmation("")
                    }}
                  >
                    取消
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={handleAccountDelete}
                    disabled={deleteConfirmation !== "删除我的账户"}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    确认注销
                  </AccessibleButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 保存所有设置按钮 */}
        <div className="flex justify-end space-x-4 pb-6">
          <AccessibleButton variant="outline" asChild>
            <Link href="/profile">返回资料</Link>
          </AccessibleButton>
          <AccessibleButton
            onClick={() => {
              alert("设置已保存！")
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            保存所有设置
          </AccessibleButton>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
