import {z} from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_GA4_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().min(1).optional()
});

export type AppEnv = z.infer<typeof schema>;

export function parseEnv(input: Record<string, string | undefined>): AppEnv {
  return schema.parse(input);
}

export const env = parseEnv(process.env);
