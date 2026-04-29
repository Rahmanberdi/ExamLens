import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle, selectStyle } from '../../shared/styles';
import { RoleBadge } from '../../shared/RoleBadge';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

export function AdminStudents() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [role, setRole] = useState('student');
  const [classNumber, setClassNumber] = useState('');
  const [formError, setFormError] = useState('');

  const { data: students, isLoading } = useQuery({ queryKey: ['students'], queryFn: adminApi.getStudents });

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createStudent({ username, password, real_name: realName, role, class_number: classNumber }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setShowForm(false);
      setUsername(''); setPassword(''); setRealName(''); setClassNumber('');
    },
    onError: () => setFormError('Failed to create account'),
  });

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <button onClick={() => setShowForm(true)} style={{ padding: '5px 12px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>
          + {t('newStudent')}
        </button>
      }
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('students')}</h1>

      {showForm && (
        <div style={{ border: '1px solid var(--line)', padding: 16, marginBottom: 20, maxWidth: 400 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <FormField label={t('username')}>
                <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} />
              </FormField>
              <FormField label={t('password')}>
                <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
              </FormField>
            </div>
            <FormField label={t('realName')}>
              <input style={inputStyle} value={realName} onChange={(e) => setRealName(e.target.value)} />
            </FormField>
            <div style={{ display: 'flex', gap: 12 }}>
              <FormField label={t('role')}>
                <select style={selectStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="student">{t('role_student')}</option>
                  <option value="teacher">{t('role_teacher')}</option>
                </select>
              </FormField>
              <FormField label={t('className')}>
                <input style={inputStyle} value={classNumber} onChange={(e) => setClassNumber(e.target.value)} />
              </FormField>
            </div>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => mutation.mutate()} disabled={mutation.isPending} style={{ padding: '5px 12px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}>
                {t('create')}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '5px 12px', border: '1px solid var(--line-2)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('username')}</Th>
            <Th>{t('realName')}</Th>
            <Th>{t('role')}</Th>
            <Th>{t('className')}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <SkeletonRows cols={5} /> : !students?.length ? <EmptyRow cols={5} label={t('noData')} /> : (
            students.map((s) => (
              <tr key={s.id}>
                <Td mono>{s.id}</Td>
                <Td mono>{s.username}</Td>
                <Td>{s.real_name || '—'}</Td>
                <Td><RoleBadge role={s.role as 'admin' | 'teacher' | 'student'} /></Td>
                <Td>{s.class_number || '—'}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <EndpointFooter method="GET" path="/api/admin/students/" />
    </Shell>
  );
}
