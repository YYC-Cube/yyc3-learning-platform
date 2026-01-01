// 专业高级题目数据结构
export interface ProfessionalAdvancedQuestion {
  id: string
  type: "single" | "multiple" | "technical-analysis" | "system-design"
  category: string
  subCategory?: string
  difficulty: 1 | 2 | 3 | 4 | 5 // 1-5星难度
  question: string
  options?: string[]
  correctAnswers: number[]
  explanation: string
  points: number
  keywords: string[]
  technicalDepth?: "basic" | "intermediate" | "advanced" | "expert"
  applicationScenario?: string
  relatedConcepts?: string[]
}

// 技术基础专项题目
export const technicalFoundationQuestions: ProfessionalAdvancedQuestion[] = [
  {
    id: "tf_001",
    type: "single",
    category: "技术基础",
    subCategory: "架构设计",
    difficulty: 3,
    question: "以下哪种架构最适合文本生成任务？",
    options: ["CNN", "RNN", "Transformer", "SVM"],
    correctAnswers: [2],
    explanation:
      "Transformer架构通过自注意力机制能够并行处理序列数据，在文本生成任务中表现最优。相比RNN的串行计算，Transformer能够更好地捕捉长距离依赖关系。",
    points: 2,
    keywords: ["Transformer", "文本生成", "自注意力机制"],
    technicalDepth: "intermediate",
    applicationScenario: "自然语言处理",
    relatedConcepts: ["注意力机制", "并行计算", "序列建模"],
  },
  {
    id: "tf_002",
    type: "single",
    category: "技术基础",
    subCategory: "扩散模型",
    difficulty: 4,
    question: "在扩散模型（Diffusion Model）中，去噪过程的核心目标是：",
    options: [
      "最小化生成图像与真实图像的像素差异",
      "逐步去除噪声以还原数据分布",
      "最大化生成图像的多样性",
      "加速训练过程",
    ],
    correctAnswers: [1],
    explanation:
      "扩散模型的去噪过程通过学习噪声分布的逆过程，逐步从纯噪声中还原出符合真实数据分布的样本。这是扩散模型生成高质量内容的核心机制。",
    points: 3,
    keywords: ["扩散模型", "去噪过程", "数据分布", "逆过程"],
    technicalDepth: "advanced",
    applicationScenario: "图像生成",
    relatedConcepts: ["马尔可夫链", "变分推断", "噪声调度"],
  },
  {
    id: "tf_003",
    type: "multiple",
    category: "技术基础",
    subCategory: "Transformer架构",
    difficulty: 3,
    question: "以下哪些是Transformer模型的关键组件？",
    options: ["自注意力机制", "位置编码", "残差连接", "卷积核"],
    correctAnswers: [0, 1, 2],
    explanation:
      "Transformer的关键组件包括：1)自注意力机制用于捕捉序列内的依赖关系；2)位置编码提供序列位置信息；3)残差连接帮助梯度传播。卷积核是CNN的组件，不属于标准Transformer架构。",
    points: 3,
    keywords: ["Transformer", "自注意力", "位置编码", "残差连接"],
    technicalDepth: "intermediate",
    applicationScenario: "深度学习架构",
    relatedConcepts: ["注意力机制", "序列建模", "梯度传播"],
  },
  {
    id: "tf_004",
    type: "single",
    category: "技术基础",
    subCategory: "模型优化",
    difficulty: 4,
    question: "LoRA（Low-Rank Adaptation）技术主要用于：",
    options: ["减少模型参数量", "加速推理速度", "微调大语言模型时的高效参数更新", "数据增强"],
    correctAnswers: [2],
    explanation:
      "LoRA通过低秩分解的方式，在微调大语言模型时只更新少量参数，大大提高了参数效率。它冻结预训练模型的主要参数，只训练低秩适配器，实现高效的任务特定优化。",
    points: 3,
    keywords: ["LoRA", "低秩分解", "参数效率", "模型微调"],
    technicalDepth: "advanced",
    applicationScenario: "大模型微调",
    relatedConcepts: ["参数高效微调", "适配器", "迁移学习"],
  },
]

// 核心技术深度专项题目
export const coreTechDepthQuestions: ProfessionalAdvancedQuestion[] = [
  {
    id: "ctd_001",
    type: "technical-analysis",
    category: "核心技术深度",
    subCategory: "多头注意力机制",
    difficulty: 4,
    question:
      "在Transformer架构中，多头注意力机制（Multi-Head Attention）如何解决传统RNN的局限性？请结合数学公式说明其并行计算优势。",
    correctAnswers: [],
    explanation: `多头注意力机制通过以下方式解决RNN局限性：

1. **并行计算优势**：
   - RNN需要串行处理序列，时间复杂度为O(n)
   - 多头注意力可以并行计算所有位置的关系，时间复杂度为O(1)

2. **数学原理**：
   - 注意力权重计算：Attention(Q,K,V) = softmax(QK^T/√d_k)V
   - 多头机制：MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O
   - 每个头：head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)

3. **长距离依赖**：
   - RNN存在梯度消失问题，难以捕捉长距离依赖
   - 注意力机制直接计算任意两个位置的关系，有效解决长距离依赖问题

4. **多样化特征学习**：
   - 不同的注意力头可以学习不同类型的依赖关系
   - 提高了模型的表达能力和泛化性能`,
    points: 15,
    keywords: ["多头注意力", "并行计算", "长距离依赖", "RNN局限性"],
    technicalDepth: "expert",
    applicationScenario: "序列建模",
    relatedConcepts: ["注意力机制", "Transformer", "梯度消失"],
  },
  {
    id: "ctd_002",
    type: "technical-analysis",
    category: "核心技术深度",
    subCategory: "模型微调技术",
    difficulty: 5,
    question: "对比分析LoRA与Adapter模块在模型微调中的异同，特别是在参数效率（Parameter Efficiency）方面的数学证明。",
    correctAnswers: [],
    explanation: `LoRA与Adapter模块对比分析：

**相同点**：
1. 都是参数高效微调方法
2. 都保持预训练模型权重冻结
3. 都只训练少量新增参数

**不同点**：

**LoRA（Low-Rank Adaptation）**：
- 原理：W = W_0 + BA，其中B∈R^(d×r)，A∈R^(r×d)，r<<d
- 参数量：2×d×r（相比原始参数d²大幅减少）
- 推理开销：无额外计算，可合并到原权重
- 数学证明：当r<<d时，参数减少比例为2r/d

**Adapter模块**：
- 原理：在Transformer层中插入小型前馈网络
- 参数量：2×d×r + 2×r（包含偏置项）
- 推理开销：增加前向传播步骤
- 位置：通常插入在注意力层和前馈层之后

**参数效率数学分析**：
- LoRA效率：η_LoRA = 2r/(d²) × 100%
- Adapter效率：η_Adapter = (2dr + 2r)/(原始参数) × 100%
- 当d=768，r=8时：LoRA约减少99.7%参数，Adapter约减少99.8%参数

**适用场景**：
- LoRA：适合需要保持推理速度的场景
- Adapter：适合需要更强表达能力的复杂任务`,
    points: 20,
    keywords: ["LoRA", "Adapter", "参数效率", "低秩分解"],
    technicalDepth: "expert",
    applicationScenario: "大模型微调",
    relatedConcepts: ["参数高效微调", "矩阵分解", "迁移学习"],
  },
]

// 多模态生成专项题目
export const multimodalQuestions: ProfessionalAdvancedQuestion[] = [
  {
    id: "mm_001",
    type: "multiple",
    category: "多模态生成",
    subCategory: "CLIP模型",
    difficulty: 3,
    question: "关于CLIP（Contrastive Language-Image Pretraining）模型的多模态对齐机制，以下说法正确的是？",
    options: [
      "通过对比学习拉近文本与图像的嵌入空间",
      "使用交叉注意力机制直接融合两种模态",
      "图像编码器采用ViT（Vision Transformer）结构",
      "文本编码器与BERT架构完全一致",
    ],
    correctAnswers: [0, 2],
    explanation: `CLIP模型的核心机制分析：

**正确选项**：
A. 对比学习机制：CLIP通过最大化匹配的文本-图像对的相似度，最小化不匹配对的相似度，实现跨模态对齐
C. ViT图像编码器：CLIP使用Vision Transformer作为图像编码器，将图像分割成patches进行处理

**错误选项**：
B. CLIP基于对比学习而非交叉注意力机制进行模态融合
D. CLIP的文本编码器是定制的Transformer，与BERT在架构上有差异

**技术细节**：
- 训练目标：最大化正样本对的余弦相似度，最小化负样本对的相似度
- 损失函数：对称的对比损失（InfoNCE loss）
- 应用价值：零样本图像分类、文本到图像检索等`,
    points: 4,
    keywords: ["CLIP", "对比学习", "多模态对齐", "ViT"],
    technicalDepth: "advanced",
    applicationScenario: "多模态理解",
    relatedConcepts: ["对比学习", "零样本学习", "跨模态检索"],
  },
  {
    id: "mm_002",
    type: "system-design",
    category: "多模态生成",
    subCategory: "视频生成",
    difficulty: 5,
    question:
      "在视频生成任务中，如何解决时序一致性（Temporal Consistency）问题？请提出至少两种技术方案并分析其优缺点。",
    correctAnswers: [],
    explanation: `视频生成中时序一致性解决方案：

**方案一：光流约束方法**
- 技术原理：利用光流估计相邻帧间的像素运动，约束生成过程
- 实现方式：在损失函数中加入光流一致性项
- 优点：能够保持物体运动的连续性，计算相对简单
- 缺点：对快速运动或遮挡场景效果有限

**方案二：时序注意力机制**
- 技术原理：在Transformer架构中引入时间维度的注意力
- 实现方式：3D注意力或分离的空间-时间注意力
- 优点：能够建模长期时序依赖，适应复杂场景变化
- 缺点：计算复杂度高，内存需求大

**方案三：3D卷积网络**
- 技术原理：使用3D卷积替代2D卷积，同时处理空间和时间信息
- 实现方式：3D U-Net或3D ResNet作为生成器骨干
- 优点：直接建模时空特征，架构相对简单
- 缺点：参数量大，训练困难

**方案四：递归生成策略**
- 技术原理：基于前一帧生成当前帧，保持时序连贯性
- 实现方式：RNN或LSTM结合生成网络
- 优点：天然保证时序连续性
- 缺点：误差累积问题，长序列生成质量下降

**综合建议**：
实际应用中通常结合多种方法，如光流约束+时序注意力，在效果和效率间取得平衡。`,
    points: 25,
    keywords: ["时序一致性", "光流约束", "时序注意力", "3D卷积"],
    technicalDepth: "expert",
    applicationScenario: "视频生成",
    relatedConcepts: ["光流估计", "时序建模", "视频理解"],
  },
]

// RLHF调优专项题目
export const rlhfQuestions: ProfessionalAdvancedQuestion[] = [
  {
    id: "rlhf_001",
    type: "multiple",
    category: "RLHF调优",
    subCategory: "奖励模型设计",
    difficulty: 4,
    question: "在RLHF中训练奖励模型时，为避免过度拟合人类偏好，应采取的措施包括：",
    options: [
      "使用多样性采样策略扩展训练数据",
      "仅使用Top-K样本进行训练",
      "加入对抗训练增强鲁棒性",
      "固定奖励模型权重",
    ],
    correctAnswers: [0, 2],
    explanation: `避免奖励模型过度拟合的策略：

**有效措施**：
A. 多样性采样：通过不同的采样策略（如nucleus sampling、top-p sampling）生成多样化的训练数据，避免模型只学习特定模式的偏好

C. 对抗训练：引入对抗样本训练，提高模型对输入扰动的鲁棒性，防止过度拟合特定的人类反馈模式

**无效或有害措施**：
B. 仅使用Top-K样本会导致数据分布偏斜，加剧过拟合问题
D. 固定权重无法让模型学习和适应新的人类偏好

**额外建议**：
- 使用正则化技术（如dropout、weight decay）
- 交叉验证确保泛化性能
- 定期更新训练数据，包含新的人类反馈
- 使用集成方法结合多个奖励模型的预测`,
    points: 5,
    keywords: ["奖励模型", "过拟合", "多样性采样", "对抗训练"],
    technicalDepth: "advanced",
    applicationScenario: "强化学习",
    relatedConcepts: ["人类反馈", "模型泛化", "鲁棒性"],
  },
  {
    id: "rlhf_002",
    type: "system-design",
    category: "RLHF调优",
    subCategory: "代码生成",
    difficulty: 5,
    question:
      "如何将强化学习（RLHF）应用于代码生成任务？请设计一个完整的奖励函数设计框架，需考虑代码正确性、可读性和安全性三个维度。",
    correctAnswers: [],
    explanation: `代码生成RLHF奖励函数设计框架：

**总体架构**：
R_total = α·R_correctness + β·R_readability + γ·R_security
其中α + β + γ = 1，权重可根据任务需求调整

**1. 代码正确性维度（R_correctness）**：
- 语法正确性：AST解析成功率（0-1分）
- 功能正确性：单元测试通过率（0-1分）
- 类型检查：静态类型检查通过率（0-1分）
- 运行时错误：异常处理覆盖率（0-1分）

计算公式：
R_correctness = 0.3·syntax_score + 0.4·test_score + 0.2·type_score + 0.1·error_score

**2. 代码可读性维度（R_readability）**：
- 命名规范：变量/函数名符合规范程度（0-1分）
- 注释质量：注释覆盖率和质量评分（0-1分）
- 代码结构：函数长度、嵌套深度等指标（0-1分）
- 风格一致性：符合PEP8等代码风格指南（0-1分）

计算公式：
R_readability = 0.25·naming_score + 0.25·comment_score + 0.25·structure_score + 0.25·style_score

**3. 代码安全性维度（R_security）**：
- 漏洞检测：使用静态分析工具检测安全漏洞（0-1分）
- 输入验证：检查是否有适当的输入验证（0-1分）
- 权限控制：检查访问控制和权限管理（0-1分）
- 敏感信息：检查是否泄露敏感信息（0-1分）

计算公式：
R_security = 0.4·vulnerability_score + 0.2·validation_score + 0.2·access_score + 0.2·privacy_score

**实现细节**：
1. 使用预训练的代码理解模型（如CodeBERT）提取语义特征
2. 结合静态分析工具（如SonarQube、Bandit）进行自动化评估
3. 引入人类专家反馈进行周期性校准
4. 使用强化学习算法（如PPO）优化生成策略

**动态调整机制**：
- 根据任务类型调整权重（如安全关键系统提高安全性权重）
- 基于用户反馈动态更新评分标准
- 定期重新训练奖励模型以适应新的编程范式`,
    points: 30,
    keywords: ["RLHF", "代码生成", "奖励函数", "多维度评估"],
    technicalDepth: "expert",
    applicationScenario: "代码生成",
    relatedConcepts: ["强化学习", "代码质量", "静态分析"],
  },
]

// 获取所有专业高级题目
export function getAllProfessionalAdvancedQuestions(): ProfessionalAdvancedQuestion[] {
  return [...technicalFoundationQuestions, ...coreTechDepthQuestions, ...multimodalQuestions, ...rlhfQuestions]
}

// 按类别获取题目
export function getQuestionsByCategory(category: string): ProfessionalAdvancedQuestion[] {
  return getAllProfessionalAdvancedQuestions().filter((q) => q.category === category)
}

// 按难度获取题目
export function getQuestionsByDifficulty(difficulty: number): ProfessionalAdvancedQuestion[] {
  return getAllProfessionalAdvancedQuestions().filter((q) => q.difficulty === difficulty)
}

// 生成专业考试试卷
export function generateProfessionalExamPaper(config: {
  categories: string[]
  difficultyRange: [number, number]
  questionCount: number
  includeSystemDesign?: boolean
}): ProfessionalAdvancedQuestion[] {
  let availableQuestions = getAllProfessionalAdvancedQuestions()

  // 按类别筛选
  if (config.categories.length > 0) {
    availableQuestions = availableQuestions.filter((q) => config.categories.includes(q.category))
  }

  // 按难度筛选
  availableQuestions = availableQuestions.filter(
    (q) => q.difficulty >= config.difficultyRange[0] && q.difficulty <= config.difficultyRange[1],
  )

  // 是否包含系统设计题
  if (!config.includeSystemDesign) {
    availableQuestions = availableQuestions.filter((q) => q.type !== "system-design")
  }

  // 随机选择题目
  const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, config.questionCount)
}
