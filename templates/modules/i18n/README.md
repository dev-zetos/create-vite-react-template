# i18n Module

Internationalization support using i18next.

## Usage

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <button onClick={() => i18n.changeLanguage('zh')}>
        Switch to Chinese
      </button>
    </div>
  );
};
```

## Adding New Languages

1. Create a new folder in `src/locales/` (e.g., `fr/`)
2. Add `translation.json` with your translations
3. Update `src/utils/i18n.ts` to import and register the new language

## Configuration

Edit `src/utils/i18n.ts` to customize:
- Default language
- Fallback language
- Supported languages
