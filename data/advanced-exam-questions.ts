// 扩展题目类型
export interface ExamQuestion {
  id: string
  type: string
  category: string
  difficulty: string
  question: string
  correctAnswers: string[]
  explanation: string
  points: number
  keywords: string[]
}

export interface AdvancedExamQuestion extends ExamQuestion {
  type: "single" | "multiple" | "essay" | "definition" | "comparison" | "application"
  subType?: string
  referenceAnswer?: string
  scoringCriteria?: string[]
}

// 名词解释题
export const definitionQuestions: AdvancedExamQuestion[] = [
  {
    id: "def_001",
    type: "definition",
    category: "核心技术",
    difficulty: "中级",
    question: "生成对抗网络（GAN）",
    correctAnswers: [],
    explanation: `生成对抗网络（Generative Adversarial Networks, GAN）是一种深度学习模型，由生成器（Generator）和判别器（Discriminator）组成。

- 生成器负责学习真实数据的分布，生成接近真实样本的伪造数据（如图像、文本）；
- 判别器则判断输入数据是真实样本还是生成器的输出。

两者通过对抗训练（生成器试图"欺骗"判别器，判别器试图准确区分真伪）不断优化，最终使生成器输出的样本接近真实数据分布。GAN广泛应用于图像生成、数据增强、视频合成等领域。`,
    points: 5,
    keywords: ["GAN", "生成器", "判别器", "对抗训练"],
    referenceAnswer: "需包含GAN的基本组成、工作原理、对抗训练机制和应用领域",
    scoringCriteria: [
      "正确说明GAN由生成器和判别器组成（1分）",
      "解释对抗训练的基本原理（2分）",
      "说明GAN的应用场景（1分）",
      "表述清晰、逻辑完整（1分）",
    ],
  },
  {
    id: "def_002",
    type: "definition",
    category: "核心技术",
    difficulty: "高级",
    question: "扩散模型（Diffusion Model）",
    correctAnswers: [],
    explanation: `扩散模型是一种基于热力学扩散原理的生成模型，通过正向扩散和逆向扩散两个过程实现数据生成。

- 正向扩散：逐步向真实样本中添加高斯噪声，直至数据变为纯噪声；
- 逆向扩散：通过神经网络（如U-Net）从纯噪声中逐步去噪，还原出真实样本。

其核心思想是通过学习噪声分布的逆过程，生成高质量、多样化的样本（如图像、语音）。扩散模型在图像生成领域（如Stable Diffusion）表现优异，能生成细节丰富、语义一致的内容。`,
    points: 5,
    keywords: ["扩散模型", "正向扩散", "逆向扩散", "去噪"],
    referenceAnswer: "需包含扩散模型的基本原理、正向和逆向过程、技术特点和应用",
    scoringCriteria: [
      "正确解释正向扩散过程（1.5分）",
      "正确解释逆向扩散过程（1.5分）",
      "说明扩散模型的优势特点（1分）",
      "举例说明应用场景（1分）",
    ],
  },
  {
    id: "def_003",
    type: "definition",
    category: "模型能力",
    difficulty: "高级",
    question: "大语言模型（LLM）的涌现能力",
    correctAnswers: [],
    explanation: `大语言模型的涌现能力（Emergent Abilities）指模型在参数规模达到一定阈值（如千亿级参数）后，突然表现出训练阶段未明确学习过的复杂能力。

例如：
- 逻辑推理：解决数学题、逻辑谜题；
- 常识理解：处理隐含语义（如反讽、隐喻）；
- 复杂指令执行：多步任务规划、跨领域知识整合；
- 少样本/零样本学习：仅通过少量示例或无示例完成新任务。

这种能力并非线性提升的结果，而是模型规模突破临界点后的"突现"特性，目前机制尚未完全明确，但已成为大模型核心优势之一。`,
    points: 5,
    keywords: ["涌现能力", "大语言模型", "零样本学习", "逻辑推理"],
    referenceAnswer: "需包含涌现能力的定义、具体表现、产生条件和重要意义",
    scoringCriteria: [
      "正确定义涌现能力概念（1分）",
      "列举具体的涌现能力表现（2分）",
      "说明产生条件和机制（1分）",
      "阐述其重要意义（1分）",
    ],
  },
]

// 技术对比题
export const comparisonQuestions: AdvancedExamQuestion[] = [
  {
    id: "comp_001",
    type: "comparison",
    category: "技术对比",
    difficulty: "高级",
    question: "对比扩散模型与GAN在训练方式、生成质量、计算成本上的差异（列表说明）",
    correctAnswers: [],
    explanation: `
| 维度 | 扩散模型（Diffusion Model） | 生成对抗网络（GAN） |
|------|---------------------------|-------------------|
| 训练方式 | - 基于正向扩散（加噪）与反向去噪（降噪）的马尔可夫链过程<br>- 需训练神经网络预测噪声，优化目标为最小化去噪损失 | - 生成器与判别器对抗训练<br>- 生成器试图欺骗判别器，判别器试图区分真伪数据 |
| 生成质量 | - 生成样本多样性高，细节丰富（尤其在图像领域）<br>- 可控性强（可通过噪声条件控制生成方向） | - 生成样本逼真度高，但多样性可能受限（模式崩溃问题）<br>- 难以精确控制生成内容（如指定细节修改） |
| 计算成本 | - 训练耗时较长（需迭代数百/数千次扩散步骤）<br>- 推理成本高（每次生成需多轮去噪） | - 训练速度较快（对抗博弈通常收敛较快）<br>- 推理成本低（单次前向传播生成样本） |
| 典型应用场景 | 高保真图像生成（如Stable Diffusion）、视频合成、3D建模 | 实时图像生成（如StyleGAN）、数据增强、虚拟人驱动 |
`,
    points: 15,
    keywords: ["扩散模型", "GAN", "训练方式", "生成质量", "计算成本"],
    referenceAnswer: "需要从训练方式、生成质量、计算成本三个维度进行详细对比，并以表格形式呈现",
    scoringCriteria: [
      "训练方式对比准确（5分）",
      "生成质量对比准确（5分）",
      "计算成本对比准确（3分）",
      "表格格式清晰（2分）",
    ],
  },
  {
    id: "comp_002",
    type: "comparison",
    category: "技术对比",
    difficulty: "中级",
    question: "分析传统机器学习与生成式AI在核心目标、数据依赖上的主要区别",
    correctAnswers: [],
    explanation: `
| 维度 | 传统机器学习 | 生成式AI |
|------|-------------|----------|
| 核心目标 | - 从数据中学习规律，实现分类、回归、聚类等判别性任务<br>- 目标是拟合数据分布，输出"预测结果" | - 学习数据分布的本质结构，生成全新的、符合分布的样本<br>- 目标是创造"新数据"，而非简单预测 |
| 数据依赖 | - 依赖大量标注数据（如图像分类需人工标注标签）<br>- 数据质量要求高（噪声敏感） | - 依赖海量无标注数据（如文本、图像集）<br>- 更关注数据分布的完整性（如语言模型依赖互联网文本） |
| 模型结构 | - 多为判别式模型（如SVM、随机森林、CNN分类器） | - 多为生成式模型（如GAN、扩散模型、自回归模型） |
| 输出特性 | - 输出固定维度的结果（如类别标签、数值） | - 输出可变长度/维度的内容（如文本段落、高分辨率图像） |
| 典型应用 | 图像识别、垃圾邮件过滤、信用评分预测 | 文本生成（如ChatGPT）、图像生成（如DALL-E）、代码生成 |
`,
    points: 15,
    keywords: ["传统机器学习", "生成式AI", "核心目标", "数据依赖"],
    referenceAnswer: "需要从核心目标、数据依赖、模型结构、输出特性等维度进行全面对比",
    scoringCriteria: [
      "核心目标对比准确（4分）",
      "数据依赖对比准确（4分）",
      "模型结构对比准确（3分）",
      "输出特性对比准确（2分）",
      "典型应用举例恰当（2分）",
    ],
  },
]

// 应用分析题
export const applicationQuestions: AdvancedExamQuestion[] = [
  {
    id: "app_001",
    type: "application",
    category: "教育应用",
    difficulty: "高级",
    question: "结合教育领域，说明生成式AI如何实现个性化学习支持（至少3点）",
    correctAnswers: [],
    explanation: `生成式AI通过动态分析学生特征、实时调整教学策略，实现"千人千面"的学习支持。具体应用包括：

1. **个性化学习路径规划**
   AI分析学生历史答题数据、知识点掌握情况，生成专属学习路径。例如，为数学薄弱的学生优先推送代数基础课程，跳过已掌握的几何模块，避免重复学习。

2. **自适应内容生成**
   根据学生认知水平生成定制化习题与解析。如为低年级学生提供图文并茂的乘法口诀记忆游戏，为高年级学生生成函数应用题的多解法对比，提升理解深度。

3. **实时互动答疑与反馈**
   基于大语言模型的智能答疑系统，可理解学生模糊提问（如"这道题为什么选C"），结合知识点漏洞生成针对性解析，并推送同类题目强化训练，实现"测—学—练"闭环。`,
    points: 15,
    keywords: ["个性化学习", "自适应内容", "智能答疑", "教育AI"],
    referenceAnswer: "需要从至少3个方面说明生成式AI在教育领域的个性化学习支持，每点需要具体说明技术实现和应用效果",
    scoringCriteria: [
      "个性化学习路径规划（5分）",
      "自适应内容生成（5分）",
      "实时互动答疑（3分）",
      "技术实现描述清晰（2分）",
    ],
  },
  {
    id: "app_002",
    type: "application",
    category: "代码生成",
    difficulty: "中级",
    question: "举例说明生成式AI在代码生成中的具体应用（如自动代码补全）及其关键技术",
    correctAnswers: [],
    explanation: `生成式AI显著提升编码效率，降低开发门槛，典型场景与技术如下：

1. **自动代码补全与生成**
   工具如GitHub Copilot可根据上下文提示自动补全代码行或生成函数。例如，输入"// 计算数组平均值"，AI自动生成循环遍历数组、求和并取平均的Python代码片段。

2. **跨语言代码转换**
   将Java代码转换为Python，或反之。关键技术包括代码预训练模型（如AlphaCode、PolyCoder），通过海量开源代码训练，学习语法规则与逻辑结构，实现语义级转换。

3. **漏洞修复与优化建议**
   AI扫描代码发现潜在bug（如空指针异常），生成修复方案。依赖静态代码分析技术与生成模型的结合，如CodeBERT通过对比漏洞代码与安全代码的差异，生成修复补丁。`,
    points: 15,
    keywords: ["代码生成", "自动补全", "代码转换", "漏洞修复"],
    referenceAnswer: "需要举例说明代码生成的具体应用场景，并说明相关的关键技术",
    scoringCriteria: ["自动代码补全应用（5分）", "跨语言转换应用（5分）", "漏洞修复应用（3分）", "关键技术说明（2分）"],
  },
]

// 获取所有高级题目
export function getAllAdvancedQuestions(): AdvancedExamQuestion[] {
  return [...definitionQuestions, ...comparisonQuestions, ...applicationQuestions]
}

// 生成高级考试试卷
export function generateAdvancedExamPaper(config: {
  definitionCount: number
  comparisonCount: number
  applicationCount: number
  difficulty?: string
}): AdvancedExamQuestion[] {
  let availableDefinitions = definitionQuestions
  let availableComparisons = comparisonQuestions
  let availableApplications = applicationQuestions

  if (config.difficulty) {
    availableDefinitions = availableDefinitions.filter((q) => q.difficulty === config.difficulty)
    availableComparisons = availableComparisons.filter((q) => q.difficulty === config.difficulty)
    availableApplications = availableApplications.filter((q) => q.difficulty === config.difficulty)
  }

  const selectedDefinitions = availableDefinitions.slice(0, config.definitionCount)
  const selectedComparisons = availableComparisons.slice(0, config.comparisonCount)
  const selectedApplications = availableApplications.slice(0, config.applicationCount)

  return [...selectedDefinitions, ...selectedComparisons, ...selectedApplications]
}
