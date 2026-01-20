#!/usr/bin/env node

/**
 * @fileoverview 安全漏洞修复脚本
 * @description 自动修复已知安全漏洞和配置问题
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 安全修复配置
 */
const SECURITY_FIX_CONFIG = {
  // 需要修复的依赖漏洞
  vulnerableDependencies: {
    'inflight': '^1.0.6', // 已知漏洞版本
  },
  
  // 需要更新的过时依赖
  outdatedDependencies: [
    'jest',
    '@types/jest', 
    'react',
    'react-dom',
    'next',
    'eslint',
    'tailwindcss',
    'typescript'
  ],
  
  // 需要添加的安全依赖
  securityDependencies: [
    'helmet',
    'express-rate-limit',
    'bcryptjs',
    'jsonwebtoken',
    'cors'
  ],
  
  // 需要检查的安全配置文件
  securityFiles: [
    '.env.example',
    '.gitleaks.toml',
    '.eslintrc.json',
    'tsconfig.json',
    'package.json'
  ]
};

/**
 * 日志函数
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 读取JSON文件
 */
function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    log(`读取文件失败: ${filePath}`, 'error');
    return null;
  }
}

/**
 * 写入JSON文件
 */
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    log(`写入文件失败: ${filePath}`, 'error');
    return false;
  }
}

/**
 * 运行命令
 */
function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log(`命令执行失败: ${command}`, 'error');
    return false;
  }
}

/**
 * 检查依赖漏洞
 */
function checkDependencyVulnerabilities() {
  log('开始检查依赖漏洞...');
  
  try {
    const result = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(result);
    
    if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
      log(`发现 ${Object.keys(auditData.vulnerabilities).length} 个漏洞`, 'warn');
      
      Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]) => {
        log(`漏洞: ${pkg} - ${vuln.severity} - ${vuln.title}`, 'warn');
      });
      
      return false;
    } else {
      log('未发现已知漏洞', 'success');
      return true;
    }
  } catch (error) {
    log('漏洞检查失败', 'error');
    return false;
  }
}

/**
 * 修复依赖漏洞
 */
function fixDependencyVulnerabilities() {
  log('开始修复依赖漏洞...');
  
  // 尝试自动修复
  if (runCommand('npm audit fix --force')) {
    log('依赖漏洞修复完成', 'success');
    return true;
  } else {
    log('自动修复失败，尝试手动修复', 'warn');
    
    // 手动更新特定依赖
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = readJsonFile(packageJsonPath);
    
    if (packageJson) {
      // 更新已知有漏洞的依赖
      if (packageJson.dependencies) {
        Object.keys(SECURITY_FIX_CONFIG.vulnerableDependencies).forEach(dep => {
          if (packageJson.dependencies[dep]) {
            packageJson.dependencies[dep] = SECURITY_FIX_CONFIG.vulnerableDependencies[dep];
            log(`更新依赖: ${dep}`, 'info');
          }
        });
      }
      
      if (packageJson.devDependencies) {
        Object.keys(SECURITY_FIX_CONFIG.vulnerableDependencies).forEach(dep => {
          if (packageJson.devDependencies[dep]) {
            packageJson.devDependencies[dep] = SECURITY_FIX_CONFIG.vulnerableDependencies[dep];
            log(`更新开发依赖: ${dep}`, 'info');
          }
        });
      }
      
      if (writeJsonFile(packageJsonPath, packageJson)) {
        log('手动依赖更新完成', 'success');
        return true;
      }
    }
    
    return false;
  }
}

/**
 * 更新过时依赖
 */
function updateOutdatedDependencies() {
  log('开始更新过时依赖...');
  
  try {
    const result = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdatedData = JSON.parse(result);
    
    if (Object.keys(outdatedData).length > 0) {
      log(`发现 ${Object.keys(outdatedData).length} 个过时依赖`, 'warn');
      
      // 更新主要依赖
      const depsToUpdate = SECURITY_FIX_CONFIG.outdatedDependencies.filter(dep => 
        outdatedData[dep]
      );
      
      if (depsToUpdate.length > 0) {
        const updateCommand = `npm update ${depsToUpdate.join(' ')} --save`;
        if (runCommand(updateCommand)) {
          log('过时依赖更新完成', 'success');
        }
      }
      
      return true;
    } else {
      log('未发现过时依赖', 'success');
      return true;
    }
  } catch (error) {
    log('依赖更新检查失败', 'error');
    return false;
  }
}

/**
 * 检查安全配置文件
 */
function checkSecurityFiles() {
  log('开始检查安全配置文件...');
  
  let allFilesExist = true;
  
  SECURITY_FIX_CONFIG.securityFiles.forEach(file => {
    if (fileExists(file)) {
      log(`✓ ${file} 存在`, 'success');
    } else {
      log(`✗ ${file} 不存在`, 'error');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

/**
 * 主修复函数
 */
async function main() {
  log('开始安全漏洞修复...');
  log('='.repeat(50));
  
  // 1. 检查安全配置文件
  if (!checkSecurityFiles()) {
    log('安全配置文件检查失败', 'error');
    process.exit(1);
  }
  
  // 2. 检查依赖漏洞
  if (!checkDependencyVulnerabilities()) {
    log('依赖漏洞检查发现安全问题', 'warn');
    
    // 3. 修复依赖漏洞
    if (!fixDependencyVulnerabilities()) {
      log('依赖漏洞修复失败', 'error');
      process.exit(1);
    }
  }
  
  // 4. 更新过时依赖
  if (!updateOutdatedDependencies()) {
    log('过时依赖更新失败', 'error');
    process.exit(1);
  }
  
  // 5. 安装安全依赖
  log('安装安全依赖...');
  if (runCommand('npm install helmet express-rate-limit bcryptjs jsonwebtoken cors --save')) {
    log('安全依赖安装完成', 'success');
  }
  
  log('='.repeat(50));
  log('安全漏洞修复完成', 'success');
  log('建议运行以下命令进行验证:');
  log('1. npm audit --audit-level=high');
  log('2. npm run lint');
  log('3. npm run type-check');
  log('4. npm test');
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    log(`修复过程出错: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  checkDependencyVulnerabilities,
  fixDependencyVulnerabilities,
  updateOutdatedDependencies,
  checkSecurityFiles
};