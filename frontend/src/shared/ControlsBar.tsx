import type React from 'react';
import { useThemeStore } from '../store/theme';
import { useLangStore } from '../store/lang';

type Lang = 'en' | 'zh' | 'ru';

const langs: { key: Lang; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'zh', label: '中' },
  { key: 'ru', label: 'RU' },
];

export function ControlsBar() {
  const { theme, setTheme } = useThemeStore();
  const { lang, setLang } = useLangStore();

  const segStyle = (active: boolean): React.CSSProperties => ({
    padding: '2px 8px',
    fontSize: 11,
    border: '1px solid var(--line-2)',
    background: active ? 'var(--ink-bg-active)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-3)',
    cursor: 'pointer',
    marginLeft: -1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
      <div style={{ display: 'flex' }}>
        {langs.map(({ key, label }) => (
          <button key={key} style={segStyle(lang === key)} onClick={() => setLang(key)}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <button style={segStyle(theme === 'light')} onClick={() => setTheme('light')}>☀</button>
        <button style={segStyle(theme === 'dark')} onClick={() => setTheme('dark')}>☾</button>
      </div>
    </div>
  );
}