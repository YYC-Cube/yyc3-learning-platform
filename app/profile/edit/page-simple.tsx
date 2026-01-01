"use client"

import { useState } from "react"
import { ResponsiveLayout } from "@/components/responsive-layout"

export default function SimpleEditProfilePage() {
  const [currentUser] = useState({
    name: "YanYu同学",
    avatar: "/placeholder.svg?height=80&width=80&text=YY",
    level: "高级"
  })

  return (
    <ResponsiveLayout title="编辑资料" user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1>编辑资料</h1>
        <p>这是一个简化版本的编辑资料页面</p>
      </div>
    </ResponsiveLayout>
  )
}