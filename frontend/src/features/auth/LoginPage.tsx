import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../../api/auth';
import { ControlsBar } from '../../shared/ControlsBar';
import { FormField, inputStyle } from '../../shared/FormField';

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
    }}>
      <div style={{ width: 320 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{t('appName')}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{t('signIn')}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label={t('username')}>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </FormField>
          <FormField label={t('password')}>
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--wrong)', border: '1px solid var(--wrong)', padding: '6px 10px', fontFamily: "'JetBrains Mono', monospace" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t('loading') : t('continue')}
          </button>
        </form>

        <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <ControlsBar />
        </div>
      </div>
    </div>
  );
}