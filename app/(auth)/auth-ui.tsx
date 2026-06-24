'use client';

// Shared inline form primitives for the login/register pages. Kept out of the
// page files because Next.js pages may only export a default component.
// (The full ui.tsx component port lands in Phase 3.)

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main style={{ maxWidth: 380, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 24 }}>{title}</h1>
      {children}
      <p style={{ marginTop: 18, fontSize: 14, color: 'var(--cl-ink-soft)' }}>
        {footer}
      </p>
    </main>
  );
}

export function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span
        style={{
          display: 'block',
          fontSize: 13,
          color: 'var(--cl-ink-soft)',
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '9px 11px',
          border: '1px solid var(--cl-line)',
          borderRadius: 'var(--cl-radius)',
          background: 'var(--cl-surface)',
          color: 'var(--cl-ink)',
          fontFamily: 'inherit',
          fontSize: 15,
          boxSizing: 'border-box',
        }}
      />
    </label>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%',
        padding: '10px 14px',
        marginTop: 8,
        border: 'none',
        borderRadius: 'var(--cl-radius)',
        background: 'var(--cl-accent)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 600,
        cursor: pending ? 'default' : 'pointer',
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? '…' : children}
    </button>
  );
}
