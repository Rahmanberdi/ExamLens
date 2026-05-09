import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../api/teacher';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { getPayload } from '../../api/auth';
import { useTeacherNav } from './teacherNav';

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

export function TeacherExams() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useTeacherNav();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  const [subjectFilter, setSubjectFilter] = useState(search.get('subject') ?? '');

  // Keep URL in sync with the dropdown
  useEffect(() => {
    const next = new URLSearchParams(search);
    if (subjectFilter) next.set('subject', subjectFilter);
    else next.delete('subject');
    if (next.toString() !== search.toString()) setSearch(next, { replace: true });
  }, [subjectFilter, search, setSearch]);

  const { data: exams, isLoading } = useQuery({ queryKey: ['teacher-exams'], queryFn: teacherApi.getExams });
  const { data: subjects } = useQuery({ queryKey: ['teacher-subjects'], queryFn: teacherApi.getSubjects });
  const { data: questions } = useQuery({
    queryKey: ['teacher-questions', 'all'],
    queryFn: () => teacherApi.getQuestions(),
  });

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]));
  const qCount: Record<number, number> = {};
  (questions ?? []).forEach((q) => { qCount[q.exam] = (qCount[q.exam] ?? 0) + 1; });

  const filtered = (exams ?? []).filter((e) => !subjectFilter || String(e.subject) === subjectFilter);

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header strip */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('exams')}</span>
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

        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <Th w={44}>{t('id')}</Th>
                <Th w={140}>{t('subject')}</Th>
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
                    onClick={() => navigate(`/teacher?exam=${e.id}`)}
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
                    <Td mono align="right">{qCount[e.id] ?? 0}</Td>
                    <Td align="right"><span style={{ color: 'var(--ink-4)' }}>→</span></Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Shell>
  );
}
