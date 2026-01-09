/**
 * 交互提示模块
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';
import { OPTIONAL_MODULES, PACKAGE_MANAGERS, VERSION, CLI_NAME } from './constants.js';
import type { UserOptions, ModuleType, PackageManager } from './constants.js';

/**
 * 运行交互式提示，获取用户选择
 */
export async function runPrompts(defaultProjectName?: string): Promise<UserOptions | null> {
  // 显示欢迎信息
  p.intro(`${pc.bgCyan(pc.black(` ${CLI_NAME} v${VERSION} `))}`);

  const options = await p.group(
    {
      // 项目名称
      projectName: () =>
        p.text({
          message: '项目名称',
          placeholder: defaultProjectName || 'my-app',
          defaultValue: defaultProjectName || 'my-app',
          validate: (value) => {
            if (!value) return '请输入项目名称';
            if (!/^[a-z0-9-_]+$/i.test(value)) {
              return '项目名称只能包含字母、数字、连字符和下划线';
            }
            return undefined;
          },
        }),

      // 可选模块
      modules: () =>
        p.multiselect({
          message: '选择需要的功能模块（空格选择，回车确认）',
          options: OPTIONAL_MODULES.map((m) => ({
            value: m.value,
            label: m.label,
            hint: m.hint,
          })),
          required: false,
        }) as Promise<ModuleType[]>,

      // 包管理器
      packageManager: () =>
        p.select({
          message: '包管理器',
          options: PACKAGE_MANAGERS.map((pm) => ({
            value: pm.value,
            label: pm.label,
          })),
          initialValue: 'pnpm' as PackageManager,
        }) as Promise<PackageManager>,

      // 是否自动安装依赖
      installDeps: () =>
        p.confirm({
          message: '是否自动安装依赖？',
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel('操作已取消');
        return process.exit(0);
      },
    }
  );

  return options as UserOptions;
}
