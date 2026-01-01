/**
 * @file 登录API路由
 * @description 处理用户登录请求
 * @author YYC³
 */
import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validators'
import { query } from '@/lib/database'
import { generateToken, verifyPassword } from '@/lib/auth'
import type { DbUser } from '@/types/user'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // 查询用户（使用 learning_users 表）
    const users = await query<DbUser>(
      'SELECT * FROM learning_users WHERE email = $1',
      [email]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    const user = users[0]

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash || '')
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 生成 JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // 更新最后登录时间
    await query(
      'UPDATE learning_users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    )

    // 返回用户信息（不包含密码）
    const { password_hash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    logger.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
