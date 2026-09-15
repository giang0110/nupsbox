import {z} from 'zod';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole, Json} from '@/types/database';

const allowedPublicSettingKeys = ['public_contact'] as const;
export type AllowedPublicSettingKey = (typeof allowedPublicSettingKeys)[number];

const nullableTrimmedString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().min(1).nullable()
);

const nullableHttpUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), 'http_url_required')
    .nullable()
);

const PublicContactValueSchema = z
  .object({
    phone: nullableTrimmedString,
    zalo_url: nullableHttpUrl
  })
  .strict();

const PublicContactSettingSchema = z
  .object({
    key: z.literal('public_contact'),
    value: PublicContactValueSchema,
    isPublic: z.boolean()
  })
  .strict();

export type PublicContactValue = z.infer<typeof PublicContactValueSchema>;

export type AdminPublicSetting = {
  key: AllowedPublicSettingKey;
  value: PublicContactValue;
  isPublic: true;
  updatedAt: string;
};

export function isAllowedPublicSettingKey(value: string): value is AllowedPublicSettingKey {
  return (allowedPublicSettingKeys as readonly string[]).includes(value);
}

export function preparePublicSiteSettingUpdate(role: AppRole, input: unknown) {
  requirePermission(role, 'settings:update');

  const source = input as {key?: unknown; isPublic?: unknown};
  if (typeof source?.key !== 'string' || !isAllowedPublicSettingKey(source.key)) {
    throw new Error('setting_not_allowed');
  }
  if (source.isPublic !== true) throw new Error('public_setting_required');

  const parsed = PublicContactSettingSchema.parse(input);
  return {
    key: parsed.key,
    value: parsed.value as Json,
    is_public: true as const
  };
}

function projectPublicContact(value: Json): PublicContactValue {
  const parsed = PublicContactValueSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return {phone: null, zalo_url: null};
}

export async function listAdminSettings(): Promise<AdminPublicSetting[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('site_settings')
    .select('key, value, is_public, updated_at')
    .in('key', [...allowedPublicSettingKeys])
    .order('key', {ascending: true});

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    if (row.key !== 'public_contact' || row.is_public !== true) return [];
    return [
      {
        key: 'public_contact' as const,
        value: projectPublicContact(row.value),
        isPublic: true as const,
        updatedAt: row.updated_at
      }
    ];
  });
}
