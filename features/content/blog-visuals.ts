import 'server-only';

import {getEditorialProfile} from '@/features/content/editorial-taxonomy';
import {
  getPublicEditorialMediaForContexts,
  type PublicEditorialMedia
} from '@/features/content/editorial-media';
import type {AppLocale} from '@/i18n/routing';

export type PublicBlogVisual = {
  url: string;
  alt: string;
  category: PublicEditorialMedia['category'];
  source: 'blog' | 'topic';
};

export async function getBlogVisualMap(
  slugs: string[],
  locale: AppLocale
): Promise<Record<string, PublicBlogVisual>> {
  const uniqueSlugs = [...new Set(slugs.map(slug => slug.trim()).filter(Boolean))];
  if (!uniqueSlugs.length) return {};

  const topicBySlug = new Map(
    uniqueSlugs.map(slug => [slug, getEditorialProfile(slug).topic] as const)
  );
  const topics = [...new Set(topicBySlug.values())];

  const [blogMedia, topicMedia] = await Promise.all([
    getPublicEditorialMediaForContexts('blog', uniqueSlugs, locale, 1),
    getPublicEditorialMediaForContexts('topic', topics, locale, 1)
  ]);

  const result: Record<string, PublicBlogVisual> = {};

  for (const slug of uniqueSlugs) {
    const direct = blogMedia[slug]?.[0];
    const topic = topicBySlug.get(slug);
    const fallback = topic ? topicMedia[topic]?.[0] : undefined;
    const selected = direct ?? fallback;
    if (!selected) continue;

    result[slug] = {
      url: selected.url,
      alt: selected.alt,
      category: selected.category,
      source: direct ? 'blog' : 'topic'
    };
  }

  return result;
}
