export default function AchievementsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pb-20">
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
          <div className="flex items-center space-x-2">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* 成就统计骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="w-12 h-8 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 分类筛选骨架 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* 成就列表骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
