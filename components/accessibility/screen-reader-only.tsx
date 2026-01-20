import type React from "react"
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  id?: string
}

export function ScreenReaderOnly({ children, id }: ScreenReaderOnlyProps) {
  return <span className="sr-only" id={id}>{children}</span>
}
