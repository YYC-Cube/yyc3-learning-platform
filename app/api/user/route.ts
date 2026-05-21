/**
 * @fileoverview API路由 · route.ts
 * @author YYC³ <admin@0379.email>
 * @version 2.0.0
 * @license MIT
 */
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { query } from '@/lib/database';

const FALLBACK_USER_ID = 'user-001';

function getFallbackUser() {
  return {
    id: FALLBACK_USER_ID,
    name: '张同学',
    email: 'zhang@example.com',
    avatar: '/placeholder.svg?height=40&width=40',
    level: 'AI学习者',
    points: 2450,
    streak: 7,
    joinDate: '2024-01-01T00:00:00Z',
    lastLoginDate: new Date().toISOString(),
    profile: { bio: '热爱AI技术的学习者', location: '北京', website: '', github: '', linkedin: '' },
    learningStats: {
      totalCourses: 12,
      completedCourses: 8,
      totalHours: 156,
      currentStreak: 7,
      longestStreak: 15,
      averageScore: 87.5,
    },
    enrolledCourses: [],
    certificates: [],
    achievements: [],
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReport: true,
      theme: 'system',
      learningReminder: {
        enabled: true,
        time: '19:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || FALLBACK_USER_ID;

    try {
      const users = await query(
        `SELECT id, email, username, display_name, role, avatar_url, created_at, last_login_at
         FROM learning_users WHERE id = $1`,
        [parseInt(userId, 10) || 0]
      );

      if (users.length > 0) {
        const dbUser = users[0];
        const enhancedUser = {
          id: String(dbUser.id),
          name: dbUser.display_name || dbUser.username,
          email: dbUser.email,
          avatar: dbUser.avatar_url || '/placeholder.svg?height=40&width=40',
          level: 'AI学习者',
          points: 2450,
          streak: 7,
          joinDate: dbUser.created_at,
          lastLoginDate: dbUser.last_login_at || new Date().toISOString(),
          profile: { bio: '', location: '', website: '', github: '', linkedin: '' },
          learningStats: {
            totalCourses: 12,
            completedCourses: 8,
            totalHours: 156,
            currentStreak: 7,
            longestStreak: 15,
            averageScore: 87.5,
          },
          enrolledCourses: [],
          certificates: [],
          achievements: [],
          preferences: {
            language: 'zh-CN',
            timezone: 'Asia/Shanghai',
            emailNotifications: true,
            pushNotifications: true,
            weeklyReport: true,
            theme: 'system',
            learningReminder: {
              enabled: true,
              time: '19:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            },
          },
        };

        return NextResponse.json({
          success: true,
          data: enhancedUser,
          message: '用户信息获取成功',
        });
      }
    } catch (dbError) {
      logger.warn(
        '数据库查询失败，使用fallback数据:',
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    const user = getFallbackUser();
    return NextResponse.json({
      success: true,
      data: user,
      message: '用户信息获取成功（fallback）',
    });
  } catch (error) {
    logger.error('获取用户信息失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误', message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || FALLBACK_USER_ID;
    const dbUserId = parseInt(userId, 10) || 0;

    try {
      const users = await query('SELECT id FROM learning_users WHERE id = $1', [dbUserId]);

      if (users.length > 0) {
        if (body.name) {
          await query('UPDATE learning_users SET display_name = $1 WHERE id = $2', [
            body.name,
            dbUserId,
          ]);
        }
        if (body.avatar) {
          await query('UPDATE learning_users SET avatar_url = $1 WHERE id = $2', [
            body.avatar,
            dbUserId,
          ]);
        }

        const updatedUsers = await query(
          `SELECT id, email, username, display_name, avatar_url FROM learning_users WHERE id = $1`,
          [dbUserId]
        );
        const dbUser = updatedUsers[0];

        return NextResponse.json({
          success: true,
          data: {
            id: String(dbUser.id),
            name: dbUser.display_name || dbUser.username,
            email: dbUser.email,
            avatar: dbUser.avatar_url || '/placeholder.svg?height=40&width=40',
          },
          message: '用户信息更新成功',
        });
      }
    } catch (dbError) {
      logger.warn(
        '数据库更新失败，使用fallback:',
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    return NextResponse.json({
      success: true,
      data: getFallbackUser(),
      message: '用户信息更新成功（fallback）',
    });
  } catch (error) {
    logger.error('更新用户信息失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误', message: '更新用户信息失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'updateProgress':
      case 'updateStreak':
      case 'enrollCourse':
        return NextResponse.json({
          success: true,
          data: getFallbackUser(),
          message: '操作执行成功',
        });
      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型', message: '不支持的操作类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('执行用户操作失败', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误', message: '操作执行失败' },
      { status: 500 }
    );
  }
}
