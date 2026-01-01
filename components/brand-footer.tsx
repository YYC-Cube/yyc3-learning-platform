/**
 * @fileoverview 品牌页脚组件
 * @description 显示应用的品牌标语和版权信息，采用深色渐变背景设计
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-01-30
 * @modified 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { Cloud, Sparkles } from "lucide-react"

export function BrandFooter() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          {/* 主标语 */}
          <div className="flex items-center justify-center space-x-2">
            <Cloud className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              万象归元于云枢，深栈智启新纪元
            </h2>
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>

          {/* 英文标语 */}
          <p className="text-blue-200 text-lg md:text-xl font-medium italic">
            "All Realms Converge at Cloud Nexus, DeepStack Ignites a New Era"
          </p>

          {/* 分割线 */}
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>

          {/* 版权信息 */}
          <div className="pt-4 border-t border-blue-800/30">
            <p className="text-blue-300 text-sm">© 2024 YanYu Smart Cloud³ Learning Platform. All rights reserved.</p>
            <p className="text-blue-400 text-xs mt-1">Powered by Advanced AI Technology</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
