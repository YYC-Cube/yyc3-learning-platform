/**
 * @file 健康检查API路由
 * @description 提供系统健康状态检查功能，包括数据库连接状态
 * @module HealthCheckApi
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @updated 2025-03-17
 */
import { NextResponse } from "next/server"
import { testConnection } from "@/lib/database"

export async function GET() {
  try {
    const dbHealthy = await testConnection()

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "up" : "down",
        api: "up",
      },
      version: process.env.npm_package_version || "1.0.0",
    }

    return NextResponse.json(health, {
      status: dbHealthy ? 200 : 503,
    })
  } catch (_error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Service unavailable",
      },
      { status: 503 },
    )
  }
}
