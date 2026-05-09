import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { FormField } from '../../shared/FormField';
import { inputStyle, selectStyle, btnPrimary, btnGhost } from '../../shared/styles';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

const mono = "'JetBrains Mono', monospace";

const pillStyle: React.CSSProperties = {
  height: 30,
  padding: '0 10px',
  border: '1px solid var(--line-2)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
  borderRadius: 0,
};

export function AdminExams() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useSearchParams();

  const [subjectFilter, setSubjectFilter] = useState(search.get('subject') ?? '');

  // form state
  const [subjectId, setSubjectId] = useState('');
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [formError, setFormError] = useState('');

  // Sync filter to URL
  useEffect(() => {
    const next = new URLSearchParams(search);
    if (subjectFilter) next.set('subject', subjectFilter); else next.delete('subject');
    if (next.toString() !== search.toString()) setSearch(next, { replace: true });
  }, [subjectFilter, search, setSearch]);

  const { data: exams, isLoading } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });
  const { data: questions } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]));
  const questionCountMap: Record<number, number> = {};
  (questions ?? []).forEach((q) => { questionCountMap[q.exam] = (questionCountMap[q.exam] ?? 0) + 1; });

  const filtered = (exams ?? []).filter((e) => !subjectFilter || String(e.subject) === subjectFilter);

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createExam({ subject: Number(subjectId), name, exam_date: examDate, total_score: totalScore }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      setSubjectId(''); setName(''); setExamDate(''); setTotalScore(''); setFormError('');
    },
    onError: () => setFormError('Failed to create exam'),
  });

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 360px' }}>
        {/* Left pane */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)', minWidth: 0 }}>
          {/* Filter strip */}
          <div style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
              {filtered.length} / {exams?.length ?? 0}
            </span>
            <span style={{ flex: 1 }} />
            <select style={pillStyle} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="">{t('subject')}: —</option>
              {(subjects ?? []).map((s) => (
                <option key={s.id} value={String(s.id)}>S{s.id} {s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <Th w={44}>{t('id')}</Th>
                  <Th w={120}>{t('subject')}</Th>
                  <Th>{t('name')}</Th>
                  <Th w={110}>{t('date')}</Th>
                  <Th w={80} align="right">{t('total')}</Th>
                  <Th w={60} align="right">Q</Th>
                  <Th w={32} />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows cols={7} />
                ) : !filtered.length ? (
                  <EmptyRow cols={7} label={t('noData')} />
                ) : (
                  filtered.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => navigate(`/admin/questions?exam=${e.id}`)}
                      style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    >
                      <Td mono>#{e.id}</Td>
                      <Td>
                        <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--ink-3)' }}>S{e.subject}</span>
                        {' '}{subjectMap[e.subject] ?? ''}
                      </Td>
                      <Td>{e.name}</Td>
                      <Td mono>{e.exam_date}</Td>
                      <Td mono align="right">{e.total_score}</Td>
                      <Td mono align="right">{questionCountMap[e.id] ?? 0}</Td>
                      <Td align="right"><span style={{ color: 'var(--ink-4)' }}>→</span></Td>
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
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('newExam')}</div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <FormField label={t('subject')}>
              <select style={selectStyle} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">—</option>
                {subjects?.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
              </select>
            </FormField>
            <FormField label={t('name')}>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label={t('date')}>
              <input
                type="date"
                style={{ ...inputStyle, fontFamily: mono }}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </FormField>
            <FormField label={t('total')}>
              <input
                type="number"
                step="0.5"
                style={{ ...inputStyle, fontFamily: mono }}
                value={totalScore}
                onChange={(e) => setTotalScore(e.target.value)}
              />
            </FormField>
            {formError && <span style={{ fontSize: 12, color: 'var(--wrong)' }}>{formError}</span>}

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setSubjectId(''); setName(''); setExamDate(''); setTotalScore(''); setFormError(''); }}
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
