import Link from 'next/link';

// Small placeholder panel for routes whose full implementation lands in a later
// phase, so navigation targets resolve instead of 404-ing.
export function ComingSoon({
  title,
  subtitle,
  body,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  body: string;
  backHref: string;
  backLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 26px', color: 'var(--cl-ink)' }}>
      <Link href={backHref} style={{ fontSize: 12, color: 'var(--cl-ink-soft)', textDecoration: 'none' }}>
        ← {backLabel}
      </Link>
      {subtitle && (
        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--cl-ink-faint)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
          {subtitle}
        </div>
      )}
      <h1 style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 500, letterSpacing: -0.4, fontFamily: 'var(--cl-body-font)' }}>{title}</h1>
      <div
        style={{
          marginTop: 24,
          padding: '16px 18px',
          border: '1px dashed var(--cl-line)',
          borderRadius: 'var(--cl-radius)',
          background: 'var(--cl-surface)',
          color: 'var(--cl-ink-soft)',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {body}
      </div>
      {children && <div style={{ marginTop: 20, fontSize: 13 }}>{children}</div>}
    </div>
  );
}
