/**
 * @fileoverview 工具函数/库 · courses.ts
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  students: number;
  rating: number;
  price: number;
  thumbnail: string;
  category: string;
  tags: string[];
  lessons: number;
  certificate: boolean;
}

export async function getCourses(): Promise<Course[]> {
  // In production, this would fetch from an API
  return [];
}

export async function getCourseById(_id: string): Promise<Course | null> {
  // In production, this would fetch from an API
  return null;
}

export async function enrollCourse(_courseId: string, _userId: string): Promise<boolean> {
  // In production, this would call an API
  return true;
}

export async function getEnrolledCourses(_userId: string): Promise<Course[]> {
  // In production, this would fetch from an API
  return [];
}
