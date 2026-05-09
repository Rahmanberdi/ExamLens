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

  const segBtn = (active: boolean): React.CSSProperties => ({
    height: 26,
    padding: '0 9px',
    fontSize: 11,
    border: 'none',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--bg)' : 'var(--ink-2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  });

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    border: '1px solid var(--line-2)',
  };

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <div style={groupStyle}>
        {langs.map(({ key, label }) => (
          <button key={key} style={segBtn(lang === key)} onClick={() => setLang(key)}>
            {label}
          </button>
        ))}
      </div>
      <div style={groupStyle}>
        <button style={segBtn(theme === 'light')} onClick={() => setTheme('light')}>☀</button>
        <button style={segBtn(theme === 'dark')} onClick={() => setTheme('dark')}>☾</button>
      </div>
    </div>
  );
}
