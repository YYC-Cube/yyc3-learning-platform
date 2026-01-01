"use client"

import { useState } from "react"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function TestEditProfilePage() {
  const [currentUser] = useState({
    name: "YanYu同学",
    avatar: "/placeholder.svg?height=80&width=80&text=YY",
    level: "高级"
  })

  const [skills, setSkills] = useState(["机器学习", "深度学习", "自然语言处理"])

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove))
  }

  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showLocation: true,
    showBirthday: false
  })

  const handlePrivacyChange = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const [formData, setFormData] = useState({
    name: "YanYu同学",
    email: "yanyu@example.com",
    phone: "13800138000",
    bio: "AI学习者，热爱机器学习和深度学习",
    avatar: "/placeholder.svg?height=80&width=80&text=YY"
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <ResponsiveLayout title="编辑资料" user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>头像设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar} alt="头像" />
                <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="secondary" className="w-full">
                上传头像
              </Button>
              <p className="text-sm text-gray-500">支持JPG、PNG格式，文件大小不超过2MB</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">姓名</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="请输入姓名"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">邮箱</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="请输入邮箱"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 text-sm flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-600 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>隐私设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>显示邮箱</span>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={() => handlePrivacyChange("showEmail")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>显示电话</span>
                <Switch
                  checked={privacySettings.showPhone}
                  onCheckedChange={() => handlePrivacyChange("showPhone")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>显示位置</span>
                <Switch
                  checked={privacySettings.showLocation}
                  onCheckedChange={() => handlePrivacyChange("showLocation")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>显示生日</span>
                <Switch
                  checked={privacySettings.showBirthday}
                  onCheckedChange={() => handlePrivacyChange("showBirthday")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}