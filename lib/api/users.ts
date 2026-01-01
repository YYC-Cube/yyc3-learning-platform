export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "student" | "instructor" | "admin"
  bio?: string
  enrolledCourses: string[]
  completedCourses: string[]
  certificates: string[]
  createdAt: Date
  updatedAt: Date
}

export async function getCurrentUser(): Promise<User | null> {
  // In production, this would fetch from an API
  return null
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  // In production, this would call an API
  return {} as User
}

export async function getUserProgress(userId: string): Promise<any> {
  // In production, this would fetch from an API
  return null
}
