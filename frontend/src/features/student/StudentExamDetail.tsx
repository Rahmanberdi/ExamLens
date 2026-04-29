import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { TypeBadge } from '../../shared/TypeBadge';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';

export function StudentExamDetail() {
  const { t } = useTranslation();
  const { examId } = useParams();
  const user = getPayload()!;
  const nav = [
    { label: t('myExams'), to: '/student' },
    { label: t('wrongAnswers'), to: '/student/wrong' },
  ];

  const { data: answers, isLoading } = useQuery({
    queryKey: ['student-exam-questions', examId],
    queryFn: () => studentApi.getExamQuestions(Number(examId)),
  });

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <Link to="/student" style={{ fontSize: 12, color: 'var(--ink-3)', border: '1px solid var(--line-2)', padding: '4px 10px' }}>
          ← {t('backToAll')}
        </Link>
      }
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        {t('exam')} #{examId}
      </h1>

      {isLoading && <div style={{ color: 'var(--ink-4)' }}>{t('loading')}</div>}

      {answers?.map((a) => (
        <div
          key={a.id}
          style={{
            border: '1px solid var(--line)',
            marginBottom: 12,
            padding: 16,
            borderLeft: `3px solid ${a.is_correct ? 'var(--line)' : 'var(--wrong)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <TypeBadge type={a.question.question_type} />
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>Q{a.question.question_number}</div>
            <div style={{ flex: 1, fontSize: 13 }}>{a.question.content}</div>
            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: a.is_correct ? 'var(--ink)' : 'var(--wrong)', whiteSpace: 'nowrap' }}>
              {a.score_obtained} / {a.question.max_score}
            </div>
          </div>

          {Object.keys(a.question.options).length > 0 && (
            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              {Object.entries(a.question.options).map(([k, v]) => {
                const isSelected = (a.selected_answer as string[]).includes(k);
                return (
                  <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 2, fontSize: 12, color: isSelected ? 'var(--ink)' : 'var(--ink-3)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
                    <span>{v}</span>
                    {isSelected && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--accent)' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--ink-3)' }}>
            <span>
              {t('yourAnswer')}:{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: a.is_correct ? 'var(--ink)' : 'var(--wrong)' }}>
                {JSON.stringify(a.selected_answer)}
              </span>
            </span>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}>
              {new Date(a.submitted_at).toLocaleString()}
            </span>
          </div>
        </div>
      ))}

      <EndpointFooter method="GET" path={`/api/student/exams/${examId}/questions/`} />
    </Shell>
  );
}
