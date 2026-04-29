import { useTranslation } from 'react-i18next';

type QType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank';

const typeKey: Record<QType, string> = {
  single_choice: 'qt_short_single',
  multiple_choice: 'qt_short_multiple',
  true_false: 'qt_short_tf',
  fill_blank: 'qt_short_fill',
};

export function TypeBadge({ type }: { type: QType }) {
  const { t } = useTranslation();
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      fontSize: 11,
      border: '1px solid var(--line-2)',
      color: 'var(--ink-3)',
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
    }}>
      {t(typeKey[type])}
    </span>
  );
}