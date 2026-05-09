const mono = "'JetBrains Mono', monospace";

interface EndpointFooterProps {
  method: string;
  path: string;
  status?: string;
  /** horizontal padding override; default 24 (pages); use 16 for narrower panes */
  px?: number;
}

export function EndpointFooter({ method, path, status = '200 OK · 142ms', px = 24 }: EndpointFooterProps) {
  const methodColor = method === 'POST' ? 'var(--accent)' : 'var(--ink-2)';
  return (
    <div style={{
      borderTop: '1px solid var(--line)',
      padding: `10px ${px}px`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 11,
      color: 'var(--ink-3)',
      fontFamily: mono,
      flexShrink: 0,
    }}>
      <span>
        <span style={{ color: methodColor, fontWeight: 600 }}>{method}</span>
        {' '}{path}
      </span>
      <span>{status}</span>
    </div>
  );
}
