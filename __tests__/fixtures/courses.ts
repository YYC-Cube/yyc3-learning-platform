/**
 * 测试数据 - 课程相关
 */

export const mockCourses = [
  {
    id: 'course-1',
    title: 'AI基础入门',
    description: '学习人工智能基础知识',
    category: 'AI',
    level: 'beginner',
    duration: 60, // 分钟
    price: 0,
    instructor: '张教授',
    image: '/images/ai-basics-course.png',
    tags: ['AI', '入门', '基础'],
    modules: [
      { id: 'm1', title: '模块1: AI简介', lessons: 5 },
      { id: 'm2', title: '模块2: 机器学习', lessons: 8 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'course-2',
    title: 'AI工程师认证',
    description: '成为专业的AI工程师',
    category: 'AI',
    level: 'advanced',
    duration: 120,
    price: 2999,
    instructor: '李专家',
    image: '/images/ai-engineer-course.png',
    tags: ['AI', '工程师', '认证'],
    modules: [
      { id: 'm1', title: '深度学习', lessons: 10 },
      { id: 'm2', title: '模型部署', lessons: 8 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * 测试数据 - 考试相关
 */
export const mockExams = [
  {
    id: 'exam-1',
    title: 'AI基础测试',
    type: 'practice', // practice | professional | comprehensive
    duration: 30, // 分钟
    totalQuestions: 20,
    passingScore: 60,
    attempts: 0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q1',
        type: 'single-choice',
        question: '什么是AI?',
        options: ['人工智能', '虚拟现实', '区块链', '大数据'],
        correctAnswer: 0,
        points: 5,
        explanation: 'AI是人工智能的缩写',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: '以下哪些是AI的应用领域?',
        options: ['计算机视觉', '自然语言处理', '机器人学', 'Web开发'],
        correctAnswer: [0, 1, 2],
        points: 10,
        explanation: 'AI在视觉、语言和机器人领域有广泛应用',
      },
    ],
  },

  {
    id: 'exam-2',
    title: 'AI工程师认证考试',
    type: 'professional',
    duration: 120,
    totalQuestions: 50,
    passingScore: 80,
    attempts: 0,
    maxAttempts: 1,
    questions: [], // 实际考试会有完整问题列表
  },
];

/**
 * 测试数据 - 学习进度
 */
export const mockProgress = {
  userId: 'student-1',
  courseId: 'course-1',
  completedLessons: ['l1', 'l2', 'l3'],
  currentLesson: 'l4',
  progressPercentage: 30,
  timeSpent: 1800, // 秒
  lastAccessedAt: '2026-01-03T10:00:00.000Z',
};

/**
 * 测试数据 - 考试记录
 */
export const mockExamRecords = [
  {
    id: 'record-1',
    userId: 'student-1',
    examId: 'exam-1',
    answers: [0, 1, 2, 3],
    score: 85,
    passed: true,
    timeSpent: 1200,
    startedAt: '2026-01-03T09:00:00.000Z',
    completedAt: '2026-01-03T09:20:00.000Z',
  },
];
