import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../api/teacher';

export function useTeacherNav() {
  const { t } = useTranslation();
  const { data: questions } = useQuery({
    queryKey: ['teacher-questions', 'all'],
    queryFn: () => teacherApi.getQuestions(),
  });
  const { data: subjects } = useQuery({ queryKey: ['teacher-subjects'], queryFn: teacherApi.getSubjects });
  const { data: exams } = useQuery({ queryKey: ['teacher-exams'], queryFn: teacherApi.getExams });

  return [
    { label: t('subjects'), to: '/teacher/subjects', count: subjects?.length },
    { label: t('exams'), to: '/teacher/exams', count: exams?.length },
    { label: t('questions'), to: '/teacher', count: questions?.length },
  ];
}
