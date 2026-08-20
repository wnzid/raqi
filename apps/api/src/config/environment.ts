import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  S3_ENDPOINT: z.string().url().or(z.literal('')).optional(),
  S3_REGION: z.string().optional(), S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(), S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().url().or(z.literal('')).optional(),
  MEDIA_LOCAL_PATH: z.string().min(1).default('./uploads'),
  MEDIA_PUBLIC_BASE_URL: z.string().url().default('http://localhost:4000/api/media'),
  MAILJET_API_KEY: z.string().optional(), MAILJET_SECRET_KEY: z.string().optional(),
  MAILJET_FROM_EMAIL: z.string().email().optional(), MAILJET_FROM_NAME: z.string().default('RAQI'),
  ORDER_NOTIFICATION_EMAIL: z.string().email(),
  RAQI_CONTACT_EMAIL: z.string().email().default('raqiofficial.bd@gmail.com'),
  RAQI_FACEBOOK_URL: z.string().url().default('https://www.facebook.com/raqiofficial.bd'),
  RAQI_INSTAGRAM_URL: z.string().url().default('https://www.instagram.com/raqiofficial.bd'),
  MAIL_FROM_EMAIL: z.string().email().optional(), MAIL_FROM_NAME: z.string().optional(),
  RAQI_BUSINESS_NAME: z.string().optional(), RAQI_BUSINESS_ADDRESS: z.string().optional(),
  RAQI_BUSINESS_EMAIL: z.string().email().optional(), RAQI_BUSINESS_PHONE: z.string().optional(),
  RAQI_BUSINESS_TIN: z.string().optional(), RAQI_BUSINESS_BIN: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;
export const validateEnvironment = (input: Record<string, unknown>): Environment => environmentSchema.parse(input);
