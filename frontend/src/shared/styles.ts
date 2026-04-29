import React from 'react';

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
