import React from 'react';

type Align = 'left' | 'right' | 'center';

interface ThProps {
  children?: React.ReactNode;
  w?: number | string;
  align?: Align;
  /** legacy alias for align="right" */
  right?: boolean;
}

export function Th({ children, w, align, right }: ThProps) {
  const textAlign: Align = align ?? (right ? 'right' : 'left');
  return (
    <th style={{
      textAlign,
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--ink-3)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      padding: '10px 12px',
      width: w != null ? (typeof w === 'number' ? `${w}px` : w) : 'auto',
      background: 'transparent',
      borderBottom: 'none',
    }}>
      {children}
    </th>
  );
}

interface TdProps {
  children?: React.ReactNode;
  mono?: boolean;
  align?: Align;
  /** legacy alias for align="right" */
  right?: boolean;
}

export function Td({ children, mono, align, right }: TdProps) {
  const textAlign: Align = align ?? (right ? 'right' : 'left');
  return (
    <td style={{
      padding: '11px 12px',
      verticalAlign: 'middle',
      textAlign,
      fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
      fontSize: mono ? 12 : 13,
      color: mono ? 'var(--ink-2)' : 'var(--ink)',
      fontVariantNumeric: 'tabular-nums',
      borderBottom: 'none',
      background: 'transparent',
    }}>
      {children ?? '—'}
    </td>
  );
}

export function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '24px 0', fontSize: 13, background: 'transparent', borderBottom: 'none' }}>
        {label}
      </td>
    </tr>
  );
}

export function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ padding: '11px 12px', background: 'transparent', borderBottom: 'none' }}>
              <div
                style={{
                  height: 14,
                  background: 'var(--ink-bg-active)',
                  borderRadius: 0,
                  width: j === 0 ? '40%' : '70%',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
