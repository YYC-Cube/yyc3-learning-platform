export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* 页面头部骨架 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="w-40 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-56 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* 时间范围选择骨架 */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>

        {/* 数据概览卡片骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 学习时长趋势图骨架 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* 课程完成度和技能分布骨架 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center justify-between mb-6">
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mr-3"></div>
                        <div>
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 学习效率分析骨架 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* 表头骨架 */}
              <div className="flex border-b pb-3 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-1 px-6">
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              {/* 表格内容骨架 */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex py-4 border-b">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex-1 px-6">
                      <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 学习建议骨架 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-6">
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 bg-gray-50 rounded-lg border">
                <div className="flex items-start">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse mr-4"></div>
                  <div className="flex-1">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
