import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { Shell } from '../../shared/Shell';
import { Th, Td, EmptyRow, SkeletonRows } from '../../shared/Table';
import { TypeBadge } from '../../shared/TypeBadge';
import { EndpointFooter } from '../../shared/EndpointFooter';
import { getPayload } from '../../api/auth';
import { useAdminNav } from './adminNav';

export function AdminQuestions() {
  const { t } = useTranslation();
  const user = getPayload()!;
  const nav = useAdminNav();

  const { data: questions, isLoading } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });
  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });

  const examMap = Object.fromEntries((exams ?? []).map((e) => [e.id, e.name]));

  return (
    <Shell
      user={user}
      nav={nav}
      headerRight={
        <Link to="/admin/questions/new" style={{ padding: '5px 12px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12 }}>
          + {t('newQuestion')}
        </Link>
      }
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('questions')}</h1>
      <table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{t('exam')}</Th>
            <Th>{t('no')}</Th>
            <Th>{t('type')}</Th>
            <Th>{t('content')}</Th>
            <Th right>{t('maxScore')}</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? <SkeletonRows cols={7} /> : !questions?.length ? <EmptyRow cols={7} label={t('noData')} /> : (
            questions.map((q) => (
              <tr key={q.id}>
                <Td mono>{q.id}</Td>
                <Td>{examMap[q.exam] ?? q.exam}</Td>
                <Td mono>{q.question_number}</Td>
                <Td><TypeBadge type={q.question_type} /></Td>
                <Td>{q.content.length > 60 ? q.content.slice(0, 60) + '…' : q.content}</Td>
                <Td right mono>{q.max_score}</Td>
                <Td>
                  <Link to={`/admin/questions/${q.id}/edit`} style={{ fontSize: 11, color: 'var(--accent)' }}>
                    {t('edit')}
                  </Link>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <EndpointFooter method="GET" path="/api/admin/questions/" />
    </Shell>
  );
}
