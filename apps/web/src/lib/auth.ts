import { PrismaClient } from '@footwear/database';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { after } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/mailjet';

const globalPrisma = globalThis as unknown as { authPrisma?: PrismaClient };
export const authPrisma = globalPrisma.authPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalPrisma.authPrisma = authPrisma;

export const auth = betterAuth({
  database: prismaAdapter(authPrisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [process.env.WEB_URL ?? 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          await sendPasswordResetEmail({ to: user.email, resetUrl: url });
        } catch (error: unknown) {
          console.error('Unable to send password reset email.', error);
        }
      });
    },
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'CUSTOMER', input: false },
      isActive: { type: 'boolean', required: false, defaultValue: true, input: false },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
