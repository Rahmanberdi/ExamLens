import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      padding: '20px 24px',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink)' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function AdminOverview() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });
  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const { data: questions } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: adminApi.getStudents });

  return (
    <Shell user={user} nav={nav}>
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>{t('overview')}</h1>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label={t('subjects')} value={subjects?.length} />
        <StatCard label={t('exams')} value={exams?.length} />
        <StatCard label={t('questions')} value={questions?.length} />
        <StatCard label={t('students')} value={students?.length} />
      </div>
    </Shell>
  );
}
