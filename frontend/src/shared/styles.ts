import React from 'react';

export const inputStyle: React.CSSProperties = {
  height: 32,
  padding: '7px 10px',
  border: '1px solid var(--line-2)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  fontSize: 13,
  width: '100%',
  borderRadius: 0,
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

export const btnPrimary: React.CSSProperties = {
  height: 30,
  padding: '0 12px',
  background: 'var(--ink)',
  color: 'var(--bg)',
  border: 'none',
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
  fontWeight: 500,
};

export const btnGhost: React.CSSProperties = {
  height: 30,
  padding: '0 12px',
  background: 'transparent',
  color: 'var(--ink)',
  border: '1px solid var(--line-2)',
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
};
