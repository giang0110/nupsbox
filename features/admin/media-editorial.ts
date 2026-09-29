import {z} from 'zod';
import {requirePermission} from '@/features/admin/mutation-guard';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {
  AppRole,
  MediaEditorialContextType,
  MediaEditorialRole
} from '@/types/database';

const idSchema = z.string().uuid();
const slugSchema = z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const linkInputSchema = z.object({
  mediaId: idSchema,
  contextType: z.enum(['blog', 'solution', 'topic']),
  contextKey: slugSchema,
  role: z.enum(['feature', 'inline', 'gallery']),
  sortOrder: z.coerce.number().int().min(-10000).max(10000).default(0)
}).strict();

export type AdminMediaEditorialLink = {
  id: string;
  mediaId: string;
  contextType: MediaEditorialContextType;
  contextKey: string;
  role: MediaEditorialRole;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function prepareMediaEditorialLinkCreate(role: AppRole, input: unknown) {
  requirePermission(role, 'media:update');
  const parsed = linkInputSchema.parse(input);
  return {
    media_id: parsed.mediaId,
    context_type: parsed.contextType,
    context_key: parsed.contextKey,
    role: parsed.role,
    sort_order: parsed.sortOrder
  };
}

export function prepareMediaEditorialLinkDelete(role: AppRole, id: string) {
  requirePermission(role, 'media:update');
  return {id: idSchema.parse(id)};
}

export async function listAdminMediaEditorialLinks(): Promise<AdminMediaEditorialLink[]> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('media_editorial_links')
    .select('id, media_id, context_type, context_key, role, sort_order, created_at, updated_at')
    .order('context_type', {ascending: true})
    .order('context_key', {ascending: true})
    .order('sort_order', {ascending: true});

  if (error) throw error;

  return (data ?? []).map(row => ({
    id: row.id,
    mediaId: row.media_id,
    contextType: row.context_type,
    contextKey: row.context_key,
    role: row.role,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
