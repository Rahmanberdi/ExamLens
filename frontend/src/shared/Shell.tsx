import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ControlsBar } from './ControlsBar';
import { logout } from '../api/auth';
import type { TokenPayload } from '../api/auth';

interface NavItem {
  label: string;
  to: string;
  count?: number;
}

interface ShellProps {
  user: TokenPayload;
  nav: NavItem[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

const mono = "'JetBrains Mono', monospace";

function LogoIcon() {
  return (
    <div style={{ width: 16, height: 16, border: '1.5px solid var(--ink)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 3, border: '1.5px solid var(--ink)' }} />
    </div>
  );
}

export function Shell({ user, nav, headerRight, children }: ShellProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const activeItem = nav.find((n) => pathname === n.to)
    ?? [...nav].reverse().find((n) => pathname.startsWith(n.to));
  const activeLabel = activeItem?.label ?? '';

  const handleLogout = async () => {
    if (!window.confirm(t('logout') + '?')) return;
    await logout();
    window.location.href = '/login';
  };

  const displayName = user.real_name || String(user.user_id);
  const initial = displayName[0] ?? '?';

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'var(--bg)',
      display: 'grid',
      gridTemplateColumns: '210px 1fr',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'var(--ink)',
    }}>
      <aside style={{
        borderRight: '1px solid var(--line)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, padding: '0 4px' }}>
          <LogoIcon />
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{t('appName')}</div>
        </div>

        {/* Role label */}
        <div style={{
          fontSize: 10,
          color: 'var(--ink-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 4px',
          marginBottom: 8,
        }}>
          {t('role_' + user.role)}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {nav.map((item) => {
            const active = item === activeItem;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '7px 8px',
                  fontSize: 13,
                  background: active ? 'var(--ink-bg-active)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: active ? 500 : 400,
                  textDecoration: 'none',
                  minHeight: 32,
                }}
              >
                <span>{item.label}</span>
                {item.count != null && (
                  <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--ink-3)' }}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: controls + avatar (click to log out) */}
        <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '0 4px' }}><ControlsBar /></div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, padding: '14px 4px 0' }}>
            {/* User info + logout on one line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 26,
                height: 26,
                background: 'var(--ink-bg-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500,
                flexShrink: 0,
              }}>
                {initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </div>
                {user.class_number && (
                  <div style={{
                    fontSize: 10,
                    color: 'var(--ink-4)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.class_number}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                title={t('logout')}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid var(--line-2)',
                  cursor: 'pointer',
                  color: 'var(--ink-3)',
                  flexShrink: 0,
                  borderRadius: 0,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--wrong)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--wrong)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line-2)';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <header style={{
          height: 52,
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--ink-3)' }}>{t('role_' + user.role)}</span>
            {activeLabel && (
              <>
                <span style={{ color: 'var(--ink-4)' }}>/</span>
                <span style={{ fontWeight: 500 }}>{activeLabel}</span>
              </>
            )}
          </div>
          {headerRight && <div style={{ display: 'flex', gap: 8 }}>{headerRight}</div>}
        </header>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
