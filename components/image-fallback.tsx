"use client"

import { useState } from "react"

interface ImageFallbackProps {
  src: string
  alt: string
  title: string
  className?: string
  fallbackColor?: string
}

export function ImageFallback({
  src,
  alt,
  title,
  className = "",
  fallbackColor = "from-blue-500 to-purple-600",
}: ImageFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // 创建专用的SVG备用图标
  const createFallbackSVG = () => {
    // 根据标题创建不同的图标
    if (title.includes("新手学习小组")) {
      return (
        <div
          className={`w-full h-32 bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center ${className}`}
        >
          <div className="text-center text-white">
            <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto mb-2">
              <defs>
                <linearGradient id="newbieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF" opacity="0.9" />
                  <stop offset="100%" stopColor="#FFF" opacity="0.7" />
                </linearGradient>
              </defs>

              {/* 学习书本 */}
              <rect x="15" y="20" width="30" height="25" rx="2" fill="url(#newbieGrad)" />
              <rect x="18" y="23" width="24" height="2" fill="rgba(255,255,255,0.8)" />
              <rect x="18" y="27" width="20" height="2" fill="rgba(255,255,255,0.8)" />
              <rect x="18" y="31" width="22" height="2" fill="rgba(255,255,255,0.8)" />
              <rect x="18" y="35" width="18" height="2" fill="rgba(255,255,255,0.8)" />

              {/* 友好的笑脸 */}
              <circle cx="30" cy="15" r="8" fill="url(#newbieGrad)" />
              <circle cx="27" cy="12" r="1.5" fill="rgba(255,255,255,0.9)" />
              <circle cx="33" cy="12" r="1.5" fill="rgba(255,255,255,0.9)" />
              <path
                d="M25 17 Q30 20 35 17"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* 互助的手 */}
              <g transform="translate(10, 35)">
                <path
                  d="M0 10 Q5 5 10 10 Q15 5 20 10"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </svg>
            <div className="text-sm font-bold">新手学习小组</div>
            <div className="text-xs opacity-90">友好互助 共同成长</div>
          </div>
        </div>
      )
    }

    if (title.includes("AI创新实验室")) {
      return (
        <div
          className={`w-full h-32 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center ${className}`}
        >
          <div className="text-center text-white">
            <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto mb-2">
              <defs>
                <linearGradient id="labGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF" opacity="0.9" />
                  <stop offset="100%" stopColor="#FFF" opacity="0.7" />
                </linearGradient>
              </defs>

              {/* 实验室烧杯 */}
              <path d="M20 15 L20 25 L15 40 L45 40 L40 25 L40 15 Z" fill="url(#labGrad)" />
              <rect x="18" y="12" width="24" height="6" rx="2" fill="url(#labGrad)" />

              {/* 创新火花 */}
              <g>
                <circle cx="25" cy="25" r="2" fill="#FFD700" opacity="0.8">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="30" r="1.5" fill="#FFD700" opacity="0.6">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="30" cy="35" r="1" fill="#FFD700" opacity="0.7">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>
            <div className="text-sm font-bold">AI创新实验室</div>
            <div className="text-xs opacity-90">前沿研究 技术创新</div>
          </div>
        </div>
      )
    }

    if (title.includes("Prompt工程师联盟")) {
      return (
        <div
          className={`w-full h-32 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center ${className}`}
        >
          <div className="text-center text-white">
            <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto mb-2">
              <defs>
                <linearGradient id="promptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF" opacity="0.9" />
                  <stop offset="100%" stopColor="#FFF" opacity="0.7" />
                </linearGradient>
              </defs>

              {/* 代码终端 */}
              <rect x="10" y="15" width="40" height="30" rx="3" fill="url(#promptGrad)" />
              <rect x="12" y="17" width="36" height="26" rx="2" fill="rgba(0,0,0,0.2)" />

              {/* 命令行提示符 */}
              <text x="15" y="25" fill="rgba(255,255,255,0.9)" fontSize="6" fontFamily="monospace">
                &gt;
              </text>
              <rect x="18" y="22" width="15" height="1" fill="rgba(255,255,255,0.7)" />
              <rect x="18" y="26" width="20" height="1" fill="rgba(255,255,255,0.7)" />
              <rect x="18" y="30" width="12" height="1" fill="rgba(255,255,255,0.7)" />

              {/* 联盟徽章 */}
              <circle cx="45" cy="20" r="8" fill="rgba(255,215,0,0.8)" />
              <text x="45" y="23" textAnchor="middle" fill="rgba(0,0,0,0.8)" fontSize="8" fontWeight="bold">
                P
              </text>
            </svg>
            <div className="text-sm font-bold">Prompt工程师联盟</div>
            <div className="text-xs opacity-90">专业技术 实战交流</div>
          </div>
        </div>
      )
    }

    // 考试相关的备用图标
    if (title.includes("AI基础知识测试")) {
      return (
        <div
          className={`w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${className}`}
        >
          <div className="text-center text-white">
            <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-3">
              <defs>
                <linearGradient id="basicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF" opacity="0.9" />
                  <stop offset="100%" stopColor="#FFF" opacity="0.7" />
                </linearGradient>
              </defs>

              {/* 大脑图标 */}
              <path
                d="M25 30 Q20 20 30 20 Q35 15 45 20 Q55 15 60 25 Q65 35 55 40 Q50 45 40 40 Q30 45 25 35 Z"
                fill="url(#basicGrad)"
              />

              {/* 神经连接 */}
              <g stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none">
                <line x1="30" y1="25" x2="35" y2="30" />
                <line x1="35" y1="30" x2="45" y2="25" />
                <line x1="45" y1="25" x2="50" y2="35" />
                <line x1="35" y1="30" x2="40" y2="35" />
              </g>

              {/* 知识点 */}
              <circle cx="30" cy="25" r="2" fill="#FFD700" />
              <circle cx="45" cy="25" r="2" fill="#FFD700" />
              <circle cx="40" cy="35" r="2" fill="#FFD700" />

              {/* 测试文字 */}
              <text x="40" y="60" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="bold">
                基础测试
              </text>
            </svg>
            <div className="text-lg font-bold">AI基础知识测试</div>
            <div className="text-sm opacity-90">测试基本概念和原理</div>
          </div>
        </div>
      )
    }

    // 通用备用图标
    return (
      <div className={`w-full h-32 bg-gradient-to-br ${fallbackColor} flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="text-lg font-bold mb-1">{title.split(" ")[0]}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageError && (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {/* 显示备用SVG */}
      {(imageError || !imageLoaded) && <div className="absolute inset-0">{createFallbackSVG()}</div>}

      {/* 加载指示器 */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-gray-500 text-sm">加载中...</div>
        </div>
      )}
    </div>
  )
}
