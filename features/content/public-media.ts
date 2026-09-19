import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppLocale} from '@/i18n/routing';
import {MEDIA_BUCKET} from '@/features/admin/media';

export type PublicGalleryItem = {
  id: string;
  url: string;
  alt: string;
  category: string;
  sortOrder: number;
};

export async function getPublicLocationGallery(
  locationId: string,
  locale: AppLocale,
  limit = 8
): Promise<PublicGalleryItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!url || url.includes('example.supabase.co')) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase
      .from('media_assets')
      .select('id, storage_path, alt_vi, alt_en, category, sort_order')
      .eq('is_public', true)
      .eq('location_id', locationId)
      .in('category', ['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle'])
      .order('sort_order', {ascending: true})
      .order('created_at', {ascending: true})
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((row) => {
      const {data: publicData} = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(row.storage_path);
      return {
        id: row.id,
        url: publicData.publicUrl,
        alt: locale === 'vi' ? row.alt_vi : row.alt_en,
        category: row.category,
        sortOrder: row.sort_order
      };
    });
  } catch {
    return [];
  }
}
