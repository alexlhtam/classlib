'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/auth';
import { AuthShell, Field, SubmitButton } from '../auth-ui';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await registerUser({ name, email, password });
    if (!res.ok) {
      setPending(false);
      setError(res.error ?? 'Registration failed.');
      return;
    }
    // Auto sign-in after successful registration.
    await signIn('credentials', { email, password, redirect: false });
    setPending(false);
    window.location.href = '/';
  }

  return (
    <AuthShell title="Create account" footer={<Link href="/login">Already have an account? Sign in</Link>}>
      <form onSubmit={onSubmit}>
        <Field label="Name" type="text" value={name} onChange={setName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />
        {error && <p style={{ color: 'var(--cl-danger)', fontSize: 14 }}>{error}</p>}
        <SubmitButton pending={pending}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
