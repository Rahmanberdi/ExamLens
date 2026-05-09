import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../../api/auth';
import { ControlsBar } from '../../shared/ControlsBar';

const mono = "'JetBrains Mono', monospace";

function LogoIcon({ size = 22 }: { size?: number }) {
  const inset = Math.round(size * 0.18);
  const innerSize = Math.round(size * 0.36);
  return (
    <div style={{
      width: size,
      height: size,
      border: '1.5px solid var(--ink)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: innerSize,
        height: innerSize,
        border: '1.5px solid var(--ink)',
        margin: inset,
      }} />
    </div>
  );
}

const fieldInput: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 0 0 0',
  border: 'none',
  borderBottom: '1px solid var(--line-2)',
  background: 'transparent',
  color: 'var(--ink)',
  fontSize: 13,
  fontFamily: mono,
  outline: 'none',
};

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  display: 'block',
  marginBottom: 8,
};

const demoAccounts: { roleKey: 'role_admin' | 'role_teacher' | 'role_student'; user: string }[] = [
  { roleKey: 'role_admin', user: 'admin1' },
  { roleKey: 'role_teacher', user: 'teacher1' },
  { roleKey: 'role_student', user: 'student1' },
];

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await login(username, password);
      if (payload.role === 'admin') navigate('/admin');
      else if (payload.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
    }}>
      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 16, right: 20 }}>
        <ControlsBar />
      </div>

      <div style={{ width: 380 }}>
        {/* Logo block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <LogoIcon size={22} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t('appName')}</span>
        </div>

        {/* Title + subtitle */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 8px' }}>
            {t('signIn')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            {t('signInSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={fieldLabel}>{t('username')}</label>
            <input
              style={fieldInput}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label style={fieldLabel}>{t('password')}</label>
            <input
              type="password"
              style={fieldInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              fontSize: 12,
              color: 'var(--wrong)',
              border: '1px solid var(--wrong)',
              padding: '6px 10px',
              fontFamily: mono,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 40,
              background: 'var(--ink)',
              color: 'var(--bg)',
              border: 'none',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontWeight: 500,
            }}
          >
            {loading ? t('loading') : t('continue')}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid var(--line)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          fontSize: 11,
          fontFamily: mono,
          color: 'var(--ink-3)',
        }}>
          {demoAccounts.map(({ roleKey, user }) => (
            <div key={roleKey}>
              <div style={{ color: 'var(--ink)', marginBottom: 2 }}>{t(roleKey)}</div>
              <div>{user}</div>
            </div>
          ))}
        </div>

        {/* API note */}
        <div style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-4)', fontFamily: mono }}>
          POST /api/token/ → {'{ access, refresh }'}
        </div>
      </div>
    </div>
  );
}
