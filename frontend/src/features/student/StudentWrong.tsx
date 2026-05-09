import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { TypeBadge } from '../../shared/TypeBadge';
import { getPayload } from '../../api/auth';

const mono = "'JetBrains Mono', monospace";

export function StudentWrong() {
  const { t } = useTranslation();
  const user = getPayload()!;

  const { data: wrongs, isLoading } = useQuery({
    queryKey: ['student-wrong'],
    queryFn: studentApi.getWrongQuestions,
  });
  const { data: exams } = useQuery({ queryKey: ['student-exams'], queryFn: studentApi.getExams });

  const examSubjectMap = Object.fromEntries((exams ?? []).map((e) => [e.id, e.subject_name]));

  const subjectCount = new Set((exams ?? []).map((e) => e.subject)).size;
  const nav = [
    { label: t('myExams'), to: '/student', count: exams?.length },
    { label: t('subjects'), to: '/student/subjects', count: subjectCount },
    { label: t('wrongAnswers'), to: '/student/wrong', count: wrongs?.length },
  ];

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', overflow: 'auto', padding: 24 }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 4,
          }}>
            {t('wrongAnswers')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
            {wrongs?.length ?? '—'} {t('acrossExams')}
          </div>
        </div>

        {isLoading && <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>{t('loading')}</div>}

        <div style={{ borderTop: '1px solid var(--line)' }}>
          {!isLoading && !wrongs?.length && (
            <div style={{ padding: '20px 0', color: 'var(--ink-4)', fontSize: 13 }}>{t('noData')}</div>
          )}

          {wrongs?.map((a) => {
            const examId = a.question.exam;
            const qNum = a.question.question_number;
            const subjectName = examSubjectMap[examId];
            return (
              <div
                key={a.id}
                style={{ padding: '20px 0', borderBottom: '1px solid var(--line)' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--ink-3)' }}>#{a.id}</span>
                  {subjectName && (
                    <span style={{
                      fontSize: 11,
                      padding: '1px 6px',
                      border: '1px solid var(--line-2)',
                      color: 'var(--ink-2)',
                    }}>
                      {subjectName}
                    </span>
                  )}
                  <TypeBadge type={a.question.question_type} />
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
                    E{examId}·Q{qNum}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{
                    fontSize: 11,
                    fontFamily: mono,
                    color: 'var(--wrong)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {t('wrong')}
                  </span>
                  <span style={{ fontSize: 13, fontFamily: mono }}>
                    <span style={{ color: 'var(--wrong)' }}>
                      {Number(a.score_obtained).toFixed(2)}
                    </span>
                    <span style={{ color: 'var(--ink-4)' }}>
                      /{Number(a.question.max_score).toFixed(2)}
                    </span>
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>
                  {a.question.content}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  border: '1px solid var(--wrong)',
                  background: 'var(--wrong-bg)',
                  fontFamily: mono,
                  fontSize: 12,
                }}>
                  <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>{t('yourAnswer')}:</span>
                  <span>{JSON.stringify(a.selected_answer)}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Shell>
  );
}
