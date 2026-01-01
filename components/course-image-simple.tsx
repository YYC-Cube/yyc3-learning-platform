interface CourseImageProps {
  src: string
  alt: string
  title: string
  color: string
  className?: string
}

export function CourseImageSimple({ src, alt, title, color, className = "" }: CourseImageProps) {
  // 简约版DeepSeek设计
  if (title.includes("DeepSeek")) {
    return (
      <div
        className={`w-full h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center relative overflow-hidden ${className}`}
      >
        {/* 几何背景 */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" viewBox="0 0 400 200" className="opacity-20">
            <polygon points="0,0 100,50 0,100" fill="white" opacity="0.1" />
            <polygon points="400,0 300,50 400,100" fill="white" opacity="0.1" />
            <polygon points="150,200 250,150 350,200" fill="white" opacity="0.1" />
            <circle cx="200" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" opacity="0.2" />
            <circle cx="200" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        {/* 主要内容 */}
        <div className="text-center z-10">
          {/* 简约Logo */}
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 8L24 24M24 8L8 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* 文字 */}
          <h3 className="text-2xl font-bold text-white mb-1">DeepSeek</h3>
          <p className="text-sm text-white text-opacity-80">大模型应用开发</p>

          {/* 状态指示器 */}
          <div className="flex justify-center mt-3 space-x-1">
            <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-white bg-opacity-40 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        onError={() => {}}
      />
    </div>
  )
}
