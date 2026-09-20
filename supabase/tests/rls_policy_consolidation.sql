begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='locations'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'locations has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='unit_types'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'unit types has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='location_unit_types'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'pricing has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='media_assets'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'media has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='faqs'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'faqs has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='content_blocks'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'content blocks has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='blog_posts'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'blog posts has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='blog_translations'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'blog translations has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='site_settings'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'site settings has one authenticated SELECT policy'
);
select is(
  (select count(*)::bigint from pg_policies
   where schemaname='public' and tablename='profiles'
     and roles @> array['authenticated']::name[] and cmd='SELECT'),
  1::bigint,
  'profiles has one authenticated SELECT policy'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='locations'
    and policyname='locations_public_read' and roles = array['anon']::name[]),
  'anonymous public catalog access remains explicit'
);

select ok(
  exists(select 1 from pg_policies where schemaname='public' and tablename='profiles'
    and policyname='profiles_authenticated_read'
    and qual like '%auth.uid()%'),
  'profile self read remains present in consolidated policy'
);

select * from finish();
rollback;
