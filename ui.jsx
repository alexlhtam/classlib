// ui.jsx — small primitives shared across views
// Status badge, Avatar, Button, Toast, etc.

function StatusBadge({ status, theme }) {
  const map = {
    'stable':   { label: 'Stable',     color: 'var(--cl-success)', bg: 'rgba(22,163,74,.10)' },
    'reviewed': { label: 'Reviewed',   color: 'var(--cl-accent)',  bg: 'var(--cl-accent-tint)' },
    'pr-open':  { label: 'PR open',    color: 'var(--cl-accent)',  bg: 'var(--cl-accent-tint)' },
    'draft':    { label: 'Draft',      color: 'var(--cl-ink-soft)', bg: 'var(--cl-chip)' },
    'open':     { label: 'Open',       color: 'var(--cl-success)', bg: 'rgba(22,163,74,.10)' },
    'merged':   { label: 'Merged',     color: '#6E40C9',           bg: 'rgba(110,64,201,.10)' },
    'rejected': { label: 'Rejected',   color: 'var(--cl-danger)',  bg: 'rgba(220,38,38,.10)' },
  };
  const m = map[status] || map.draft;
  const style = theme === 'underline' ? {
    color: m.color, borderBottom: `1.5px solid ${m.color}`, padding: '0 0 1px',
    fontVariant: 'small-caps', letterSpacing: '.04em', fontWeight: 600,
    fontSize: 11, textTransform: 'lowercase',
  } : theme === 'square' ? {
    color: m.color, background: m.bg, borderRadius: 3, padding: '1px 6px',
    fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    border: `1px solid ${m.color}33`,
  } : {
    color: m.color, background: m.bg, borderRadius: 999, padding: '2px 9px',
    fontSize: 11.5, fontWeight: 500,
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...style }}>
    {theme !== 'underline' && <span style={{ width: 6, height: 6, borderRadius: 3, background: m.color }} />}
    {m.label}
  </span>;
}

function Avatar({ name, size = 22, accent }) {
  const initials = (name || '?').split(/[.\s_-]/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  // Hash to a hue for variety
  let h = 0; for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) % 360;
  const bg = accent || `oklch(0.78 0.10 ${h})`;
  return <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: size, height: size, borderRadius: '50%', background: bg,
    color: '#fff', fontSize: Math.max(9, size * 0.42), fontWeight: 600, flexShrink: 0,
    fontFamily: 'system-ui, sans-serif', letterSpacing: 0,
  }}>{initials}</span>;
}

function IconBtn({ children, onClick, title, active, style }) {
  return <button onClick={onClick} title={title}
    style={{
      appearance: 'none', border: 'none', background: active ? 'var(--cl-chip)' : 'transparent',
      color: active ? 'var(--cl-ink)' : 'var(--cl-ink-soft)',
      width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .12s, color .12s', ...style,
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--cl-line-soft)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >{children}</button>;
}

function Btn({ children, onClick, variant = 'secondary', size = 'md', style, disabled, icon }) {
  const v = variant === 'primary' ? {
    background: 'var(--cl-accent)', color: '#fff', border: '1px solid var(--cl-accent)',
  } : variant === 'success' ? {
    background: 'var(--cl-success)', color: '#fff', border: '1px solid var(--cl-success)',
  } : variant === 'danger' ? {
    background: 'transparent', color: 'var(--cl-danger)', border: '1px solid var(--cl-line)',
  } : variant === 'ghost' ? {
    background: 'transparent', color: 'var(--cl-ink-soft)', border: '1px solid transparent',
  } : {
    background: 'var(--cl-bg)', color: 'var(--cl-ink)', border: '1px solid var(--cl-line)',
  };
  const s = size === 'sm'
    ? { padding: '4px 10px', fontSize: 12, height: 26 }
    : { padding: '6px 14px', fontSize: 13, height: 32 };
  return <button onClick={onClick} disabled={disabled}
    style={{
      ...v, ...s, borderRadius: 'var(--cl-radius)', cursor: disabled ? 'default' : 'pointer',
      fontWeight: 500, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center',
      gap: 6, opacity: disabled ? 0.5 : 1, transition: 'background .12s, transform .08s',
      whiteSpace: 'nowrap', ...style,
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(.96)'; }}
    onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.filter = 'none'; }}
  >{icon}{children}</button>;
}

function Chip({ children, color, onClick }) {
  return <span onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px',
    borderRadius: 999, background: 'var(--cl-chip)', color: color || 'var(--cl-ink-soft)',
    fontSize: 11, fontWeight: 500, cursor: onClick ? 'pointer' : 'default',
    fontFamily: 'system-ui, sans-serif',
  }}>{children}</span>;
}

// Toast — global queue, fade-up animation
const ToastCtx = React.createContext(null);
function ToastHost({ children }) {
  const [items, setItems] = React.useState([]);
  const push = React.useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, msg, ...opts }]);
    setTimeout(() => setItems((x) => x.filter(i => i.id !== id)), opts.duration || 3200);
  }, []);
  return <ToastCtx.Provider value={push}>
    {children}
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000, pointerEvents: 'none',
    }}>
      {items.map(t => (
        <div key={t.id} style={{
          background: 'var(--cl-ink)', color: 'var(--cl-bg)',
          padding: '10px 16px', borderRadius: 'var(--cl-radius)',
          fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,.18)',
          display: 'inline-flex', alignItems: 'center', gap: 10, animation: 'cl-toast-in .25s ease',
          maxWidth: 380,
        }}>
          {t.kind === 'success' && <span style={{ color: '#7CDB9D' }}>✓</span>}
          {t.kind === 'error' && <span style={{ color: '#F5A3A3' }}>✕</span>}
          {t.msg}
        </div>
      ))}
    </div>
  </ToastCtx.Provider>;
}
function useToast() { return React.useContext(ToastCtx); }

// Icons (inline SVG so they pick up currentColor)
const I = {
  search: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="m11 11 3 3" /></svg>,
  plus: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>,
  pencil: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m11 2 3 3-8 8H3v-3z" /></svg>,
  branch: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="4" cy="3" r="1.5" /><circle cx="4" cy="13" r="1.5" /><circle cx="12" cy="6" r="1.5" /><path d="M4 4.5v7M4 9c0-2 8-1 8-3" /></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 3 3 7-7" /></svg>,
  x: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8" /></svg>,
  eye: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>,
  split: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2.5" width="5.5" height="11" rx="1" /><rect x="8.5" y="2.5" width="5.5" height="11" rx="1" /></svg>,
  write: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3h10v10H3z" /><path d="M6 6h4M6 9h6M6 12h3" /></svg>,
  arrow: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10m-4-4 4 4-4 4" /></svg>,
  back: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M13 8H3m4-4-4 4 4 4" /></svg>,
  module: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" /><rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" /></svg>,
  doc: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1.5h7l3 3V14a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" /><path d="M10 1.5v3h3" /></svg>,
  pr: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="4" cy="3.5" r="1.5" /><circle cx="4" cy="12.5" r="1.5" /><circle cx="12" cy="12.5" r="1.5" /><path d="M4 5v6M9 4l3 3v4" /><path d="M9 4h-2" /></svg>,
  history: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8a6 6 0 1 0 1.7-4.2L2 5.5" /><path d="M2 2v3.5h3.5" /><path d="M8 5v3l2 2" /></svg>,
  user: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3" /><path d="M2.5 14a5.5 5.5 0 0 1 11 0" /></svg>,
  lightning: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M9 1 2 9h4l-1 6 7-8H8z" /></svg>,
};

Object.assign(window, { StatusBadge, Avatar, IconBtn, Btn, Chip, ToastHost, useToast, I });
