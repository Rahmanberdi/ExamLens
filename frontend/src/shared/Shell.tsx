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

export function Shell({ user, nav, headerRight, children }: ShellProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const activePage = nav.find((n) => pathname.startsWith(n.to))?.label ?? '';

  const roleLabel =
    user.role === 'admin'
      ? t('adminPanel')
      : user.role === 'teacher'
      ? t('teacherPanel')
      : t('studentPanel');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 210,
        minWidth: 210,
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: 'var(--bg)',
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t('appName')}</div>
          <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>{roleLabel}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 32,
                padding: '0 16px',
                fontSize: 13,
                color: active ? 'var(--ink)' : 'var(--ink-2)',
                background: active ? 'var(--ink-bg-active)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                textDecoration: 'none',
              }}>
                <span>{item.label}</span>
                {item.count != null && (
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Controls + Avatar */}
        <div style={{ borderTop: '1px solid var(--line)', padding: '0 16px' }}>
          <ControlsBar />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{user.real_name || user.user_id}</div>
              {user.class_number && (
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{user.class_number}</div>
              )}
            </div>
            <button onClick={handleLogout} title={t('logout')} style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              cursor: 'pointer',
              padding: '2px 4px',
              border: '1px solid var(--line-2)',
            }}>
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 210, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          height: 52,
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          background: 'var(--bg)',
          zIndex: 10,
        }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            <span>{roleLabel}</span>
            {activePage && (
              <>
                <span style={{ margin: '0 6px' }}>/</span>
                <span style={{ color: 'var(--ink)' }}>{activePage}</span>
              </>
            )}
          </div>
          {headerRight && <div style={{ display: 'flex', gap: 8 }}>{headerRight}</div>}
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', paddingBottom: 52 }}>
          {children}
        </main>
      </div>
    </div>
  );
}