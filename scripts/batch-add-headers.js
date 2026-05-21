const fs = require('fs');
const path = require('path');

const DESCRIPTIONS = {
  page: '页面组件',
  route: 'API路由',
  loading: '加载状态组件',
  layout: '布局组件',
  provider: 'Context Provider',
  component: 'UI组件',
  util: '工具函数/库',
  hook: '自定义Hook',
  config: '配置文件',
  test: '测试文件',
};

function detectType(filePath) {
  const name = path.basename(filePath);
  if (name.includes('.test.') || name.includes('.spec.')) return 'test';
  if (name === 'route.ts' || name.endsWith('/route.ts')) return 'route';
  if (name === 'loading.tsx') return 'loading';
  if (name.startsWith('use') && !name.includes('.')) return 'hook';
  if (filePath.includes('/providers/') || name.includes('Provider')) return 'provider';
  if (filePath.includes('app/') && (name === 'page.tsx' || name === 'page.ts')) return 'page';
  if (filePath.includes('components/')) return 'component';
  if (filePath.includes('lib/')) return 'util';
  return 'file';
}

function generateHeader(filePath) {
  const relPath = filePath.replace(process.cwd() + '/', '');
  const name = path.basename(filePath);
  const type = detectType(filePath);
  const desc = DESCRIPTIONS[type] || '源代码文件';
  const today = new Date().toISOString().split('T')[0];

  return `/**
 * @fileoverview ${desc} · ${name}
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
`;
}

const TARGET_DIRS = ['components', 'lib', 'app'];
let updated = 0;
let skipped = 0;

function walk(dir) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === '.next') continue;
      const full = path.join(dir, item);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (
        (item.endsWith('.ts') || item.endsWith('.tsx')) &&
        !item.match(/\.(test|spec)\./) &&
        item !== 'next-env.d.ts'
      ) {
        // Only process files in target directories
        const relPath = full.replace(process.cwd() + path.sep, '');
        if (!TARGET_DIRS.some((d) => relPath.startsWith(d + '/') || relPath.startsWith(d + '\\')))
          continue;

        try {
          const content = fs.readFileSync(full, 'utf8');
          const trimmed = content.trimStart();

          // Check if already has proper header
          if (trimmed.startsWith('/**') && trimmed.includes('@fileoverview')) {
            skipped++;
            continue;
          }

          // Remove any existing incomplete header
          let body = content;
          if (trimmed.startsWith('/**')) {
            const endIdx = content.indexOf('*/');
            if (endIdx !== -1) {
              body = content.substring(endIdx + 2).replace(/^\n/, '');
            }
          }

          const header = generateHeader(full);
          fs.writeFileSync(full, header + body, 'utf8');
          updated++;
          console.log(`  ✅ ${relPath}`);
        } catch (e) {}
      }
    }
  } catch (e) {}
}

console.log('🔧 YYC³ 标准文件头批量添加\n');
TARGET_DIRS.forEach((d) => walk(path.join(process.cwd(), d)));
console.log(`\n📊 结果: 更新 ${updated} | 跳过 ${skipped}`);
