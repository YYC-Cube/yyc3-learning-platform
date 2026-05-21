/**
 * @fileoverview 工具函数/库 · auth-context.tsx
 * @author YYC³ <admin@0379.email>
 * @version 2.1.0
 * @license MIT
 */
'use client';

import type { User } from '@/app/types';
import { createLogger } from '@/lib/logger';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const logger = createLogger('AuthContext');

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Partial<User> & {
    id: string | number;
    email: string;
    display_name?: string;
    role?: string;
  };
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createFallbackUser(email: string): User {
  return {
    id: 'guest',
    name: '访客用户',
    email,
    avatar: '/placeholder.svg?height=40&width=40',
    studyPoints: 0,
    studyDays: 0,
    completedCourses: 0,
    studyHours: 0,
    level: 'beginner',
    points: 0,
    streak: 0,
    joinDate: new Date().toISOString().split('T')[0],
    certificates: 0,
    rank: 0,
    profile: { bio: '', location: '', website: '', github: '', linkedin: '' },
    learningStats: {
      totalCourses: 0,
      completedCourses: 0,
      totalHours: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageScore: 0,
    },
    enrolledCourses: [],
    achievements: [],
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReport: true,
      theme: 'system',
      learningReminder: { enabled: false, time: '09:00', days: [] },
      notifications: true,
      emailUpdates: true,
    },
    progress: {},
  };
}

function mapApiUserToUser(apiUser: LoginResponse['user'], email: string): User {
  if (!apiUser) return createFallbackUser(email);
  return {
    id: String(apiUser.id),
    name: apiUser.display_name || apiUser.name || email.split('@')[0],
    email: apiUser.email || email,
    avatar: apiUser.avatar || '/placeholder.svg?height=40&width=40',
    studyPoints: apiUser.studyPoints || 0,
    studyDays: apiUser.studyDays || 0,
    completedCourses: apiUser.completedCourses || 0,
    studyHours: apiUser.studyHours || 0,
    level: apiUser.level || 'beginner',
    points: apiUser.points || 0,
    streak: apiUser.streak || 0,
    joinDate: apiUser.joinDate || new Date().toISOString().split('T')[0],
    certificates: apiUser.certificates || 0,
    rank: apiUser.rank || 0,
    profile: apiUser.profile || { bio: '', location: '', website: '', github: '', linkedin: '' },
    learningStats: apiUser.learningStats || {
      totalCourses: 0,
      completedCourses: 0,
      totalHours: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageScore: 0,
    },
    enrolledCourses: apiUser.enrolledCourses || [],
    achievements: apiUser.achievements || [],
    preferences: apiUser.preferences || {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReport: true,
      theme: 'system',
      learningReminder: { enabled: false, time: '09:00', days: [] },
      notifications: true,
      emailUpdates: true,
    },
    progress: apiUser.progress || {},
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      logger.error('恢复会话失败', error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.token && data.user) {
        const mappedUser = mapApiUserToUser(data.user, email);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
        setUser(mappedUser);
      } else if (response.status === 401 || response.status === 400) {
        throw new Error(data.error || '邮箱或密码错误');
      } else {
        throw new Error('登录服务暂时不可用');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
