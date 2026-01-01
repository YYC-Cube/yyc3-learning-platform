const fs = require('fs');

// 读取覆盖率报告文件
const coverageData = JSON.parse(fs.readFileSync('./coverage/coverage-final.json', 'utf8'));

// 计算整体覆盖率
let totalStatements = 0;
let coveredStatements = 0;
let totalBranches = 0;
let coveredBranches = 0;
let totalFunctions = 0;
let coveredFunctions = 0;
let totalLines = 0;
let coveredLines = 0;

// 遍历所有文件
Object.values(coverageData).forEach(fileData => {
  // 跳过配置文件和第三方库
  if (fileData.path.includes('node_modules') || fileData.path.includes('.next')) {
    return;
  }
  
  // 累加统计信息（添加空值检查）
  if (fileData.s) {
    totalStatements += Object.keys(fileData.s).length;
    coveredStatements += Object.values(fileData.s).reduce((sum, count) => sum + count, 0);
  }
  
  if (fileData.b) {
    totalBranches += Object.keys(fileData.b).length;
    coveredBranches += Object.values(fileData.b).reduce((sum, branch) => sum + (branch[0] || 0), 0);
  }
  
  if (fileData.f) {
    totalFunctions += Object.keys(fileData.f).length;
    coveredFunctions += Object.values(fileData.f).reduce((sum, count) => sum + count, 0);
  }
  
  if (fileData.l) {
    totalLines += Object.keys(fileData.l).length;
    coveredLines += Object.values(fileData.l).reduce((sum, count) => sum + count, 0);
  }
});

// 计算百分比
const statementCoverage = (coveredStatements / totalStatements * 100).toFixed(2);
const branchCoverage = (coveredBranches / totalBranches * 100).toFixed(2);
const functionCoverage = (coveredFunctions / totalFunctions * 100).toFixed(2);
const lineCoverage = (coveredLines / totalLines * 100).toFixed(2);

// 输出结果
console.log('整体覆盖率报告:');
console.log('========================================');
console.log(`语句覆盖率: ${statementCoverage}% (${coveredStatements}/${totalStatements})`);
console.log(`分支覆盖率: ${branchCoverage}% (${coveredBranches}/${totalBranches})`);
console.log(`函数覆盖率: ${functionCoverage}% (${coveredFunctions}/${totalFunctions})`);
console.log(`行覆盖率: ${lineCoverage}% (${coveredLines}/${totalLines})`);
console.log('========================================');

// 检查是否达到YYC³标准
const yyc3Standard = 80;
console.log('\nYYC³标准检查:');
console.log('========================================');
console.log(`语句覆盖率: ${statementCoverage}% ${parseFloat(statementCoverage) >= yyc3Standard ? '✅' : '🔴'}`);
console.log(`分支覆盖率: ${branchCoverage}% ${parseFloat(branchCoverage) >= yyc3Standard ? '✅' : '🔴'}`);
console.log(`函数覆盖率: ${functionCoverage}% ${parseFloat(functionCoverage) >= yyc3Standard ? '✅' : '🔴'}`);
console.log(`行覆盖率: ${lineCoverage}% ${parseFloat(lineCoverage) >= yyc3Standard ? '✅' : '🔴'}`);

// 生成覆盖率最低的文件列表
console.log('\n覆盖率最低的前10个文件:');
console.log('========================================');
const files = Object.entries(coverageData).map(([path, data]) => {
  // 跳过配置文件和第三方库
  if (path.includes('node_modules') || path.includes('.next')) {
    return null;
  }
  
  const fileStatements = data.s;
  const fileCoveredStatements = Object.values(fileStatements).reduce((sum, count) => sum + count, 0);
  const fileStatementCoverage = Object.keys(fileStatements).length > 0 ? 
    (fileCoveredStatements / Object.keys(fileStatements).length * 100).toFixed(2) : 0;
  
  return {
    path: path.replace('/Users/yanyu/learning-platform/', ''),
    coverage: parseFloat(fileStatementCoverage)
  };
}).filter(file => file !== null)
  .sort((a, b) => a.coverage - b.coverage)
  .slice(0, 10);

files.forEach(file => {
  console.log(`${file.path}: ${file.coverage}%`);
});
