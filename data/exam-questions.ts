// 考试题目数据结构
export interface ExamQuestion {
  id: string
  type: "single" | "multiple" | "essay"
  category: string
  difficulty: "初级" | "中级" | "高级"
  question: string
  options?: string[]
  correctAnswers: string[] | number[]
  explanation: string
  points: number
  keywords: string[]
}

// 单选题数据
export const singleChoiceQuestions: ExamQuestion[] = [
  {
    id: "sc_001",
    type: "single",
    category: "核心技术",
    difficulty: "初级",
    question: "以下哪种技术是生成式人工智能的核心技术之一？",
    options: ["线性回归", "决策树", "生成对抗网络（GAN）", "朴素贝叶斯"],
    correctAnswers: [2],
    explanation:
      "生成对抗网络（GAN）是生成式 AI 的核心技术之一，用于生成图像、视频等内容；其他选项均为传统机器学习算法。",
    points: 1,
    keywords: ["GAN", "生成对抗网络", "核心技术"],
  },
  {
    id: "sc_002",
    type: "single",
    category: "基础概念",
    difficulty: "初级",
    question: "在生成式人工智能中，用于描述输入文本以引导模型生成特定内容的是？",
    options: ["训练数据", "超参数", "提示词", "损失函数"],
    correctAnswers: [2],
    explanation: "提示词（Prompt）是用户输入的文本描述，用于引导模型生成符合要求的内容。",
    points: 1,
    keywords: ["提示词", "Prompt", "输入文本"],
  },
  {
    id: "sc_003",
    type: "single",
    category: "应用场景",
    difficulty: "初级",
    question: "以下哪个不是生成式人工智能在图像领域的应用？",
    options: ["图像生成", "图像分类", "图像修复", "图像风格迁移"],
    correctAnswers: [1],
    explanation: "图像分类属于传统计算机视觉任务（判别式 AI），而非生成式 AI 的应用。",
    points: 1,
    keywords: ["图像分类", "判别式AI", "应用场景"],
  },
  {
    id: "sc_004",
    type: "single",
    category: "技术架构",
    difficulty: "中级",
    question: "以下关于 Transformer 架构的说法，错误的是？",
    options: ["广泛应用于生成式人工智能模型", "包含编码器和解码器结构", "主要依赖循环神经网络", "采用了自注意力机制"],
    correctAnswers: [2],
    explanation: "Transformer 架构摒弃了循环神经网络（RNN），基于自注意力机制，支持并行计算。",
    points: 1,
    keywords: ["Transformer", "自注意力", "并行计算"],
  },
  {
    id: "sc_005",
    type: "single",
    category: "医疗应用",
    difficulty: "中级",
    question: "生成式人工智能在医疗领域的应用不包括？",
    options: ["疾病诊断辅助", "药物研发", "手术机器人控制", "医疗影像分析"],
    correctAnswers: [2],
    explanation: "手术机器人控制属于自动化控制技术，非生成式 AI 的核心应用场景。",
    points: 1,
    keywords: ["医疗应用", "手术机器人", "自动化控制"],
  },
]

// 多选题数据
export const multipleChoiceQuestions: ExamQuestion[] = [
  {
    id: "mc_001",
    type: "multiple",
    category: "模型架构",
    difficulty: "中级",
    question: "生成式人工智能的常见模型架构包括？",
    options: ["生成对抗网络（GAN）", "变分自编码器（VAE）", "Transformer", "卷积神经网络（CNN）"],
    correctAnswers: [0, 1, 2],
    explanation: "GAN、VAE、Transformer都是生成式AI的常见架构；CNN主要用于判别式模型。",
    points: 2,
    keywords: ["GAN", "VAE", "Transformer", "模型架构"],
  },
  {
    id: "mc_002",
    type: "multiple",
    category: "自然语言处理",
    difficulty: "中级",
    question: "在自然语言处理中，生成式人工智能可用于？",
    options: ["机器翻译", "文本摘要", "对话系统", "情感分析"],
    correctAnswers: [0, 1, 2],
    explanation: "机器翻译、文本摘要、对话系统都是生成式任务；情感分析是判别式任务。",
    points: 2,
    keywords: ["NLP", "机器翻译", "文本摘要", "对话系统"],
  },
  {
    id: "mc_003",
    type: "multiple",
    category: "数据安全",
    difficulty: "高级",
    question: "在生成式人工智能应用中，可能引发的数据安全问题包括？",
    options: ["训练数据中的隐私信息泄露", "生成内容被用于恶意攻击", "模型参数被窃取", "数据标注错误导致的模型偏差"],
    correctAnswers: [0, 1, 2],
    explanation: "前三项都是数据安全问题；数据标注错误属于模型性能问题，非数据安全范畴。",
    points: 2,
    keywords: ["数据安全", "隐私泄露", "恶意攻击", "模型窃取"],
  },
]

// 简答题数据
export const essayQuestions: ExamQuestion[] = [
  {
    id: "es_001",
    type: "essay",
    category: "核心原理",
    difficulty: "中级",
    question: "简述扩散模型的正向扩散与反向去噪过程。",
    correctAnswers: [],
    explanation: `正向扩散过程：通过逐步向初始数据（如图像）中添加高斯噪声，使数据逐渐退化为纯噪声（如高斯分布）。这一过程是可预测的马尔可夫链，每一步的噪声强度由超参数控制（如方差 schedule）。

反向去噪过程：从纯噪声出发，通过神经网络（如 U-Net）逐步预测并去除噪声，还原清晰数据。反向过程是概率逆过程，需学习噪声分布的逆映射，最终生成接近真实数据的样本。`,
    points: 10,
    keywords: ["扩散模型", "正向扩散", "反向去噪", "马尔可夫链"],
  },
  {
    id: "es_002",
    type: "essay",
    category: "学习方式",
    difficulty: "中级",
    question: "对比生成式 AI 中 Zero-Shot 与 Few-Shot 的核心区别。",
    correctAnswers: [],
    explanation: `Zero-Shot（零样本学习）：模型在未见过的任务或类别上直接推理，依赖预训练中学习的通用语义理解能力（如通过提示词指定任务）。例如，未训练过"图像分类"的模型，通过文本指令识别从未见过的物体类别。

Few-Shot（少样本学习）：模型基于少量（如 1-10 个）样本快速适应新任务，利用元学习或注意力机制提取样本特征。例如，仅用 3 张猫的图片，模型即可学会识别猫的新图像。

核心区别：Zero-Shot 完全依赖预训练知识迁移，无需新样本；Few-Shot 需要少量新样本调整参数或特征空间。`,
    points: 10,
    keywords: ["Zero-Shot", "Few-Shot", "样本学习", "知识迁移"],
  },
  {
    id: "es_003",
    type: "essay",
    category: "医疗应用",
    difficulty: "高级",
    question: "列举生成式 AI 在医疗领域的 3 个应用场景，并说明其价值。",
    correctAnswers: [],
    explanation: `1. 医学影像分析：
应用：通过扩散模型生成高质量合成医学影像（如 CT、MRI），补充稀缺标注数据；或自动检测影像中的病变（如肿瘤）。
价值：缓解数据不足问题，提升诊断效率与准确性，尤其辅助基层医院快速筛查。

2. 药物研发：
应用：基于 GPT 类模型预测蛋白质结构、设计新分子化合物，或通过强化学习优化药物合成路径。
价值：缩短研发周期（从数年压缩至数月），降低实验成本，加速罕见病药物开发。

3. 个性化治疗方案生成：
应用：结合患者基因组数据、病史和临床指南，生成定制化治疗建议（如癌症化疗方案）。
价值：避免"一刀切"治疗，提升疗效并减少副作用，推动精准医疗发展。`,
    points: 10,
    keywords: ["医疗影像", "药物研发", "个性化治疗", "精准医疗"],
  },
]

// 获取所有题目
export function getAllQuestions(): ExamQuestion[] {
  return [...singleChoiceQuestions, ...multipleChoiceQuestions, ...essayQuestions]
}

// 按类别获取题目
export function getQuestionsByCategory(category: string): ExamQuestion[] {
  return getAllQuestions().filter((q) => q.category === category)
}

// 按难度获取题目
export function getQuestionsByDifficulty(difficulty: string): ExamQuestion[] {
  return getAllQuestions().filter((q) => q.difficulty === difficulty)
}

// 生成考试试卷
export function generateExamPaper(config: {
  singleCount: number
  multipleCount: number
  essayCount: number
  difficulty?: string
  categories?: string[]
}): ExamQuestion[] {
  let availableQuestions = getAllQuestions()

  if (config.difficulty) {
    availableQuestions = availableQuestions.filter((q) => q.difficulty === config.difficulty)
  }

  if (config.categories && config.categories.length > 0) {
    availableQuestions = availableQuestions.filter((q) => config.categories!.includes(q.category))
  }

  const singleQuestions = availableQuestions.filter((q) => q.type === "single").slice(0, config.singleCount)

  const multipleQuestions = availableQuestions.filter((q) => q.type === "multiple").slice(0, config.multipleCount)

  const essayQuestions = availableQuestions.filter((q) => q.type === "essay").slice(0, config.essayCount)

  return [...singleQuestions, ...multipleQuestions, ...essayQuestions]
}
