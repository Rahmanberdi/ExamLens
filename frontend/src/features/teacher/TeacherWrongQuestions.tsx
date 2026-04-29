import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../api/teacher';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { TypeBadge } from '../../shared/TypeBadge';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';

function useDebounce(fn: (v: string) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  return useCallback((v: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(v), delay);
  }, [fn, delay]);
}

export function TeacherWrongQuestions() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  const nav = [
    { label: t('wrongQuestions'), to: '/teacher' },
  ];

  const { data: wrongQs, isLoading } = useQuery({
    queryKey: ['teacher-wrong', keyword],
    queryFn: () => teacherApi.getWrongQuestions(keyword || undefined),
  });

  const { data: detail } = useQuery({
    queryKey: ['teacher-question', selected],
    queryFn: () => teacherApi.getQuestionDetail(selected!),
    enabled: selected != null,
  });

  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const examMap = Object.fromEntries((exams ?? []).map((e) => [e.id, e.name]));

  const handleSearch = useDebounce((v: string) => setKeyword(v), 300);

  return (
    <Shell user={user} nav={nav}>
      <div style={{ display: 'flex', height: 'calc(100vh - 52px - 28px)', gap: 0 }}>
        {/* Left pane */}
        <div style={{ flex: '0 0 55%', borderRight: '1px solid var(--line)', overflowY: 'auto', paddingRight: 0 }}>
          <div style={{ padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 600 }}>{t('wrongQuestions')}</h1>
          </div>

          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <input
              style={{ padding: '5px 8px', border: '1px solid var(--line-2)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 12, flex: 1 }}
              placeholder={t('keyword')}
              defaultValue={keyword}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>{t('exam')}</Th>
                <Th>{t('no')}</Th>
                <Th>{t('type')}</Th>
                <Th>{t('content')}</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <SkeletonRows cols={5} /> : !wrongQs?.length ? <EmptyRow cols={5} label={t('noData')} /> : (
                wrongQs.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelected(q.id)}
                    style={{ cursor: 'pointer', background: selected === q.id ? 'var(--ink-bg-active)' : undefined }}
                  >
                    <Td mono>{q.id}</Td>
                    <Td>{examMap[q.exam] ?? q.exam}</Td>
                    <Td mono>{q.question_number}</Td>
                    <Td><TypeBadge type={q.question_type} /></Td>
                    <Td>{q.content.length > 50 ? q.content.slice(0, 50) + '…' : q.content}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right detail pane */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 0 24px' }}>
          {selected == null ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-4)', fontSize: 13 }}>
              {t('viewDetails')}
            </div>
          ) : detail ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <TypeBadge type={detail.question_type} />
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 8 }}>Q{detail.question_number}. {detail.content}</div>
              </div>

              {Object.keys(detail.options).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {Object.entries(detail.options).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-3)', minWidth: 16 }}>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t('correctAnswer')}:</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                  {JSON.stringify(detail.correct_answer)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 12 }}>{t('maxScore')}:</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{detail.max_score}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {t('wrongStudents')} ({detail.wrong_answer_students.length})
                </div>
                {detail.wrong_answer_students.length === 0 ? (
                  <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{t('noData')}</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <Th>ID</Th>
                        <Th>{t('username')}</Th>
                        <Th>{t('realName')}</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.wrong_answer_students.map((s) => (
                        <tr key={s.id}>
                          <Td mono>{s.id}</Td>
                          <Td mono>{s.username}</Td>
                          <Td>{s.real_name || '—'}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--ink-4)', fontSize: 12 }}>{t('loading')}</div>
          )}
        </div>
      </div>
      <EndpointFooter method="GET" path="/api/teacher/wrong-questions/" />
    </Shell>
  );
}
