import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { getPayload } from '../../api/auth';

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

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
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
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function StudentExams() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const [search, setSearch] = useSearchParams();
  const [subjectFilter, setSubjectFilter] = useState(search.get('subject') ?? '');

  const { data: exams, isLoading } = useQuery({ queryKey: ['student-exams'], queryFn: studentApi.getExams });
  const { data: wrongs } = useQuery({ queryKey: ['student-wrong'], queryFn: studentApi.getWrongQuestions });

  // Sync filter to URL
  useEffect(() => {
    const next = new URLSearchParams(search);
    if (subjectFilter) next.set('subject', subjectFilter); else next.delete('subject');
    if (next.toString() !== search.toString()) setSearch(next, { replace: true });
  }, [subjectFilter, search, setSearch]);

  const subjectOptions = Array.from(
    new Map((exams ?? []).map((e) => [e.subject, e.subject_name])).entries()
  ).map(([id, name]) => ({ id, name }));

  const filtered = (exams ?? []).filter((e) => !subjectFilter || String(e.subject) === subjectFilter);

  const nav = [
    { label: t('myExams'), to: '/student', count: exams?.length },
    { label: t('subjects'), to: '/student/subjects', count: subjectOptions.length },
    { label: t('wrongAnswers'), to: '/student/wrong', count: wrongs?.length },
  ];

  // Stats
  const examsTaken = filtered.length;
  const totalObtained = filtered.reduce((s, e) => s + Number(e.score_obtained), 0);
  const totalMax = filtered.reduce((s, e) => s + Number(e.total_score), 0);
  const avgScore = totalMax > 0 ? `${((totalObtained / totalMax) * 100).toFixed(0)}%` : '—';
  const avgSub = totalMax > 0 ? `${totalObtained.toFixed(0)} ${t('of')} ${totalMax.toFixed(0)} ${t('points')}` : '';
  const subjectSub = subjectFilter
    ? subjectOptions.find((s) => String(s.id) === subjectFilter)?.name ?? ''
    : Array.from(new Set(filtered.map((e) => e.subject_name))).join(' · ');

  // Wrong count restricted to filtered exams
  const filteredExamIds = new Set(filtered.map((e) => e.id));
  const wrongCount = (wrongs ?? []).filter((w) => filteredExamIds.has(w.question.exam)).length;

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', overflow: 'auto', padding: 24 }}>
        {/* Stat tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--line)',
          borderLeft: '1px solid var(--line)',
          marginBottom: 24,
        }}>
          <StatTile label={t('examsTaken')} value={examsTaken} sub={subjectSub} />
          <StatTile label={t('avgScore')} value={avgScore} sub={avgSub} />
          <StatTile label={t('wrongAnswers')} value={wrongCount} sub={t('acrossExams')} />
        </div>

        {/* Heading + filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('myExams')}</span>
          <span style={{ flex: 1 }} />
          <select style={pillStyle} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">{t('subject')}: —</option>
            {subjectOptions.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--line)' }}>
          {isLoading && (
            <div style={{ padding: '20px 0', color: 'var(--ink-4)', fontSize: 13 }}>{t('loading')}</div>
          )}
          {!isLoading && !filtered.length && (
            <div style={{ padding: '20px 0', color: 'var(--ink-4)', fontSize: 13 }}>{t('noData')}</div>
          )}
          {filtered.map((e) => {
            const total = Number(e.total_score);
            const score = Number(e.score_obtained);
            const pct = total > 0 ? (score / total) * 100 : 0;
            return (
              <Link
                key={e.id}
                to={`/student/exams/${e.id}`}
                style={{
                  padding: '20px 0',
                  borderBottom: '1px solid var(--line)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--ink-3)' }}>#{e.id}</span>
                    <span style={{
                      fontSize: 11,
                      padding: '1px 6px',
                      border: '1px solid var(--line-2)',
                      color: 'var(--ink-2)',
                    }}>
                      {e.subject_name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>{e.exam_date}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{e.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--line)', position: 'relative', maxWidth: 360 }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        width: `${Math.min(pct, 100)}%`,
                        background: 'var(--ink)',
                      }} />
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      fontFamily: mono,
                      minWidth: 40,
                    }}>
                      {pct.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 28,
                    fontWeight: 400,
                    fontFamily: mono,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span>{score.toFixed(0)}</span>
                    <span style={{ color: 'var(--ink-4)' }}>/{total.toFixed(0)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                    {t('viewDetails')} →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </Shell>
  );
}
