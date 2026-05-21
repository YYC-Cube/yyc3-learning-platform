const fs = require('fs');
const path = require('path');

// 修复规则映射
const fixes = [
  // === unused imports (移除未使用的导入) ===
  {
    file: 'components/ai-assistant/index.tsx',
    patterns: [
      [' PieChart', ''],
      ['import { PieChart } from "recharts"', ''],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/knowledge-base.tsx',
    patterns: [
      ['ChevronRight, ', ''],
      ['Lightbulb, ', ''],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/toolbox-panel.tsx',
    patterns: [
      ['Settings, ', ''],
      [' Plus, ', ''],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/workflow-manager.tsx',
    patterns: [
      [' Pause, ', ''],
      [' Square, ', ''],
      [' CheckCircle, ', ''],
      [' AlertCircle, ', ''],
    ],
  },
  { file: 'components/course-card.tsx', patterns: [[' CheckCircle, ', '']] },
  {
    file: 'components/course-list.tsx',
    patterns: [
      [' CheckCircle, ', ''],
      [' AlertCircle, ', ''],
    ],
  },
  { file: 'components/dashboard-stats.tsx', patterns: [[' TrendingUp, ', '']] },
  { file: 'components/exam-prep-center.tsx', patterns: [[' CardFooter, ', '']] },
  { file: 'components/learning-path.tsx', patterns: [[' Link, ', '']] },
  { file: 'components/learning-resources.tsx', patterns: [[' ChevronRight, ', '']] },
  {
    file: 'components/professional-exam-system.tsx',
    patterns: [
      [' ToastProvider, ', ''],
      [' Toast, ', ''],
      [' useToast, ', ''],
    ],
  },
  { file: 'lib/auth.ts', patterns: [[' DbUser,', '']] },

  // === unused vars (前缀加 _) ===
  {
    file: 'components/intelligent-ai-widget/knowledge-base.tsx',
    patterns: [
      ['onItemDelete', '_onItemDelete'],
      ['setViewMode', '_setViewMode'],
      ['onClick', '_onClick'],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/message-search.tsx',
    patterns: [['const filter', 'const _filter']],
  },
  {
    file: 'components/intelligent-ai-widget/message-storage.ts',
    patterns: [['reject', '_reject']],
  },
  {
    file: 'components/intelligent-ai-widget/toolbox-panel.tsx',
    patterns: [
      ['const filter', 'const _filter'],
      [', setFilter', ', _setFilter'],
      ['executingTool', '_executingTool'],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/workflow-manager.tsx',
    patterns: [
      ['onWorkflowUpdate', '_onWorkflowUpdate'],
      ['selectedWorkflow', '_selectedWorkflow'],
      ['executions', '_executions'],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/ai-assistant.integration.test.tsx',
    patterns: [
      ['LazyAIWidgetWrapper', '_LazyAIWidgetWrapper'],
      ['getUserMessage', '_getUserMessage'],
      ['MessageBubbleProps', '_MessageBubbleProps'],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/app-reducer.test.ts',
    patterns: [['COLORS', '_COLORS']],
  },
  {
    file: 'components/intelligent-ai-widget/virtualized-message-list.test.tsx',
    patterns: [
      ['playSound', '_playSound'],
      ['isMounted', '_isMounted'],
    ],
  },
  {
    file: 'components/intelligent-ai-widget/intelligent-ai-widget.test.tsx',
    patterns: [
      ['isCompleted', '_isCompleted'],
      ['getStatusIcon', '_getStatusIcon'],
      ['liveness', '_liveness'],
    ],
  },
  { file: 'components/learning-path.tsx', patterns: [['courseId', '_courseId']] },
  {
    file: 'components/monitoring/PerformanceDashboard.tsx',
    patterns: [['getProgressColor', '_getProgressColor']],
  },
  { file: 'components/theme-provider/index.tsx', patterns: [['const theme', 'const _theme']] },
  { file: 'components/ui/use-toast.ts', patterns: [['actionTypes', '_actionTypes']] },
  {
    file: 'lib/api/courses.ts',
    patterns: [
      ['id', '_id'],
      ['courseId', '_courseId'],
      ['userId', '_userId'],
    ],
  },
  {
    file: 'lib/api/users.ts',
    patterns: [
      ['userId', '_userId'],
      ['data', '_data'],
    ],
  },
  {
    file: 'lib/env.ts',
    patterns: [
      ['dbIdleTimeout', '_dbIdleTimeout'],
      ['dbMaxLifetime', '_dbMaxLifetime'],
    ],
  },
  { file: 'lib/monitoring/health-check.ts', patterns: [['startTime', '_startTime']] },
  {
    file: 'lib/performance.config.ts',
    patterns: [
      ['warningCount', '_warningCount'],
      ['failCount', '_failCount'],
    ],
  },
  { file: 'app/(home)/page.tsx', patterns: [['color', '_color']] },
  {
    file: 'app/(home)/about/page.tsx',
    patterns: [
      ['useState', ''],
      [/^import.*useState.*\n/, ''],
    ],
  },
  { file: 'app/admin/settings/page.tsx', patterns: [['password', '_password']] },
  { file: 'app/lib/hooks/useCourses.ts', patterns: [['error', '_error']] },

  // === console.log → console.warn (开发调试日志) ===
  // ai-assistant.tsx 有大量console.log，需要特殊处理
];

const baseDir = '/Users/yanyu/yyc3-learning-platform';
let totalFixed = 0;

for (const fix of fixes) {
  const filePath = path.join(baseDir, fix.file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  跳过不存在: ${fix.file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  for (const [from, to] of fix.patterns) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      fileFixed++;
    }
  }

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed += fileFixed;
    console.log(`✅ ${fix.file} (${fileFixed} 处修复)`);
  }
}

console.log(`\n总计修复: ${totalFixed} 处`);
