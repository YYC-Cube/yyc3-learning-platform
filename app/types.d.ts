// 全局类型定义文件

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message: string
}

// 分页信息类型
export interface PaginationInfo {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

// 课程相关类型
export interface Course {
  id: string
  title: string
  description: string
  image: string
  level: "beginner" | "intermediate" | "advanced"
  duration: string
  progress: number
  chapters: number
  category: string
  instructor?: string
  rating?: number
  students?: number
}

// 用户相关类型
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  level: string
  points: number
  streak: number
  joinDate: string
  studyPoints: number
  studyDays: number
  completedCourses: number
  studyHours: number
  certificates: number
  rank: number
  phone?: string
  location?: string
  company?: string
  position?: string
  bio?: string
  skills?: string[]
  interests?: string[]
  profile: UserProfile
  learningStats: LearningStats
  enrolledCourses: any[] // CourseProgress[]
  achievements: Achievement[]
  preferences: UserPreferences
}

export interface UserProfile {
  bio: string
  location: string
  website: string
  github: string
  linkedin: string
}

export interface LearningStats {
  totalCourses: number
  completedCourses: number
  totalHours: number
  currentStreak: number
  longestStreak: number
  averageScore: number
  daysSinceJoin?: number
  completionRate?: number
}

export interface Certificate {
  id: string
  courseId: string
  courseName: string
  issuedAt: string
  certificateUrl: string
  score: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt?: string
  progress?: number
  maxProgress?: number
  unlockedAt?: Date
}

export interface UserPreferences {
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyReport: boolean
  theme: "light" | "dark" | "system"
  learningReminder: {
    enabled: boolean
    time: string
    days: string[]
  }
}

// 考试相关类型
export interface ExamQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  category: string
  tags: string[]
}

export interface ExamResult {
  id: string
  examId: string
  userId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  completedAt: Date
  answers: ExamAnswer[]
}

export interface ExamAnswer {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
  timeSpent: number
}

export interface Exam {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: number
  totalQuestions: number
  passingScore: number
  questions: ExamQuestion[]
  timeLimit: number // 分钟
  attempts: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 学习路径类型
export interface LearningPath {
  id: string
  title: string
  description: string
  courses: Course[]
  estimatedTime: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

// 团队学习类型
export interface StudyGroup {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  maxMembers: number
  isPublic: boolean
  createdBy: string
  createdAt: string
  image: string
  tags: string[]
  members: GroupMember[]
  activities: GroupActivity[]
}

export interface GroupMember {
  userId: string
  name: string
  avatar: string
  role: "admin" | "moderator" | "member"
  joinedAt: string
  contribution: number
}

export interface GroupActivity {
  id: string
  type: "discussion" | "study-session" | "quiz" | "project"
  title: string
  description: string
  scheduledAt: string
  duration: number
  participants: string[]
  status: "scheduled" | "ongoing" | "completed" | "cancelled"
}

// 推荐系统类型
export interface Recommendation {
  id: string
  type: "course" | "path" | "group" | "exam"
  targetId: string
  title: string
  description: string
  reason: string
  confidence: number
  image: string
  metadata: Record<string, any>
}

// 通知类型
export interface Notification {
  id: string
  userId: string
  type: "course" | "achievement" | "reminder" | "system" | "social"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, any>
}

// 搜索相关类型
export interface SearchFilters {
  category?: string
  difficulty?: string
  priceRange?: [number, number]
  rating?: number
  duration?: string
  tags?: string[]
}

export interface SearchResult<T> {
  items: T[]
  total: number
  filters: SearchFilters
  suggestions: string[]
}

// 分析统计类型
export interface LearningAnalytics {
  userId: string
  period: "week" | "month" | "quarter" | "year"
  metrics: {
    studyTime: number
    coursesCompleted: number
    averageScore: number
    streakDays: number
    pointsEarned: number
    skillsAcquired: string[]
  }
  trends: {
    studyTimeByDay: number[]
    scoreByCategory: Record<string, number>
    progressByWeek: number[]
  }
  recommendations: Recommendation[]
}

// 系统配置类型
export interface SystemConfig {
  features: {
    enableChat: boolean
    enableNotifications: boolean
    enableAnalytics: boolean
    enableSocialFeatures: boolean
  }
  limits: {
    maxCoursesPerUser: number
    maxGroupsPerUser: number
    maxFileUploadSize: number
  }
  ui: {
    theme: string
    language: string
    timezone: string
  }
}

// Hook返回类型
export interface UseCoursesReturn {
  courses: Course[]
  loading: boolean
  error: string | null
  fetchCourses: (filters?: SearchFilters) => Promise<void>
  searchCourses: (query: string) => Promise<void>
  enrollCourse: (courseId: number) => Promise<void>
  updateProgress: (courseId: number, progress: number) => Promise<void>
}

export interface UseUserReturn {
  user: User | null
  loading: boolean
  error: string | null
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  refreshUser: () => Promise<void>
}

// 表单类型
export interface CourseFormData {
  title: string
  description: string
  category: string
  level: string
  duration: string
  price: string
  tags: string[]
  instructor: string
  chapters: number
  image?: string
}

export interface UserProfileFormData {
  name: string
  bio: string
  location: string
  website: string
  github: string
  linkedin: string
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// 事件类型
export interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  userId?: string
  timestamp: string
}

// 团队类型
export interface Team {
  id: string
  name: string
  description: string
  members: number
  image: string
  category: string
  isJoined?: boolean
}

// 导出所有类型的联合类型
export type AllTypes = Course | User | Exam | LearningPath | StudyGroup | Notification | Recommendation | Team

// 声明 CourseProgress 类型
export interface CourseProgress {
  courseId: number
  progress: number
  completedAt?: string
}
