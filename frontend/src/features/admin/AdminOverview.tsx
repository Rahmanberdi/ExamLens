import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td } from '../../shared/Table';
import { btnPrimary } from '../../shared/styles';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

const mono = "'JetBrains Mono', monospace";

function StatTile({ label, value, sub }: { label: string; value: number | string | undefined; sub?: string }) {
  return (
    <div style={{
      padding: 18,
      borderRight: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 400,
        marginTop: 8,
        letterSpacing: '-0.02em',
        fontFamily: mono,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const quickActionDefs = [
  { key: 'newStudent', to: '/admin/students' },
  { key: 'newSubject', to: '/admin/subjects' },
  { key: 'newExam', to: '/admin/exams' },
  { key: 'newQuestion', to: '/admin/questions/new' },
  { key: 'enterAnswer', to: '/admin/answers' },
] as const;

export function AdminOverview() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });
  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const { data: questions } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });
  const { data: answers } = useQuery({ queryKey: ['answers'], queryFn: adminApi.getAnswers });

  const subjectMap = Object.fromEntries((subjects ?? []).map((s) => [s.id, s.name]));
  const subjectSub = subjects?.map((s) => s.name).join(' · ') ?? '';
  const examSub = exams?.[0]?.name ?? '';
  const qtCounts = questions ? ['single_choice', 'multiple_choice', 'true_false', 'fill_blank']
    .map((qt) => questions.filter((q) => q.question_type === qt).length).join('·') : '';
  const uniqueStudents = answers ? new Set(answers.map((a) => a.student)).size : 0;
  const answerSub = answers?.length ? `${uniqueStudents} × ${questions?.length ?? 0}` : '';

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <Link to="/admin/exams" style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          + {t('newExam')}
        </Link>
      }
    >
      <div style={{ height: '100%', overflow: 'auto', padding: 24 }}>
        {/* Stat tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid var(--line)',
          borderLeft: '1px solid var(--line)',
        }}>
          <StatTile label={t('subjects')} value={subjects?.length} sub={subjectSub} />
          <StatTile label={t('exams')} value={exams?.length} sub={examSub} />
          <StatTile label={t('questions')} value={questions?.length} sub={qtCounts} />
          <StatTile label={t('answers')} value={answers?.length} sub={answerSub} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, marginTop: 32 }}>
          {/* Recent exams */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t('exams')}</div>
              <Link to="/admin/exams" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                {t('viewAll')} →
              </Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <Th w={44}>{t('id')}</Th>
                  <Th w={80}>{t('subject')}</Th>
                  <Th>{t('name')}</Th>
                  <Th w={100}>{t('date')}</Th>
                  <Th w={80} align="right">{t('total')}</Th>
                </tr>
              </thead>
              <tbody>
                {(exams ?? []).slice(0, 8).map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <Td mono>#{e.id}</Td>
                    <Td>{subjectMap[e.subject] ?? `S${e.subject}`}</Td>
                    <Td>{e.name}</Td>
                    <Td mono>{e.exam_date}</Td>
                    <Td mono align="right">{e.total_score}</Td>
                  </tr>
                ))}
                {!exams?.length && (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                      {t('noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('action')}</div>
            <div style={{ marginTop: 12, borderTop: '1px solid var(--line)' }}>
              {quickActionDefs.map(({ key, to }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t(key)}</div>
                    </div>
                  <span style={{ color: 'var(--ink-4)', fontSize: 14 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
