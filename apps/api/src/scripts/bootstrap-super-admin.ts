import { PrismaClient } from '@footwear/database';
import path from 'node:path';

function loadRootEnvironment(): void {
  try {
    process.loadEnvFile(path.resolve(process.cwd(), '../../.env'));
  } catch (error) {
    const code = error instanceof Error && 'code' in error ? error.code : undefined;
    if (code !== 'ENOENT') throw error;
  }
}

async function main(): Promise<void> {
  loadRootEnvironment();
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must both be set in the root .env file.');
  }

  const prisma = new PrismaClient();
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    let created = false;

    if (!user) {
      const { auth } = await import('../auth/auth.js');
      try {
        const result = await auth.api.signUpEmail({
          body: { email, password, name: 'RAQI Super Admin' },
        });
        user = await prisma.user.findUnique({ where: { id: result.user.id } });
        created = true;
      } catch (error) {
        // A concurrent/idempotent run may have created the same email first.
        user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw error;
      }
    }

    if (!user) throw new Error('Better Auth did not create the expected user account.');
    if (user.role !== 'SUPER_ADMIN' || !user.isActive) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN', isActive: true },
      });
    }

    console.log(created ? `Created Super Admin account for ${email}.` : `Super Admin account already existed for ${email}; role and status verified.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Super Admin bootstrap failed.');
  process.exitCode = 1;
});
