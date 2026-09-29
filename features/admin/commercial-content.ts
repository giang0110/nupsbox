import {z} from 'zod';
import {requirePermission} from '@/features/admin/mutation-guard';
import {
  commercialBlockKeys,
  getCommercialDefaults,
  type CommercialBlockKey,
  type CommercialCopy
} from '@/features/content/commercial-content';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppRole, Json} from '@/types/database';

const copySchema = z.object({
  eyebrow: z.string().trim().max(160).optional().default(''),
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(3000),
  primaryLabel: z.string().trim().max(120).optional().default(''),
  secondaryLabel: z.string().trim().max(120).optional().default('')
}).strict();

export const CommercialBlockInputSchema = z.object({
  blockKey: z.enum(commercialBlockKeys),
  contentVi: copySchema,
  contentEn: copySchema,
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000)
}).superRefine((value, ctx) => {
  if (!value.blockKey.startsWith('seo')) {
    if (!value.contentVi.eyebrow) ctx.addIssue({code: 'custom', path: ['contentVi', 'eyebrow'], message: 'eyebrow_required'});
    if (!value.contentEn.eyebrow) ctx.addIssue({code: 'custom', path: ['contentEn', 'eyebrow'], message: 'eyebrow_required'});
  }

  if (value.blockKey === 'commercial_cta') {
    for (const localeKey of ['contentVi', 'contentEn'] as const) {
      if (!value[localeKey].primaryLabel) ctx.addIssue({code: 'custom', path: [localeKey, 'primaryLabel'], message: 'primary_label_required'});
      if (!value[localeKey].secondaryLabel) ctx.addIssue({code: 'custom', path: [localeKey, 'secondaryLabel'], message: 'secondary_label_required'});
    }
  }
});

export type CommercialBlockInput = z.infer<typeof CommercialBlockInputSchema>;

export type AdminCommercialBlock = {
  id: string | null;
  blockKey: CommercialBlockKey;
  contentVi: CommercialCopy;
  contentEn: CommercialCopy;
  active: boolean;
  sortOrder: number;
  updatedAt: string;
};

const defaultOrder: Record<CommercialBlockKey, number> = {
  company_profile: 10,
  services: 20,
  service_shop_online: 21,
  service_small_business: 22,
  service_inventory: 23,
  service_personal: 24,
  capabilities: 30,
  commercial_cta: 40,
  seo: 50,
  seo_solutions: 51,
  seo_about: 52,
  seo_contact: 53
};

function valueToCopy(value: Json | null, fallback: CommercialCopy): CommercialCopy {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, Json | undefined>
    : {};
  const pick = (key: string) => typeof source[key] === 'string' && source[key]?.trim()
    ? String(source[key]).trim()
    : undefined;

  return {
    eyebrow: pick('eyebrow') ?? fallback.eyebrow,
    title: pick('title') ?? fallback.title,
    description: pick('description') ?? fallback.description,
    primaryLabel: pick('primaryLabel') ?? fallback.primaryLabel,
    secondaryLabel: pick('secondaryLabel') ?? fallback.secondaryLabel
  };
}

export function prepareCommercialBlockUpdate(role: AppRole, input: unknown) {
  requirePermission(role, 'content:update');
  const parsed = CommercialBlockInputSchema.parse(input);
  return {
    page_key: 'commercial',
    block_key: parsed.blockKey,
    content_vi: parsed.contentVi as Json,
    content_en: parsed.contentEn as Json,
    active: parsed.active,
    sort_order: parsed.sortOrder
  };
}

export async function listAdminCommercialBlocks(): Promise<AdminCommercialBlock[]> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('content_blocks')
    .select('id, block_key, content_vi, content_en, active, sort_order, updated_at')
    .eq('page_key', 'commercial')
    .in('block_key', [...commercialBlockKeys])
    .order('sort_order', {ascending: true});

  if (error) throw error;

  const byKey = new Map((data ?? []).map((row) => [row.block_key, row]));
  const viDefaults = getCommercialDefaults('vi');
  const enDefaults = getCommercialDefaults('en');

  return commercialBlockKeys.map((blockKey) => {
    const row = byKey.get(blockKey);
    return {
      id: row?.id ?? null,
      blockKey,
      contentVi: valueToCopy(row?.content_vi ?? null, viDefaults[blockKey]),
      contentEn: valueToCopy(row?.content_en ?? null, enDefaults[blockKey]),
      active: row?.active ?? true,
      sortOrder: row?.sort_order ?? defaultOrder[blockKey],
      updatedAt: row?.updated_at ?? ''
    };
  });
}
