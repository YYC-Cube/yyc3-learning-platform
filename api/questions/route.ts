/**
 * @file 题库管理 API
 * @description 题目的增删改查接口
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { questionsFromJSON, questionsToJSON } from '@/lib/question-parser'
import type { Question, QuestionFilter } from '@/types/question'
import { logger } from '@/lib/logger'
import { getClientIp } from '@/lib/security/rate-limiter'
import { logDataAccessEvent, logDataModificationEvent, logValidationErrorEvent } from '@/lib/security/audit-log'

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions', 'single-choice-questions.json')

/**
 * 读取题库
 */
function loadQuestions(): Question[] {
  try {
    if (!fs.existsSync(QUESTIONS_FILE)) {
      return []
    }
    const json = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
    return questionsFromJSON(json)
  } catch (error) {
    logger.error('读取题库失败:', error)
    return []
  }
}

/**
 * 保存题库
 */
function saveQuestions(questions: Question[]): boolean {
  try {
    const dir = path.dirname(QUESTIONS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(QUESTIONS_FILE, questionsToJSON(questions), 'utf-8')
    return true
  } catch (error) {
    logger.error('保存题库失败:', error)
    return false
  }
}

/**
 * 过滤题目
 */
function filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
  return questions.filter(q => {
    if (filter.type && q.type !== filter.type) return false
    if (filter.category && q.category !== filter.category) return false
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false
    if (filter.keyword && !q.title.toLowerCase().includes(filter.keyword.toLowerCase())) return false
    if (filter.tags && filter.tags.length > 0) {
      if (!q.tags || !filter.tags.some(tag => q.tags?.includes(tag))) return false
    }
    return true
  })
}

/**
 * GET /api/questions - 获取题目列表
 * 支持筛选: ?type=single&category=ai-basics&page=1&pageSize=20
 */
export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const { searchParams } = new URL(request.url)
    
    const typeParam = searchParams.get('type')
    const categoryParam = searchParams.get('category')
    const difficultyParam = searchParams.get('difficulty')
    
    const filter: QuestionFilter = {
      type: typeParam as QuestionFilter['type'],
      category: categoryParam as QuestionFilter['category'],
      difficulty: difficultyParam as QuestionFilter['difficulty'],
      keyword: searchParams.get('keyword') || undefined,
    }
    
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    let questions = loadQuestions()
    questions = filterQuestions(questions, filter)
    
    const total = questions.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedQuestions = questions.slice(startIndex, endIndex)
    
    logDataAccessEvent('get_questions', 'questions', true, undefined, clientIp, {
      filter,
      page,
      pageSize,
      total,
    })
    
    return NextResponse.json({
      questions: paginatedQuestions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    const clientIp = getClientIp(request)
    logDataAccessEvent('get_questions', 'questions', false, undefined, clientIp, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: '获取题库失败' }, { status: 500 })
  }
}

/**
 * POST /api/questions - 创建新题目
 */
export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const newQuestion = await request.json() as Question
    
    const questions = loadQuestions()
    const maxId = questions.reduce((max, q) => Math.max(max, q.id), 0)
    newQuestion.id = maxId + 1
    newQuestion.createdAt = new Date()
    newQuestion.updatedAt = new Date()
    
    questions.push(newQuestion)
    
    if (!saveQuestions(questions)) {
      logDataModificationEvent('create_question', 'questions', false, undefined, clientIp, {
        questionId: newQuestion.id,
      }, 'Failed to save questions')
      return NextResponse.json({ error: '保存题目失败' }, { status: 500 })
    }
    
    logDataModificationEvent('create_question', 'questions', true, undefined, clientIp, {
      questionId: newQuestion.id,
      type: newQuestion.type,
      category: newQuestion.category,
    })
    
    return NextResponse.json({ question: newQuestion }, { status: 201 })
  } catch (error) {
    const clientIp = getClientIp(request)
    logDataModificationEvent('create_question', 'questions', false, undefined, clientIp, {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Failed to create question')
    return NextResponse.json({ error: '创建题目失败' }, { status: 500 })
  }
}

/**
 * DELETE /api/questions?ids=1,2,3 - 批量删除题目
 */
export async function DELETE(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const { searchParams } = new URL(request.url)
    const idsStr = searchParams.get('ids')
    
    if (!idsStr) {
      logValidationErrorEvent('delete_questions', 'Missing question IDs', undefined, clientIp)
      return NextResponse.json({ error: '缺少题目ID' }, { status: 400 })
    }
    
    const ids = idsStr.split(',').map(id => parseInt(id.trim()))
    let questions = loadQuestions()
    const originalCount = questions.length
    
    questions = questions.filter(q => !ids.includes(q.id))
    
    if (!saveQuestions(questions)) {
      logDataModificationEvent('delete_questions', 'questions', false, undefined, clientIp, {
        ids,
      }, 'Failed to save questions')
      return NextResponse.json({ error: '删除题目失败' }, { status: 500 })
    }
    
    logDataModificationEvent('delete_questions', 'questions', true, undefined, clientIp, {
      ids,
      deletedCount: originalCount - questions.length,
    })
    
    return NextResponse.json({ 
      deleted: originalCount - questions.length,
      remaining: questions.length 
    })
  } catch (error) {
    const clientIp = getClientIp(request)
    logDataModificationEvent('delete_questions', 'questions', false, undefined, clientIp, {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Failed to delete questions')
    return NextResponse.json({ error: '删除题目失败' }, { status: 500 })
  }
}
