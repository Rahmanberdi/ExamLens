import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';

export function useAdminNav() {
  const { t } = useTranslation();
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: adminApi.getSubjects });
  const { data: exams } = useQuery({ queryKey: ['exams'], queryFn: adminApi.getExams });
  const { data: questions } = useQuery({ queryKey: ['questions'], queryFn: adminApi.getQuestions });
  const { data: answers } = useQuery({ queryKey: ['answers'], queryFn: adminApi.getAnswers });
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: adminApi.getStudents });
  return [
    { label: t('overview'), to: '/admin' },
    { label: t('subjects'), to: '/admin/subjects', count: subjects?.length },
    { label: t('exams'), to: '/admin/exams', count: exams?.length },
    { label: t('questions'), to: '/admin/questions', count: questions?.length },
    { label: t('answers'), to: '/admin/answers', count: answers?.length },
    { label: t('students'), to: '/admin/students', count: students?.length },
    { label: t('import'), to: '/admin/import' },
  ];
}
