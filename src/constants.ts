/**
 * 常量定义
 */

// CLI 版本
export const VERSION = '1.0.0';

// CLI 名称
export const CLI_NAME = 'create-vite-react-template';

// 可选模块定义
export const OPTIONAL_MODULES = [
  {
    value: 'i18n',
    label: '国际化 (i18n)',
    hint: '多语言支持，基于 i18next',
  },
  {
    value: 'theme',
    label: '主题切换',
    hint: '暗黑/亮色模式，CSS 变量系统',
  },
  {
    value: 'subscription',
    label: '订阅模块',
    hint: 'Stripe 支付集成',
  },
] as const;

// 包管理器选项
export const PACKAGE_MANAGERS = [
  { value: 'pnpm', label: 'pnpm（推荐）' },
  { value: 'npm', label: 'npm' },
  { value: 'yarn', label: 'yarn' },
] as const;

// 模块类型
export type ModuleType = (typeof OPTIONAL_MODULES)[number]['value'];
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]['value'];

// 用户选择结果
export interface UserOptions {
  projectName: string;
  modules: ModuleType[];
  packageManager: PackageManager;
  installDeps: boolean;
}
