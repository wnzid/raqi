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
});

export type Environment = z.infer<typeof environmentSchema>;
export const validateEnvironment = (input: Record<string, unknown>): Environment => environmentSchema.parse(input);
