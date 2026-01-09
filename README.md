# create-vite-react-template

🚀 交互式 CLI 工具，快速创建 Vite + React 19 + TypeScript 项目模板。

## ✨ 特性

- **Vite 6** - 极速开发服务器和构建
- **React 19** - 最新 React 版本
- **TypeScript** - 类型安全
- **Ant Design 6** - 企业级 UI 组件库
- **Zustand** - 轻量级状态管理（支持持久化）
- **Axios** - HTTP 请求封装（Token 管理、错误处理）
- **React Router 7** - 路由配置（懒加载、守卫）
- **SCSS Modules** - 组件级样式隔离
- **ESLint + Prettier** - 代码规范
- **Claude Code Ready** - 内置 CLAUDE.md 和 AGENTS.md

### 可选模块

- 🌐 **国际化 (i18n)** - i18next 多语言支持
- 🎨 **主题切换** - 暗黑/亮色模式 + CSS 变量
- 💳 **订阅模块** - Stripe 支付集成

## 📦 快速开始

### 使用 npx（推荐）

```bash
# 从 GitHub 直接运行
npx github:caoxicheng/create-vite-react-template my-app

# 或者先克隆再运行
git clone https://github.com/caoxicheng/create-vite-react-template.git
cd create-vite-react-template
pnpm install && pnpm build
node bin/index.js my-app
```

### 交互式创建

```bash
npx github:caoxicheng/create-vite-react-template

# 按照提示选择：
# 1. 项目名称
# 2. 可选功能模块
# 3. 包管理器
# 4. 是否自动安装依赖
```

## 📁 生成的项目结构

```
my-app/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Home/
│   │   └── Login/
│   ├── components/         # 通用组件
│   │   ├── Layout/
│   │   └── SvgIcon.tsx
│   ├── apis/               # API 请求
│   ├── router/             # 路由配置
│   ├── store/              # Zustand stores
│   ├── hooks/              # 自定义 Hooks
│   ├── context/            # React Context
│   ├── utils/              # 工具函数
│   ├── types/              # 类型定义
│   ├── theme/              # Ant Design 主题
│   └── assets/             # 静态资源
│       ├── svg/            # SVG 图标
│       └── styles/         # 全局样式
├── CLAUDE.md               # Claude Code 指南
├── AGENTS.md               # AI 开发规范
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🛠️ 可选模块详情

### 国际化 (i18n)

基于 i18next 的多语言支持。

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('zh')}>
        切换到中文
      </button>
    </div>
  );
};
```

### 主题切换

暗黑/亮色模式切换，基于 CSS 变量。

```tsx
import useThemeStore from '@/store/useThemeStore';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};
```

### 订阅模块

Stripe 支付集成示例。

```tsx
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

const PremiumFeature = () => {
  const { isSubscribed } = useSubscriptionStore();

  if (!isSubscribed) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
};
```

## 📝 开发约定

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile.tsx` |
| 工具函数 | camelCase | `formatDate.ts` |
| 样式文件 | `index.module.scss` | - |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |

### 路径别名

```tsx
// ✅ 正确
import { useUserStore } from '@/store/useUserStore';

// ❌ 避免
import { useUserStore } from '../../../store/useUserStore';
```

### CSS 变量

```scss
// ✅ 正确 - 使用语义变量
.container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

// ❌ 避免 - 硬编码颜色
.container {
  background-color: #1e1f24;
  color: #ffffff;
}
```

## 🔧 配置说明

### 环境变量

```bash
# .env.dev - 开发环境
VITE_API_BASE_URL=http://localhost:8000/api

# .env.prod - 生产环境
VITE_API_BASE_URL=https://api.example.com
```

### Vite 配置

- 开发服务器端口：3000
- API 代理配置在 `vite.config.ts`
- SVG 图标自动注册

## 📄 许可证

MIT
