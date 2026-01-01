"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Camera,
  Save,
  Plus,
  X,
  Upload,
  Shield,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { AccessibleButton } from "@/components/accessibility/accessible-button"

export default function EditProfilePage() {
  const [currentUser] = useState({
    name: "YanYu同学",
    email: "yanyu@smartcloud.com",
    avatar: "/placeholder.svg?height=80&width=80&text=YY",
    bio: "专注于AI技术研发与应用，致力于推动人工智能在各行业的落地实践。",
    phone: "+86 138-0000-0000",
    location: "北京市海淀区",
    company: "YanYu智能科技",
    position: "AI算法工程师",
    skills: ["机器学习", "深度学习", "自然语言处理", "计算机视觉", "Python", "TensorFlow"],
  })

  const [formData, setFormData] = useState(currentUser)
  const [newSkill, setNewSkill] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  // 隐私设置状态
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showLocation: true,
    showCompany: true,
    showLearningProgress: true,
    allowMessages: true,
    showOnlineStatus: true,
    publicProfile: true,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleAvatarUpload = () => {
    setIsUploading(true)
    // 模拟上传过程
    setTimeout(() => {
      setIsUploading(false)
      // 这里可以处理实际的文件上传逻辑
    }, 2000)
  }

  const handleSave = async () => {
    setSaveStatus("saving")

    // 模拟保存过程
    setTimeout(() => {
      setSaveStatus("success")

      // 3秒后重置状态
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    }, 1500)
  }

  return (
    <ResponsiveLayout title="编辑资料" user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面状态提示 */}
        {saveStatus === "success" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">✅ 个人资料保存成功！</span>
            </div>
          </div>
        )}

        {saveStatus === "error" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">❌ 保存失败，请重试</span>
            </div>
          </div>
        )}

        {/* 返回按钮 */}
        <div className="flex items-center space-x-4">
          <AccessibleButton variant="outline" size="sm" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回资料
            </Link>
          </AccessibleButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">编辑个人资料</h1>
            <p className="text-gray-600">管理您的个人信息和隐私设置</p>
          </div>
        </div>

        {/* 头像编辑 */}
        <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-700" />
              <span>头像设置</span>
            </CardTitle>
            <CardDescription>上传您的个人头像，支持 JPG、PNG 格式</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                YY
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-3">
                <AccessibleButton
                  variant="outline"
                  onClick={handleAvatarUpload}
                  loading={isUploading}
                  loadingText="上传中..."
                  className="border-2 border-blue-300 hover:border-blue-400 text-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  上传新头像
                </AccessibleButton>
                <AccessibleButton variant="ghost" className="text-gray-600">
                  <Camera className="h-4 w-4 mr-2" />
                  拍照
                </AccessibleButton>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• 推荐尺寸：400x400 像素</p>
                <p>• 文件大小不超过 2MB</p>
                <p>• 支持格式：JPG、PNG、GIF</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本信息 */}
        <Card className="shadow-lg border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-700" />
              <span>基本信息</span>
            </CardTitle>
            <CardDescription>编辑您的个人基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>姓名</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="请输入您的姓名"
                  className="border-2 border-gray-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>邮箱</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="请输入您的邮箱"
                  className="border-2 border-gray-200 focus:border-green-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>手机号</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="请输入您的手机号"
                  className="border-2 border-gray-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>所在地</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="请输入您的所在地"
                  className="border-2 border-gray-200 focus:border-green-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span>个人简介</span>
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="介绍一下您自己..."
                rows={4}
                className="border-2 border-gray-200 focus:border-green-400 resize-none"
              />
              <div className="text-sm text-gray-500 text-right">{formData.bio.length}/500 字符</div>
            </div>
          </CardContent>
        </Card>

        {/* 职业信息 */}
        <Card className="shadow-lg border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-purple-700" />
              <span>职业信息</span>
            </CardTitle>
            <CardDescription>编辑您的工作相关信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company">公司</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="请输入您的公司名称"
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">职位</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="请输入您的职位"
                  className="border-2 border-gray-200 focus:border-purple-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技能标签管理 */}
        <Card className="shadow-lg border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-yellow-700" />
              <span>技能标签</span>
            </CardTitle>
            <CardDescription>管理您的专业技能标签</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 添加新技能 */}
            <div className="flex space-x-3">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="输入新技能..."
                className="flex-1 border-2 border-gray-200 focus:border-yellow-400"
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
              />
              <AccessibleButton
                onClick={addSkill}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加
              </AccessibleButton>
            </div>

            {/* 技能列表 */}
            <div className="space-y-3">
              <Label>当前技能 ({formData.skills.length})</Label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 text-sm flex items-center space-x-2"
                  >
                    <div>
                      <span>{skill}</span>
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-600 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </Badge>
                ))}
              </div>
              {formData.skills.length === 0 && (
                <p className="text-gray-500 text-sm">暂无技能标签，请添加您的专业技能</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 隐私设置 */}
        <Card className="shadow-lg border-2 border-red-100 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-700" />
              <span>隐私设置</span>
            </CardTitle>
            <CardDescription>控制您的个人信息可见性</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 个人信息可见性 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                个人信息可见性
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">显示邮箱地址</span>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">显示手机号码</span>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => handlePrivacyChange("showPhone", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">显示所在地</span>
                  </div>
                  <Switch
                    checked={privacySettings.showLocation}
                    onCheckedChange={(checked) => handlePrivacyChange("showLocation", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">显示公司信息</span>
                  </div>
                  <Switch
                    checked={privacySettings.showCompany}
                    onCheckedChange={(checked) => handlePrivacyChange("showCompany", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 学习隐私设置 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                学习隐私设置
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div>
                    <span className="text-sm font-medium">显示学习进度</span>
                    <p className="text-xs text-gray-500">其他用户可以看到您的学习进度</p>
                  </div>
                  <Switch
                    checked={privacySettings.showLearningProgress}
                    onCheckedChange={(checked) => handlePrivacyChange("showLearningProgress", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div>
                    <span className="text-sm font-medium">允许私信</span>
                    <p className="text-xs text-gray-500">其他用户可以向您发送私信</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) => handlePrivacyChange("allowMessages", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div>
                    <span className="text-sm font-medium">显示在线状态</span>
                    <p className="text-xs text-gray-500">显示您是否在线</p>
                  </div>
                  <Switch
                    checked={privacySettings.showOnlineStatus}
                    onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                  <div>
                    <span className="text-sm font-medium">公开个人资料</span>
                    <p className="text-xs text-gray-500">您的资料可以被搜索引擎索引</p>
                  </div>
                  <Switch
                    checked={privacySettings.publicProfile}
                    onCheckedChange={(checked) => handlePrivacyChange("publicProfile", checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex justify-end space-x-4 pb-6">
          <AccessibleButton variant="outline" asChild>
            <Link href="/profile">取消</Link>
          </AccessibleButton>
          <AccessibleButton
            onClick={handleSave}
            loading={saveStatus === "saving"}
            loadingText="保存中..."
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            保存更改
          </AccessibleButton>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
