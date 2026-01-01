import type { ExamQuestion, Exam } from "./exam-data"

// 扩展AI基础知识测试题库（新增20题）
export const expandedAiBasicsQuestions: ExamQuestion[] = [
  // 计算机视觉专题
  {
    id: "ai_basic_011",
    type: "single",
    question: "YOLO算法主要用于解决什么问题？",
    options: ["图像分类", "目标检测", "语音识别", "文本生成"],
    correctAnswer: 1,
    explanation: "YOLO（You Only Look Once）是一种实时目标检测算法，能够在图像中同时检测多个目标的位置和类别。",
    points: 3,
    difficulty: "medium",
    category: "计算机视觉",
  },
  {
    id: "ai_basic_012",
    type: "multiple",
    question: "图像预处理常用的技术包括哪些？",
    options: ["数据增强", "归一化", "降维", "特征选择"],
    correctAnswers: [0, 1],
    explanation:
      "图像预处理主要包括数据增强（旋转、缩放、翻转等）和归一化（像素值标准化）。降维和特征选择更多用于传统机器学习。",
    points: 3,
    difficulty: "medium",
    category: "计算机视觉",
  },

  // 自然语言处理专题
  {
    id: "ai_basic_013",
    type: "single",
    question: "Transformer架构的核心创新是什么？",
    options: ["循环神经网络", "自注意力机制", "卷积操作", "池化层"],
    correctAnswer: 1,
    explanation:
      "Transformer的核心创新是自注意力机制（Self-Attention），它能够并行处理序列数据，有效捕捉长距离依赖关系。",
    points: 3,
    difficulty: "medium",
    category: "自然语言处理",
  },
  {
    id: "ai_basic_014",
    type: "essay",
    question: "比较BERT和GPT模型的主要区别，并说明它们各自的优势和应用场景。",
    explanation:
      "BERT是双向编码器，擅长理解任务如问答、分类；GPT是单向生成器，擅长生成任务如文本创作。BERT通过掩码语言模型预训练，GPT通过自回归方式预训练。BERT适合需要深度理解的任务，GPT适合创造性生成任务。",
    points: 15,
    difficulty: "hard",
    category: "自然语言处理",
  },

  // 强化学习专题
  {
    id: "ai_basic_015",
    type: "single",
    question: "在强化学习中，Q-Learning算法的目标是什么？",
    options: ["最小化损失函数", "学习最优的状态-动作价值函数", "最大化准确率", "减少训练时间"],
    correctAnswer: 1,
    explanation: "Q-Learning的目标是学习最优的Q函数（状态-动作价值函数），通过不断更新Q值来找到最优策略。",
    points: 3,
    difficulty: "hard",
    category: "强化学习",
  },
  {
    id: "ai_basic_016",
    type: "multiple",
    question: "强化学习的主要组成要素包括哪些？",
    options: ["智能体（Agent）", "环境（Environment）", "奖励（Reward）", "数据集（Dataset）"],
    correctAnswers: [0, 1, 2],
    explanation:
      "强化学习的主要要素包括智能体、环境、状态、动作和奖励。数据集不是强化学习的核心要素，强化学习通过与环境交互学习。",
    points: 3,
    difficulty: "medium",
    category: "强化学习",
  },

  // AI伦理与安全专题
  {
    id: "ai_basic_017",
    type: "single",
    question: "AI系统中的算法偏见主要来源于什么？",
    options: ["计算能力不足", "训练数据的偏见", "模型结构复杂", "硬件限制"],
    correctAnswer: 1,
    explanation:
      "AI系统的算法偏见主要来源于训练数据中存在的历史偏见和社会偏见，这些偏见会被模型学习并在预测中体现出来。",
    points: 2,
    difficulty: "medium",
    category: "AI伦理",
  },
  {
    id: "ai_basic_018",
    type: "essay",
    question: "讨论AI在招聘过程中可能产生的伦理问题，并提出相应的解决方案。",
    explanation:
      "AI招聘可能产生的问题：1）性别、种族歧视；2）算法黑箱，缺乏透明度；3）历史数据偏见的延续。解决方案：1）数据去偏见处理；2）算法可解释性；3）人工审核机制；4）多元化训练数据；5）定期算法审计。",
    points: 15,
    difficulty: "hard",
    category: "AI伦理",
  },

  // 生成式AI专题
  {
    id: "ai_basic_019",
    type: "single",
    question: "GAN网络中，判别器的作用是什么？",
    options: ["生成新数据", "区分真实数据和生成数据", "优化损失函数", "预处理数据"],
    correctAnswer: 1,
    explanation:
      "在GAN中，判别器（Discriminator）的作用是区分输入数据是真实数据还是生成器生成的假数据，与生成器形成对抗训练。",
    points: 2,
    difficulty: "medium",
    category: "生成式AI",
  },
  {
    id: "ai_basic_020",
    type: "multiple",
    question: "Stable Diffusion模型的主要特点包括哪些？",
    options: ["基于扩散过程", "可以文本到图像生成", "开源可用", "只能生成黑白图像"],
    correctAnswers: [0, 1, 2],
    explanation:
      "Stable Diffusion基于扩散过程，支持文本到图像生成，并且是开源的。它可以生成彩色高质量图像，不仅限于黑白图像。",
    points: 3,
    difficulty: "medium",
    category: "生成式AI",
  },

  // 边缘AI与部署专题
  {
    id: "ai_basic_021",
    type: "single",
    question: "模型量化的主要目的是什么？",
    options: ["提高模型精度", "减少模型大小和推理时间", "增加模型复杂度", "改善训练效果"],
    correctAnswer: 1,
    explanation:
      "模型量化通过降低数值精度（如从32位浮点数到8位整数）来减少模型大小和推理时间，便于在资源受限的设备上部署。",
    points: 3,
    difficulty: "medium",
    category: "模型部署",
  },
  {
    id: "ai_basic_022",
    type: "essay",
    question: "分析边缘AI部署面临的主要挑战，并提出优化策略。",
    explanation:
      "主要挑战：1）计算资源限制；2）存储空间不足；3）功耗约束；4）实时性要求。优化策略：1）模型压缩（剪枝、量化、蒸馏）；2）硬件加速（专用芯片）；3）模型分割（云边协同）；4）缓存优化；5）动态调度。",
    points: 15,
    difficulty: "hard",
    category: "模型部署",
  },

  // AI工具与框架专题
  {
    id: "ai_basic_023",
    type: "multiple",
    question: "以下哪些是主流的机器学习云平台？",
    options: ["Google Cloud AI", "AWS SageMaker", "Azure ML", "Microsoft Word"],
    correctAnswers: [0, 1, 2],
    explanation:
      "Google Cloud AI、AWS SageMaker和Azure ML都是主流的机器学习云平台。Microsoft Word是文档编辑软件，不是ML平台。",
    points: 2,
    difficulty: "easy",
    category: "工具平台",
  },
  {
    id: "ai_basic_024",
    type: "single",
    question: "MLOps的核心理念是什么？",
    options: ["只关注模型训练", "将机器学习工作流程工程化和自动化", "只关注数据收集", "只关注模型部署"],
    correctAnswer: 1,
    explanation:
      "MLOps（Machine Learning Operations）的核心是将机器学习的整个生命周期工程化和自动化，包括数据管理、模型训练、部署、监控等。",
    points: 3,
    difficulty: "medium",
    category: "工程实践",
  },

  // 多模态AI专题
  {
    id: "ai_basic_025",
    type: "single",
    question: "CLIP模型的训练方式是什么？",
    options: ["监督学习", "无监督学习", "对比学习", "强化学习"],
    correctAnswer: 2,
    explanation:
      "CLIP使用对比学习方式训练，通过最大化匹配的文本-图像对的相似度，最小化不匹配对的相似度来学习跨模态表示。",
    points: 3,
    difficulty: "medium",
    category: "多模态AI",
  },
  {
    id: "ai_basic_026",
    type: "essay",
    question: "描述多模态AI在自动驾驶中的应用，包括涉及的数据类型和技术挑战。",
    explanation:
      "数据类型：摄像头图像、激光雷达点云、GPS定位、IMU传感器数据、高精地图。技术挑战：1）多传感器数据融合；2）实时处理要求；3）恶劣天气适应性；4）安全性和可靠性；5）边缘计算优化。应用：目标检测、路径规划、行为预测、决策控制。",
    points: 20,
    difficulty: "hard",
    category: "多模态AI",
  },

  // 大语言模型专题
  {
    id: "ai_basic_027",
    type: "single",
    question: '什么是大语言模型的"涌现能力"？',
    options: ["模型训练速度提升", "模型在达到一定规模后表现出的新能力", "模型内存使用减少", "模型部署变得简单"],
    correctAnswer: 1,
    explanation:
      "涌现能力是指大语言模型在参数规模达到一定阈值后，突然表现出训练时未明确学习的复杂能力，如推理、创作等。",
    points: 3,
    difficulty: "medium",
    category: "大语言模型",
  },
  {
    id: "ai_basic_028",
    type: "multiple",
    question: "大语言模型的训练通常包括哪些阶段？",
    options: ["预训练", "指令微调", "人类反馈强化学习", "数据清洗"],
    correctAnswers: [0, 1, 2],
    explanation:
      "大语言模型训练包括预训练（在大规模文本上学习语言知识）、指令微调（学习遵循指令）、RLHF（根据人类反馈优化）。数据清洗是预处理步骤。",
    points: 4,
    difficulty: "medium",
    category: "大语言模型",
  },

  // AI产业应用专题
  {
    id: "ai_basic_029",
    type: "essay",
    question: "分析AI在金融科技领域的主要应用场景，并讨论相关的风险和监管要求。",
    explanation:
      "应用场景：1）智能风控和反欺诈；2）算法交易；3）智能投顾；4）信用评估；5）客户服务。风险：算法偏见、系统性风险、数据隐私。监管要求：算法透明度、公平性审查、数据保护合规、风险控制机制。",
    points: 20,
    difficulty: "hard",
    category: "产业应用",
  },
  {
    id: "ai_basic_030",
    type: "single",
    question: "在智能制造中，数字孪生技术的主要作用是什么？",
    options: ["替代人工操作", "创建物理系统的虚拟副本进行仿真优化", "存储生产数据", "控制机器设备"],
    correctAnswer: 1,
    explanation: "数字孪生技术通过创建物理制造系统的虚拟副本，实现实时仿真、预测性维护、工艺优化等功能。",
    points: 3,
    difficulty: "medium",
    category: "产业应用",
  },
]

// 扩展Prompt工程师认证题库（新增15题）
export const expandedPromptQuestions: ExamQuestion[] = [
  // 高级Prompt技巧
  {
    id: "prompt_006",
    type: "single",
    question: "什么是Temperature参数在文本生成中的作用？",
    options: ["控制模型训练速度", "控制输出的随机性和创造性", "控制模型大小", "控制输入长度"],
    correctAnswer: 1,
    explanation:
      "Temperature参数控制文本生成的随机性，值越高输出越有创造性但可能不够准确，值越低输出越确定但可能缺乏多样性。",
    points: 3,
    difficulty: "medium",
    category: "参数调优",
  },
  {
    id: "prompt_007",
    type: "essay",
    question:
      "设计一个复杂的Prompt来让AI扮演数据分析师角色，分析电商销售数据并提供业务建议。要求包含角色设定、任务描述、输出格式和约束条件。",
    explanation:
      "示例Prompt：'你是一位资深的电商数据分析师，拥有10年行业经验。请分析以下销售数据：[数据]。任务：1）识别销售趋势和异常；2）分析用户行为模式；3）提供3个具体的业务优化建议。输出格式：使用markdown格式，包含图表描述、关键发现、风险提示。约束：建议必须可执行且有数据支撑，避免过于宽泛的建议。'",
    points: 20,
    difficulty: "hard",
    category: "角色扮演",
  },
  {
    id: "prompt_008",
    type: "multiple",
    question: "以下哪些是有效的Prompt优化策略？",
    options: ["使用具体的示例", "明确指定输出格式", "添加思维链提示", "使用模糊的描述"],
    correctAnswers: [0, 1, 2],
    explanation: "有效的Prompt优化包括使用具体示例、明确输出格式、添加思维链提示。模糊描述会降低Prompt效果。",
    points: 3,
    difficulty: "medium",
    category: "优化策略",
  },

  // 领域专用Prompt
  {
    id: "prompt_009",
    type: "single",
    question: "在代码生成任务中，最重要的Prompt要素是什么？",
    options: ["代码长度", "编程语言、功能需求和代码风格", "变量命名", "注释数量"],
    correctAnswer: 1,
    explanation: "代码生成Prompt应明确指定编程语言、详细的功能需求和期望的代码风格，这样才能生成高质量的代码。",
    points: 2,
    difficulty: "medium",
    category: "代码生成",
  },
  {
    id: "prompt_010",
    type: "essay",
    question: "为创意写作任务设计一个多步骤的Prompt工程流程，包括头脑风暴、大纲制作和内容生成三个阶段。",
    explanation:
      "阶段1-头脑风暴：'请为[主题]生成10个创意角度，每个角度包含核心冲突和独特视角'。阶段2-大纲制作：'选择最有潜力的创意，制作详细大纲：开头、发展、高潮、结局，每部分2-3个要点'。阶段3-内容生成：'基于大纲写作，要求：生动的人物描写、引人入胜的对话、丰富的环境描述，长度约1000字'。",
    points: 18,
    difficulty: "hard",
    category: "创意写作",
  },

  // Prompt安全与伦理
  {
    id: "prompt_011",
    type: "single",
    question: "什么是Prompt注入攻击？",
    options: ["提高Prompt效果的技术", "恶意用户试图操控AI输出的攻击方式", "Prompt优化方法", "数据预处理技术"],
    correctAnswer: 1,
    explanation: "Prompt注入攻击是指恶意用户通过精心设计的输入来操控AI模型，使其产生不当或有害的输出，绕过安全限制。",
    points: 3,
    difficulty: "medium",
    category: "安全防护",
  },
  {
    id: "prompt_012",
    type: "multiple",
    question: "防范Prompt注入攻击的方法包括哪些？",
    options: ["输入过滤和验证", "输出内容审查", "用户权限控制", "增加Prompt长度"],
    correctAnswers: [0, 1, 2],
    explanation: "防范措施包括输入过滤验证、输出内容审查、用户权限控制等。增加Prompt长度不是有效的防护方法。",
    points: 3,
    difficulty: "medium",
    category: "安全防护",
  },

  // 多模态Prompt
  {
    id: "prompt_013",
    type: "single",
    question: "在图像生成任务中，负面提示词（Negative Prompt）的作用是什么？",
    options: ["增加图像质量", "指定不希望出现在图像中的元素", "加快生成速度", "减少计算成本"],
    correctAnswer: 1,
    explanation: "负面提示词用于指定不希望在生成图像中出现的元素、风格或特征，帮助模型避免生成不需要的内容。",
    points: 2,
    difficulty: "medium",
    category: "图像生成",
  },
  {
    id: "prompt_014",
    type: "essay",
    question:
      "设计一个完整的图像生成Prompt，要求生成一幅科幻主题的概念艺术作品，包含正面描述、风格指定、技术参数和负面提示。",
    explanation:
      "正面Prompt：'未来城市天际线，赛博朋克风格，霓虹灯光，飞行汽车，高耸的摩天大楼，夜晚场景，雨后湿润的街道反射，细节丰富，8K分辨率，概念艺术风格'。风格：'by Syd Mead, Blade Runner aesthetic, cinematic lighting'。技术参数：'ultra detailed, photorealistic, dramatic lighting, wide angle'。负面提示：'blurry, low quality, cartoon, anime, oversaturated, people, crowds'。",
    points: 15,
    difficulty: "hard",
    category: "图像生成",
  },

  // 商业应用Prompt
  {
    id: "prompt_015",
    type: "single",
    question: "在客户服务场景中，Prompt设计的关键原则是什么？",
    options: ["追求技术复杂性", "确保回复的准确性、友好性和有用性", "使用专业术语", "回复越长越好"],
    correctAnswer: 1,
    explanation: "客户服务Prompt应确保AI回复准确、友好、有用，能够真正解决客户问题，同时保持专业和礼貌的语调。",
    points: 2,
    difficulty: "easy",
    category: "客户服务",
  },
  {
    id: "prompt_016",
    type: "essay",
    question: "为电商平台设计一个智能客服的Prompt系统，需要处理订单查询、退换货、产品咨询三类问题。",
    explanation:
      "系统Prompt：'你是专业的电商客服助手，友好、耐心、准确。根据用户问题类型提供帮助：1）订单查询：核实订单号，提供物流信息，解释订单状态；2）退换货：了解具体原因，说明政策，指导操作流程；3）产品咨询：提供详细信息，对比推荐，解答疑虑。始终保持礼貌，如无法解决请转人工客服。回复格式：问题确认+解决方案+后续建议。'",
    points: 18,
    difficulty: "hard",
    category: "客户服务",
  },

  // 评估与测试
  {
    id: "prompt_017",
    type: "multiple",
    question: "评估Prompt效果的指标包括哪些？",
    options: ["准确性", "相关性", "创造性", "Prompt长度"],
    correctAnswers: [0, 1, 2],
    explanation:
      "Prompt效果评估主要看准确性（输出是否正确）、相关性（是否符合需求）、创造性（是否有新颖见解）。Prompt长度不是评估指标。",
    points: 3,
    difficulty: "medium",
    category: "效果评估",
  },
  {
    id: "prompt_018",
    type: "single",
    question: "A/B测试在Prompt优化中的作用是什么？",
    options: ["增加Prompt复杂度", "比较不同Prompt版本的效果", "减少测试时间", "提高模型性能"],
    correctAnswer: 1,
    explanation: "A/B测试通过对比不同Prompt版本在相同任务上的表现，帮助识别最有效的Prompt设计。",
    points: 2,
    difficulty: "medium",
    category: "效果评估",
  },

  // 行业应用案例
  {
    id: "prompt_019",
    type: "essay",
    question: "分析Prompt工程在教育领域的应用潜力，设计一个个性化学习助手的Prompt框架。",
    explanation:
      "应用潜力：个性化教学、智能答疑、作业批改、学习路径规划。Prompt框架：'你是个性化学习助手，根据学生[年级][学科][学习水平]提供帮助。任务：1）分析学习问题，提供易懂解释；2）设计练习题巩固知识；3）推荐学习资源；4）跟踪学习进度。原则：因材施教、循序渐进、鼓励为主。输出：结构化建议+具体行动步骤。'",
    points: 20,
    difficulty: "hard",
    category: "教育应用",
  },
  {
    id: "prompt_020",
    type: "single",
    question: "在医疗咨询场景中，Prompt设计必须特别注意什么？",
    options: ["使用复杂医学术语", "免责声明和建议就医", "提供确定性诊断", "推荐特定药物"],
    correctAnswer: 1,
    explanation: "医疗咨询Prompt必须包含免责声明，强调AI不能替代专业医生，建议用户就医咨询，避免提供确定性诊断。",
    points: 3,
    difficulty: "medium",
    category: "医疗应用",
  },
]

// 扩展AI应用开发题库（新增25题）
export const expandedDevelopmentQuestions: ExamQuestion[] = [
  // 系统架构设计
  {
    id: "dev_004",
    type: "single",
    question: "微服务架构在AI应用中的主要优势是什么？",
    options: ["降低开发成本", "提高系统可扩展性和维护性", "减少代码量", "提高运行速度"],
    correctAnswer: 1,
    explanation: "微服务架构允许AI应用的不同组件独立开发、部署和扩展，提高了系统的可扩展性和维护性。",
    points: 3,
    difficulty: "medium",
    category: "系统架构",
  },
  {
    id: "dev_005",
    type: "essay",
    question: "设计一个大规模推荐系统的技术架构，包括数据层、算法层、服务层和前端展示层。",
    explanation:
      "数据层：用户行为数据、商品信息、实时流数据处理。算法层：协同过滤、深度学习模型、实时推荐引擎。服务层：推荐API、A/B测试、缓存系统。前端层：个性化展示、用户反馈收集。关键技术：分布式计算、实时数据处理、模型服务化、负载均衡。",
    points: 25,
    difficulty: "hard",
    category: "系统设计",
  },

  // 数据工程
  {
    id: "dev_006",
    type: "multiple",
    question: "AI应用的数据管道通常包括哪些组件？",
    options: ["数据采集", "数据清洗", "特征工程", "用户界面"],
    correctAnswers: [0, 1, 2],
    explanation: "AI数据管道包括数据采集、清洗、特征工程、存储等组件。用户界面属于应用层，不是数据管道的组件。",
    points: 3,
    difficulty: "medium",
    category: "数据工程",
  },
  {
    id: "dev_007",
    type: "single",
    question: "什么是数据漂移（Data Drift）？",
    options: ["数据存储位置改变", "训练数据和生产数据分布发生变化", "数据传输延迟", "数据格式转换"],
    correctAnswer: 1,
    explanation: "数据漂移是指生产环境中的数据分布与训练时的数据分布发生变化，可能导致模型性能下降。",
    points: 3,
    difficulty: "medium",
    category: "数据工程",
  },

  // 模型开发与训练
  {
    id: "dev_008",
    type: "single",
    question: "在深度学习模型训练中，什么是学习率调度？",
    options: ["安排训练时间", "动态调整学习率大小", "分配计算资源", "选择优化算法"],
    correctAnswer: 1,
    explanation: "学习率调度是指在训练过程中动态调整学习率的策略，如逐步衰减、周期性调整等，以提高训练效果。",
    points: 2,
    difficulty: "medium",
    category: "模型训练",
  },
  {
    id: "dev_009",
    type: "essay",
    question: "解释什么是迁移学习，并描述在计算机视觉项目中如何实施迁移学习的完整流程。",
    explanation:
      "迁移学习是利用预训练模型的知识来解决新任务。流程：1）选择合适的预训练模型（如ResNet、VGG）；2）冻结底层特征提取层；3）替换顶层分类器；4）在新数据集上微调；5）逐步解冻更多层进行精细调优；6）验证和测试。优势：减少训练时间、提高小数据集性能。",
    points: 18,
    difficulty: "medium",
    category: "模型训练",
  },

  // 模型部署与运维
  {
    id: "dev_010",
    type: "single",
    question: "什么是模型版本控制的重要性？",
    options: ["节省存储空间", "跟踪模型变化，支持回滚和比较", "加快训练速度", "减少代码复杂度"],
    correctAnswer: 1,
    explanation: "模型版本控制帮助跟踪模型的变化历史，支持不同版本间的比较、回滚到稳定版本，是MLOps的重要组成部分。",
    points: 2,
    difficulty: "easy",
    category: "模型运维",
  },
  {
    id: "dev_011",
    type: "multiple",
    question: "容器化部署AI模型的优势包括哪些？",
    options: ["环境一致性", "易于扩展", "资源隔离", "提高模型精度"],
    correctAnswers: [0, 1, 2],
    explanation:
      "容器化提供环境一致性、易于扩展、资源隔离等优势。它不会直接提高模型精度，精度主要取决于模型本身和数据质量。",
    points: 3,
    difficulty: "medium",
    category: "模型部署",
  },

  // 性能优化
  {
    id: "dev_012",
    type: "single",
    question: "GPU并行计算在深度学习中的主要作用是什么？",
    options: ["减少内存使用", "加速矩阵运算和并行处理", "提高模型精度", "简化代码编写"],
    correctAnswer: 1,
    explanation: "GPU具有大量并行计算核心，特别适合深度学习中的矩阵运算和并行处理，能显著加速模型训练和推理。",
    points: 2,
    difficulty: "easy",
    category: "性能优化",
  },
  {
    id: "dev_013",
    type: "essay",
    question: "分析大规模深度学习模型推理优化的策略，包括硬件和软件层面的优化方法。",
    explanation:
      "硬件优化：1）GPU/TPU加速；2）专用AI芯片；3）内存优化；4）分布式推理。软件优化：1）模型量化（INT8/FP16）；2）模型剪枝；3）知识蒸馏；4）动态批处理；5）缓存策略；6）异步处理。系统优化：负载均衡、预热机制、监控告警。",
    points: 20,
    difficulty: "hard",
    category: "性能优化",
  },

  // 安全与隐私
  {
    id: "dev_014",
    type: "single",
    question: "什么是联邦学习？",
    options: ["多个模型联合预测", "在保护数据隐私的前提下进行分布式机器学习", "模型集成方法", "并行训练技术"],
    correctAnswer: 1,
    explanation: "联邦学习允许多个参与方在不共享原始数据的情况下协作训练机器学习模型，保护了数据隐私。",
    points: 3,
    difficulty: "medium",
    category: "隐私保护",
  },
  {
    id: "dev_015",
    type: "multiple",
    question: "AI应用的安全威胁包括哪些？",
    options: ["对抗样本攻击", "模型窃取", "数据投毒", "界面美观度"],
    correctAnswers: [0, 1, 2],
    explanation: "AI安全威胁包括对抗样本攻击、模型窃取、数据投毒等。界面美观度是用户体验问题，不是安全威胁。",
    points: 3,
    difficulty: "medium",
    category: "AI安全",
  },

  // 监控与运维
  {
    id: "dev_016",
    type: "single",
    question: "模型监控中最重要的指标是什么？",
    options: ["服务器CPU使用率", "模型准确率和性能指标", "代码行数", "用户界面响应时间"],
    correctAnswer: 1,
    explanation: "模型监控最重要的是跟踪模型的准确率、精确率、召回率等性能指标，以及数据漂移、模型退化等问题。",
    points: 2,
    difficulty: "easy",
    category: "模型监控",
  },
  {
    id: "dev_017",
    type: "essay",
    question: "设计一个完整的AI模型监控系统，包括监控指标、告警机制和自动化响应策略。",
    explanation:
      "监控指标：1）性能指标（准确率、延迟、吞吐量）；2）数据质量（完整性、一致性）；3）系统资源（CPU、内存、GPU）；4）业务指标（转化率、用户满意度）。告警机制：阈值告警、异常检测、趋势分析。自动响应：模型回滚、流量切换、资源扩容、人工介入。",
    points: 22,
    difficulty: "hard",
    category: "模型监控",
  },

  // 云原生AI
  {
    id: "dev_018",
    type: "single",
    question: "Kubernetes在AI应用部署中的主要作用是什么？",
    options: ["提高模型精度", "容器编排和资源管理", "数据预处理", "模型训练加速"],
    correctAnswer: 1,
    explanation: "Kubernetes提供容器编排和资源管理功能，支持AI应用的自动化部署、扩缩容和故障恢复。",
    points: 2,
    difficulty: "medium",
    category: "云原生",
  },
  {
    id: "dev_019",
    type: "multiple",
    question: "云原生AI平台的核心组件包括哪些？",
    options: ["容器运行时", "服务网格", "CI/CD流水线", "数据库管理系统"],
    correctAnswers: [0, 1, 2],
    explanation: "云原生AI平台包括容器运行时、服务网格、CI/CD流水线等组件。数据库是基础设施，不是云原生特有组件。",
    points: 3,
    difficulty: "medium",
    category: "云原生",
  },

  // API设计与集成
  {
    id: "dev_020",
    type: "single",
    question: "RESTful API设计中，哪个HTTP方法用于获取资源？",
    options: ["POST", "GET", "PUT", "DELETE"],
    correctAnswer: 1,
    explanation: "GET方法用于获取资源，POST用于创建，PUT用于更新，DELETE用于删除。这是RESTful API的标准约定。",
    points: 1,
    difficulty: "easy",
    category: "API设计",
  },
  {
    id: "dev_021",
    type: "essay",
    question: "设计一个AI图像识别服务的API接口，包括请求格式、响应格式、错误处理和性能考虑。",
    explanation:
      "请求：POST /api/v1/image/classify，支持multipart/form-data上传图片，包含confidence阈值参数。响应：JSON格式，包含预测类别、置信度、处理时间。错误处理：标准HTTP状态码，详细错误信息。性能考虑：异步处理、批量请求、缓存机制、限流策略、超时设置。",
    points: 18,
    difficulty: "medium",
    category: "API设计",
  },

  // 测试与质量保证
  {
    id: "dev_022",
    type: "multiple",
    question: "AI应用的测试类型包括哪些？",
    options: ["单元测试", "集成测试", "模型性能测试", "界面颜色测试"],
    correctAnswers: [0, 1, 2],
    explanation:
      "AI应用测试包括传统的单元测试、集成测试，以及特有的模型性能测试、数据质量测试等。界面颜色属于UI测试范畴。",
    points: 3,
    difficulty: "medium",
    category: "质量保证",
  },
  {
    id: "dev_023",
    type: "single",
    question: "什么是A/B测试在AI产品中的应用？",
    options: ["测试代码错误", "比较不同模型或策略的效果", "测试服务器性能", "检查数据格式"],
    correctAnswer: 1,
    explanation: "A/B测试用于比较不同AI模型、算法或策略在真实用户环境中的表现，帮助选择最优方案。",
    points: 2,
    difficulty: "easy",
    category: "质量保证",
  },

  // 成本优化
  {
    id: "dev_024",
    type: "single",
    question: "云端AI服务的成本优化策略不包括哪项？",
    options: ["按需扩缩容", "使用预留实例", "模型压缩", "增加服务器数量"],
    correctAnswer: 3,
    explanation: "成本优化策略包括按需扩缩容、预留实例、模型压缩等。盲目增加服务器数量会增加成本，不是优化策略。",
    points: 2,
    difficulty: "easy",
    category: "成本优化",
  },
  {
    id: "dev_025",
    type: "essay",
    question: "分析企业级AI应用的TCO（总拥有成本）构成，并提出成本优化建议。",
    explanation:
      "TCO构成：1）基础设施成本（计算、存储、网络）；2）软件许可费用；3）人力成本（开发、运维）；4）数据成本；5）合规成本。优化建议：1）云原生架构降低基础设施成本；2）开源工具减少许可费用；3）自动化运维降低人力成本；4）数据治理提高数据质量；5）预防性合规降低风险成本。",
    points: 20,
    difficulty: "hard",
    category: "成本优化",
  },

  // 行业应用案例
  {
    id: "dev_026",
    type: "single",
    question: "在智慧城市项目中，边缘计算的主要优势是什么？",
    options: ["降低硬件成本", "减少网络延迟，提高实时性", "简化系统架构", "提高数据安全性"],
    correctAnswer: 1,
    explanation: "边缘计算将计算能力部署在数据源附近，减少了数据传输延迟，提高了智慧城市应用的实时响应能力。",
    points: 2,
    difficulty: "medium",
    category: "行业应用",
  },
  {
    id: "dev_027",
    type: "essay",
    question: "设计一个智能制造质量检测系统的完整解决方案，包括硬件配置、软件架构和业务流程。",
    explanation:
      "硬件：工业相机、光源系统、传送带、边缘计算设备、PLC控制器。软件架构：图像采集模块、AI检测引擎、数据管理系统、可视化界面、MES集成。业务流程：产品上线→图像采集→AI检测→质量判定→数据记录→异常处理→统计分析。关键技术：实时图像处理、缺陷检测算法、工业通信协议。",
    points: 25,
    difficulty: "hard",
    category: "行业应用",
  },

  // 新兴技术
  {
    id: "dev_028",
    type: "single",
    question: "什么是AutoML？",
    options: ["自动驾驶技术", "自动化机器学习流程", "自动代码生成", "自动数据收集"],
    correctAnswer: 1,
    explanation:
      "AutoML（Automated Machine Learning）是自动化机器学习流程的技术，包括特征工程、模型选择、超参数优化等步骤的自动化。",
    points: 2,
    difficulty: "medium",
    category: "新兴技术",
  },
]

// 合并所有扩展题库
export const allExpandedQuestions = {
  aiBasics: expandedAiBasicsQuestions,
  promptEngineering: expandedPromptQuestions,
  aiDevelopment: expandedDevelopmentQuestions,
}

// 更新考试数据
export const expandedExams: Exam[] = [
  {
    id: "1",
    title: "AI基础知识测试",
    description: "全面测试您对人工智能各个领域的理解，包括机器学习、深度学习、计算机视觉、自然语言处理等",
    duration: 60,
    difficulty: "初级-中级",
    category: "基础理论",
    questions: expandedAiBasicsQuestions,
  },
  {
    id: "2",
    title: "Prompt工程师认证考试",
    description: "深度评估您的Prompt设计能力，涵盖基础技巧、高级策略、安全防护和商业应用",
    duration: 90,
    difficulty: "中级-高级",
    category: "Prompt工程",
    questions: expandedPromptQuestions,
  },
  {
    id: "3",
    title: "AI应用开发综合测评",
    description: "全方位测试AI应用开发技能，包括系统设计、模型部署、性能优化、安全防护等",
    duration: 120,
    difficulty: "高级",
    category: "开发实战",
    questions: expandedDevelopmentQuestions,
  },
]
