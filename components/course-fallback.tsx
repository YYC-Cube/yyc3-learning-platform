interface CourseFallbackProps {
  title: string
  color: string
}

export function CourseFallback({ title, color }: CourseFallbackProps) {
  return (
    <div className={`w-20 h-20 rounded-lg flex items-center justify-center bg-gradient-to-r ${color}`}>
      <div className="text-white text-xs font-bold text-center px-2">{title.split(" ")[0]}</div>
    </div>
  )
}
