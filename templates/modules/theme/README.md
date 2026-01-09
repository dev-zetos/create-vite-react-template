# Theme Module

Dark/Light mode switching with CSS variables.

## Usage

```tsx
import useThemeStore from '@/store/useThemeStore';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, setThemeMode } = useThemeStore();

  return (
    <div>
      <button onClick={toggleTheme}>
        {isDarkMode ? '🌙' : '☀️'}
      </button>

      {/* Or use mode selector */}
      <select onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'system')}>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="system">System</option>
      </select>
    </div>
  );
};
```

## Setup

In your `main.tsx`, add theme initialization:

```tsx
import useThemeStore from './store/useThemeStore';

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ConfigProvider theme={getAntdThemeConfig(isDarkMode)}>
      {/* ... */}
    </ConfigProvider>
  );
}
```

## CSS Variables

Use semantic CSS variables that automatically switch between themes:

```scss
.container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

**Never hardcode colors** - always use CSS variables for theme compatibility.
