import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle } from '../../shared/styles';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

export function AdminSubjects() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });

  const mutation = useMutation({
    mutationFn: () => adminApi.createSubject({ name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      setShowForm(false);
      setName('');
      setDescription('');
    },
    onError: () => setFormError('Failed to create subject'),
  });

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: '5px 12px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}
        >
          + {t('newSubject')}
        </button>
      }
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('subjects')}</h1>

      {showForm && (
        <div style={{ border: '1px solid var(--line)', padding: 16, marginBottom: 20, maxWidth: 400 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label={t('name')}>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label={t('description')}>
              <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                style={{ padding: '5px 12px', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}
              >
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
            <Th>{t('name')}</Th>
            <Th>{t('description')}</Th>
            <Th>{t('date')}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows cols={4} />
          ) : !data?.length ? (
            <EmptyRow cols={4} label={t('noData')} />
          ) : (
            data.map((s) => (
              <tr key={s.id}>
                <Td mono>{s.id}</Td>
                <Td>{s.name}</Td>
                <Td>{s.description || '—'}</Td>
                <Td mono>{s.created_at.slice(0, 10)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <EndpointFooter method="GET" path="/api/admin/subjects/" />
    </Shell>
  );
}
