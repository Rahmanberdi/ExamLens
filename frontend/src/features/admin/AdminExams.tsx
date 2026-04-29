import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField, inputStyle, selectStyle } from '../../shared/FormField';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

export function AdminExams() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [formError, setFormError] = useState('');

  const { data: exams, isLoading } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]));

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createExam({ subject: Number(subjectId), name, exam_date: examDate, total_score: totalScore }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      setShowForm(false);
      setSubjectId(''); setName(''); setExamDate(''); setTotalScore('');
    },
    onError: () => setFormError('Failed to create exam'),
  });

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <button onClick={() => setShowForm(true)} style={{ padding: '5px 12px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>
          + {t('newExam')}
        </button>
      }
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('exams')}</h1>

      {showForm && (
        <div style={{ border: '1px solid var(--line)', padding: 16, marginBottom: 20, maxWidth: 400 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label={t('subject')}>
              <select style={selectStyle} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">—</option>
                {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
            <FormField label={t('name')}>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label={t('examDate')}>
              <input type="date" style={inputStyle} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </FormField>
            <FormField label={t('totalScore')}>
              <input type="number" style={inputStyle} value={totalScore} onChange={(e) => setTotalScore(e.target.value)} />
            </FormField>
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
            <Th>{t('subject')}</Th>
            <Th>{t('name')}</Th>
            <Th>{t('examDate')}</Th>
            <Th right>{t('totalScore')}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <SkeletonRows cols={5} /> : !exams?.length ? <EmptyRow cols={5} label={t('noData')} /> : (
            exams.map((e) => (
              <tr key={e.id}>
                <Td mono>{e.id}</Td>
                <Td>{subjectMap[e.subject] ?? e.subject}</Td>
                <Td>{e.name}</Td>
                <Td mono>{e.exam_date}</Td>
                <Td right mono>{e.total_score}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <EndpointFooter method="GET" path="/api/admin/exams/" />
    </Shell>
  );
}
