import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../api/teacher';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { getPayload } from '../../api/auth';
import { useTeacherNav } from './teacherNav';

const mono = "'JetBrains Mono', monospace";

export function TeacherSubjects() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useTeacherNav();
  const navigate = useNavigate();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: teacherApi.getSubjects,
  });
  const { data: exams } = useQuery({
    queryKey: ['teacher-exams'],
    queryFn: teacherApi.getExams,
  });

  const examCount: Record<number, number> = {};
  (exams ?? []).forEach((e) => { examCount[e.subject] = (examCount[e.subject] ?? 0) + 1; });

  return (
    <Shell user={user} nav={nav}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('subjects')}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: mono }}>
            {subjects?.length ?? 0}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
            {t('viewDetails')} →
          </span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <Th w={44}>{t('id')}</Th>
                <Th>{t('name')}</Th>
                <Th>{t('description')}</Th>
                <Th w={110}>{t('date')}</Th>
                <Th w={70} align="right">{t('exams')}</Th>
                <Th w={32} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows cols={6} />
              ) : !subjects?.length ? (
                <EmptyRow cols={6} label={t('noData')} />
              ) : (
                subjects.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/teacher/exams?subject=${s.id}`)}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      cursor: 'pointer',
                    }}
                  >
                    <Td mono>#{s.id}</Td>
                    <Td>{s.name}</Td>
                    <Td>{s.description || <span style={{ color: 'var(--ink-4)' }}>—</span>}</Td>
                    <Td mono>{s.created_at.slice(0, 10)}</Td>
                    <Td mono align="right">{examCount[s.id] ?? 0}</Td>
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
