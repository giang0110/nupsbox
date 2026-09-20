import {z} from 'zod';
import {UnitTypeInputSchema, type UnitTypeInput} from '@/features/admin/catalog-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole} from '@/types/database';

const idSchema = z.string().uuid();

export type UnitTypeDbRow = {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  area_m2: number;
  recommended_for_vi: string | null;
  recommended_for_en: string | null;
  capacity_note_vi: string | null;
  capacity_note_en: string | null;
  sort_order: number;
  active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UnitTypePublicationCheck = {
  id: 'nameVi' | 'nameEn' | 'areaM2' | 'recommendedForVi' | 'recommendedForEn';
  label: string;
  ready: boolean;
};

export type UnitTypePublicationReadiness = {
  ready: boolean;
  checks: UnitTypePublicationCheck[];
  missingLabels: string[];
};

export type AdminUnitType = {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  areaM2: number;
  recommendedForVi: string | null;
  recommendedForEn: string | null;
  capacityNoteVi: string | null;
  capacityNoteEn: string | null;
  sortOrder: number;
  active: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getUnitTypePublicationReadiness(unit: Pick<AdminUnitType, 'nameVi' | 'nameEn' | 'areaM2' | 'recommendedForVi' | 'recommendedForEn'>): UnitTypePublicationReadiness {
  const checks: UnitTypePublicationCheck[] = [
    {id: 'nameVi', label: 'Tên VI', ready: hasText(unit.nameVi)},
    {id: 'nameEn', label: 'Tên EN', ready: hasText(unit.nameEn)},
    {id: 'areaM2', label: 'Diện tích', ready: Number.isFinite(unit.areaM2) && unit.areaM2 > 0},
    {id: 'recommendedForVi', label: 'Gợi ý VI', ready: hasText(unit.recommendedForVi)},
    {id: 'recommendedForEn', label: 'Gợi ý EN', ready: hasText(unit.recommendedForEn)}
  ];
  return {
    ready: checks.every(check => check.ready),
    checks,
    missingLabels: checks.filter(check => !check.ready).map(check => check.label)
  };
}

export function mapAdminUnitType(row: UnitTypeDbRow): AdminUnitType {
  return {
    id: row.id,
    slug: row.slug,
    nameVi: row.name_vi,
    nameEn: row.name_en,
    areaM2: row.area_m2,
    recommendedForVi: row.recommended_for_vi,
    recommendedForEn: row.recommended_for_en,
    capacityNoteVi: row.capacity_note_vi,
    capacityNoteEn: row.capacity_note_en,
    sortOrder: row.sort_order,
    active: row.active,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toUnitMutation(input: UnitTypeInput) {
  return {
    slug: input.slug,
    name_vi: input.nameVi,
    name_en: input.nameEn,
    area_m2: input.areaM2,
    recommended_for_vi: input.recommendedForVi ?? null,
    recommended_for_en: input.recommendedForEn ?? null,
    capacity_note_vi: input.capacityNoteVi ?? null,
    capacity_note_en: input.capacityNoteEn ?? null,
    sort_order: input.sortOrder
  };
}

export function prepareUnitTypeCreate(role: AppRole, input: unknown) {
  requirePermission(role, 'catalog:create');
  return {...toUnitMutation(UnitTypeInputSchema.parse(input)), active: false};
}

export function prepareUnitTypeUpdate(role: AppRole, id: string, input: unknown) {
  requirePermission(role, 'catalog:update');
  return {id: idSchema.parse(id), changes: toUnitMutation(UnitTypeInputSchema.parse(input))};
}

export function prepareUnitTypePublication(role: AppRole, id: string, publish: boolean) {
  requirePermission(role, 'catalog:publish');
  return {id: idSchema.parse(id), active: publish};
}

export async function listAdminUnitTypes(): Promise<AdminUnitType[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('unit_types')
    .select('*')
    .order('sort_order', {ascending: true})
    .order('area_m2', {ascending: true});
  if (error) throw error;
  return (data ?? []).map((row) => mapAdminUnitType(row as unknown as UnitTypeDbRow));
}
