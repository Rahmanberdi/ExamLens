import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle, btnPrimary, btnGhost } from '../../shared/styles';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

const mono = "'JetBrains Mono', monospace";

export function AdminSubjects() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });
  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const examCountMap: Record<number, number> = {};
  (exams ?? []).forEach((e) => { examCountMap[e.subject] = (examCountMap[e.subject] ?? 0) + 1; });

  const mutation = useMutation({
    mutationFn: () => adminApi.createSubject({ name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      setName('');
      setDescription('');
      setFormError('');
    },
    onError: () => setFormError('Failed to create subject'),
  });

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
                  <Th>{t('name')}</Th>
                  <Th>{t('description')}</Th>
                  <Th w={110}>{t('date')}</Th>
                  <Th w={70} align="right">{t('exams')}</Th>
                  <Th w={32} />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows cols={6} />
                ) : !data?.length ? (
                  <EmptyRow cols={6} label={t('noData')} />
                ) : (
                  data.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/admin/exams?subject=${s.id}`)}
                      style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    >
                      <Td mono>#{s.id}</Td>
                      <Td>{s.name}</Td>
                      <Td>{s.description || <span style={{ color: 'var(--ink-4)' }}>—</span>}</Td>
                      <Td mono>{s.created_at.slice(0, 10)}</Td>
                      <Td mono align="right">{examCountMap[s.id] ?? 0}</Td>
                      <Td align="right"><span style={{ color: 'var(--ink-4)' }}>→</span></Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane — create form */}
        <aside style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('newSubject')}</div>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <FormField label={t('name')}>
              <input
                style={{ ...inputStyle, fontFamily: mono }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>
            <FormField label={t('description')}>
              <textarea
                style={{ ...inputStyle, height: 'auto', minHeight: 60, resize: 'vertical', whiteSpace: 'pre-wrap' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setName(''); setDescription(''); setFormError(''); }}
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
