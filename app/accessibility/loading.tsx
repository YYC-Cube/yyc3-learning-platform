/**
 * @fileoverview 加载状态组件 · loading.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export default function AccessibilityLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-40 h-7 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-52 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
