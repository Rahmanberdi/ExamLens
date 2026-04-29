import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { studentApi } from '../../api/student';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';

export function StudentExams() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = [
    { label: t('myExams'), to: '/student' },
    { label: t('wrongAnswers'), to: '/student/wrong' },
  ];

  const { data: exams, isLoading } = useQuery({ queryKey: ['student-exams'], queryFn: studentApi.getExams });

  return (
    <Shell user={user} nav={nav}>
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('myExams')}</h1>
      <table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('subject')}</Th>
            <Th>{t('name')}</Th>
            <Th>{t('examDate')}</Th>
            <Th right>{t('scoreObtained')}</Th>
            <Th right>{t('totalScore')}</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <SkeletonRows cols={7} /> : !exams?.length ? <EmptyRow cols={7} label={t('noData')} /> : (
            exams.map((e) => {
              const pct = Number(e.total_score) > 0 ? (e.score_obtained / Number(e.total_score)) * 100 : 0;
              return (
                <tr key={e.id}>
                  <Td mono>{e.id}</Td>
                  <Td>{e.subject_name}</Td>
                  <Td>{e.name}</Td>
                  <Td mono>{e.exam_date}</Td>
                  <Td right mono>{e.score_obtained}</Td>
                  <Td right>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: 'var(--line)', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'var(--ink)' }} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{e.total_score}</span>
                    </div>
                  </Td>
                  <Td>
                    <Link to={`/student/exams/${e.id}`} style={{ fontSize: 11, color: 'var(--accent)' }}>
                      {t('viewDetails')}
                    </Link>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <EndpointFooter method="GET" path="/api/student/exams/" />
    </Shell>
  );
}
