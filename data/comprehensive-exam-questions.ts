// 综合考试题目数据结构
export interface ComprehensiveExamQuestion {
  id: string
  type: "single" | "multiple" | "essay" | "definition" | "comparison" | "application"
  category: string
  subCategory?: string
  difficulty: "初级" | "中级" | "高级"
  question: string
  options?: string[]
  correctAnswers: number[]
  explanation: string
  points: number
  keywords: string[]
  relatedConcepts?: string[]
}

// AI大模型分类相关题目
export const modelClassificationQuestions: ComprehensiveExamQuestion[] = [
  // 按模型架构分类题目
  {
    id: "mc_001",
    type: "single",
    category: "模型架构分类",
    subCategory: "语言模型",
    difficulty: "初级",
    question: "以下哪个模型属于基于自回归生成机制的大型语言模型？",
    options: ["BERT", "GPT系列", "ResNet", "CLIP"],
    correctAnswers: [1],
    explanation:
      "GPT系列模型基于自回归生成机制，能够逐步生成文本序列。BERT是双向编码器，ResNet是视觉模型，CLIP是多模态模型。",
    points: 2,
    keywords: ["GPT", "自回归", "语言模型"],
    relatedConcepts: ["Transformer", "文本生成", "预训练模型"],
  },
  {
    id: "mc_002",
    type: "multiple",
    category: "模型架构分类",
    subCategory: "视觉模型",
    difficulty: "中级",
    question: "以下哪些模型主要用于计算机视觉任务？",
    options: ["Vision Transformer (ViT)", "ResNet系列", "GPT-3", "DALL·E"],
    correctAnswers: [0, 1, 3],
    explanation:
      "ViT将Transformer应用于图像处理，ResNet是经典的卷积神经网络，DALL·E能生成图像。GPT-3主要用于文本处理。",
    points: 3,
    keywords: ["ViT", "ResNet", "DALL·E", "计算机视觉"],
    relatedConcepts: ["图像识别", "卷积神经网络", "多模态生成"],
  },
  {
    id: "mc_003",
    type: "definition",
    category: "模型架构分类",
    subCategory: "多模态模型",
    difficulty: "中级",
    question: "请解释CLIP模型的核心原理和应用场景",
    correctAnswers: [],
    explanation:
      "CLIP（Contrastive Language-Image Pretraining）是一种结合图像和文本的多模态表示学习模型。它通过对比学习的方式，将图像和文本映射到同一个嵌入空间中，能够实现零样本迁移学习。CLIP可以理解图像内容并将其与文本描述进行匹配，广泛应用于跨模态检索、视觉问答等任务。",
    points: 5,
    keywords: ["CLIP", "多模态", "对比学习", "零样本学习"],
    relatedConcepts: ["跨模态检索", "视觉问答", "嵌入空间"],
  },
  {
    id: "mc_004",
    type: "single",
    category: "模型架构分类",
    subCategory: "视觉模型",
    difficulty: "中级",
    question: "ResNet系列模型解决了深度神经网络中的什么关键问题？",
    options: ["过拟合问题", "梯度消失问题", "计算效率问题", "数据不足问题"],
    correctAnswers: [1],
    explanation:
      "ResNet通过引入残差连接（skip connection）解决了深度神经网络训练中的梯度消失问题，使得可以训练更深的网络。",
    points: 2,
    keywords: ["ResNet", "残差连接", "梯度消失"],
    relatedConcepts: ["深度网络", "skip connection", "网络深度"],
  },
  {
    id: "mc_005",
    type: "single",
    category: "模型架构分类",
    subCategory: "视觉模型",
    difficulty: "中级",
    question: "Vision Transformer (ViT)的核心创新是什么？",
    options: ["使用卷积操作", "引入注意力机制", "将图像分割为patch并序列化处理", "使用循环神经网络"],
    correctAnswers: [2],
    explanation:
      "ViT的核心创新是将图像分割为固定大小的patch，然后将这些patch序列化处理，直接应用Transformer架构进行图像处理。",
    points: 2,
    keywords: ["ViT", "patch", "Transformer", "图像处理"],
    relatedConcepts: ["注意力机制", "序列化", "图像分类"],
  },

  // 按训练方式分类题目
  {
    id: "tm_001",
    type: "single",
    category: "训练方式分类",
    subCategory: "预训练+微调",
    difficulty: "中级",
    question: "预训练+微调模型的主要优势是什么？",
    options: ["只需要大量标注数据", "充分利用大规模未标注数据和少量标注数据", "训练速度最快", "模型参数最少"],
    correctAnswers: [1],
    explanation:
      "预训练+微调模型先在大规模未标注数据上进行预训练，学习通用特征，然后在少量标注数据上微调，这样能充分利用两种数据的优势。",
    points: 2,
    keywords: ["预训练", "微调", "未标注数据", "标注数据"],
    relatedConcepts: ["迁移学习", "BERT", "GPT"],
  },
  {
    id: "tm_002",
    type: "comparison",
    category: "训练方式分类",
    subCategory: "GAN vs VAE",
    difficulty: "高级",
    question: "对比生成对抗网络(GAN)与变分自编码器(VAE)在生成任务中的异同点",
    correctAnswers: [],
    explanation: `
**相同点：**
- 都是生成模型，能够生成新的数据样本
- 都可以用于图像生成、数据增强等任务
- 都基于深度学习框架实现

**不同点：**

| 维度 | GAN | VAE |
|------|-----|-----|
| 训练方式 | 对抗训练（生成器vs判别器） | 重构损失+KL散度正则化 |
| 生成质量 | 生成图像清晰，但可能模式崩溃 | 生成图像较模糊，但训练稳定 |
| 训练稳定性 | 训练不稳定，容易出现模式崩溃 | 训练相对稳定 |
| 潜在空间 | 潜在空间不规则，难以插值 | 潜在空间连续，支持插值 |
| 应用场景 | 高质量图像生成、风格迁移 | 数据降维、异常检测 |
`,
    points: 15,
    keywords: ["GAN", "VAE", "生成模型", "对抗训练"],
    relatedConcepts: ["生成器", "判别器", "重构损失", "KL散度"],
  },
  {
    id: "tm_003",
    type: "single",
    category: "训练方式分类",
    subCategory: "无监督学习",
    difficulty: "初级",
    question: "以下哪种学习方式不需要标注数据？",
    options: ["有监督学习", "无监督学习", "强化学习", "半监督学习"],
    correctAnswers: [1],
    explanation: "无监督学习不需要标注数据，通过发现数据中的内在结构和模式来学习，如聚类、降维等。",
    points: 1,
    keywords: ["无监督学习", "标注数据", "聚类"],
    relatedConcepts: ["K-means", "PCA", "自编码器"],
  },
  {
    id: "tm_004",
    type: "multiple",
    category: "训练方式分类",
    subCategory: "自编码器",
    difficulty: "中级",
    question: "自编码器模型的主要应用场景包括哪些？",
    options: ["数据降维", "异常检测", "图像去噪", "文本分类"],
    correctAnswers: [0, 1, 2],
    explanation:
      "自编码器通过学习数据的压缩表示，主要用于数据降维、异常检测和图像去噪等任务。文本分类通常使用有监督学习方法。",
    points: 3,
    keywords: ["自编码器", "数据降维", "异常检测", "图像去噪"],
    relatedConcepts: ["编码器", "解码器", "重构损失"],
  },

  // 按应用场景分类题目
  {
    id: "as_001",
    type: "multiple",
    category: "应用场景分类",
    subCategory: "文本生成类",
    difficulty: "初级",
    question: "以下哪些属于文本生成类AI模型的应用场景？",
    options: ["写作助手", "机器翻译", "图像识别", "聊天机器人"],
    correctAnswers: [0, 1, 3],
    explanation: "写作助手、机器翻译和聊天机器人都涉及文本的生成和处理。图像识别属于计算机视觉任务，不是文本生成。",
    points: 3,
    keywords: ["文本生成", "写作助手", "机器翻译", "聊天机器人"],
    relatedConcepts: ["自然语言处理", "序列生成", "语言模型"],
  },
  {
    id: "as_002",
    type: "application",
    category: "应用场景分类",
    subCategory: "图像生成类",
    difficulty: "高级",
    question: "分析DALL·E在艺术创作领域的应用价值及其技术实现原理",
    correctAnswers: [],
    explanation: `
**应用价值：**
1. **创意激发**：根据文本描述生成独特的艺术作品，为艺术家提供创意灵感
2. **效率提升**：快速生成概念图和草图，大幅缩短创作周期
3. **个性化定制**：根据客户需求生成定制化的艺术作品
4. **教育辅助**：帮助艺术教育中的概念可视化

**技术实现原理：**
1. **多模态架构**：结合文本编码器和图像解码器
2. **注意力机制**：通过交叉注意力将文本特征与图像特征对齐
3. **自回归生成**：逐步生成图像的每个部分
4. **大规模训练**：在海量文本-图像对上进行预训练

**技术优势：**
- 能够理解复杂的文本描述
- 生成高质量、高分辨率的图像
- 支持风格控制和细节调整
`,
    points: 20,
    keywords: ["DALL·E", "艺术创作", "多模态", "文本到图像"],
    relatedConcepts: ["创意生成", "注意力机制", "自回归生成"],
  },
  {
    id: "as_003",
    type: "single",
    category: "应用场景分类",
    subCategory: "对话系统类",
    difficulty: "中级",
    question: "现代聊天机器人相比传统基于规则的对话系统，主要优势是什么？",
    options: ["响应速度更快", "支持多轮对话和上下文理解", "部署成本更低", "不需要训练数据"],
    correctAnswers: [1],
    explanation: "基于深度学习的现代聊天机器人能够理解上下文，支持多轮对话，提供更自然的交互体验。",
    points: 2,
    keywords: ["聊天机器人", "多轮对话", "上下文理解"],
    relatedConcepts: ["对话系统", "自然语言理解", "Transformer"],
  },

  // 按规模大小分类题目
  {
    id: "sz_001",
    type: "single",
    category: "规模大小分类",
    subCategory: "大型模型",
    difficulty: "中级",
    question: "以下哪个模型属于大型模型（参数量超过100亿）？",
    options: ["BERT-base", "GPT-3", "MobileBERT", "DistilBERT"],
    correctAnswers: [1],
    explanation: "GPT-3拥有1750亿参数，属于大型模型。BERT-base约1.1亿参数，MobileBERT和DistilBERT都是轻量化模型。",
    points: 2,
    keywords: ["GPT-3", "大型模型", "参数量", "1750亿"],
    relatedConcepts: ["大规模预训练", "计算资源", "模型性能"],
  },
  {
    id: "sz_002",
    type: "essay",
    category: "规模大小分类",
    subCategory: "轻量化模型",
    difficulty: "高级",
    question: "分析轻量化模型在边缘计算场景中的优势和挑战，并提出优化策略",
    correctAnswers: [],
    explanation: `
**优势：**
1. **资源效率**：内存占用小，计算量少，适合资源受限的边缘设备
2. **响应速度**：推理速度快，满足实时性要求
3. **部署灵活**：可在移动设备、IoT设备等多种平台部署
4. **成本控制**：降低硬件成本和能耗

**挑战：**
1. **性能权衡**：模型压缩可能导致精度下降
2. **任务适应性**：在复杂任务上表现可能不如大模型
3. **优化复杂性**：需要专门的压缩和优化技术

**优化策略：**
1. **知识蒸馏**：从大模型向小模型传递知识
2. **模型剪枝**：移除不重要的参数和连接
3. **量化技术**：降低数值精度减少存储和计算
4. **架构优化**：设计专门的轻量化架构如MobileNet
5. **硬件协同**：结合专用芯片优化推理性能
`,
    points: 15,
    keywords: ["轻量化模型", "边缘计算", "模型压缩", "知识蒸馏"],
    relatedConcepts: ["模型剪枝", "量化", "移动端部署"],
  },
  {
    id: "sz_003",
    type: "multiple",
    category: "规模大小分类",
    subCategory: "中型模型",
    difficulty: "中级",
    question: "以下哪些模型属于中型模型（参数量10-100亿）？",
    options: ["RoBERTa-large", "T5-base", "GPT-2", "GPT-3"],
    correctAnswers: [0, 1, 2],
    explanation:
      "RoBERTa-large、T5-base和GPT-2的参数量都在10-100亿范围内，属于中型模型。GPT-3有1750亿参数，属于大型模型。",
    points: 3,
    keywords: ["中型模型", "RoBERTa", "T5", "GPT-2"],
    relatedConcepts: ["参数规模", "模型性能", "计算资源"],
  },

  // 按开源状态分类题目
  {
    id: "os_001",
    type: "multiple",
    category: "开源状态分类",
    subCategory: "开源模型",
    difficulty: "初级",
    question: "以下哪些属于开源的AI大模型？",
    options: ["Meta Llama系列", "HuggingFace Transformers", "GPT-4", "百度文心一言"],
    correctAnswers: [0, 1],
    explanation: "Meta Llama系列和HuggingFace Transformers都是开源模型。GPT-4和百度文心一言是商业化的闭源模型。",
    points: 3,
    keywords: ["开源模型", "Meta Llama", "HuggingFace", "闭源模型"],
    relatedConcepts: ["开源社区", "商业模型", "模型许可"],
  },
  {
    id: "os_002",
    type: "single",
    category: "开源状态分类",
    subCategory: "闭源模型",
    difficulty: "初级",
    question: "闭源AI模型的主要特点是什么？",
    options: ["代码完全公开", "仅供内部使用或商业授权", "免费使用", "社区维护"],
    correctAnswers: [1],
    explanation: "闭源模型的代码和模型权重不公开，通常仅供开发公司内部使用或通过商业授权提供服务。",
    points: 1,
    keywords: ["闭源模型", "商业授权", "私有模型"],
    relatedConcepts: ["知识产权", "商业模式", "API服务"],
  },

  // 按技术发展阶段分类题目
  {
    id: "ts_001",
    type: "comparison",
    category: "技术发展阶段",
    subCategory: "三代模型对比",
    difficulty: "高级",
    question: "对比第一代、第二代、第三代AI模型的主要特征和代表性技术",
    correctAnswers: [],
    explanation: `
| 发展阶段 | 主要特征 | 代表技术 | 典型应用 |
|----------|----------|----------|----------|
| **第一代模型** | 基于规则和统计方法 | 专家系统、决策树、SVM | 简单分类、规则推理 |
| **第二代模型** | 深度学习兴起 | CNN、RNN、LSTM | 图像识别、语音识别 |
| **第三代模型** | 大规模预训练+Transformer | BERT、GPT、T5 | 自然语言理解、生成 |

**技术演进特点：**
1. **数据依赖**：从小数据到大数据，从标注数据到自监督学习
2. **模型复杂度**：从简单规则到深度网络，再到超大规模模型
3. **通用性**：从专用模型到通用模型，支持多任务学习
4. **性能提升**：在各种任务上都有显著的性能提升
`,
    points: 15,
    keywords: ["技术发展", "三代模型", "深度学习", "Transformer"],
    relatedConcepts: ["模型演进", "技术突破", "应用拓展"],
  },
  {
    id: "ts_002",
    type: "single",
    category: "技术发展阶段",
    subCategory: "第三代模型",
    difficulty: "中级",
    question: "第三代AI模型的核心技术突破是什么？",
    options: ["卷积神经网络", "循环神经网络", "Transformer架构", "支持向量机"],
    correctAnswers: [2],
    explanation: "第三代AI模型的核心突破是Transformer架构，它基于自注意力机制，支持并行化训练，显著提升了模型性能。",
    points: 2,
    keywords: ["第三代模型", "Transformer", "自注意力机制"],
    relatedConcepts: ["BERT", "GPT", "预训练模型"],
  },
]

// 扩展现有题库
export const extendedSingleChoiceQuestions: ComprehensiveExamQuestion[] = [
  ...modelClassificationQuestions.filter((q) => q.type === "single"),
  {
    id: "ext_sc_001",
    type: "single",
    category: "模型优化技术",
    difficulty: "中级",
    question: "LoRA（Low-Rank Adaptation）技术的主要作用是什么？",
    options: ["提高模型训练速度", "减少模型推理时间", "高效微调大语言模型", "增加模型参数量"],
    correctAnswers: [2],
    explanation: "LoRA通过低秩分解的方式，在微调大语言模型时只更新少量参数，实现参数高效的微调，大大降低了微调成本。",
    points: 2,
    keywords: ["LoRA", "低秩分解", "参数高效微调"],
    relatedConcepts: ["模型微调", "参数效率", "大语言模型"],
  },
  {
    id: "ext_sc_002",
    type: "single",
    category: "多模态技术",
    difficulty: "高级",
    question: "在多模态模型中，如何实现文本和图像特征的对齐？",
    options: ["简单拼接特征向量", "使用对比学习方法", "只使用注意力机制", "分别训练两个模型"],
    correctAnswers: [1],
    explanation:
      "对比学习是多模态模型中实现跨模态对齐的核心方法，通过最大化匹配样本对的相似度，最小化不匹配样本对的相似度来学习统一的表示空间。",
    points: 3,
    keywords: ["多模态", "对比学习", "特征对齐"],
    relatedConcepts: ["CLIP", "跨模态检索", "相似度学习"],
  },
]

export const extendedMultipleChoiceQuestions: ComprehensiveExamQuestion[] = [
  ...modelClassificationQuestions.filter((q) => q.type === "multiple"),
  {
    id: "ext_mc_001",
    type: "multiple",
    category: "模型部署技术",
    difficulty: "中级",
    question: "在生产环境中部署大语言模型时，需要考虑哪些关键因素？",
    options: ["模型推理延迟", "内存占用大小", "并发处理能力", "模型训练时间"],
    correctAnswers: [0, 1, 2],
    explanation:
      "生产环境部署需要考虑推理延迟（用户体验）、内存占用（硬件成本）、并发能力（服务容量）。模型训练时间是开发阶段的考虑因素。",
    points: 3,
    keywords: ["模型部署", "推理延迟", "并发处理"],
    relatedConcepts: ["生产环境", "性能优化", "服务化"],
  },
]

export const extendedEssayQuestions: ComprehensiveExamQuestion[] = [
  ...modelClassificationQuestions.filter((q) => q.type === "essay"),
  {
    id: "ext_es_001",
    type: "essay",
    category: "AI伦理与安全",
    difficulty: "高级",
    question: "分析大语言模型在实际应用中可能面临的伦理和安全挑战，并提出相应的解决方案",
    correctAnswers: [],
    explanation: `
**主要挑战：**

1. **偏见和歧视**
   - 训练数据中的社会偏见会被模型学习和放大
   - 可能对特定群体产生不公平的输出

2. **虚假信息生成**
   - 模型可能生成看似真实但实际错误的信息
   - 难以区分生成内容的真实性

3. **隐私泄露**
   - 可能泄露训练数据中的敏感信息
   - 通过提示工程可能提取私人信息

4. **恶意使用**
   - 可能被用于生成有害内容
   - 自动化虚假信息传播

**解决方案：**

1. **技术层面**
   - 数据清洗和去偏见处理
   - 对抗训练提高鲁棒性
   - 差分隐私保护技术
   - 内容过滤和安全检测

2. **治理层面**
   - 建立AI伦理委员会
   - 制定使用规范和准则
   - 定期审计和评估
   - 透明度和可解释性要求

3. **社会层面**
   - 提高公众AI素养
   - 多方参与治理
   - 国际合作和标准制定
`,
    points: 20,
    keywords: ["AI伦理", "模型安全", "偏见消除", "隐私保护"],
    relatedConcepts: ["负责任AI", "可解释性", "治理框架"],
  },
]

// 获取所有综合题目
export function getAllComprehensiveQuestions(): ComprehensiveExamQuestion[] {
  return [
    ...modelClassificationQuestions,
    ...extendedSingleChoiceQuestions,
    ...extendedMultipleChoiceQuestions,
    ...extendedEssayQuestions,
  ]
}

// 按分类获取题目
export function getQuestionsByClassification(classification: string): ComprehensiveExamQuestion[] {
  return getAllComprehensiveQuestions().filter((q) => q.category.includes(classification))
}

// 生成分类专项考试
export function generateClassificationExam(config: {
  classifications: string[]
  questionTypes: string[]
  difficulty: string[]
  questionCount: number
}): ComprehensiveExamQuestion[] {
  let availableQuestions = getAllComprehensiveQuestions()

  // 按分类筛选
  if (config.classifications.length > 0) {
    availableQuestions = availableQuestions.filter((q) => config.classifications.some((c) => q.category.includes(c)))
  }

  // 按题型筛选
  if (config.questionTypes.length > 0) {
    availableQuestions = availableQuestions.filter((q) => config.questionTypes.includes(q.type))
  }

  // 按难度筛选
  if (config.difficulty.length > 0) {
    availableQuestions = availableQuestions.filter((q) => config.difficulty.includes(q.difficulty))
  }

  // 随机选择题目
  const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, config.questionCount)
}

// 生成综合考试
export function generateComprehensiveExam(config: {
  topics: string[]
  questionTypes: string[]
  difficulty: string[]
  questionCount: number
}): ComprehensiveExamQuestion[] {
  return generateClassificationExam({
    classifications: config.topics,
    questionTypes: config.questionTypes,
    difficulty: config.difficulty,
    questionCount: config.questionCount,
  })
}
