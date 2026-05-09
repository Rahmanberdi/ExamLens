import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { TypeBadge } from '../../shared/TypeBadge';
import { getPayload } from '../../api/auth';

const mono = "'JetBrains Mono', monospace";

export function StudentExamDetail() {
  const { t } = useTranslation();
  const { examId } = useParams();
  const user = getPayload()!;

  const { data: exams } = useQuery({ queryKey: ['student-exams'], queryFn: studentApi.getExams });
  const { data: wrongs } = useQuery({ queryKey: ['student-wrong'], queryFn: studentApi.getWrongQuestions });

  const subjectCount = new Set((exams ?? []).map((e) => e.subject)).size;
  const nav = [
    { label: t('myExams'), to: '/student', count: exams?.length },
    { label: t('subjects'), to: '/student/subjects', count: subjectCount },
    { label: t('wrongAnswers'), to: '/student/wrong', count: wrongs?.length },
  ];

  const { data: answers, isLoading } = useQuery({
    queryKey: ['student-exam-questions', examId],
    queryFn: () => studentApi.getExamQuestions(Number(examId)),
  });

  const exam = exams?.find((e) => e.id === Number(examId));

  const totalMax = answers?.reduce((s, a) => s + Number(a.question.max_score), 0) ?? 0;
  const totalObtained = answers?.reduce((s, a) => s + Number(a.score_obtained), 0) ?? 0;
  const correctCount = answers?.filter((a) => a.is_correct).length ?? 0;

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        {/* Back link */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
          <Link to="/student" style={{ color: 'var(--ink-3)' }}>← {t('backToAll')}</Link>
        </div>

        <div style={{ padding: 24, maxWidth: 820 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--ink-3)' }}>#{examId}</span>
            {exam?.subject_name && (
              <span style={{
                fontSize: 11,
                padding: '1px 6px',
                border: '1px solid var(--line-2)',
                color: 'var(--ink-2)',
              }}>
                {exam.subject_name}
              </span>
            )}
            {exam?.exam_date && (
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
                {exam.exam_date}
              </span>
            )}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {exam?.name ?? `${t('exam')} #${examId}`}
          </div>
          {answers && (
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 28 }}>
              {t('score')}{' '}
              <span style={{ fontFamily: mono, color: 'var(--ink)' }}>
                {totalObtained.toFixed(2)}
              </span>{' '}
              {t('of')} {totalMax.toFixed(2)}
              {' · '}
              {correctCount} {t('correctOf')} {answers.length}
            </div>
          )}

          {isLoading && <div style={{ color: 'var(--ink-4)' }}>{t('loading')}</div>}

          <div style={{ borderTop: '1px solid var(--line)' }}>
            {answers?.map((a) => {
              const hasOptions = Object.keys(a.question.options).length > 0;
              const selectedArr = a.selected_answer as (string | boolean)[];
              const selectedAsStrings = selectedArr.map((s) =>
                typeof s === 'boolean' ? (s ? t('true_') : t('false_')) : `"${s}"`
              );
              return (
                <div
                  key={a.id}
                  style={{ padding: '20px 0', borderBottom: '1px solid var(--line)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 12,
                      fontFamily: mono,
                      color: 'var(--ink-3)',
                      minWidth: 24,
                    }}>
                      Q{a.question.question_number}
                    </span>
                    <TypeBadge type={a.question.question_type} />
                    <span style={{ flex: 1 }} />
                    <span style={{
                      fontSize: 11,
                      fontFamily: mono,
                      color: a.is_correct ? 'var(--ink-2)' : 'var(--wrong)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                      {a.is_correct ? t('correct') : t('wrong')}
                    </span>
                    <span style={{ fontSize: 13, fontFamily: mono }}>
                      {Number(a.score_obtained).toFixed(2)}
                      <span style={{ color: 'var(--ink-4)' }}>
                        /{Number(a.question.max_score).toFixed(2)}
                      </span>
                    </span>
                  </div>

                  <div style={{
                    fontSize: 15,
                    marginBottom: 12,
                    fontWeight: 500,
                    paddingLeft: 34,
                  }}>
                    {a.question.content}
                  </div>

                  <div style={{ paddingLeft: 34 }}>
                    {hasOptions ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {Object.entries(a.question.options).map(([k, v]) => {
                          const isSel = (selectedArr as string[]).includes(k);
                          return (
                            <div
                              key={k}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '6px 10px',
                                border: isSel
                                  ? `1px solid ${a.is_correct ? 'var(--ink)' : 'var(--wrong)'}`
                                  : '1px solid transparent',
                                background: isSel
                                  ? (a.is_correct ? 'var(--ink-bg-active)' : 'var(--wrong-bg)')
                                  : 'transparent',
                              }}
                            >
                              <span style={{
                                width: 20,
                                height: 20,
                                border: '1px solid',
                                borderColor: isSel ? 'var(--ink)' : 'var(--line-2)',
                                background: isSel ? 'var(--ink)' : 'transparent',
                                color: isSel ? 'var(--bg)' : 'var(--ink-2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: mono,
                                fontSize: 11,
                                flexShrink: 0,
                              }}>
                                {k}
                              </span>
                              <span style={{ fontSize: 13 }}>{v}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        border: `1px solid ${a.is_correct ? 'var(--ink)' : 'var(--wrong)'}`,
                        background: a.is_correct ? 'var(--ink-bg-active)' : 'var(--wrong-bg)',
                        fontFamily: mono,
                        fontSize: 13,
                      }}>
                        <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>{t('yourAnswer')}:</span>
                        <span>{selectedAsStrings.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </Shell>
  );
}
