import {buildSeoRoutePairs, SITE_ORIGIN} from '@/features/seo/routes';
import type {AdminBlog} from '@/features/admin/blog';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminMedia} from '@/features/admin/media';
import type {AdminUnitType} from '@/features/admin/unit-types';

export type AdminSeoTone = 'warning' | 'info';

export type AdminSeoIssue = {
  id: string;
  tone: AdminSeoTone;
  title: string;
  detail: string;
  href: string;
};

export type AdminSeoSnapshot = {
  siteOrigin: string;
  routePairs: number;
  indexableUrls: number;
  activeLocations: number;
  activeUnitTypes: number;
  publishedBlogs: number;
  publicMedia: number;
  blogs: AdminBlog[];
  issues: AdminSeoIssue[];
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function lengthIssue(
  value: string | null | undefined,
  max: number,
  label: string,
  href: string,
  id: string
): AdminSeoIssue | null {
  if (!value || value.length <= max) return null;
  return {
    id,
    tone: 'info',
    title: `${label} dài hơn mức gợi ý`,
    detail: `${value.length} ký tự · mức gợi ý tối đa khoảng ${max}. Không bắt buộc sửa nếu nội dung vẫn rõ ràng.`,
    href
  };
}

export function buildAdminSeoIssues(
  blogs: AdminBlog[],
  media: AdminMedia[]
): AdminSeoIssue[] {
  const issues: AdminSeoIssue[] = [];

  for (const blog of blogs.filter(item => item.status === 'published')) {
    const href = '/admin/content/blog/' + blog.id;
    const label = blog.vi.title || blog.en.title || blog.slug;

    if (!blog.coverMediaId) {
      issues.push({
        id: `blog-cover:${blog.id}`,
        tone: 'warning',
        title: `Blog thiếu cover: ${label}`,
        detail: 'Bài vẫn có thể index nhưng thiếu ảnh đại diện cho listing và social preview.',
        href
      });
    }

    for (const locale of ['vi', 'en'] as const) {
      const translation = blog[locale];
      const localeLabel = locale.toUpperCase();

      if (!hasText(translation.seoTitle)) {
        issues.push({
          id: `blog-seo-title:${blog.id}:${locale}`,
          tone: 'warning',
          title: `Thiếu SEO title ${localeLabel}: ${label}`,
          detail: 'Public page hiện fallback về title bài viết. Nên nhập SEO title nếu cần tối ưu riêng.',
          href
        });
      }

      if (!hasText(translation.seoDescription)) {
        issues.push({
          id: `blog-seo-description:${blog.id}:${locale}`,
          tone: 'warning',
          title: `Thiếu SEO description ${localeLabel}: ${label}`,
          detail: 'Public page fallback về excerpt hoặc title. Nên có description riêng cho kết quả tìm kiếm.',
          href
        });
      }

      const titleLength = lengthIssue(
        translation.seoTitle,
        60,
        `SEO title ${localeLabel}`,
        href,
        `blog-title-length:${blog.id}:${locale}`
      );
      if (titleLength) issues.push(titleLength);

      const descriptionLength = lengthIssue(
        translation.seoDescription,
        160,
        `SEO description ${localeLabel}`,
        href,
        `blog-description-length:${blog.id}:${locale}`
      );
      if (descriptionLength) issues.push(descriptionLength);
    }
  }

  for (const item of media.filter(row => row.isPublic)) {
    if (!hasText(item.altVi) || !hasText(item.altEn)) {
      issues.push({
        id: `media-alt:${item.id}`,
        tone: 'warning',
        title: 'Public media thiếu alt song ngữ',
        detail: item.storagePath,
        href: '/admin/content/media'
      });
    }
  }

  return issues.sort((a, b) => {
    if (a.tone === b.tone) return a.title.localeCompare(b.title);
    return a.tone === 'warning' ? -1 : 1;
  });
}

export async function getAdminSeoSnapshot(): Promise<AdminSeoSnapshot> {
  const [
    {listAdminBlogs},
    {listAdminLocations},
    {listAdminMedia},
    {listAdminUnitTypes}
  ] = await Promise.all([
    import('@/features/admin/blog'),
    import('@/features/admin/locations'),
    import('@/features/admin/media'),
    import('@/features/admin/unit-types')
  ]);

  const [blogs, locations, media, units] = await Promise.all([
    listAdminBlogs(),
    listAdminLocations(),
    listAdminMedia(),
    listAdminUnitTypes()
  ]);

  const activeLocations = locations.filter((item: AdminLocation) => item.status === 'active');
  const activeUnits = units.filter((item: AdminUnitType) => item.active);
  const publishedBlogs = blogs.filter((item: AdminBlog) => item.status === 'published');
  const publicMedia = media.filter((item: AdminMedia) => item.isPublic);

  const routes = buildSeoRoutePairs({
    locationSlugs: activeLocations.map((item: AdminLocation) => item.slug),
    unitSlugs: activeUnits.map((item: AdminUnitType) => item.slug),
    blogSlugs: publishedBlogs.map((item: AdminBlog) => item.slug)
  });

  return {
    siteOrigin: SITE_ORIGIN,
    routePairs: routes.length,
    indexableUrls: routes.length * 2,
    activeLocations: activeLocations.length,
    activeUnitTypes: activeUnits.length,
    publishedBlogs: publishedBlogs.length,
    publicMedia: publicMedia.length,
    blogs,
    issues: buildAdminSeoIssues(blogs, media)
  };
}
