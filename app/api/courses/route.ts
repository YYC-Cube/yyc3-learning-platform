/**
 * @fileoverview API路由 · route.ts
 * @author YYC³ <admin@0379.email>
 * @version 2.0.0
 * @license MIT
 */
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { query } from '@/lib/database';
import { courseData } from '@/data/course-data';

function getFallbackCourses() {
  return courseData.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    difficulty: c.level,
    duration: c.duration,
    chapters: c.chapters,
    rating: c.rating,
    studentsCount: c.students,
    price:
      typeof c.price === 'string' ? parseInt(c.price.replace(/[^0-9]/g, ''), 10) || 0 : c.price,
    tags: c.tags,
    instructor: c.instructor,
    image: c.image,
    progress: c.progress,
    isEnrolled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const offset = Number.parseInt(searchParams.get('offset') || '0');

    let courses = getFallbackCourses();

    try {
      const dbCourses = await query(
        `SELECT id, title, description, category, difficulty_level, duration, chapters_count,
                rating, students_count, price, tags, instructor_name, image_url,
                created_at, updated_at
         FROM courses ORDER BY created_at DESC`
      );

      if (dbCourses.length > 0) {
        courses = dbCourses.map((c: Record<string, unknown>) => ({
          id: String(c.id),
          title: String(c.title || ''),
          description: String(c.description || ''),
          category: String(c.category || ''),
          difficulty: String(c.difficulty_level || 'beginner'),
          duration: String(c.duration || ''),
          chapters: Number(c.chapters_count) || 0,
          rating: Number(c.rating) || 0,
          studentsCount: Number(c.students_count) || 0,
          price: Number(c.price) || 0,
          tags: Array.isArray(c.tags) ? c.tags : [],
          instructor: String(c.instructor_name || ''),
          image: String(c.image_url || ''),
          progress: 0,
          isEnrolled: false,
          createdAt: String(c.created_at || ''),
          updatedAt: String(c.updated_at || ''),
        }));
      }
    } catch (dbError) {
      logger.warn(
        '课程数据库查询失败，使用fallback数据:',
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    if (category && category !== 'all') {
      courses = courses.filter((course) => course.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      courses = courses.filter((course) => course.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    const total = courses.length;
    const paginatedCourses = courses.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        courses: paginatedCourses,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      },
      message: '课程列表获取成功',
    });
  } catch (error) {
    logger.error('获取课程列表失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误', message: '获取课程列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['title', 'description', 'category', 'difficulty', 'duration', 'price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `缺少必填字段: ${field}`, message: '请填写所有必填信息' },
          { status: 400 }
        );
      }
    }

    const newCourseId = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newCourse = {
      id: newCourseId,
      title: body.title,
      description: body.description,
      category: body.category,
      difficulty: body.difficulty,
      duration: body.duration,
      chapters: body.chapters || 10,
      rating: 0,
      studentsCount: 0,
      price: body.price,
      tags: body.tags || [],
      instructor: body.instructor || '系统管理员',
      image: body.image || '/images/default-course.png',
      progress: 0,
      isEnrolled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await query(
        `INSERT INTO courses (title, description, category, difficulty_level, duration, chapters_count, price, tags, instructor_name, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newCourse.title,
          newCourse.description,
          newCourse.category,
          newCourse.difficulty,
          newCourse.duration,
          newCourse.chapters,
          newCourse.price,
          JSON.stringify(newCourse.tags),
          newCourse.instructor,
          newCourse.image,
        ]
      );
    } catch (dbError) {
      logger.warn(
        '课程创建数据库写入失败（fallback）:',
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    return NextResponse.json(
      { success: true, data: newCourse, message: '课程创建成功' },
      { status: 201 }
    );
  } catch (error) {
    logger.error('创建课程失败', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误', message: '创建课程失败' },
      { status: 500 }
    );
  }
}
