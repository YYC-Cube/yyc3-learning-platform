/**
 * @fileoverview 加载状态组件 · loading.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-36 h-7 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-56 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 border text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-2" />
              <div className="w-12 h-6 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-full h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
