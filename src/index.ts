/**
 * CLI 入口
 */

import cac from 'cac';
import { VERSION, CLI_NAME } from './constants.js';
import { runPrompts } from './prompts.js';
import { generateProject } from './generator.js';

const cli = cac(CLI_NAME);

cli
  .command('[project-name]', '创建新项目')
  .option('--force', '强制覆盖已存在的目录')
  .action(async (projectName: string | undefined) => {
    try {
      // 运行交互式提示
      const options = await runPrompts(projectName);

      if (!options) {
        process.exit(1);
      }

      // 生成项目
      await generateProject(options);
    } catch (error) {
      console.error('错误:', error);
      process.exit(1);
    }
  });

cli.help();
cli.version(VERSION);

cli.parse();
