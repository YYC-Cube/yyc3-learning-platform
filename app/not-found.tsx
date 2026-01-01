"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-800">页面未找到</CardTitle>
          <CardDescription>抱歉，您访问的页面不存在或已被移动。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
            <p className="text-gray-600">请检查网址是否正确，或尝试以下操作：</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/" className="inline-flex items-center justify-center">
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回上一页
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">如果问题持续存在，请联系技术支持</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
