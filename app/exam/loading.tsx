/**
 * @fileoverview 加载状态组件 · loading.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export default function ExamLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border">
              <div className="flex items-center justify-between mb-3">
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
