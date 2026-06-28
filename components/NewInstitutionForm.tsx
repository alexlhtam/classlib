'use client';

// Create-a-classlib form. Calls the createInstitution server action (which makes
// the creator an ADMIN), then routes into the new institution.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInstitution } from '@/lib/actions/institution';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

export function NewInstitutionForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugEdited ? slug : slugify(name);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await createInstitution({ name: name.trim(), slug: effectiveSlug });
    if (!res.ok || !res.slug) {
      setPending(false);
      setError(res.error ?? 'Could not create.');
      return;
    }
    router.push(`/${res.slug}`);
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Demo University" required style={fieldStyle} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>URL slug</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--cl-ink-faint)', fontFamily: 'ui-monospace, monospace' }}>classlib.app/</span>
          <input
            value={effectiveSlug}
            onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }}
            placeholder="demo"
            required
            style={{ ...fieldStyle, fontFamily: 'ui-monospace, monospace' }}
          />
        </div>
      </label>
      {error && <div style={{ color: 'var(--cl-danger)', fontSize: 13 }}>{error}</div>}
      <button
        type="submit"
        disabled={pending || !name.trim() || !effectiveSlug}
        style={{
          padding: '10px 16px', border: 'none', borderRadius: 'var(--cl-radius)',
          background: 'var(--cl-accent)', color: '#fff', fontSize: 15, fontWeight: 600,
          fontFamily: 'inherit', cursor: pending ? 'default' : 'pointer', opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? 'Creating…' : 'Create classlib'}
      </button>
      <p style={{ fontSize: 12, color: 'var(--cl-ink-faint)', margin: 0 }}>
        You’ll be the maintainer. Add modules and notes once it’s created.
      </p>
    </form>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const };
const fieldStyle = {
  width: '100%', padding: '9px 11px', border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
  background: 'var(--cl-surface)', color: 'var(--cl-ink)', fontSize: 15, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box' as const,
};
