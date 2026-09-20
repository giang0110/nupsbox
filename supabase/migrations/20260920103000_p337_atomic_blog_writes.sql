-- P3.37 final production readiness: atomic bilingual blog writes.
-- SECURITY INVOKER preserves existing RLS and does not expand caller privileges.

create or replace function public.create_blog_post_atomic(
  p_slug text,
  p_cover_media_id uuid,
  p_source_url text,
  p_author_id uuid,
  p_vi jsonb,
  p_en jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_id uuid;
begin
  if auth.uid() is distinct from p_author_id then
    raise exception 'blog author mismatch' using errcode = '42501';
  end if;

  insert into public.blog_posts (
    slug, status, cover_media_id, source_url, author_id
  ) values (
    p_slug, 'draft', p_cover_media_id, p_source_url, p_author_id
  )
  returning id into v_id;

  insert into public.blog_translations (
    blog_post_id, locale, title, excerpt, body, seo_title, seo_description
  ) values
  (
    v_id,
    'vi',
    p_vi->>'title',
    nullif(p_vi->>'excerpt', ''),
    coalesce(p_vi->'body', '{}'::jsonb),
    nullif(p_vi->>'seo_title', ''),
    nullif(p_vi->>'seo_description', '')
  ),
  (
    v_id,
    'en',
    p_en->>'title',
    nullif(p_en->>'excerpt', ''),
    coalesce(p_en->'body', '{}'::jsonb),
    nullif(p_en->>'seo_title', ''),
    nullif(p_en->>'seo_description', '')
  );

  return v_id;
end;
$$;

create or replace function public.update_blog_post_atomic(
  p_id uuid,
  p_slug text,
  p_cover_media_id uuid,
  p_source_url text,
  p_vi jsonb,
  p_en jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  update public.blog_posts
  set
    slug = p_slug,
    cover_media_id = p_cover_media_id,
    source_url = p_source_url
  where id = p_id;

  if not found then
    raise exception 'blog not found' using errcode = 'P0002';
  end if;

  insert into public.blog_translations (
    blog_post_id, locale, title, excerpt, body, seo_title, seo_description
  ) values
  (
    p_id,
    'vi',
    p_vi->>'title',
    nullif(p_vi->>'excerpt', ''),
    coalesce(p_vi->'body', '{}'::jsonb),
    nullif(p_vi->>'seo_title', ''),
    nullif(p_vi->>'seo_description', '')
  ),
  (
    p_id,
    'en',
    p_en->>'title',
    nullif(p_en->>'excerpt', ''),
    coalesce(p_en->'body', '{}'::jsonb),
    nullif(p_en->>'seo_title', ''),
    nullif(p_en->>'seo_description', '')
  )
  on conflict (blog_post_id, locale)
  do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    body = excluded.body,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description;

  return p_id;
end;
$$;

revoke all on function public.create_blog_post_atomic(text, uuid, text, uuid, jsonb, jsonb)
from public, anon;
revoke all on function public.update_blog_post_atomic(uuid, text, uuid, text, jsonb, jsonb)
from public, anon;

grant execute on function public.create_blog_post_atomic(text, uuid, text, uuid, jsonb, jsonb)
to authenticated;
grant execute on function public.update_blog_post_atomic(uuid, text, uuid, text, jsonb, jsonb)
to authenticated;
