// 应用常量定义

export const APP_CONFIG = {
  name: "AI学习平台",
  description: "AI Learning Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "zh-CN",
  supportEmail: "support@ai-learning.com",
} as const

export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    verify: "/api/auth/verify",
  },
  courses: {
    list: "/api/courses",
    detail: "/api/courses/[id]",
    enroll: "/api/courses/[id]/enroll",
    progress: "/api/courses/[id]/progress",
  },
  exams: {
    list: "/api/exams",
    detail: "/api/exams/[id]",
    start: "/api/exams/[id]/start",
    submit: "/api/exams/[id]/submit",
  },
  user: {
    profile: "/api/user/profile",
    update: "/api/user/update",
    achievements: "/api/user/achievements",
    certificates: "/api/user/certificates",
  },
} as const

export const STORAGE_KEYS = {
  token: "auth_token",
  user: "user_data",
  theme: "theme_preference",
  locale: "locale_preference",
} as const

export const PAGINATION = {
  defaultPageSize: 12,
  maxPageSize: 100,
  pageSizeOptions: [12, 24, 36, 48],
} as const

export const COURSE_LEVELS = [
  { value: "beginner", label: "初级" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
] as const

export const COURSE_CATEGORIES = [
  { value: "ai-basics", label: "AI基础" },
  { value: "machine-learning", label: "机器学习" },
  { value: "deep-learning", label: "深度学习" },
  { value: "nlp", label: "自然语言处理" },
  { value: "computer-vision", label: "计算机视觉" },
  { value: "prompt-engineering", label: "Prompt工程" },
  { value: "ai-applications", label: "AI应用" },
] as const

export const EXAM_DIFFICULTIES = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" },
] as const

export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const

export const ACHIEVEMENT_RARITIES = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
} as const

export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
} as const

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "请输入有效的邮箱地址",
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: "密码至少8位，包含大小写字母和数字",
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: "用户名3-20位，只能包含字母、数字和下划线",
  },
} as const
