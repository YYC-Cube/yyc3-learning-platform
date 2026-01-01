"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, VolumeX, Moon, Sun } from "lucide-react"

interface ExamExperienceEnhancerProps {
  onThemeChange?: (theme: string) => void
}

export function ExamExperienceEnhancer({ onThemeChange }: ExamExperienceEnhancerProps) {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [theme, setTheme] = useState("light")
  const [fontSize, setFontSize] = useState("normal")

  // 播放提示音
  const playSound = (type: "success" | "warning" | "info") => {
    if (!soundEnabled) return

    // 使用Web Audio API创建简单提示音
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // 不同类型的音频频率
    const frequencies = {
      success: 800,
      warning: 400,
      info: 600,
    }

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  // 主题切换
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    onThemeChange?.(newTheme)

    // 应用主题到document
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // 字体大小调整
  const adjustFontSize = (size: "small" | "normal" | "large") => {
    setFontSize(size)
    const root = document.documentElement

    switch (size) {
      case "small":
        root.style.fontSize = "14px"
        break
      case "large":
        root.style.fontSize = "18px"
        break
      default:
        root.style.fontSize = "16px"
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {/* 声音控制 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 p-0"
            title={soundEnabled ? "关闭提示音" : "开启提示音"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* 主题切换 */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0" title="切换主题">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* 字体大小 */}
          <div className="flex items-center gap-1">
            <Button
              variant={fontSize === "small" ? "default" : "ghost"}
              size="sm"
              onClick={() => adjustFontSize("small")}
              className="h-6 w-6 p-0 text-xs"
              title="小字体"
            >
              A
            </Button>
            <Button
              variant={fontSize === "normal" ? "default" : "ghost"}
              size="sm"
              onClick={() => adjustFontSize("normal")}
              className="h-7 w-7 p-0 text-sm"
              title="正常字体"
            >
              A
            </Button>
            <Button
              variant={fontSize === "large" ? "default" : "ghost"}
              size="sm"
              onClick={() => adjustFontSize("large")}
              className="h-8 w-8 p-0"
              title="大字体"
            >
              A
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
