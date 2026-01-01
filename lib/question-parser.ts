/**
 * @file 题库解析工具
 * @description 从 Markdown 文件解析题目
 */

import { logger } from './logger'
import { Question, QuestionOption, QuestionType, QuestionCategory } from '@/types/question'

/**
 * 从 Markdown 文本解析题目列表
 */
export function parseQuestionsFromMarkdown(markdown: string, defaultCategory: QuestionCategory = 'other'): Question[] {
  const questions: Question[] = []
  
  // 按题目分割（以"第X题"开头，可能有空格）
  const blocks = markdown.split(/\s*第\s*(\d+)\s*题/)
  
  // blocks数组格式: [前置内容, 题号1, 题目1内容, 题号2, 题目2内容, ...]
  for (let i = 1; i < blocks.length; i += 2) {
    const questionNumber = parseInt(blocks[i])
    const content = blocks[i + 1]
    
    if (!content || !content.trim()) continue
    
    try {
      const question = parseQuestionBlock(content.trim(), questionNumber, defaultCategory)
      if (question) {
        questions.push(question)
      }
    } catch (error) {
      logger.error(`解析第 ${questionNumber} 题时出错`, error)
    }
  }
  
  return questions
}

/**
 * 解析单个题目块
 */
function parseQuestionBlock(block: string, id: number, category: QuestionCategory): Question | null {
  const lines = block.split('\n').map(line => line.trim()).filter(line => line)
  
  if (lines.length === 0) return null
  
  let title = ''
  const options: QuestionOption[] = []
  let answer = ''
  let explanation = ''
  let currentSection = 'title'
  
  for (const line of lines) {
    // 识别题干
    if (line.startsWith('**题干**') || line.startsWith('题干：')) {
      title = line.replace(/\*\*题干\*\*[:：]/, '').replace('题干：', '').trim()
      currentSection = 'options'
      continue
    }
    
    // 识别选项
    if (line.startsWith('**选项**') || line.startsWith('选项：')) {
      currentSection = 'options'
      continue
    }
    
    // 解析选项内容
    if (currentSection === 'options' && /^-\s*[A-E]\./.test(line)) {
      const match = line.match(/^-\s*([A-E])\.\s*(.+)/)
      if (match) {
        options.push({
          label: match[1],
          content: match[2].trim()
        })
      }
      continue
    }
    
    // 识别答案
    if (line.startsWith('**答案**') || line.startsWith('答案：')) {
      answer = line.replace(/\*\*答案\*\*[:：]/, '').replace('答案：', '').trim()
      currentSection = 'explanation'
      continue
    }
    
    // 识别解析
    if (line.startsWith('**解析**') || line.startsWith('解析：')) {
      explanation = line.replace(/\*\*解析\*\*[:：]/, '').replace('解析：', '').trim()
      currentSection = 'explanation'
      continue
    }
    
    // 跳过标题、空行、分隔线
    if (line.startsWith('#') || line.startsWith('---') || line === '') {
      continue
    }
    
    // 补充题干内容
    if (currentSection === 'title' && !title) {
      title = line
    } else if (currentSection === 'explanation' && explanation) {
      explanation += ' ' + line
    }
  }
  
  if (!title || !answer) {
    return null
  }
  
  // 判断题型
  const type: QuestionType = options.length > 0 
    ? (answer.length > 1 && (answer.includes(',') || /^[A-E]{2,}$/.test(answer)) ? 'multiple' : 'single')
    : 'essay'
  
  return {
    id,
    type,
    category,
    difficulty: 'medium',
    title,
    options: options.length > 0 ? options : undefined,
    answer,
    explanation: explanation || '暂无解析',
    tags: [],
  }
}

/**
 * 将题目列表转换为 JSON 格式
 */
export function questionsToJSON(questions: Question[]): string {
  return JSON.stringify(questions, null, 2)
}

/**
 * 从 JSON 字符串解析题目列表
 */
export function questionsFromJSON(json: string): Question[] {
  try {
    const data = JSON.parse(json)
    return Array.isArray(data) ? data : []
  } catch (error) {
    logger.error('JSON 解析失败:', error)
    return []
  }
}

/**
 * 验证题目格式
 */
export function validateQuestion(question: Partial<Question>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!question.title || question.title.trim().length === 0) {
    errors.push('题干不能为空')
  }
  
  if (!question.answer || question.answer.trim().length === 0) {
    errors.push('答案不能为空')
  }
  
  if (question.type === 'single' || question.type === 'multiple') {
    if (!question.options || question.options.length < 2) {
      errors.push('选择题至少需要2个选项')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 题目统计信息
 */
export function getQuestionStats(questions: Question[]) {
  return {
    total: questions.length,
    byType: {
      single: questions.filter(q => q.type === 'single').length,
      multiple: questions.filter(q => q.type === 'multiple').length,
      judgment: questions.filter(q => q.type === 'judgment').length,
      fill: questions.filter(q => q.type === 'fill').length,
      essay: questions.filter(q => q.type === 'essay').length,
    },
    byDifficulty: {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    },
    byCategory: questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}
