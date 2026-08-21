import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prismaService } from '../infrastructure/prisma/prisma.service';
import { sendAccountCreatedEmail } from './account-created-email';

export const auth = betterAuth({
  database: prismaAdapter(prismaService, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.WEB_URL ?? 'http://localhost:3000'],
  emailAndPassword: { enabled: true, minPasswordLength: 8, resetPasswordTokenExpiresIn:3600, revokeSessionsOnPasswordReset:true, sendResetPassword:async({user,url})=>sendAccountCreatedEmail({to:user.email,name:user.name,role:(user as typeof user&{role?:string}).role,resetUrl:url}) },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'CUSTOMER', input: false },
      isActive: { type: 'boolean', required: false, defaultValue: true, input: false },
    },
  },
});
