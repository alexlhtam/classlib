// guard.ts — server-component wrapper around requireMembership that translates
// TenancyError into Next.js navigation (redirect to login / 404). Use this in
// every [institution]/* page and layout.

import { redirect, notFound } from 'next/navigation';
import { requireMembership, requireAdmin, TenancyError, type MembershipContext } from './tenancy';

async function run(fn: () => Promise<MembershipContext>): Promise<MembershipContext> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof TenancyError) {
      if (e.code === 'UNAUTHENTICATED') redirect('/login');
      notFound(); // NOT_FOUND or FORBIDDEN — don't reveal which to non-members
    }
    throw e;
  }
}

export function guardMembership(slug: string): Promise<MembershipContext> {
  return run(() => requireMembership(slug));
}

export function guardAdmin(slug: string): Promise<MembershipContext> {
  return run(() => requireAdmin(slug));
}
