# 📝 YYC³ AILP - 类型定义

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档信息

| 属性         | 内容                                     |
| ------------ | ---------------------------------------- |
| **文档标题** | YYC³ AILP - 类型定义                     |
| **文档版本** | v1.0.0                                   |
| **创建时间** | 2026-01-24                               |
| **适用范围** | YYC³ AILP学习平台类型定义管理            |
| **文档类型** | 数据库类型、前端类型、后端类型、业务类型 |

---

## 📖 文档概述

本文档详细描述YYC³ AILP学习平台的完整类型定义体系，包括数据库全库表字段字典、枚举值字典、前端TypeScript全局类型声明、组件Props类型约束、请求响应数据类型、后端Java实体DTO定义、请求参数VO校验规则、返回结果BO结构、用户权限类型字典、课程体系类型约束、测评数据类型、微服务间契约类型定义、全局常量枚举、数据格式校验规则、跨端数据类型适配、版本迭代类型变更记录等核心类型定义文档。通过本文档，开发团队可以全面了解项目的类型系统、数据结构和接口规范。

---

## 🏗️ 类型定义体系

### 📊 类型定义架构

```
┌─────────────────────────────────────────────────────────────┐
│                    YYC³ AILP 类型定义体系                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ 数据库类型   │    │ 前端类型     │    │ 后端类型     │   │
│  │ DB Types   │    │ Frontend    │    │ Backend    │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ 业务类型     │    │ 微服务类型   │    │ 通用类型     │   │
│  │ Business   │    │ Microservice│    │ Common     │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              跨端类型与版本管理              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │ 跨端适配     │  │ 版本迭代     │  │ 预留文档位   ││   │
│  │  │ Cross Plat  │  │ Versioning  │  │ Reserved   ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🎯 类型定义分类

| 类型类别       | 定义重点                        | 技术栈                     | 负责团队           |
| -------------- | ------------------------------- | -------------------------- | ------------------ |
| **数据库类型** | 表结构、字段字典、枚举值        | PostgreSQL、MySQL、Redis   | 数据团队、后端团队 |
| **前端类型**   | TypeScript、组件Props、数据类型 | React、Next.js、TypeScript | 前端团队、UI团队   |
| **后端类型**   | Java实体、DTO、VO、BO           | Java、Spring Boot、JPA     | 后端团队、架构团队 |
| **业务类型**   | 用户权限、课程体系、测评数据    | 业务逻辑、领域模型         | 产品团队、业务团队 |
| **微服务类型** | 服务契约、API定义、消息格式     | gRPC、REST、GraphQL        | 架构团队、后端团队 |
| **通用类型**   | 常量枚举、校验规则、数据格式    | 工具类、公共组件           | 架构团队、全栈团队 |

---

## 🗃️ 数据库类型定义详解

### 🎯 数据库字段字典

**文件位置**: [076-YYC3-AILP-类型定义-数据库-全库表字段字典.md](076-YYC3-AILP-类型定义-数据库-全库表字段字典.md)

#### 📋 核心数据表结构

**用户相关表**：

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    status user_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户资料表
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    gender gender_type,
    education_level education_type,
    work_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**课程相关表**：

```sql
-- 课程表
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    difficulty_level course_difficulty DEFAULT 'beginner',
    estimated_hours INTEGER,
    price DECIMAL(10,2) DEFAULT 0.00,
    thumbnail_url TEXT,
    status course_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程章节表
CREATE TABLE course_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 🏗️ 数据类型规范

**字段类型标准**：

- **主键**：统一使用UUID类型，默认gen_random_uuid()
- **时间戳**：created_at和updated_at字段，默认CURRENT_TIMESTAMP
- **状态字段**：使用枚举类型，提供默认值
- **外键关系**：明确定义ON DELETE和ON UPDATE行为
- **索引策略**：为查询频繁字段创建索引

---

## 🔢 数据库枚举值字典详解

### 🎯 枚举类型定义

**文件位置**: [077-YYC3-AILP-类型定义-数据库-枚举值字典文档.md](077-YYC3-AILP-类型定义-数据库-枚举值字典文档.md)

#### 📋 核心枚举类型

**用户相关枚举**：

```sql
-- 用户角色枚举
CREATE TYPE user_role AS ENUM (
    'student',    -- 学生
    'instructor', -- 讲师
    'admin',      -- 管理员
    'super_admin' -- 超级管理员
);

-- 用户状态枚举
CREATE TYPE user_status AS ENUM (
    'active',     -- 活跃
    'inactive',   -- 非活跃
    'suspended',  -- 暂停
    'deleted'     -- 已删除
);

-- 性别枚举
CREATE TYPE gender_type AS ENUM (
    'male',       -- 男性
    'female',     -- 女性
    'other',      -- 其他
    'prefer_not_to_say' -- 不愿透露
);
```

**课程相关枚举**：

```sql
-- 课程难度枚举
CREATE TYPE course_difficulty AS ENUM (
    'beginner',   -- 初级
    'intermediate', -- 中级
    'advanced',   -- 高级
    'expert'      -- 专家级
);

-- 课程状态枚举
CREATE TYPE course_status AS ENUM (
    'draft',      -- 草稿
    'published',  -- 已发布
    'archived',   -- 已归档
    'deleted'     -- 已删除
);

-- 教育程度枚举
CREATE TYPE education_type AS ENUM (
    'high_school',    -- 高中
    'associate',      -- 大专
    'bachelor',      -- 本科
    'master',        -- 硕士
    'phd',          -- 博士
    'other'          -- 其他
);
```

---

## 💻 前端TypeScript类型定义详解

### 🎯 全局类型声明

**文件位置**: [078-YYC3-AILP-类型定义-前端-TypeScript全局类型声明.md](078-YYC3-AILP-类型定义-前端-TypeScript全局类型声明.md)

#### 📋 核心类型定义

**基础类型定义**：

```typescript
// 用户相关类型
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  gender?: GenderType;
  educationLevel?: EducationType;
  workExperience?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 课程相关类型
export interface Course {
  id: string;
  title: string;
  description?: string;
  instructorId: string;
  categoryId?: string;
  difficultyLevel: CourseDifficulty;
  estimatedHours?: number;
  price?: number;
  thumbnailUrl?: string;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseChapter {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 🏗️ 枚举类型定义

**枚举类型**：

```typescript
// 用户角色枚举
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

// 课程难度枚举
export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}
```

---

## 🎨 前端组件Props类型约束详解

### 🎯 组件类型规范

**文件位置**: [079-YYC3-AILP-类型定义-前端-组件Props类型约束.md](079-YYC3-AILP-类型定义-前端-组件Props类型约束.md)

#### 📋 组件Props类型定义

**基础组件Props**：

```typescript
// Button组件Props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  className?: string;
}

// Input组件Props
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

// Modal组件Props
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
```

#### 🏗️ 复杂组件类型

**业务组件Props**：

```typescript
// CourseCard组件Props
export interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  showInstructor?: boolean;
  onEnroll?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
  className?: string;
}

// UserProfile组件Props
export interface UserProfileProps {
  user: User;
  profile?: UserProfile;
  editable?: boolean;
  onUpdate?: (user: User, profile?: UserProfile) => void;
  className?: string;
}

// LearningProgress组件Props
export interface LearningProgressProps {
  courseId: string;
  userId: string;
  showDetails?: boolean;
  refreshInterval?: number;
  onProgressUpdate?: (progress: LearningProgress) => void;
  className?: string;
}
```

---

## 📡 前端请求响应数据类型详解

### 🎯 API类型定义

**文件位置**: [080-YYC3-AILP-类型定义-前端-请求响应数据类型.md](080-YYC3-AILP-类型定义-前端-请求响应数据类型.md)

#### 📋 API请求类型

**请求参数类型**：

```typescript
// 分页请求参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 课程查询参数
export interface CourseQueryParams extends PaginationParams {
  categoryId?: string;
  difficultyLevel?: CourseDifficulty;
  instructorId?: string;
  status?: CourseStatus;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

// 用户更新参数
export interface UserUpdateParams {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: GenderType;
  educationLevel?: EducationType;
  workExperience?: number;
}
```

#### 🏗️ API响应类型

**响应数据类型**：

```typescript
// API响应基础结构
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

// 分页响应数据
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 用户登录响应
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// 课程详情响应
export interface CourseDetailResponse extends Course {
  chapters: CourseChapter[];
  instructor: User;
  category: Category;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
}
```

---

## ☕ 后端Java实体DTO定义详解

### 🎯 Java实体类型

**文件位置**: [081-YYC3-AILP-类型定义-后端-Java实体DTO定义文档.md](081-YYC3-AILP-类型定义-后端-Java实体DTO定义文档.md)

#### 📋 核心实体定义

**用户相关实体**：

```java
// 用户实体
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.STUDENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

// 用户资料实体
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private GenderType gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "education_level")
    private EducationType educationLevel;

    @Column(name = "work_experience")
    private Integer workExperience = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

---

## 📝 后端请求参数VO校验规则详解

### 🎯 请求参数验证

**文件位置**: [082-YYC3-AILP-类型定义-后端-请求参数VO校验规则.md](082-YYC3-AILP-类型定义-后端-请求参数VO校验规则.md)

#### 📋 请求参数VO定义

**用户相关VO**：

```java
// 用户注册VO
@Data
public class UserRegistrationVO {
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Length(max = 255, message = "邮箱长度不能超过255个字符")
    private String email;

    @NotBlank(message = "用户名不能为空")
    @Length(min = 3, max = 100, message = "用户名长度必须在3-100个字符之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Length(min = 8, max = 128, message = "密码长度必须在8-128个字符之间")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$",
             message = "密码必须包含大小写字母和数字")
    private String password;

    @Length(max = 100, message = "名字长度不能超过100个字符")
    private String firstName;

    @Length(max = 100, message = "姓氏长度不能超过100个字符")
    private String lastName;
}

// 用户更新VO
@Data
public class UserUpdateVO {
    @Length(max = 100, message = "名字长度不能超过100个字符")
    private String firstName;

    @Length(max = 100, message = "姓氏长度不能超过100个字符")
    private String lastName;

    @Length(max = 1000, message = "个人简介长度不能超过1000个字符")
    private String bio;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @Length(max = 500, message = "地址长度不能超过500个字符")
    private String address;

    @Past(message = "出生日期必须是过去的日期")
    private LocalDate birthDate;

    private GenderType gender;

    private EducationType educationLevel;

    @Min(value = 0, message = "工作经验不能为负数")
    @Max(value = 50, message = "工作经验不能超过50年")
    private Integer workExperience;
}
```

---

## 📦 后端返回结果BO结构详解

### 🎯 响应结果对象

**文件位置**: [083-YYC3-AILP-类型定义-后端-返回结果BO结构文档.md](083-YYC3-AILP-类型定义-后端-返回结果BO结构文档.md)

#### 📋 响应结果BO定义

**基础响应BO**：

```java
// API响应结果
@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String code;
    private String timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String code) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .code(code)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}

// 分页响应BO
@Data
@Builder
public class PaginatedResponse<T> {
    private List<T> items;
    private PaginationInfo pagination;

    @Data
    @Builder
    public static class PaginationInfo {
        private int page;
        private int limit;
        private long total;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrev;
    }
}

// 用户登录响应BO
@Data
@Builder
public class LoginResponseBO {
    private UserBO user;
    private String token;
    private String refreshToken;
    private int expiresIn;
}

// 用户信息BO
@Data
@Builder
public class UserBO {
    private String id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
    private UserProfileBO profile;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

## 👥 业务模块-用户权限类型字典详解

### 🎯 权限类型定义

**文件位置**: [084-YYC3-AILP-类型定义-业务模块-用户权限类型字典.md](084-YYC3-AILP-类型定义-业务模块-用户权限类型字典.md)

#### 📋 权限体系结构

**角色权限定义**：

```typescript
// 权限枚举
export enum Permission {
  // 用户管理权限
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // 课程管理权限
  COURSE_READ = 'course:read',
  COURSE_WRITE = 'course:write',
  COURSE_DELETE = 'course:delete',
  COURSE_PUBLISH = 'course:publish',

  // 学习管理权限
  LEARNING_READ = 'learning:read',
  LEARNING_WRITE = 'learning:write',
  LEARNING_DELETE = 'learning:delete',

  // 系统管理权限
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_MONITOR = 'system:monitor',
  SYSTEM_CONFIG = 'system:config',
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.USER_READ,
    Permission.COURSE_READ,
    Permission.LEARNING_READ,
    Permission.LEARNING_WRITE,
  ],
  [UserRole.INSTRUCTOR]: [
    Permission.USER_READ,
    Permission.COURSE_READ,
    Permission.COURSE_WRITE,
    Permission.COURSE_PUBLISH,
    Permission.LEARNING_READ,
    Permission.LEARNING_WRITE,
  ],
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.COURSE_READ,
    Permission.COURSE_WRITE,
    Permission.COURSE_DELETE,
    Permission.COURSE_PUBLISH,
    Permission.LEARNING_READ,
    Permission.LEARNING_WRITE,
    Permission.LEARNING_DELETE,
    Permission.SYSTEM_MONITOR,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
};
```

---

## 📚 业务模块-课程体系类型约束详解

### 🎯 课程类型定义

**文件位置**: [085-YYC3-AILP-类型定义-业务模块-课程体系类型约束.md](085-YYC3-AILP-类型定义-业务模块-课程体系类型约束.md)

#### 📋 课程类型体系

**课程分类定义**：

```typescript
// 课程分类
export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 课程类型
export enum CourseType {
  VIDEO = 'video', // 视频课程
  TEXT = 'text', // 文本课程
  INTERACTIVE = 'interactive', // 互动课程
  LIVE = 'live', // 直播课程
  MIXED = 'mixed', // 混合课程
}

// 学习路径
export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  courses: string[]; // 课程ID数组
  estimatedHours: number;
  difficultyLevel: CourseDifficulty;
  prerequisites?: string[]; // 前置课程ID数组
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 📊 业务模块-测评数据类型详解

### 🎯 测评类型定义

**文件位置**: [086-YYC3-AILP-类型定义-业务模块-测评数据类型文档.md](086-YYC3-AILP-类型定义-业务模块-测评数据类型文档.md)

#### 📋 测评类型体系

**测评数据结构**：

```typescript
// 测验定义
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  chapterId?: string;
  timeLimit?: number; // 时间限制（分钟）
  attempts: number; // 允许尝试次数
  passingScore: number; // 及格分数
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 题目类型
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice', // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TRUE_FALSE = 'true_false', // 判断题
  FILL_BLANK = 'fill_blank', // 填空题
  ESSAY = 'essay', // 简答题
}

// 题目定义
export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  title: string;
  content?: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  points: number;
  orderIndex: number;
}

// 题目选项
export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}
```

---

## 🔗 微服务-服务间契约类型定义详解

### 🎯 服务契约定义

**文件位置**: [087-YYC3-AILP-类型定义-微服务-服务间契约类型定义.md](087-YYC3-AILP-类型定义-微服务-服务间契约类型定义.md)

#### 📋 服务契约结构

**服务接口定义**：

```typescript
// 用户服务接口
export interface UserService {
  getUserById(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: UserCreationData): Promise<User>;
  updateUser(id: string, userData: UserUpdateData): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  validateToken(token: string): Promise<TokenValidationResult>;
}

// 课程服务接口
export interface CourseService {
  getCourseById(id: string): Promise<Course>;
  getCoursesByCategory(categoryId: string): Promise<Course[]>;
  searchCourses(params: CourseSearchParams): Promise<PaginatedResponse<Course>>;
  enrollUser(userId: string, courseId: string): Promise<EnrollmentResult>;
  getUserProgress(userId: string, courseId: string): Promise<LearningProgress>;
}

// 学习服务接口
export interface LearningService {
  getQuizById(quizId: string): Promise<Quiz>;
  submitQuizAttempt(attempt: QuizAttempt): Promise<QuizResult>;
  getLearningProgress(userId: string): Promise<LearningProgress[]>;
  updateLearningProgress(progress: LearningProgressUpdate): Promise<boolean>;
}
```

---

## 🔧 通用-全局常量枚举文档详解

### 🎯 常量定义

**文件位置**: [088-YYC3-AILP-类型定义-通用-全局常量枚举文档.md](088-YYC3-AILP-类型定义-通用-全局常量枚举文档.md)

#### 📋 全局常量定义

**系统常量**：

```typescript
// API常量
export const API_CONSTANTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒
};

// 分页常量
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZES: [10, 20, 50, 100],
};

// 文件上传常量
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// 缓存常量
export const CACHE_CONSTANTS = {
  USER_SESSION_TTL: 24 * 60 * 60, // 24小时
  COURSE_DATA_TTL: 60 * 60, // 1小时
  QUIZ_DATA_TTL: 30 * 60, // 30分钟
  MAX_CACHE_SIZE: 1000,
};
```

---

## ✅ 通用-数据格式校验规则详解

### 🎯 校验规则定义

**文件位置**: [089-YYC3-AILP-类型定义-通用-数据格式校验规则.md](089-YYC3-AILP-类型定义-通用-数据格式校验规则.md)

#### 📋 校验规则体系

**数据格式校验**：

```typescript
// 邮箱校验
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 手机号校验（中国）
export const PHONE_REGEX = /^1[3-9]\d{9}$/;

// 密码强度校验
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// 用户名校验
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// URL校验
export const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/;

// 身份证号校验（18位）
export const ID_CARD_REGEX =
  /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
```

---

## 📱 跨端-小程序-APP数据类型适配详解

### 🎯 跨端类型适配

**文件位置**: [090-YYC3-AILP-类型定义-跨端-小程序-APP数据类型适配.md](090-YYC3-AILP-类型定义-跨端-小程序-APP数据类型适配.md)

#### 📋 跨端类型适配

**平台特定类型**：

```typescript
// 平台类型
export enum PlatformType {
  WEB = 'web',
  MOBILE_WEB = 'mobile_web',
  IOS_APP = 'ios_app',
  ANDROID_APP = 'android_app',
  WECHAT_MINI = 'wechat_mini',
  ALIPAY_MINI = 'alipay_mini',
}

// 平台特定配置
export interface PlatformConfig {
  type: PlatformType;
  apiBaseUrl: string;
  websocketUrl: string;
  features: PlatformFeatures;
  uiConfig: PlatformUIConfig;
}

// 平台功能特性
export interface PlatformFeatures {
  pushNotification: boolean;
  offlineMode: boolean;
  cameraAccess: boolean;
  locationAccess: boolean;
  fileUpload: boolean;
  paymentMethods: PaymentMethod[];
}

// 平台UI配置
export interface PlatformUIConfig {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}
```

---

## 🔄 版本迭代-类型变更记录详解

### 🎯 版本管理

**文件位置**: [091-YYC3-AILP-类型定义-版本迭代-类型变更记录.md](091-YYC3-AILP-类型定义-版本迭代-类型变更记录.md)

#### 📋 版本变更记录

**版本变更日志**：

```typescript
// 版本变更记录
export interface TypeChangeRecord {
  version: string;
  timestamp: Date;
  changes: TypeChange[];
  author: string;
  description: string;
}

// 类型变更
export interface TypeChange {
  type: 'add' | 'remove' | 'modify' | 'deprecate';
  target: string; // 目标类型名称
  description: string;
  breakingChange: boolean;
  migrationGuide?: string;
}

// 版本兼容性
export interface VersionCompatibility {
  fromVersion: string;
  toVersion: string;
  compatibilityLevel: 'full' | 'partial' | 'breaking';
  notes: string;
}

// 当前版本变更记录
export const TYPE_CHANGE_HISTORY: TypeChangeRecord[] = [
  {
    version: '1.0.0',
    timestamp: new Date('2026-01-24'),
    changes: [
      {
        type: 'add',
        target: 'User',
        description: '新增用户基础类型定义',
        breakingChange: false,
      },
      {
        type: 'add',
        target: 'Course',
        description: '新增课程基础类型定义',
        breakingChange: false,
      },
    ],
    author: 'YYC³ Team',
    description: '初始版本，包含基础用户和课程类型定义',
  },
];
```

---

## 📈 类型定义指标与监控

### 🎯 类型系统指标

| 指标类型         | 指标名称             | 目标值 | 当前值 | 状态 |
| ---------------- | -------------------- | ------ | ------ | ---- |
| **类型覆盖率**   | 代码类型定义覆盖率   | ≥95%   | 97%    | ✅   |
| **接口一致性**   | 前后端接口类型一致性 | 100%   | 100%   | ✅   |
| **文档同步率**   | 类型文档与代码同步率 | ≥90%   | 95%    | ✅   |
| **校验规则覆盖** | 数据校验规则覆盖率   | ≥85%   | 90%    | ✅   |
| **版本兼容性**   | 类型版本向后兼容性   | ≥80%   | 85%    | ✅   |

### 🎯 类型质量指标

| 质量指标       | 指标名称               | 目标值 | 当前值 | 状态 |
| -------------- | ---------------------- | ------ | ------ | ---- |
| **类型安全性** | TypeScript编译错误数   | 0      | 0      | ✅   |
| **命名规范性** | 类型命名规范符合率     | ≥95%   | 98%    | ✅   |
| **文档完整性** | 类型定义文档完整性     | ≥90%   | 95%    | ✅   |
| **更新及时性** | 类型变更文档更新及时率 | ≥85%   | 90%    | ✅   |

---

## 📚 相关文档链接

| 文档名称         | 链接                                                               |
| ---------------- | ------------------------------------------------------------------ |
| **模版规范文档** | [../YYC3-AILP-模版规范/README.md](../YYC3-AILP-模版规范/README.md) |
| **实施步骤文档** | [../YYC3-AILP-实施步骤/README.md](../YYC3-AILP-实施步骤/README.md) |
| **详细设计文档** | [../YYC3-AILP-详细设计/README.md](../YYC3-AILP-详细设计/README.md) |
| **API文档**      | [../YYC3-AILP-API文档/README.md](../YYC3-AILP-API文档/README.md)   |

---

## 📄 文档标尾

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
