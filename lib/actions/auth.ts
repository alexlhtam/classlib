'use server';

// Registration for email+password accounts. Sign-in itself goes through
// Auth.js (lib/auth.ts Credentials provider); this just creates the user.

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export interface RegisterResult {
  ok: boolean;
  error?: string;
}

export async function registerUser(
  input: z.infer<typeof registerSchema>,
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'An account with that email already exists.' };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });
  return { ok: true };
}
