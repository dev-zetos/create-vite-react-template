/**
 * 工具函数
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { PackageManager } from './constants.js';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取模板目录路径
 */
export function getTemplatesDir(): string {
  // 从 dist 目录向上一级，再进入 templates
  return path.resolve(__dirname, '..', 'templates');
}

/**
 * 检查目录是否存在且非空
 */
export async function isDirEmpty(dir: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dir);
    return files.length === 0;
  } catch {
    return true; // 目录不存在视为空
  }
}

/**
 * 复制目录，排除特定文件
 */
export async function copyDir(
  src: string,
  dest: string,
  options?: {
    filter?: (src: string, dest: string) => boolean;
  }
): Promise<void> {
  await fs.copy(src, dest, {
    overwrite: true,
    filter: options?.filter,
  });
}

/**
 * 读取并替换模板变量
 */
export async function renderTemplate(
  templatePath: string,
  destPath: string,
  variables: Record<string, string>
): Promise<void> {
  let content = await fs.readFile(templatePath, 'utf-8');

  // 替换所有 {{variable}} 形式的占位符
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    content = content.replace(regex, value);
  }

  // 写入目标文件（去掉 .hbs 后缀）
  const finalPath = destPath.replace(/\.hbs$/, '');
  await fs.writeFile(finalPath, content, 'utf-8');
}

/**
 * 合并 package.json 依赖
 */
export async function mergePackageJson(
  basePath: string,
  moduleDepsPath: string
): Promise<void> {
  const basePkg = await fs.readJson(basePath);
  const moduleDeps = await fs.readJson(moduleDepsPath);

  // 合并 dependencies
  if (moduleDeps.dependencies) {
    basePkg.dependencies = {
      ...basePkg.dependencies,
      ...moduleDeps.dependencies,
    };
  }

  // 合并 devDependencies
  if (moduleDeps.devDependencies) {
    basePkg.devDependencies = {
      ...basePkg.devDependencies,
      ...moduleDeps.devDependencies,
    };
  }

  await fs.writeJson(basePath, basePkg, { spaces: 2 });
}

/**
 * 获取包管理器安装命令
 */
export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn';
    case 'npm':
    default:
      return 'npm install';
  }
}

/**
 * 获取包管理器运行命令
 */
export function getRunCommand(pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm dev';
    case 'yarn':
      return 'yarn dev';
    case 'npm':
    default:
      return 'npm run dev';
  }
}

/**
 * 检查包管理器是否可用
 */
export async function isPmAvailable(pm: PackageManager): Promise<boolean> {
  const { exec } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execAsync = promisify(exec);

  try {
    await execAsync(`${pm} --version`);
    return true;
  } catch {
    return false;
  }
}
