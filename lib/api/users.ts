/**
 * @fileoverview 工具函数/库 · users.ts
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  enrolledCourses: string[];
  completedCourses: string[];
  certificates: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getCurrentUser(): Promise<User | null> {
  // In production, this would fetch from an API
  return null;
}

export async function updateUser(_userId: string, _data: Partial<User>): Promise<User> {
  // In production, this would call an API
  return {} as User;
}

export async function getUserProgress(_userId: string): Promise<any> {
  // In production, this would fetch from an API
  return null;
}
