import { useTranslation } from 'react-i18next';

export function useAdminNav() {
  const { t } = useTranslation();
  return [
    { label: t('overview'), to: '/admin' },
    { label: t('subjects'), to: '/admin/subjects' },
    { label: t('exams'), to: '/admin/exams' },
    { label: t('questions'), to: '/admin/questions' },
    { label: t('answers'), to: '/admin/answers' },
    { label: t('students'), to: '/admin/students' },
  ];
}
