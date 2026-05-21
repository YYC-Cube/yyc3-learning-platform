/**
 * @fileoverview 加载状态组件 · loading.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm p-6 border mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
            <div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-5 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                <div className="w-14 h-3 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="flex items-center justify-between">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
