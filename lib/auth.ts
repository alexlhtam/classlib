// auth.ts — Auth.js (NextAuth v5) configuration.
// Providers: Google OAuth + email/password (Credentials, bcrypt). JWT sessions,
// so the user id rides on the token (no Session table). The Prisma adapter
// persists OAuth account links.

import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './db';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Google is only wired when credentials are present (deferred until the user
// supplies GOOGLE_CLIENT_ID/SECRET); email+password always works.
const providers: NextAuthConfig['providers'] = [
  Credentials({
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async (raw) => {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Lets a Google sign-in link to an existing email+password account.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  // Trust the deployment host. Without this, Auth.js throws UntrustedHost when
  // the request host doesn't match AUTH_URL (e.g. Vercel deployment-hash URLs
  // and preview deployments), which surfaces as a server-side 500 on any page
  // that calls auth(). Safe for Vercel / self-hosted single-app deployments.
  trustHost: true,
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
