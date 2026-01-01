/**
 * @file 单个题目管理 API
 * @description 题目详情、更新操作
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { questionsFromJSON, questionsToJSON } from '@/lib/question-parser'
import type { Question } from '@/types/question'

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions', 'single-choice-questions.json')

function loadQuestions(): Question[] {
  try {
    if (!fs.existsSync(QUESTIONS_FILE)) {
      return []
    }
    const json = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
    return questionsFromJSON(json)
  } catch {
    return []
  }
}

function saveQuestions(questions: Question[]): boolean {
  try {
    fs.writeFileSync(QUESTIONS_FILE, questionsToJSON(questions), 'utf-8')
    return true
  } catch {
    return false
  }
}

/**
 * GET /api/questions/[id] - 获取题目详情
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionId = parseInt(id)
    
    const questions = loadQuestions()
    const question = questions.find(q => q.id === questionId)
    
    if (!question) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 })
    }
    
    return NextResponse.json({ question })
  } catch {
    return NextResponse.json({ error: '获取题目失败' }, { status: 500 })
  }
}

/**
 * PUT /api/questions/[id] - 更新题目
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionId = parseInt(id)
    const updatedData = await request.json() as Partial<Question>
    
    const questions = loadQuestions()
    const index = questions.findIndex(q => q.id === questionId)
    
    if (index === -1) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 })
    }
    
    questions[index] = {
      ...questions[index],
      ...updatedData,
      id: questionId, // 保持ID不变
      updatedAt: new Date()
    }
    
    if (!saveQuestions(questions)) {
      return NextResponse.json({ error: '更新题目失败' }, { status: 500 })
    }
    
    return NextResponse.json({ question: questions[index] })
  } catch {
    return NextResponse.json({ error: '更新题目失败' }, { status: 500 })
  }
}

/**
 * DELETE /api/questions/[id] - 删除单个题目
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionId = parseInt(id)
    
    let questions = loadQuestions()
    const originalLength = questions.length
    
    questions = questions.filter(q => q.id !== questionId)
    
    if (questions.length === originalLength) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 })
    }
    
    if (!saveQuestions(questions)) {
      return NextResponse.json({ error: '删除题目失败' }, { status: 500 })
    }
    
    return NextResponse.json({ message: '删除成功' })
  } catch {
    return NextResponse.json({ error: '删除题目失败' }, { status: 500 })
  }
}
