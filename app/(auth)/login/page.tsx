'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { AuthShell, Field, SubmitButton } from '../auth-ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    window.location.href = '/';
  }

  return (
    <AuthShell title="Sign in" footer={<Link href="/register">Create an account</Link>}>
      <form onSubmit={onSubmit}>
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />
        {error && <p style={{ color: 'var(--cl-danger)', fontSize: 14 }}>{error}</p>}
        <SubmitButton pending={pending}>Sign in</SubmitButton>
      </form>
    </AuthShell>
  );
}
