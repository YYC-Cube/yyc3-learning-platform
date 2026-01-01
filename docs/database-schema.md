# 数据库设计

## 数据表结构

### users - 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| email | VARCHAR(255) | 邮箱，唯一 |
| username | VARCHAR(50) | 用户名，唯一 |
| display_name | VARCHAR(100) | 显示名称 |
| password_hash | VARCHAR(255) | 密码哈希 |
| avatar | TEXT | 头像URL |
| bio | TEXT | 个人简介 |
| role | ENUM | 角色: student/teacher/admin |
| email_verified | BOOLEAN | 邮箱是否验证 |
| is_active | BOOLEAN | 是否激活 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| last_login_at | TIMESTAMP | 最后登录时间 |

### courses - 课程表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| title | VARCHAR(255) | 课程标题 |
| description | TEXT | 课程描述 |
| instructor_id | VARCHAR(36) | 讲师ID |
| category | VARCHAR(50) | 分类 |
| level | ENUM | 难度: beginner/intermediate/advanced |
| duration | VARCHAR(50) | 课程时长 |
| price | DECIMAL(10,2) | 价格 |
| thumbnail | TEXT | 缩略图 |
| is_published | BOOLEAN | 是否发布 |
| created_at | TIMESTAMP | 创建时间 |

### enrollments - 课程注册表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| user_id | VARCHAR(36) | 用户ID |
| course_id | VARCHAR(36) | 课程ID |
| progress | INT | 进度百分比 |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP | 完成时间 |

### exams - 考试表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| title | VARCHAR(255) | 考试标题 |
| description | TEXT | 考试描述 |
| category | VARCHAR(50) | 分类 |
| difficulty | ENUM | 难度 |
| duration | INT | 时长(分钟) |
| passing_score | INT | 及格分数 |
| total_questions | INT | 题目总数 |
| created_at | TIMESTAMP | 创建时间 |

### exam_attempts - 考试记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| user_id | VARCHAR(36) | 用户ID |
| exam_id | VARCHAR(36) | 考试ID |
| score | INT | 得分 |
| total_questions | INT | 题目总数 |
| correct_answers | INT | 正确数量 |
| answers | JSON | 答案详情 |
| started_at | TIMESTAMP | 开始时间 |
| completed_at | TIMESTAMP | 完成时间 |
| passed | BOOLEAN | 是否通过 |

### certificates - 证书表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| user_id | VARCHAR(36) | 用户ID |
| course_id | VARCHAR(36) | 课程ID (可选) |
| exam_id | VARCHAR(36) | 考试ID (可选) |
| title | VARCHAR(255) | 证书标题 |
| issue_date | TIMESTAMP | 颁发日期 |
| verification_code | VARCHAR(50) | 验证码 |
| credential_id | VARCHAR(100) | 凭证ID |

## 索引设计

- users: email, username
- courses: category, level, instructor_id
- enrollments: user_id, course_id
- exams: category, difficulty
- exam_attempts: user_id, exam_id
- certificates: user_id, verification_code
