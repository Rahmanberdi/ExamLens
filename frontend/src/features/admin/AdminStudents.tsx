import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle, btnPrimary, btnGhost } from '../../shared/styles';
import { RoleBadge } from '../../shared/RoleBadge';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

const mono = "'JetBrains Mono', monospace";

export function AdminStudents() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const qc = useQueryClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [classNumber, setClassNumber] = useState('');
  const [formError, setFormError] = useState('');

  const { data: students, isLoading } = useQuery({ queryKey: ['students'], queryFn: adminApi.getStudents });

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createStudent({ username, password, real_name: realName, role, class_number: classNumber }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setUsername(''); setPassword(''); setRealName(''); setClassNumber(''); setFormError('');
    },
    onError: () => setFormError('Failed to create account'),
  });

  const roleOptions: { value: 'student' | 'teacher' | 'admin' }[] = [
    { value: 'student' },
    { value: 'teacher' },
    { value: 'admin' },
  ];

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 360px' }}>
        {/* Left pane */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <Th w={44}>{t('id')}</Th>
                  <Th w={120}>{t('username')}</Th>
                  <Th>{t('realName')}</Th>
                  <Th w={100}>{t('type')}</Th>
                  <Th>{t('className')}</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows cols={5} />
                ) : !students?.length ? (
                  <EmptyRow cols={5} label={t('noData')} />
                ) : (
                  students.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <Td mono>#{s.id}</Td>
                      <Td mono>{s.username}</Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 22,
                            height: 22,
                            background: 'var(--ink-bg-active)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 500,
                            flexShrink: 0,
                          }}>
                            {(s.real_name || s.username)[0]}
                          </div>
                          {s.real_name || <span style={{ color: 'var(--ink-4)' }}>—</span>}
                        </div>
                      </Td>
                      <Td><RoleBadge role={s.role as 'admin' | 'teacher' | 'student'} /></Td>
                      <Td>
                        {s.class_number || <span style={{ color: 'var(--ink-4)' }}>—</span>}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane */}
        <aside style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('newStudent')}</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'auto' }}>
            <FormField label={t('username')}>
              <input style={{ ...inputStyle, fontFamily: mono }} value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormField>
            <FormField label={t('password')}>
              <input
                type="password"
                style={{ ...inputStyle, fontFamily: mono }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <FormField label={t('realName')}>
              <input style={inputStyle} value={realName} onChange={(e) => setRealName(e.target.value)} />
            </FormField>
            <div>
              <div style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}>
                {t('type')}
              </div>
              <div style={{ display: 'flex', border: '1px solid var(--line-2)' }}>
                {roleOptions.map(({ value }, i) => {
                  const active = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        textAlign: 'center',
                        fontSize: 12,
                        background: active ? 'var(--ink)' : 'transparent',
                        color: active ? 'var(--bg)' : 'var(--ink-2)',
                        borderLeft: i ? '1px solid var(--line-2)' : 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t(`role_${value}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <FormField label={t('className')}>
              <input style={inputStyle} value={classNumber} onChange={(e) => setClassNumber(e.target.value)} />
            </FormField>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setUsername(''); setPassword(''); setRealName(''); setClassNumber(''); setFormError(''); }}
                style={{ ...btnGhost, flex: 1 }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                style={{ ...btnPrimary, flex: 1 }}
              >
                {t('create')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
