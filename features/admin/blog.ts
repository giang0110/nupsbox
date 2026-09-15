import {z} from 'zod';
import {BlogInputSchema, type BlogInput} from '@/features/admin/content-schemas';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole} from '@/types/database';

const idSchema = z.string().uuid();
export type BlogStatus = 'draft' | 'published' | 'archived';
export type BlogLocale = 'vi' | 'en';

export type PreparedBlogTranslation = {
  locale: BlogLocale;
  title: string;
  excerpt: string | null;
  body: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
};

export type BlogPostDbRow = {
  id: string;
  slug: string;
  status: string;
  published_at: string | null;
  cover_media_id: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogTranslationDbRow = {
  id: string;
  blog_post_id: string;
  locale: string;
  title: string;
  excerpt: string | null;
  body: unknown;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminBlogTranslation = {
  locale: BlogLocale;
  title: string;
  excerpt: string | null;
  body: Record<string, unknown>;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type AdminBlog = {
  id: string;
  slug: string;
  status: BlogStatus;
  publishedAt: string | null;
  coverMediaId: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  vi: AdminBlogTranslation;
  en: AdminBlogTranslation;
};

function nullableString(value: string | null | undefined): string | null {
  return value ?? null;
}

function bodyObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function statusValue(value: string): BlogStatus {
  if (value === 'draft' || value === 'published' || value === 'archived') return value;
  throw new Error('invalid_blog_status');
}

function translationFromInput(locale: BlogLocale, input: BlogInput): PreparedBlogTranslation {
  const vi = locale === 'vi';
  return {
    locale,
    title: vi ? input.titleVi : input.titleEn,
    excerpt: nullableString(vi ? input.excerptVi : input.excerptEn),
    body: vi ? input.bodyVi : input.bodyEn,
    seo_title: nullableString(vi ? input.seoTitleVi : input.seoTitleEn),
    seo_description: nullableString(vi ? input.seoDescriptionVi : input.seoDescriptionEn)
  };
}

function translationsFromInput(input: BlogInput): PreparedBlogTranslation[] {
  return [translationFromInput('vi', input), translationFromInput('en', input)];
}

export function prepareBlogCreate(role: AppRole, input: unknown) {
  requirePermission(role, 'content:create');
  const parsed = BlogInputSchema.parse(input);
  return {
    post: {
      slug: parsed.slug,
      status: 'draft' as const,
      cover_media_id: parsed.coverMediaId ?? null
    },
    translations: translationsFromInput(parsed)
  };
}

export function prepareBlogUpdate(
  role: AppRole,
  id: string,
  input: unknown,
  current: {slug: string; publishedAt: string | null}
) {
  requirePermission(role, 'content:update');
  const blogId = idSchema.parse(id);
  const parsed = BlogInputSchema.parse(input);
  if (current.publishedAt && parsed.slug !== current.slug) {
    throw new Error('published_slug_immutable');
  }
  return {
    id: blogId,
    postChanges: {
      slug: parsed.slug,
      cover_media_id: parsed.coverMediaId ?? null
    },
    translations: translationsFromInput(parsed)
  };
}

function publishable(input: unknown): boolean {
  const parsed = BlogInputSchema.safeParse(input);
  if (!parsed.success) return false;
  return Object.keys(parsed.data.bodyVi).length > 0 && Object.keys(parsed.data.bodyEn).length > 0;
}

export function prepareBlogStatusChange(
  role: AppRole,
  id: string,
  currentStatus: BlogStatus,
  targetStatus: 'published' | 'archived',
  currentInput: unknown,
  publishedAt: string | null,
  nowIso = new Date().toISOString()
) {
  requirePermission(role, 'content:publish');
  const blogId = idSchema.parse(id);

  if (targetStatus === 'published') {
    if (currentStatus !== 'draft') throw new Error('invalid_blog_transition');
    if (!publishable(currentInput)) throw new Error('blog_not_publishable');
    return {
      id: blogId,
      changes: {
        status: 'published' as const,
        published_at: publishedAt ?? nowIso
      }
    };
  }

  if (currentStatus !== 'published') throw new Error('invalid_blog_transition');
  return {id: blogId, changes: {status: 'archived' as const}};
}

function emptyTranslation(locale: BlogLocale): AdminBlogTranslation {
  return {
    locale,
    title: '',
    excerpt: null,
    body: {},
    seoTitle: null,
    seoDescription: null
  };
}

function projectTranslation(row: BlogTranslationDbRow): AdminBlogTranslation {
  const locale: BlogLocale = row.locale === 'en' ? 'en' : 'vi';
  return {
    locale,
    title: row.title,
    excerpt: row.excerpt,
    body: bodyObject(row.body),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description
  };
}

function assembleBlog(post: BlogPostDbRow, rows: BlogTranslationDbRow[]): AdminBlog {
  const viRow = rows.find((row) => row.locale === 'vi');
  const enRow = rows.find((row) => row.locale === 'en');
  return {
    id: post.id,
    slug: post.slug,
    status: statusValue(post.status),
    publishedAt: post.published_at,
    coverMediaId: post.cover_media_id,
    authorId: post.author_id,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    vi: viRow ? projectTranslation(viRow) : emptyTranslation('vi'),
    en: enRow ? projectTranslation(enRow) : emptyTranslation('en')
  };
}

export function adminBlogToInput(blog: AdminBlog): BlogInput {
  return BlogInputSchema.parse({
    slug: blog.slug,
    titleVi: blog.vi.title,
    titleEn: blog.en.title,
    excerptVi: blog.vi.excerpt,
    excerptEn: blog.en.excerpt,
    bodyVi: blog.vi.body,
    bodyEn: blog.en.body,
    seoTitleVi: blog.vi.seoTitle,
    seoTitleEn: blog.en.seoTitle,
    seoDescriptionVi: blog.vi.seoDescription,
    seoDescriptionEn: blog.en.seoDescription,
    coverMediaId: blog.coverMediaId
  });
}

export async function listAdminBlogs(): Promise<AdminBlog[]> {
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const {data: posts, error: postError} = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', {ascending: false});
  if (postError) throw postError;
  if (!posts?.length) return [];

  const ids = posts.map((post) => post.id);
  const {data: translations, error: translationError} = await supabase
    .from('blog_translations')
    .select('*')
    .in('blog_post_id', ids);
  if (translationError) throw translationError;

  const translationRows = (translations ?? []) as BlogTranslationDbRow[];
  return posts.map((post) =>
    assembleBlog(
      post as BlogPostDbRow,
      translationRows.filter((row) => row.blog_post_id === post.id)
    )
  );
}

export async function getAdminBlog(id: string): Promise<AdminBlog | null> {
  const blogId = idSchema.parse(id);
  const {createSupabaseServerClient} = await import('@/lib/supabase/server');
  const supabase = await createSupabaseServerClient();
  const [postResult, translationResult] = await Promise.all([
    supabase.from('blog_posts').select('*').eq('id', blogId).maybeSingle(),
    supabase.from('blog_translations').select('*').eq('blog_post_id', blogId)
  ]);
  if (postResult.error) throw postResult.error;
  if (translationResult.error) throw translationResult.error;
  if (!postResult.data) return null;
  return assembleBlog(
    postResult.data as BlogPostDbRow,
    (translationResult.data ?? []) as BlogTranslationDbRow[]
  );
}
