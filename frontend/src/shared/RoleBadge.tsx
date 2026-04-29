import { useTranslation } from 'react-i18next';

type Role = 'admin' | 'teacher' | 'student';

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation();
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      fontSize: 11,
      border: '1px solid var(--line-2)',
      color: 'var(--accent)',
    }}>
      {t(`role_${role}`)}
    </span>
  );
}