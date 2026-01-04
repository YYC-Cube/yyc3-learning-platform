/**
 * @file 注册API路由
 * @description 处理用户注册请求
 * @author YYC³
 */
import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validators'
import { query } from '@/lib/database'
import { hashPassword } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp, RateLimits, createRateLimitResponse } from '@/lib/security/rate-limiter'
import { applySecurityHeadersToNextResponse } from '@/lib/security/headers'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = await checkRateLimit(`register:${clientIp}`, RateLimits.auth)

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetTime)
    }

    const body = await request.json()

    // 验证请求数据
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return applySecurityHeadersToNextResponse(
        NextResponse.json(
          { error: '请求数据格式错误', details: validation.error.errors },
          { status: 400 }
        )
      )
    }

    const { email, username, password } = validation.data

    // 检查邮箱是否已存在
    const existingEmails = await query(
      'SELECT id FROM learning_users WHERE email = $1',
      [email]
    )
    if (existingEmails.length > 0) {
      return applySecurityHeadersToNextResponse(
        NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 409 }
        )
      )
    }

    // 检查用户名是否已存在
    const existingUsernames = await query(
      'SELECT id FROM learning_users WHERE username = $1',
      [username]
    )
    if (existingUsernames.length > 0) {
      return applySecurityHeadersToNextResponse(
        NextResponse.json(
          { error: '该用户名已被使用' },
          { status: 409 }
        )
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建新用户（使用 username 作为 display_name 的默认值）
    const newUsers = await query<{ id: number }>(
      `INSERT INTO learning_users (email, username, display_name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [email, username, username, hashedPassword, 'student']
    )

    const userId = newUsers[0].id

    const response = NextResponse.json({
      success: true,
      message: '注册成功',
      userId,
    }, { status: 201 })

    // Apply rate limit headers
    response.headers.set('X-RateLimit-Limit', RateLimits.auth.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())

    return applySecurityHeadersToNextResponse(response)
  } catch (error) {
    logger.error('Register error:', error)
    return applySecurityHeadersToNextResponse(
      NextResponse.json(
        { error: '服务器错误，请稍后重试' },
        { status: 500 }
      )
    )
  }
}
