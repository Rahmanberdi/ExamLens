import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { TypeBadge } from '../../shared/TypeBadge';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';

export function StudentWrong() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = [
    { label: t('myExams'), to: '/student' },
    { label: t('wrongAnswers'), to: '/student/wrong' },
  ];

  const { data: wrongs, isLoading } = useQuery({
    queryKey: ['student-wrong'],
    queryFn: studentApi.getWrongQuestions,
  });

  return (
    <Shell user={user} nav={nav}>
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        {t('wrongAnswers')}
        {wrongs && (
          <span style={{ fontSize: 12, color: 'var(--wrong)', fontFamily: "'JetBrains Mono', monospace", marginLeft: 10 }}>
            {wrongs.length}
          </span>
        )}
      </h1>

      {isLoading && <div style={{ color: 'var(--ink-4)' }}>{t('loading')}</div>}

      {!isLoading && !wrongs?.length && (
        <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>{t('noData')}</div>
      )}

      {wrongs?.map((a) => (
        <div
          key={a.id}
          style={{
            border: '1px solid var(--wrong-bg)',
            borderLeft: '3px solid var(--wrong)',
            background: 'var(--wrong-bg)',
            marginBottom: 12,
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <TypeBadge type={a.question.question_type} />
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
              Q{a.question.question_number}
            </div>
            <div style={{ flex: 1, fontSize: 13 }}>{a.question.content}</div>
            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--wrong)', whiteSpace: 'nowrap' }}>
              0 / {a.question.max_score}
            </div>
          </div>

          {Object.keys(a.question.options).length > 0 && (
            <div style={{ marginBottom: 8, paddingLeft: 16 }}>
              {Object.entries(a.question.options).map(([k, v]) => {
                const isSelected = (a.selected_answer as string[]).includes(k);
                return (
                  <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 2, fontSize: 12, color: isSelected ? 'var(--wrong)' : 'var(--ink-3)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{k}</span>
                    <span>{v}</span>
                    {isSelected && <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--wrong)' }}>✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 16 }}>
            <span>
              {t('yourAnswer')}:{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--wrong)' }}>
                {JSON.stringify(a.selected_answer)}
              </span>
            </span>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}>
              {new Date(a.submitted_at).toLocaleString()}
            </span>
          </div>
        </div>
      ))}

      <EndpointFooter method="GET" path="/api/student/wrong-questions/" />
    </Shell>
  );
}
