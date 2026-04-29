import React from 'react';

export function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th style={{ textAlign: right ? 'right' : 'left' }}>{children}</th>;
}

export function Td({
  children,
  right,
  mono,
}: {
  children: React.ReactNode;
  right?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: right ? 'right' : 'left',
        fontFamily: mono ? "'JetBrains Mono', monospace" : undefined,
        color: children === '—' ? 'var(--ink-4)' : undefined,
      }}
    >
      {children ?? '—'}
    </td>
  );
}

export function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '24px 0' }}>
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
            <td key={j}>
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