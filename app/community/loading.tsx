export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* 页面头部骨架 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏骨架 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 社区统计骨架 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 分类筛选骨架 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* 热门标签骨架 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* 主内容区骨架 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 搜索栏骨架 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-center space-x-4">
                <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* 帖子列表骨架 */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
