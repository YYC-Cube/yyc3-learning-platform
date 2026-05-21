const fs = require('fs');
const path = require('path');

const COMPONENT_DESCRIPTIONS = {
  accordion: '手风琴UI组件，提供可折叠的内容面板',
  alert: '警告提示UI组件',
  'alert-dialog': '确认对话框UI组件',
  'aspect-ratio': '宽高比容器组件',
  avatar: '头像显示组件',
  badge: '徽章UI组件',
  breadcrumb: '面包屑导航组件',
  button: '按钮UI组件',
  'button-group': '按钮组组件',
  calendar: '日历选择组件',
  card: '卡片UI组件',
  carousel: '轮播图组件',
  checkbox: '复选框组件',
  collapsible: '可折叠面板组件',
  command: '命令菜单组件',
  'context-menu': '右键菜单组件',
  chart: '图表组件',
  dialog: '对话框UI组件',
  drawer: '抽屉组件',
  'dropdown-menu': '下拉菜单组件',
  empty: '空状态占位组件',
  field: '表单字段组件',
  form: '表单容器组件',
  'hover-card': '悬停卡片组件',
  input: '输入框UI组件',
  'input-group': '输入框组合组件',
  'input-otp': 'OTP验证码输入组件',
  item: '列表项组件',
  label: '标签组件',
  menubar: '菜单栏组件',
  'navigation-menu': '导航菜单组件',
  pagination: '分页组件',
  popover: '弹出框组件',
  progress: '进度条组件',
  'radio-group': '单选按钮组组件',
  resizable: '可调整大小容器组件',
  'scroll-area': '滚动区域组件',
  select: '选择器组件',
  separator: '分隔线组件',
  sheet: '侧边面板组件',
  sidebar: '侧边栏组件',
  skeleton: '骨架屏加载组件',
  slider: '滑块组件',
  sonner: 'Toast通知组件(sonner)',
  spinner: '加载旋转指示器',
  switch: '开关切换组件',
  table: '表格组件',
  tabs: '选项卡组件',
  textarea: '多行文本输入组件',
  toggle: '切换按钮组件',
  'toggle-group': '切换按钮组组件',
  toast: 'Toast提示组件',
  toaster: 'Toast容器组件',
  tooltip: '工具提示组件',
  kbd: '键盘按键展示组件',
  'link-button': '链接按钮组件',
  'use-mobile': '移动端检测Hook',
};

function getHeader(name) {
  const desc = COMPONENT_DESCRIPTIONS[name] || `${name} UI组件`;
  return `/**
 * @fileoverview ${desc}
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT */
`;
}

const uiDir = path.join(__dirname, '..', 'components', 'ui');
let updatedCount = 0;
let skippedCount = 0;

try {
  const files = fs
    .readdirSync(uiDir)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => ({ name: f, fullPath: path.join(uiDir, f) }));

  for (const file of files) {
    const content = fs.readFileSync(file.fullPath, 'utf-8');
    const fileName = file.name.replace('.tsx', '');

    if (content.includes('@fileoverview')) {
      skippedCount++;
      continue;
    }

    const header = getHeader(fileName);
    let newContent;

    if (content.startsWith("'use client'")) {
      newContent =
        "'use client'\n\n" +
        header +
        '\n' +
        content.slice("'use client'".length).replace(/^\n+/, '');
    } else {
      newContent = header + '\n' + content;
    }

    fs.writeFileSync(file.fullPath, newContent);
    updatedCount++;
    console.log(`✅ ${fileName}.tsx`);
  }

  console.log(`\n📊 统计:`);
  console.log(`   ✅ 已更新: ${updatedCount} 个文件`);
  console.log(`   ⏭️ 已跳过: ${skippedCount} 个文件（已有注释头）`);
} catch (err) {
  console.error('错误:', err.message);
}
