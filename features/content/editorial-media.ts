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

export async function getPublicEditorialMedia(
  contextType: MediaEditorialContextType,
  contextKey: string,
  locale: AppLocale,
  limit = 3
): Promise<PublicEditorialMedia[]> {
  if (!databaseEnabled()) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const {data: links, error: linkError} = await supabase
      .from('media_editorial_links')
      .select('id, media_id, role, sort_order')
      .eq('context_type', contextType)
      .eq('context_key', contextKey)
      .order('sort_order', {ascending: true})
      .order('created_at', {ascending: true})
      .limit(Math.max(limit, 1));

    if (linkError) throw linkError;
    if (!links?.length) return [];

    const mediaIds = [...new Set(links.map(link => link.media_id))];
    const {data: mediaRows, error: mediaError} = await supabase
      .from('media_assets')
      .select('id, storage_path, alt_vi, alt_en, category')
      .in('id', mediaIds)
      .eq('is_public', true);

    if (mediaError) throw mediaError;
    const mediaById = new Map((mediaRows ?? []).map(row => [row.id, row]));

    return links.flatMap(link => {
      const media = mediaById.get(link.media_id);
      if (!media) return [];

      const publicUrl = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(media.storage_path)
        .data.publicUrl;

      return [{
        linkId: link.id,
        mediaId: media.id,
        url: publicUrl,
        alt: locale === 'vi' ? media.alt_vi : media.alt_en,
        category: media.category,
        role: link.role,
        sortOrder: link.sort_order
      }];
    });
  } catch {
    return [];
  }
}
