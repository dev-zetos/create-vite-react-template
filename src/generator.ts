/**
 * 项目生成器
 */

import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { UserOptions, ModuleType } from './constants.js';
import {
  getTemplatesDir,
  copyDir,
  renderTemplate,
  mergePackageJson,
  getInstallCommand,
  getRunCommand,
  isDirEmpty,
} from './utils.js';

const execAsync = promisify(exec);

/**
 * 生成项目
 */
export async function generateProject(options: UserOptions): Promise<void> {
  const { projectName, modules, packageManager, installDeps } = options;
  const targetDir = path.resolve(process.cwd(), projectName);
  const templatesDir = getTemplatesDir();
  const baseTemplateDir = path.join(templatesDir, 'base');
  const modulesDir = path.join(templatesDir, 'modules');

  // 检查目标目录
  if (await fs.pathExists(targetDir)) {
    const isEmpty = await isDirEmpty(targetDir);
    if (!isEmpty) {
      const shouldOverwrite = await p.confirm({
        message: `目录 ${pc.cyan(projectName)} 已存在且非空，是否覆盖？`,
        initialValue: false,
      });

      if (!shouldOverwrite || p.isCancel(shouldOverwrite)) {
        p.cancel('操作已取消');
        process.exit(0);
      }

      await fs.emptyDir(targetDir);
    }
  }

  // 创建目标目录
  await fs.ensureDir(targetDir);

  const spinner = p.spinner();

  // 1. 复制基础模板
  spinner.start('正在创建项目...');

  try {
    // 复制基础模板（排除 .hbs 文件，它们需要单独处理）
    await copyDir(baseTemplateDir, targetDir, {
      filter: (src) => !src.endsWith('.hbs'),
    });

    // 处理模板文件
    const hbsFiles = await findHbsFiles(baseTemplateDir);
    for (const hbsFile of hbsFiles) {
      const relativePath = path.relative(baseTemplateDir, hbsFile);
      const destPath = path.join(targetDir, relativePath);
      await fs.ensureDir(path.dirname(destPath));
      await renderTemplate(hbsFile, destPath, {
        projectName,
      });
    }

    spinner.stop('项目结构创建完成');
  } catch (error) {
    spinner.stop('项目创建失败');
    throw error;
  }

  // 2. 复制选中的模块
  if (modules.length > 0) {
    spinner.start('正在集成选中的模块...');

    try {
      for (const moduleName of modules) {
        await integrateModule(moduleName, modulesDir, targetDir);
      }
      spinner.stop(`已集成 ${modules.length} 个模块`);
    } catch (error) {
      spinner.stop('模块集成失败');
      throw error;
    }
  }

  // 3. 安装依赖
  if (installDeps) {
    spinner.start('正在安装依赖...');

    try {
      const installCmd = getInstallCommand(packageManager);
      await execAsync(installCmd, { cwd: targetDir });
      spinner.stop('依赖安装完成');
    } catch (error) {
      spinner.stop('依赖安装失败，请手动安装');
      console.error(pc.yellow(`请进入项目目录后运行: ${getInstallCommand(packageManager)}`));
    }
  }

  // 4. 显示成功信息
  const runCmd = getRunCommand(packageManager);

  p.note(
    `${pc.cyan('cd')} ${projectName}\n${pc.cyan(runCmd)}`,
    '下一步'
  );

  p.outro(`🎉 ${pc.green('项目创建成功！')}`);

  // 显示已集成的模块
  if (modules.length > 0) {
    console.log();
    console.log(pc.dim('已集成的模块:'));
    modules.forEach((m) => {
      console.log(pc.dim(`  - ${m}`));
    });
  }
}

/**
 * 查找所有 .hbs 模板文件
 */
async function findHbsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.hbs')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

/**
 * 集成单个模块
 */
async function integrateModule(
  moduleName: ModuleType,
  modulesDir: string,
  targetDir: string
): Promise<void> {
  const moduleDir = path.join(modulesDir, moduleName);

  if (!(await fs.pathExists(moduleDir))) {
    console.warn(pc.yellow(`警告: 模块 ${moduleName} 不存在，跳过`));
    return;
  }

  // 复制模块的 src 目录内容
  const moduleSrcDir = path.join(moduleDir, 'src');
  if (await fs.pathExists(moduleSrcDir)) {
    await copyDir(moduleSrcDir, path.join(targetDir, 'src'));
  }

  // 合并依赖
  const depsFile = path.join(moduleDir, 'dependencies.json');
  const targetPkgFile = path.join(targetDir, 'package.json');

  if (await fs.pathExists(depsFile)) {
    await mergePackageJson(targetPkgFile, depsFile);
  }
}
