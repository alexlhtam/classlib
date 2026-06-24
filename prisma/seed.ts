// prisma/seed.ts — local dev seed.
// Builds a `demo` institution with an admin + a student, the seeded canonical
// content, and one open suggestion (the mergesort proof-sketch PR). Idempotent:
// re-running wipes and recreates the demo institution.
//
// Run with: npm run db:seed   (or: prisma db seed)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_SUGGESTIONS } from '../lib/canonical-content';
import { seedInstitutionContent } from '../lib/seed-content';
import { computeDiffStats } from '../lib/diff';

const prisma = new PrismaClient();

const DEMO_SLUG = 'demo';
const ADMIN_EMAIL = 'admin@demo.classlib';
const STUDENT_EMAIL = 'student@demo.classlib';
const DEMO_PASSWORD = 'password123';

async function main() {
  // Idempotent reset of the demo institution (cascades modules/notes/etc.).
  await prisma.institution.deleteMany({ where: { slug: DEMO_SLUG } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, name: 'Prof. Kale' },
    create: { email: ADMIN_EMAIL, name: 'Prof. Kale', passwordHash },
  });

  const student = await prisma.user.upsert({
    where: { email: STUDENT_EMAIL },
    update: { passwordHash, name: 'Aria Lin' },
    create: { email: STUDENT_EMAIL, name: 'Aria Lin', passwordHash },
  });

  const institution = await prisma.institution.create({
    data: {
      slug: DEMO_SLUG,
      name: 'Demo University',
      memberships: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: student.id, role: 'USER' },
        ],
      },
    },
  });

  const noteIdBySlug = await seedInstitutionContent(
    prisma,
    institution.id,
    admin.id,
  );

  // Open suggestions against the seeded notes.
  for (const s of DEMO_SUGGESTIONS) {
    const noteId = noteIdBySlug.get(s.noteSlug);
    if (!noteId) continue;
    const note = await prisma.note.findUniqueOrThrow({ where: { id: noteId } });
    const { add, del } = computeDiffStats(note.body, s.proposedBody);
    await prisma.suggestion.create({
      data: {
        institutionId: institution.id,
        noteId,
        title: s.title,
        summary: s.summary,
        proposedBody: s.proposedBody,
        baseBody: note.body,
        status: 'OPEN',
        authorId: student.id,
        additions: add,
        deletions: del,
      },
    });
  }

  const counts = {
    modules: await prisma.module.count({ where: { institutionId: institution.id } }),
    notes: await prisma.note.count({ where: { institutionId: institution.id } }),
    suggestions: await prisma.suggestion.count({
      where: { institutionId: institution.id },
    }),
  };

  console.log('Seeded demo institution:', {
    institution: institution.slug,
    admin: ADMIN_EMAIL,
    student: STUDENT_EMAIL,
    password: DEMO_PASSWORD,
    ...counts,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
