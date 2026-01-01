// 课程推荐数据结构
export interface CourseModule {
  id: string
  title: string
  category: string
  level: "初级" | "中级" | "高级" | "专家"
  duration: string
  description: string
  tags: string[]
  nextRecommendations: {
    primary: string
    secondary: string
    description: string
  }
  prerequisites?: string[]
  certificationPath?: string
}

export const courseModules: CourseModule[] = [
  // 一、人工智能学习课程模块
  {
    id: "ai-engineer-basic",
    title: "AI 大模型工程师",
    category: "认证课程",
    level: "初级",
    duration: "40小时",
    description: "掌握大模型基础理论和应用开发技能",
    tags: ["大模型", "基础理论", "应用开发"],
    nextRecommendations: {
      primary: "实战速成系列 —— 大模型应用开发实践",
      secondary: "工业领域垂直模型构建实战",
      description: "从基础认证过渡到实战开发，再延伸至工业垂直领域落地",
    },
  },
  {
    id: "ai-engineer-advanced",
    title: "AI 大模型高级工程师",
    category: "认证课程",
    level: "高级",
    duration: "60小时",
    description: "深入掌握大模型架构设计和优化技术",
    tags: ["大模型", "架构设计", "性能优化"],
    nextRecommendations: {
      primary: "模型训练推理系列 —— 大模型训练核心技术",
      secondary: "系统架构师认证预备课程",
      description: "聚焦模型训练高阶技术，为系统架构师认证奠定基础",
    },
  },
  {
    id: "generative-ai-advanced",
    title: "生成式人工智能应用工程师（高级）",
    category: "认证课程",
    level: "高级",
    duration: "50小时",
    description: "基于百度智能云课程体系的专业AI工程师认证培训",
    tags: ["生成式AI", "提示词工程", "企业应用"],
    nextRecommendations: {
      primary: "行业应用实践系列 —— 保险条款智能解读应用实践",
      secondary: "AI 治理与政策合规认证",
      description: "从行业应用延伸至 AI 治理，强化合规与管理能力",
    },
  },
  {
    id: "generative-ai-intermediate",
    title: "生成式人工智能应用工程师（中级）",
    category: "认证课程",
    level: "中级",
    duration: "35小时",
    description: "掌握生成式AI的核心技术和应用场景",
    tags: ["生成式AI", "应用开发", "技术实践"],
    nextRecommendations: {
      primary: "应用开发技术系列 —— 大模型应用开发技术与实践基础",
      secondary: "医疗影像 AI 辅助诊断实战",
      description: "从技术基础过渡到医疗领域实战，匹配中级认证能力提升需求",
    },
  },
  {
    id: "generative-ai-basic",
    title: "生成式人工智能应用工程师（初级）",
    category: "认证课程",
    level: "初级",
    duration: "25小时",
    description: "生成式AI入门课程，适合初学者",
    tags: ["生成式AI", "入门基础", "工具应用"],
    nextRecommendations: {
      primary: "通识认知应用系列 —— 大模型提示词工程技巧与应用",
      secondary: "金融智能风控系统开发入门",
      description: "从基础工具使用延伸至金融领域基础开发，适配初级认证的行业衔接",
    },
  },

  // 二、实战与开发系列模块
  {
    id: "practical-development",
    title: "实战速成系列 —— 大模型应用开发实践",
    category: "实战开发",
    level: "中级",
    duration: "30小时",
    description: "快速掌握大模型应用开发的核心技能",
    tags: ["实战开发", "应用构建", "项目实践"],
    nextRecommendations: {
      primary: "应用开发技术系列 —— 大模型应用开发实战工作坊",
      secondary: "垂直领域推理模型构建实战",
      description: "从速成实战过渡到深度工作坊，再聚焦垂直领域模型开发",
    },
  },
  {
    id: "development-workshop",
    title: "应用开发技术系列 —— 大模型应用开发实战工作坊",
    category: "实战开发",
    level: "高级",
    duration: "45小时",
    description: "深度实战工作坊，项目驱动学习",
    tags: ["工作坊", "深度实战", "项目驱动"],
    nextRecommendations: {
      primary: "AI 基础设施系列 —— 智算中心高阶技术培训",
      secondary: "企业级大模型部署实战",
      description: "从开发实战延伸至基础设施与部署，强化工程落地能力",
    },
  },

  // 三、通识与认知系列模块
  {
    id: "prompt-engineering",
    title: "通识认知应用系列 —— 大模型提示词工程技巧与应用",
    category: "通识认知",
    level: "初级",
    duration: "20小时",
    description: "掌握提示词工程的核心技巧和应用方法",
    tags: ["提示词工程", "应用技巧", "工具使用"],
    nextRecommendations: {
      primary: "通识认知应用系列 —— 零代码 AI 智能体构建与应用",
      secondary: "营销 AI 原生应用实践",
      description: "从提示词工程延伸至智能体开发，再落地营销场景应用",
    },
  },
  {
    id: "no-code-ai-agent",
    title: "通识认知应用系列 —— 零代码 AI 智能体构建与应用",
    category: "通识认知",
    level: "中级",
    duration: "25小时",
    description: "无需编程基础，快速构建AI智能体应用",
    tags: ["零代码", "智能体", "快速构建"],
    nextRecommendations: {
      primary: "领域应用实践系列 —— 大模型赋能法务管理实践",
      secondary: "智能客悦运营工程师认证预备",
      description: "从智能体构建延伸至法务场景，再对接客悦运营认证",
    },
  },

  // 四、DeepSeek 专项课程模块
  {
    id: "deepseek-efficiency",
    title: "DeepSeek 魔法 —— 用 AI 改变你的工作效率",
    category: "专项技术",
    level: "初级",
    duration: "15小时",
    description: "利用DeepSeek提升工作效率的实用技巧",
    tags: ["DeepSeek", "工作效率", "实用技巧"],
    nextRecommendations: {
      primary: "DeepSeek 革命 —— 从颠覆到实践，探索 AI 新纪元",
      secondary: "AI 产品经理认证预备课程",
      description: "从效率工具延伸至行业趋势，再对接产品经理认证",
    },
  },
  {
    id: "deepseek-cloud",
    title: "DeepSeek 云上之旅 —— 探索计算的无限可能",
    category: "专项技术",
    level: "中级",
    duration: "20小时",
    description: "深入了解DeepSeek在云计算环境中的应用",
    tags: ["DeepSeek", "云计算", "分布式计算"],
    nextRecommendations: {
      primary: "AI 基础设施系列 —— 智算中心高阶技术培训",
      secondary: "云计算与大模型融合实战",
      description: "从云计算探索延伸至智算中心技术，强化算力与模型的协同应用",
    },
  },

  // 五、行业应用与创新管理模块
  {
    id: "legal-ai-practice",
    title: "领域应用实践系列 —— 大模型赋能法务管理实践",
    category: "行业应用",
    level: "高级",
    duration: "35小时",
    description: "AI在法务领域的深度应用和管理实践",
    tags: ["法务管理", "行业应用", "合规实践"],
    nextRecommendations: {
      primary: "智能化创新管理系列 —— 大模型带来的机遇与挑战",
      secondary: "法务 AI 合规师认证",
      description: "从法务场景应用延伸至创新管理，强化合规认证",
    },
  },
  {
    id: "insurance-ai-practice",
    title: "行业应用实践系列 —— 保险条款智能解读应用实践",
    category: "行业应用",
    level: "高级",
    duration: "30小时",
    description: "AI在保险行业的智能化应用实践",
    tags: ["保险科技", "智能解读", "行业应用"],
    nextRecommendations: {
      primary: "智能化创新管理系列 —— 大模型带来的机遇和挑战 (技术版)",
      secondary: "保险科技工程师认证",
      description: "从保险应用延伸至技术版创新管理，对接保险科技认证",
    },
  },
]

// 获取课程推荐
export function getCourseRecommendations(courseId: string): CourseModule | null {
  return courseModules.find((course) => course.id === courseId) || null
}

// 获取学习路径
export function getLearningPath(currentLevel: string, targetLevel: string): CourseModule[] {
  const levels = ["初级", "中级", "高级", "专家"]
  const currentIndex = levels.indexOf(currentLevel)
  const targetIndex = levels.indexOf(targetLevel)

  if (currentIndex === -1 || targetIndex === -1 || currentIndex >= targetIndex) {
    return []
  }

  return courseModules.filter((course) => {
    const courseIndex = levels.indexOf(course.level)
    return courseIndex > currentIndex && courseIndex <= targetIndex
  })
}
