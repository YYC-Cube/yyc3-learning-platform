/**
 * @file 课程API路由
 * @description 提供课程数据的获取和管理功能
 * @module CoursesApi
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @updated 2025-03-17
 */
import { NextResponse } from "next/server"
import { courseData } from "@/data/course-data"

export async function GET() {
  try {
    return NextResponse.json({
      courses: courseData,
      total: courseData.length,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
