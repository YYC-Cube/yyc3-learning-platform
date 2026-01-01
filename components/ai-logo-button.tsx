"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAIWidget } from "@/app/providers/AIWidgetContext";

interface AILogobuttonProps {
  size?: "sm" | "md" | "lg";
}

export function AILogobutton({ size = "md" }: AILogobuttonProps) {
  const { theme, systemTheme } = useTheme();
  const { toggleWidget, showWidget } = useAIWidget();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const logoWidth = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = mounted && currentTheme === "dark" ? "/yyc3-white.png" : "/yyc3-logo-blue.png";

  return (
    <button
      onClick={toggleWidget}
      className={`fixed top-4 left-4 z-[9999] rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ${logoSizes[size]} flex items-center justify-center border-2 ${showWidget ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200 dark:border-gray-700'}`}
      aria-label={showWidget ? "关闭AI助手" : "打开AI助手"}
      title={showWidget ? "关闭AI助手" : "打开AI助手"}
    >
      <Image
        src={logoSrc}
        alt="YYC³ AI助手"
        width={logoWidth[size]}
        height={logoWidth[size]}
        className={`${logoSizes[size]} object-contain`}
        priority={true}
      />
    </button>
  );
}

export default AILogobutton;
