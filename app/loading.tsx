import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">加载中...</h2>
          <p className="text-gray-600">正在为您准备学习内容</p>
        </div>
      </div>

      {/* 头部骨架屏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-32 h-6" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-24 h-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容骨架屏 */}
      <div className="container mx-auto px-4 py-8">
        {/* 欢迎区域骨架屏 */}
        <div className="mb-8">
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-64 h-5" />
        </div>

        {/* 统计卡片骨架屏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="w-20 h-8 mb-1" />
                <Skeleton className="w-24 h-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 课程网格骨架屏 */}
        <div className="mb-6">
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-0">
                  <Skeleton className="w-full h-48 rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="w-full h-5 mb-2" />
                  <Skeleton className="w-3/4 h-4 mb-3" />
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="w-12 h-3" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 学习路径骨架屏 */}
        <div className="mb-6">
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="w-3/4 h-5 mb-2" />
                      <Skeleton className="w-full h-4 mb-3" />
                      <div className="flex gap-2 mb-3">
                        <Skeleton className="w-16 h-6 rounded-full" />
                        <Skeleton className="w-20 h-6 rounded-full" />
                      </div>
                      <Skeleton className="w-24 h-8 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航骨架屏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 p-2">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-8 h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
