/**
 * 测试数据 - 用户相关
 */

export const mockUsers = {
  student: {
    id: 'student-1',
    name: '张三',
    email: 'zhangsan@example.com',
    password: 'hashed_password',
    role: 'student',
    avatar: '/avatars/student-1.png',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  teacher: {
    id: 'teacher-1',
    name: '李老师',
    email: 'liteacher@example.com',
    password: 'hashed_password',
    role: 'teacher',
    avatar: '/avatars/teacher-1.png',
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  admin: {
    id: 'admin-1',
    name: '管理员',
    email: 'admin@example.com',
    password: 'hashed_password',
    role: 'admin',
    avatar: '/avatars/admin-1.png',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
};

export const mockAuthTokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_token',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_token',
};
