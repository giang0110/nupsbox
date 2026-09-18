import {z} from 'zod';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole, Json} from '@/types/database';

const allowedPublicSettingKeys = ['public_contact'] as const;
export type AllowedPublicSettingKey = (typeof allowedPublicSettingKeys)[number];

const nullableTrimmedString = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([z.string().trim().min(1), z.null(), z.undefined()])
).transform(value => value ?? null);

const nullableHttpUrl = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([
    z.string().trim().url().refine(value => /^https?:\/\//i.test(value), 'http_url_required'),
    z.null(),
    z.undefined()
  ])
).transform(value => value ?? null);

const nullableEmail = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([z.string().trim().email(), z.null(), z.undefined()])
).transform(value => value ?? null);

const PublicContactValueSchema = z.object({
  phone: nullableTrimmedString,
  zalo_url: nullableHttpUrl,
  email: nullableEmail,
  facebook_url: nullableHttpUrl,
  opening_hours: z.record(z.string(), z.unknown()).optional().default({})
}).strict();

const PublicContactSettingSchema = z.object({
  key: z.literal('public_contact'),
  value: PublicContactValueSchema,
  isPublic: z.boolean()
}).strict();

export type PublicContactValue = z.infer<typeof PublicContactValueSchema>;

export type AdminPublicSetting = {
  key: AllowedPublicSettingKey;
  value: PublicContactValue;
  isPublic: true;
  updatedAt: string;
};

const emptyPublicContact: PublicContactValue = {
  phone: null,
  zalo_url: null,
  email: null,
  facebook_url: null,
  opening_hours: {}
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
  return parsed.success ? parsed.data : emptyPublicContact;
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

  const row = (data ?? []).find(item => item.key === 'public_contact' && item.is_public === true);
  return [{
    key: 'public_contact',
    value: row ? projectPublicContact(row.value) : emptyPublicContact,
    isPublic: true,
    updatedAt: row?.updated_at ?? ''
  }];
}
