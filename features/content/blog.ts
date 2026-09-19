import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {AppLocale} from '@/i18n/routing';
import {MEDIA_BUCKET} from '@/features/admin/media';

export type PublicBlogCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
};

export async function getPublishedBlogCards(locale: AppLocale): Promise<PublicBlogCard[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!supabaseUrl || supabaseUrl.includes('example.supabase.co')) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const {data: posts, error: postsError} = await supabase
      .from('blog_posts')
      .select('id, slug, published_at, source_url, cover_media_id')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', {ascending: false});

    if (postsError) throw postsError;
    if (!posts?.length) return [];

    const ids = posts.map((post) => post.id);
    const coverIds = posts.flatMap((post) => post.cover_media_id ? [post.cover_media_id] : []);

    const [translationsResult, mediaResult] = await Promise.all([
      supabase
        .from('blog_translations')
        .select('blog_post_id, locale, title, excerpt')
        .in('blog_post_id', ids)
        .eq('locale', locale),
      coverIds.length
        ? supabase
            .from('media_assets')
            .select('id, storage_path, alt_vi, alt_en')
            .in('id', coverIds)
            .eq('is_public', true)
        : Promise.resolve({data: [], error: null})
    ]);

    if (translationsResult.error) throw translationsResult.error;
    if (mediaResult.error) throw mediaResult.error;

    const translations = new Map(
      (translationsResult.data ?? []).map((row) => [row.blog_post_id, row])
    );
    const media = new Map((mediaResult.data ?? []).map((row) => [row.id, row]));

    return posts.flatMap((post) => {
      const translation = translations.get(post.id);
      if (!translation) return [];

      const cover = post.cover_media_id ? media.get(post.cover_media_id) : null;
      const coverUrl = cover
        ? supabase.storage.from(MEDIA_BUCKET).getPublicUrl(cover.storage_path).data.publicUrl
        : null;

      return [{
        id: post.id,
        slug: post.slug,
        title: translation.title,
        excerpt: translation.excerpt,
        sourceUrl: post.source_url ?? null,
        publishedAt: post.published_at,
        coverUrl,
        coverAlt: cover ? (locale === 'vi' ? cover.alt_vi : cover.alt_en) : null
      }];
    });
  } catch {
    return [];
  }
}
