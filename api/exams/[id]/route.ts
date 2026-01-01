/**
 * @file 考试详情API路由
 * @description 根据考试ID获取考试详情和相关题目
 * @module ExamDetailsApi
 * @author YYC³
 * @version 1.0.0
 * @created 2025-03-17
 * @updated 2025-03-17
 */
import { type NextRequest, NextResponse } from "next/server"
import { getExamById } from "@/data/exams"
import { getQuestionsByExamId } from "@/data/question-bank"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const exam = getExamById(id)

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const questions = getQuestionsByExamId(id)

    return NextResponse.json({
      exam,
      questions,
      totalQuestions: questions.length,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
