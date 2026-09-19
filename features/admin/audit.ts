import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {Json} from '@/types/database';

type SearchParamValue = string | string[] | undefined;

export type AdminAuditFilters = {
  action?: string;
  table?: string;
};

export type AdminAuditRow = {
  id: number;
  actorId: string | null;
  actorName: string | null;
  action: string;
  tableName: string;
  rowId: string | null;
  metadata: Json;
  createdAt: string;
};

export type AdminAuditFacets = {
  actions: string[];
  tables: string[];
};

function firstString(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeFacet(value: SearchParamValue): string | undefined {
  const normalized = firstString(value)?.trim().slice(0, 80);
  if (!normalized || !/^[a-z0-9_.-]+$/i.test(normalized)) return undefined;
  return normalized;
}

export function normalizeAuditQuery(
  searchParams: Record<string, SearchParamValue>
): AdminAuditFilters {
  const action = normalizeFacet(searchParams.action);
  const table = normalizeFacet(searchParams.table);
  return {
    ...(action ? {action} : {}),
    ...(table ? {table} : {})
  };
}

function metadataObject(metadata: Json): Record<string, Json | undefined> {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? metadata
    : {};
}

export function summarizeAuditMetadata(metadata: Json): string | null {
  const source = metadataObject(metadata);
  const parts: string[] = [];

  if (typeof source.from === 'string' || typeof source.to === 'string') {
    parts.push(
      (typeof source.from === 'string' ? source.from : '∅') +
      ' → ' +
      (typeof source.to === 'string' ? source.to : '∅')
    );
  }

  if (typeof source.key === 'string') {
    parts.push('key: ' + source.key);
  }

  if (
    typeof source.from_assignee === 'string' ||
    typeof source.to_assignee === 'string'
  ) {
    const from = typeof source.from_assignee === 'string' ? source.from_assignee : '∅';
    const to = typeof source.to_assignee === 'string' ? source.to_assignee : '∅';
    parts.push('assignee: ' + from + ' → ' + to);
  }

  return parts.length ? parts.join(' · ') : null;
}

export function auditTargetHref(tableName: string, rowId: string | null): string | null {
  if (tableName === 'leads' && rowId) return '/admin/leads/' + rowId;
  if (tableName === 'locations') return '/admin/catalog/locations';
  if (tableName === 'unit_types') return '/admin/catalog/unit-types';
  if (tableName === 'location_unit_types') return '/admin/catalog/pricing';
  if (tableName === 'media_assets') return '/admin/content/media';
  if (tableName === 'faqs') return '/admin/content/faq';
  if (tableName === 'blog_posts' || tableName === 'blog_translations') {
    return '/admin/content/blog';
  }
  if (tableName === 'site_settings') return '/admin/content/settings';
  return null;
}

export async function listAdminAuditFacets(): Promise<AdminAuditFacets> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('audit_log')
    .select('action, table_name')
    .order('created_at', {ascending: false})
    .limit(500);

  if (error) throw error;

  return {
    actions: [...new Set((data ?? []).map(row => row.action))].sort(),
    tables: [...new Set((data ?? []).map(row => row.table_name))].sort()
  };
}

export async function listAdminAuditLog(
  filters: AdminAuditFilters = {},
  limit = 100
): Promise<AdminAuditRow[]> {
  const supabase = await createSupabaseServerClient();
  const cappedLimit = Math.min(Math.max(limit, 1), 100);
  let query = supabase
    .from('audit_log')
    .select('id, actor_id, action, table_name, row_id, metadata, created_at')
    .order('created_at', {ascending: false})
    .limit(cappedLimit);

  if (filters.action) query = query.eq('action', filters.action);
  if (filters.table) query = query.eq('table_name', filters.table);

  const {data, error} = await query;
  if (error) throw error;

  const actorIds = [
    ...new Set((data ?? []).flatMap(row => row.actor_id ? [row.actor_id] : []))
  ];
  const actorNames = new Map<string, string>();

  if (actorIds.length) {
    const profiles = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds);

    if (profiles.error) throw profiles.error;
    for (const profile of profiles.data ?? []) {
      actorNames.set(profile.id, profile.full_name?.trim() || profile.id);
    }
  }

  return (data ?? []).map(row => ({
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_id ? actorNames.get(row.actor_id) ?? null : null,
    action: row.action,
    tableName: row.table_name,
    rowId: row.row_id,
    metadata: row.metadata,
    createdAt: row.created_at
  }));
}
