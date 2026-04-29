import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--wrong)' }}>{error}</span>}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid var(--line-2)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  fontSize: 13,
  width: '100%',
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};