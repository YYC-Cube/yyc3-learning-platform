# API文档

## 基础信息

- **Base URL**: \`http://localhost:3000/api\`
- **Content-Type**: \`application/json\`
- **认证方式**: Bearer Token (JWT)

## 认证相关

### 用户登录

\`\`\`
POST /api/auth/login
\`\`\`

**请求体：**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**响应：**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "token": "jwt-token"
  }
}
\`\`\`

### 用户注册

\`\`\`
POST /api/auth/register
\`\`\`

### 退出登录

\`\`\`
POST /api/auth/logout
\`\`\`

## 课程相关

### 获取课程列表

\`\`\`
GET /api/courses?page=1&pageSize=12&category=ai-basics
\`\`\`

### 获取课程详情

\`\`\`
GET /api/courses/[id]
\`\`\`

### 报名课程

\`\`\`
POST /api/courses/[id]/enroll
\`\`\`

## 考试相关

### 获取考试列表

\`\`\`
GET /api/exams
\`\`\`

### 开始考试

\`\`\`
POST /api/exams/[id]/start
\`\`\`

### 提交考试

\`\`\`
POST /api/exams/[id]/submit
\`\`\`

## 用户相关

### 获取用户信息

\`\`\`
GET /api/user/profile
\`\`\`

### 更新用户信息

\`\`\`
PUT /api/user/profile
\`\`\`

## 健康检查

### 系统健康状态

\`\`\`
GET /api/health
\`\`\`

**响应：**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "up",
    "api": "up"
  }
}
\`\`\`

## 错误响应

所有API错误响应格式：

\`\`\`json
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
\`\`\`

常见错误码：
- \`400\`: 请求参数错误
- \`401\`: 未认证
- \`403\`: 无权限
- \`404\`: 资源不存在
- \`500\`: 服务器错误
