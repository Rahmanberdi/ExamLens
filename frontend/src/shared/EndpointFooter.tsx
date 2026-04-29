export function EndpointFooter({ method, path }: { method: string; path: string }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 210,
      right: 0,
      height: 28,
      borderTop: '1px solid var(--line)',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      zIndex: 10,
    }}>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)', fontWeight: 500 }}>
        {method}
      </span>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-3)' }}>
        {path}
      </span>
    </div>
  );
}