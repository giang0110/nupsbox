import 'server-only';

import {MEDIA_BUCKET} from '@/features/admin/media';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {
  MediaCategory,
  MediaEditorialContextType,
  MediaEditorialRole
} from '@/types/database';
import type {AppLocale} from '@/i18n/routing';

export type PublicEditorialMedia = {
  linkId: string;
  mediaId: string;
  url: string;
  alt: string;
  category: MediaCategory;
  role: MediaEditorialRole;
  sortOrder: number;
};

function databaseEnabled() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return Boolean(supabaseUrl && !supabaseUrl.includes('example.supabase.co'));
}

export async function getPublicEditorialMediaForContexts(
  contextType: MediaEditorialContextType,
  contextKeys: string[],
  locale: AppLocale,
  limitPerContext = 1
): Promise<Record<string, PublicEditorialMedia[]>> {
  const keys = [...new Set(contextKeys.map(key => key.trim()).filter(Boolean))];
  if (!databaseEnabled() || !keys.length) return {};

  try {
    const supabase = await createSupabaseServerClient();
    const {data: links, error: linkError} = await supabase
      .from('media_editorial_links')
      .select('id, media_id, context_key, role, sort_order, created_at')
      .eq('context_type', contextType)
      .in('context_key', keys)
      .order('sort_order', {ascending: true})
      .order('created_at', {ascending: true});

    if (linkError) throw linkError;
    if (!links?.length) return {};

    const mediaIds = [...new Set(links.map(link => link.media_id))];
    const {data: mediaRows, error: mediaError} = await supabase
      .from('media_assets')
      .select('id, storage_path, alt_vi, alt_en, category')
      .in('id', mediaIds)
      .eq('is_public', true);

    if (mediaError) throw mediaError;
    const mediaById = new Map((mediaRows ?? []).map(row => [row.id, row]));
    const grouped: Record<string, PublicEditorialMedia[]> = {};
    const safeLimit = Math.max(limitPerContext, 1);

    for (const link of links) {
      const media = mediaById.get(link.media_id);
      if (!media) continue;

      const existing = grouped[link.context_key] ?? [];
      if (existing.length >= safeLimit) continue;

      const publicUrl = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(media.storage_path)
        .data.publicUrl;

      existing.push({
        linkId: link.id,
        mediaId: media.id,
        url: publicUrl,
        alt: locale === 'vi' ? media.alt_vi : media.alt_en,
        category: media.category,
        role: link.role,
        sortOrder: link.sort_order
      });
      grouped[link.context_key] = existing;
    }

    return grouped;
  } catch {
    return {};
  }
}

export async function getPublicEditorialMedia(
  contextType: MediaEditorialContextType,
  contextKey: string,
  locale: AppLocale,
  limit = 3
): Promise<PublicEditorialMedia[]> {
  const grouped = await getPublicEditorialMediaForContexts(
    contextType,
    [contextKey],
    locale,
    limit
  );
  return grouped[contextKey] ?? [];
}
