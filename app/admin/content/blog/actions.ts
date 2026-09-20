'use server';

import {revalidatePath} from 'next/cache';
import {
  getAdminBlog,
  hcmDateTimeLocalToIso,
  prepareBlogCreate,
  prepareBlogSchedule,
  prepareBlogScheduleCancellation,
  prepareBlogStatusChange,
  prepareBlogUpdate,
  type AdminBlog,
  type PreparedBlogTranslation
} from '@/features/admin/blog';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {Json} from '@/types/database';

function parseBody(value: FormDataEntryValue | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(String(value ?? '{}'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error('invalid_blog_body_json');
  }
}

function inputFromFormData(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? ''),
    titleVi: String(formData.get('titleVi') ?? ''),
    titleEn: String(formData.get('titleEn') ?? ''),
    excerptVi: String(formData.get('excerptVi') ?? ''),
    excerptEn: String(formData.get('excerptEn') ?? ''),
    bodyVi: parseBody(formData.get('bodyVi')),
    bodyEn: parseBody(formData.get('bodyEn')),
    seoTitleVi: String(formData.get('seoTitleVi') ?? ''),
    seoTitleEn: String(formData.get('seoTitleEn') ?? ''),
    seoDescriptionVi: String(formData.get('seoDescriptionVi') ?? ''),
    seoDescriptionEn: String(formData.get('seoDescriptionEn') ?? ''),
    coverMediaId: String(formData.get('coverMediaId') ?? ''),
    sourceUrl: String(formData.get('sourceUrl') ?? '')
  };
}

function blogInput(blog: AdminBlog) {
  return {
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
    coverMediaId: blog.coverMediaId,
    sourceUrl: blog.sourceUrl
  };
}

type BlogAtomicRpcError = {code?: string; message?: string} | null;
type BlogAtomicRpcClient = {
  rpc(
    name: 'create_blog_post_atomic' | 'update_blog_post_atomic',
    args: Record<string, unknown>
  ): PromiseLike<{data: unknown; error: BlogAtomicRpcError}>;
};

function translationPayload(translation: PreparedBlogTranslation): Json {
  return {
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body as Json,
    seo_title: translation.seo_title,
    seo_description: translation.seo_description
  };
}

function bilingualPayload(translations: PreparedBlogTranslation[]) {
  const vi = translations.find(item => item.locale === 'vi');
  const en = translations.find(item => item.locale === 'en');
  if (!vi || !en) throw new Error('blog_translations_incomplete');
  return {vi: translationPayload(vi), en: translationPayload(en)};
}

function throwBlogError(error: {code?: string; message?: string} | null) {
  if (!error) return;
  if (error.code === '23505') throw new Error('slug_conflict');
  if (error.message?.includes('published_slug_immutable')) throw new Error('published_slug_immutable');
  throw error;
}

function revalidateBlogs() {
  revalidatePath('/admin/content');
  revalidatePath('/admin/content/blog');
  revalidatePath('/vi/blog');
  revalidatePath('/en/blog');
}

export async function createBlogPost(formData: FormData) {
  const session = await requireAdminUser();
  const prepared = prepareBlogCreate(session.role, inputFromFormData(formData));
  const payload = bilingualPayload(prepared.translations);
  const supabase = await createSupabaseServerClient();
  const rpcClient = supabase as unknown as BlogAtomicRpcClient;

  const {data, error} = await rpcClient.rpc('create_blog_post_atomic', {
    p_slug: prepared.post.slug,
    p_cover_media_id: prepared.post.cover_media_id,
    p_source_url: prepared.post.source_url,
    p_author_id: session.user.id,
    p_vi: payload.vi,
    p_en: payload.en
  });
  throwBlogError(error);
  if (typeof data !== 'string') throw new Error('blog_create_failed');
  revalidateBlogs();
}

export async function updateBlogPost(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const current = await getAdminBlog(id);
  if (!current) throw new Error('blog_not_found');

  const prepared = prepareBlogUpdate(session.role, id, inputFromFormData(formData), {
    slug: current.slug,
    publishedAt: current.publishedAt
  });
  const payload = bilingualPayload(prepared.translations);
  const supabase = await createSupabaseServerClient();
  const rpcClient = supabase as unknown as BlogAtomicRpcClient;
  const {data, error} = await rpcClient.rpc('update_blog_post_atomic', {
    p_id: prepared.id,
    p_slug: prepared.postChanges.slug,
    p_cover_media_id: prepared.postChanges.cover_media_id,
    p_source_url: prepared.postChanges.source_url,
    p_vi: payload.vi,
    p_en: payload.en
  });
  throwBlogError(error);
  if (data !== prepared.id) throw new Error('blog_update_noop');
  revalidateBlogs();
  revalidatePath(`/admin/content/blog/${prepared.id}`);
}

export async function scheduleBlogPublication(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const current = await getAdminBlog(id);
  if (!current) throw new Error('blog_not_found');

  const scheduledAtIso = hcmDateTimeLocalToIso(String(formData.get('scheduledAt') ?? ''));
  const command = prepareBlogSchedule(
    session.role,
    id,
    current.status,
    blogInput(current),
    scheduledAtIso
  );

  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('blog_posts')
    .update(command.changes)
    .eq('id', command.id)
    .select('id')
    .single();
  throwBlogError(error);
  if (!data) throw new Error('blog_status_update_noop');
  revalidateBlogs();
  revalidatePath('/admin/content/calendar');
  revalidatePath('/admin/seo');
  revalidatePath(`/admin/content/blog/${command.id}`);
}

export async function cancelScheduledBlogPublication(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const current = await getAdminBlog(id);
  if (!current) throw new Error('blog_not_found');

  const command = prepareBlogScheduleCancellation(
    session.role,
    id,
    current.status,
    current.publishedAt
  );

  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('blog_posts')
    .update(command.changes)
    .eq('id', command.id)
    .select('id')
    .single();
  throwBlogError(error);
  if (!data) throw new Error('blog_status_update_noop');
  revalidateBlogs();
  revalidatePath('/admin/content/calendar');
  revalidatePath('/admin/seo');
  revalidatePath(`/admin/content/blog/${command.id}`);
}

export async function setBlogStatus(formData: FormData) {
  const session = await requireAdminUser();
  const id = String(formData.get('id') ?? '');
  const targetValue = String(formData.get('target') ?? '');
  if (targetValue !== 'published' && targetValue !== 'archived') {
    throw new Error('invalid_blog_transition');
  }

  const current = await getAdminBlog(id);
  if (!current) throw new Error('blog_not_found');
  const command = prepareBlogStatusChange(
    session.role,
    id,
    current.status,
    targetValue,
    blogInput(current),
    current.publishedAt
  );
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('blog_posts')
    .update(command.changes)
    .eq('id', command.id)
    .select('id')
    .single();
  throwBlogError(error);
  if (!data) throw new Error('blog_status_update_noop');
  revalidateBlogs();
  revalidatePath('/admin/content/calendar');
  revalidatePath('/admin/seo');
  revalidatePath(`/admin/content/blog/${command.id}`);
}
