'use client';

// ui.tsx — shared primitives ported from legacy/ui.jsx.
// Same inline-style + CSS-variable approach; ES exports instead of
// Object.assign(window, …). StatusBadge maps Prisma enums to display labels.

import type { CSSProperties, ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { BADGE_MAP, type BadgeKey } from '@/lib/status';

// StatusBadge — `variant` mirrors the legacy theme.badge presets; editorial
// ships 'underline'. The enum→key mappers live in lib/status (server-callable).
export function StatusBadge({
  statusKey,
  variant = 'underline',
}: {
  statusKey: BadgeKey;
  variant?: 'underline' | 'square' | 'pill';
}) {
  const m = BADGE_MAP[statusKey] ?? BADGE_MAP.draft;
  const style: CSSProperties =
    variant === 'underline'
      ? {
          color: m.color,
          borderBottom: `1.5px solid ${m.color}`,
          padding: '0 0 1px',
          fontVariant: 'small-caps',
          letterSpacing: '.04em',
          fontWeight: 600,
          fontSize: 11,
          textTransform: 'lowercase',
        }
      : variant === 'square'
        ? {
            color: m.color,
            background: m.bg,
            borderRadius: 3,
            padding: '1px 6px',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            border: `1px solid ${m.color}33`,
          }
        : {
            color: m.color,
            background: m.bg,
            borderRadius: 999,
            padding: '2px 9px',
            fontSize: 11.5,
            fontWeight: 500,
          };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...style }}>
      {variant !== 'underline' && (
        <span style={{ width: 6, height: 6, borderRadius: 3, background: m.color }} />
      )}
      {m.label}
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────
export function Avatar({
  name,
  size = 22,
  accent,
}: {
  name: string;
  size?: number;
  accent?: string;
}) {
  const initials = (name || '?')
    .split(/[.\s_-]/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  let h = 0;
  for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) % 360;
  const bg = accent || `oklch(0.78 0.10 ${h})`;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        fontSize: Math.max(9, size * 0.42),
        fontWeight: 600,
        flexShrink: 0,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: 0,
      }}
    >
      {initials}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'secondary';

export function Btn({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  style,
  disabled,
  icon,
  type = 'button',
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: 'sm' | 'md';
  style?: CSSProperties;
  disabled?: boolean;
  icon?: ReactNode;
  type?: 'button' | 'submit';
}) {
  const v: CSSProperties =
    variant === 'primary'
      ? { background: 'var(--cl-accent)', color: '#fff', border: '1px solid var(--cl-accent)' }
      : variant === 'success'
        ? { background: 'var(--cl-success)', color: '#fff', border: '1px solid var(--cl-success)' }
        : variant === 'danger'
          ? { background: 'transparent', color: 'var(--cl-danger)', border: '1px solid var(--cl-line)' }
          : variant === 'ghost'
            ? { background: 'transparent', color: 'var(--cl-ink-soft)', border: '1px solid transparent' }
            : { background: 'var(--cl-bg)', color: 'var(--cl-ink)', border: '1px solid var(--cl-line)' };
  const s: CSSProperties =
    size === 'sm'
      ? { padding: '4px 10px', fontSize: 12, height: 26 }
      : { padding: '6px 14px', fontSize: 13, height: 32 };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        ...s,
        borderRadius: 'var(--cl-radius)',
        cursor: disabled ? 'default' : 'pointer',
        fontWeight: 500,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        transition: 'background .12s, transform .08s',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ── Chip ───────────────────────────────────────────────────────
export function Chip({
  children,
  color,
  onClick,
}: {
  children: ReactNode;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 8px',
        borderRadius: 999,
        background: 'var(--cl-chip)',
        color: color || 'var(--cl-ink-soft)',
        fontSize: 11,
        fontWeight: 500,
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {children}
    </span>
  );
}

// ── Toast (client only) ────────────────────────────────────────
interface ToastOpts {
  kind?: 'success' | 'error';
  duration?: number;
}
type ToastFn = (msg: string, opts?: ToastOpts) => void;
const ToastCtx = createContext<ToastFn | null>(null);

interface ToastItem extends ToastOpts {
  id: string;
  msg: string;
}

export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback<ToastFn>((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, msg, ...opts }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), opts.duration || 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            style={{
              background: 'var(--cl-ink)',
              color: 'var(--cl-bg)',
              padding: '10px 16px',
              borderRadius: 'var(--cl-radius)',
              fontSize: 13,
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              animation: 'cl-toast-in .25s ease',
              maxWidth: 380,
            }}
          >
            {t.kind === 'success' && <span style={{ color: '#7CDB9D' }}>✓</span>}
            {t.kind === 'error' && <span style={{ color: '#F5A3A3' }}>✕</span>}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastHost>');
  return ctx;
}
