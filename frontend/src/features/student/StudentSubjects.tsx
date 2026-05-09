import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { getPayload } from '../../api/auth';

const mono = "'JetBrains Mono', monospace";

interface SubjectRow {
  subject: number;
  subject_name: string;
  examCount: number;
  totalObtained: number;
  totalMax: number;
  wrongCount: number;
}

export function StudentSubjects() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const navigate = useNavigate();

  const { data: exams, isLoading } = useQuery({ queryKey: ['student-exams'], queryFn: studentApi.getExams });
  const { data: wrongs } = useQuery({ queryKey: ['student-wrong'], queryFn: studentApi.getWrongQuestions });

  // Aggregate per-subject from /student/exams
  const subjectsMap = new Map<number, SubjectRow>();
  (exams ?? []).forEach((e) => {
    const row = subjectsMap.get(e.subject) ?? {
      subject: e.subject,
      subject_name: e.subject_name,
      examCount: 0,
      totalObtained: 0,
      totalMax: 0,
      wrongCount: 0,
    };
    row.examCount += 1;
    row.totalObtained += Number(e.score_obtained);
    row.totalMax += Number(e.total_score);
    subjectsMap.set(e.subject, row);
  });
  // Wrong counts by exam → roll up to subject
  const examSubject: Record<number, number> = {};
  (exams ?? []).forEach((e) => { examSubject[e.id] = e.subject; });
  (wrongs ?? []).forEach((a) => {
    const subj = examSubject[a.question.exam];
    if (subj == null) return;
    const row = subjectsMap.get(subj);
    if (row) row.wrongCount += 1;
  });

  const rows = Array.from(subjectsMap.values()).sort((a, b) => a.subject - b.subject);

  const nav = [
    { label: t('myExams'), to: '/student', count: exams?.length },
    { label: t('subjects'), to: '/student/subjects', count: rows.length },
    { label: t('wrongAnswers'), to: '/student/wrong', count: wrongs?.length },
  ];

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header strip */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('subjects')}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
            {rows.length}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
            {t('viewDetails')} →
          </span>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <Th w={44}>{t('id')}</Th>
                <Th>{t('subject')}</Th>
                <Th w={80} align="right">{t('exams')}</Th>
                <Th w={120} align="right">{t('avgScore')}</Th>
                <Th w={120} align="right">{t('wrongAnswers')}</Th>
                <Th w={32} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows cols={6} />
              ) : !rows.length ? (
                <EmptyRow cols={6} label={t('noData')} />
              ) : (
                rows.map((r) => {
                  const pct = r.totalMax > 0 ? (r.totalObtained / r.totalMax) * 100 : 0;
                  return (
                    <tr
                      key={r.subject}
                      onClick={() => navigate(`/student?subject=${r.subject}`)}
                      style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    >
                      <Td mono>#{r.subject}</Td>
                      <Td>{r.subject_name}</Td>
                      <Td mono align="right">{r.examCount}</Td>
                      <Td mono align="right">
                        {r.totalMax > 0 ? `${pct.toFixed(0)}%` : '—'}
                      </Td>
                      <Td mono align="right">
                        <span style={{ color: r.wrongCount > 0 ? 'var(--wrong)' : 'var(--ink-3)' }}>
                          {r.wrongCount}
                        </span>
                      </Td>
                      <Td align="right"><span style={{ color: 'var(--ink-4)' }}>→</span></Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Shell>
  );
}
