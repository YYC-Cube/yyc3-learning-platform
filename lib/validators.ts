import { z } from "zod"

// 用户验证schemas
export const loginSchema = z.object({
  email: z.string().email("无效的邮箱地址"),
  password: z.string().min(8, "密码至少8位"),
})

export const registerSchema = z
  .object({
    email: z.string().email("无效的邮箱地址"),
    username: z
      .string()
      .min(3, "用户名至少3位")
      .max(20, "用户名最多20位")
      .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
    password: z
      .string()
      .min(8, "密码至少8位")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码必须包含大小写字母和数字"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  })

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "显示名称至少2位").optional(),
  bio: z.string().max(500, "简介最多500字").optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "无效的手机号")
    .optional(),
  website: z.string().url("无效的网址").optional(),
})

// 课程验证schemas
export const courseFilterSchema = z.object({
  category: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
})

// 考试验证schemas
export const examSubmitSchema = z.object({
  examId: z.string(),
  answers: z.record(z.union([z.string(), z.array(z.string())])),
})
