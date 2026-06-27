'use client';

// Admin members panel: list members, change roles, add an existing user by email.
// All mutations go through admin-gated server actions; this is convenience UI.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@prisma/client';
import { addMember, setMemberRole } from '@/lib/actions/membership';
import { Avatar } from './ui';

interface Member {
  userId: string;
  role: Role;
  name: string | null;
  email: string;
}

export function MembersManager({
  slug,
  members,
  currentUserId,
}: {
  slug: string;
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const res = await addMember(slug, email.trim(), role);
      if (!res.ok) setErr(res.error ?? 'Could not add member.');
      else {
        setMsg(`Added ${email}.`);
        setEmail('');
        router.refresh();
      }
    });
  }

  function onRole(userId: string, next: Role) {
    setErr(null);
    startTransition(async () => {
      const res = await setMemberRole(slug, userId, next);
      if (!res.ok) setErr(res.error ?? 'Could not change role.');
      else router.refresh();
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <form onSubmit={onAdd} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
          <span style={labelStyle}>Add member by email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="person@school.edu" required style={fieldStyle} />
        </label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={{ ...fieldStyle, width: 'auto' }}>
          <option value="USER">Member</option>
          <option value="ADMIN">Maintainer</option>
        </select>
        <button type="submit" disabled={pending} style={addBtnStyle}>Add</button>
      </form>
      {msg && <div style={{ color: 'var(--cl-success)', fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ color: 'var(--cl-danger)', fontSize: 13 }}>{err}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)', overflow: 'hidden' }}>
        {members.map((m, i) => (
          <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === members.length - 1 ? 'none' : '1px solid var(--cl-line-soft)' }}>
            <Avatar name={m.name ?? m.email} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name ?? m.email}{m.userId === currentUserId && ' (you)'}</div>
              <div style={{ fontSize: 12, color: 'var(--cl-ink-faint)' }}>{m.email}</div>
            </div>
            <select
              value={m.role}
              disabled={pending}
              onChange={(e) => onRole(m.userId, e.target.value as Role)}
              style={{ ...fieldStyle, width: 'auto', fontSize: 13 }}
            >
              <option value="USER">Member</option>
              <option value="ADMIN">Maintainer</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--cl-ink-soft)', letterSpacing: '.04em', textTransform: 'uppercase' as const };
const fieldStyle = {
  padding: '8px 11px', border: '1px solid var(--cl-line)', borderRadius: 'var(--cl-radius)',
  background: 'var(--cl-surface)', color: 'var(--cl-ink)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box' as const, width: '100%',
};
const addBtnStyle = {
  padding: '8px 16px', border: 'none', borderRadius: 'var(--cl-radius)', background: 'var(--cl-accent)',
  color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', height: 37,
};
