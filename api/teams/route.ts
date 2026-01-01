/**
 * @file 团队API路由
 * @description 提供团队数据的获取和管理功能
 * @module TeamsApi
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @updated 2025-03-17
 */
import { NextResponse } from "next/server"
import { teams } from "@/data/teams"

export async function GET() {
  try {
    return NextResponse.json({
      teams,
      total: teams.length,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
