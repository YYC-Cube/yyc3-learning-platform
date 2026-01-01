export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  level: string
  students: number
  rating: number
  price: number
  thumbnail: string
  category: string
  tags: string[]
  lessons: number
  certificate: boolean
}

export async function getCourses(): Promise<Course[]> {
  // In production, this would fetch from an API
  return []
}

export async function getCourseById(id: string): Promise<Course | null> {
  // In production, this would fetch from an API
  return null
}

export async function enrollCourse(courseId: string, userId: string): Promise<boolean> {
  // In production, this would call an API
  return true
}

export async function getEnrolledCourses(userId: string): Promise<Course[]> {
  // In production, this would fetch from an API
  return []
}
