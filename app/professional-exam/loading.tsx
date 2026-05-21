/**
 * @fileoverview 加载状态组件 · loading.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export default function ProfessionalExamLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-44 h-7 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-60 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-full h-2 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
