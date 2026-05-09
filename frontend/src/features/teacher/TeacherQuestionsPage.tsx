import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../api/teacher';
import { Shell } from '../../shared/Shell';
import { TypeBadge } from '../../shared/TypeBadge';
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

function useDebounce(fn: (v: string) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  return useCallback((v: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(v), delay);
  }, [fn, delay]);
}

function formatAnswer(arr: (string | boolean)[], t: (k: string) => string): string {
  if (!arr || arr.length === 0) return '—';
  return arr
    .map((s) => (typeof s === 'boolean' ? (s ? t('true_') : t('false_')) : `"${s}"`))
    .join(', ');
}

type StudentFilter = 'all' | 'wrong' | 'correct';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}
function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--line-2)' }}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              height: 28,
              padding: '0 10px',
              border: 'none',
              borderLeft: i ? '1px solid var(--line-2)' : 'none',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--ink-2)',
              fontSize: 12,
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontWeight: active ? 500 : 400,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TeacherQuestionsPage() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useTeacherNav();
  const [search, setSearch] = useSearchParams();

  // List filters
  const [keyword, setKeyword] = useState(search.get('keyword') ?? '');
  const [subjectFilter, setSubjectFilter] = useState(search.get('subject') ?? '');
  const [examFilter, setExamFilter] = useState(search.get('exam') ?? '');

  // Detail-pane filter (which students to show)
  const [studentFilter, setStudentFilter] = useState<StudentFilter>('all');

  const [selected, setSelected] = useState<number | null>(
    search.get('q') ? Number(search.get('q')) : null
  );

  // Persist filters to URL
  useEffect(() => {
    const next = new URLSearchParams(search);
    keyword ? next.set('keyword', keyword) : next.delete('keyword');
    subjectFilter ? next.set('subject', subjectFilter) : next.delete('subject');
    examFilter ? next.set('exam', examFilter) : next.delete('exam');
    selected != null ? next.set('q', String(selected)) : next.delete('q');
    if (next.toString() !== search.toString()) setSearch(next, { replace: true });
  }, [keyword, subjectFilter, examFilter, selected, search, setSearch]);

  const { data: subjects } = useQuery({ queryKey: ['teacher-subjects'], queryFn: teacherApi.getSubjects });
  const { data: exams } = useQuery({ queryKey: ['teacher-exams'], queryFn: teacherApi.getExams });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['teacher-questions', { keyword, subjectFilter, examFilter }],
    queryFn: () => teacherApi.getQuestions({
      keyword: keyword || undefined,
      subject: subjectFilter || undefined,
      exam: examFilter || undefined,
    }),
  });

  const { data: detail } = useQuery({
    queryKey: ['teacher-question-detail', selected],
    queryFn: () => teacherApi.getQuestionDetail(selected!),
    enabled: selected != null,
  });

  // Clear selection if it leaves the filtered list
  useEffect(() => {
    if (selected != null && questions && !questions.some((q) => q.id === selected)) {
      setSelected(null);
    }
  }, [questions, selected]);

  const handleSearch = useDebounce((v: string) => setKeyword(v), 300);

  const examOptions = useMemo(() => {
    if (!subjectFilter) return exams ?? [];
    return (exams ?? []).filter((e) => String(e.subject) === subjectFilter);
  }, [exams, subjectFilter]);

  // Detail-pane derived values
  const allAnswers = detail?.student_answers ?? [];
  const wrongAnswers = allAnswers.filter((a) => !a.is_correct);
  const correctAnswers = allAnswers.filter((a) => a.is_correct);
  const visibleAnswers =
    studentFilter === 'wrong' ? wrongAnswers
    : studentFilter === 'correct' ? correctAnswers
    : allAnswers;

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 460px' }}>
        {/* Left pane — list */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)', minWidth: 0 }}>
          {/* Filter strip */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)' }}>
            {/* Search */}
            <div style={{
              height: 34,
              border: '1px solid var(--line-2)',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontFamily: mono,
            }}>
              <span style={{ color: 'var(--ink-4)' }}>⌕</span>
              <span style={{ color: 'var(--ink-3)' }}>keyword=</span>
              <input
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontFamily: mono,
                  fontSize: 13,
                  color: 'var(--ink)',
                  padding: 0,
                }}
                defaultValue={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('keywordHint')}
              />
              <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>{t('pressEnter')}</span>
            </div>

            {/* Filters row */}
            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                style={pillStyle}
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setExamFilter('');
                }}
              >
                <option value="">{t('subject')}: —</option>
                {(subjects ?? []).map((s) => (
                  <option key={s.id} value={String(s.id)}>S{s.id} {s.name}</option>
                ))}
              </select>
              <select style={pillStyle} value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
                <option value="">{t('exam')}: —</option>
                {examOptions.map((e) => (
                  <option key={e.id} value={String(e.id)}>E{e.id} {e.name}</option>
                ))}
              </select>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
                {questions?.length ?? 0}
              </span>
            </div>

          </div>

          {/* Card list */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {isLoading && (
              <div style={{ padding: 24, color: 'var(--ink-4)', fontSize: 13 }}>{t('loading')}</div>
            )}
            {!isLoading && !questions?.length && (
              <div style={{ padding: 24, color: 'var(--ink-4)', fontSize: 13 }}>{t('noData')}</div>
            )}
            {questions?.map((q) => {
              const isSelected = selected === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelected(q.id)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--line)',
                    background: isSelected ? 'var(--ink-bg-active)' : 'transparent',
                    borderLeft: `2px solid ${isSelected ? 'var(--ink)' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>#{q.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
                      E{q.exam}·Q{q.question_number}
                    </span>
                    <TypeBadge type={q.question_type} />
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--ink-3)' }}>
                      <span style={{ color: 'var(--wrong)' }}>{q.wrong_count}</span>
                      <span style={{ color: 'var(--ink-4)' }}> / </span>
                      <span style={{ color: 'var(--ink)' }}>{q.total_count}</span>
                      <span style={{ color: 'var(--ink-4)' }}> {t('wrong').toLowerCase()}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 6, fontWeight: isSelected ? 500 : 400 }}>
                    {q.content}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
                    correct: {JSON.stringify(q.correct_answer)} · max {q.max_score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane — detail */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

          <div style={{ flex: 1, padding: 24 }}>
            {selected == null ? (
              <div style={{ color: 'var(--ink-4)', fontSize: 13, padding: '60px 0', textAlign: 'center' }}>
                {t('viewDetails')}
              </div>
            ) : !detail ? (
              <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>{t('loading')}</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--ink-3)' }}>#{detail.id}</span>
                  <TypeBadge type={detail.question_type} />
                  <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--ink-3)' }}>
                    E{detail.exam}·Q{detail.question_number}
                  </span>
                </div>

                <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, marginBottom: 16 }}>
                  {detail.content}
                </div>

                {Object.keys(detail.options).length > 0 && (
                  <div style={{ borderTop: '1px solid var(--line)' }}>
                    {Object.entries(detail.options).map(([k, v]) => {
                      const isCorrect = (detail.correct_answer as (string | boolean)[]).includes(k);
                      return (
                        <div
                          key={k}
                          style={{
                            padding: '10px 0',
                            borderBottom: '1px solid var(--line)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <span style={{
                            width: 22,
                            height: 22,
                            border: '1px solid',
                            borderColor: isCorrect ? 'var(--ink)' : 'var(--line-2)',
                            background: isCorrect ? 'var(--ink)' : 'transparent',
                            color: isCorrect ? 'var(--bg)' : 'var(--ink-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: mono,
                            fontSize: 12,
                            flexShrink: 0,
                          }}>
                            {k}
                          </span>
                          <span style={{ fontSize: 14 }}>{v}</span>
                          {isCorrect && (
                            <span style={{
                              marginLeft: 'auto',
                              fontSize: 11,
                              color: 'var(--ink-3)',
                              fontFamily: mono,
                            }}>
                              {t('correct').toLowerCase()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Student answers */}
                <div style={{ marginTop: 28 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    gap: 8,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t('student')}</div>
                    <Segmented<StudentFilter>
                      options={[
                        { value: 'all', label: `${t('total')} ${allAnswers.length}` },
                        { value: 'wrong', label: `${t('wrong')} ${wrongAnswers.length}` },
                        { value: 'correct', label: `${t('correct')} ${correctAnswers.length}` },
                      ]}
                      value={studentFilter}
                      onChange={setStudentFilter}
                    />
                  </div>

                  {visibleAnswers.length === 0 ? (
                    <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>{t('noData')}</div>
                  ) : (
                    <div style={{ borderTop: '1px solid var(--line)' }}>
                      {visibleAnswers.map((s) => {
                        const display = s.real_name || s.username;
                        const wrong = !s.is_correct;
                        return (
                          <div
                            key={s.id}
                            style={{
                              padding: '12px 0',
                              borderBottom: '1px solid var(--line)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                            }}
                          >
                            <div style={{
                              width: 28,
                              height: 28,
                              background: 'var(--ink-bg-active)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 500,
                              flexShrink: 0,
                            }}>
                              {display[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{display}</span>
                                <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
                                  {s.username}
                                </span>
                                {s.class_number && (
                                  <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                    {s.class_number}
                                  </span>
                                )}
                              </div>
                              <div style={{
                                marginTop: 6,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '4px 10px',
                                border: `1px solid ${wrong ? 'var(--wrong)' : 'var(--line-2)'}`,
                                background: wrong ? 'var(--wrong-bg)' : 'transparent',
                                fontFamily: mono,
                                fontSize: 12,
                              }}>
                                <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                                  {t('selectedAnswer')}:
                                </span>
                                <span style={{ color: wrong ? 'var(--wrong)' : 'var(--ink)' }}>
                                  {formatAnswer(s.selected_answer, t)}
                                </span>
                                <span style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  color: wrong ? 'var(--wrong)' : 'var(--ink-2)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                }}>
                                  {wrong ? t('wrong') : t('correct')}
                                </span>
                              </div>
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: 'var(--ink-3)',
                              fontFamily: mono,
                              flexShrink: 0,
                              textAlign: 'right',
                            }}>
                              <div style={{ color: wrong ? 'var(--wrong)' : 'var(--ink)' }}>
                                {s.score_obtained}
                              </div>
                              <div>{s.submitted_at.slice(0, 10)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
