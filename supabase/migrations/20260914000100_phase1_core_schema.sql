-- NupsBox Phase 1 core schema
-- Public marketing data, lightweight CRM, CMS, and booking-ready inventory metadata.

create type public.app_role as enum ('admin', 'staff', 'viewer');
create type public.location_status as enum ('active', 'inactive', 'coming_soon');
create type public.availability_status as enum ('available', 'limited', 'sold_out', 'contact');
create type public.lead_status as enum ('new', 'contacted', 'visit_scheduled', 'visited', 'won', 'lost');
create type public.need_type as enum ('shop_online', 'sme', 'inventory', 'personal', 'documents', 'other');
create type public.estimated_volume as enum ('under_20_boxes', 'boxes_20_50', 'over_50_boxes', 'unknown');
create type public.media_category as enum ('hero', 'location', 'unit', 'security', 'exterior', 'lifestyle', 'blog');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_vi text not null,
  name_en text not null,
  address_vi text not null,
  address_en text not null,
  district text not null,
  city text not null default 'Ho Chi Minh City',
  latitude numeric(9,6),
  longitude numeric(9,6),
  phone text,
  zalo_url text,
  opening_hours jsonb not null default '{}'::jsonb,
  status public.location_status not null default 'active',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint locations_longitude_check check (longitude is null or longitude between -180 and 180)
);

create table public.unit_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_vi text not null,
  name_en text not null,
  area_m2 numeric(8,2) not null check (area_m2 > 0),
  recommended_for_vi text,
  recommended_for_en text,
  capacity_note_vi text,
  capacity_note_en text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.location_unit_types (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  unit_type_id uuid not null references public.unit_types(id) on delete cascade,
  monthly_price numeric(12,0) check (monthly_price >= 0),
  promo_price numeric(12,0) check (promo_price is null or promo_price >= 0),
  deposit_amount numeric(12,0) check (deposit_amount is null or deposit_amount >= 0),
  availability_status public.availability_status not null default 'contact',
  available_count integer check (available_count is null or available_count >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, unit_type_id),
  constraint location_unit_types_promo_check check (
    promo_price is null or monthly_price is null or promo_price <= monthly_price
  )
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_vi text not null default '',
  alt_en text not null default '',
  location_id uuid references public.locations(id) on delete set null,
  unit_type_id uuid references public.unit_types(id) on delete set null,
  category public.media_category not null,
  sort_order integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_vi text not null,
  answer_vi text not null,
  question_en text not null,
  answer_en text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  block_key text not null,
  content_vi jsonb not null default '{}'::jsonb,
  content_en jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, block_key)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_publish_check check (status <> 'published' or published_at is not null)
);

create table public.blog_translations (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  title text not null,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (blog_post_id, locale)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  preferred_language text not null default 'vi' check (preferred_language in ('vi', 'en')),
  location_id uuid references public.locations(id) on delete set null,
  unit_type_id uuid references public.unit_types(id) on delete set null,
  need_type public.need_type not null default 'other',
  estimated_volume public.estimated_volume not null default 'unknown',
  message text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  landing_page text,
  referrer text,
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_phone_length_check check (char_length(phone) between 6 and 32)
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null check (char_length(note) > 0),
  created_at timestamptz not null default now()
);

create table public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_status public.lead_status,
  to_status public.lead_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  row_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_rate_limits (
  fingerprint text primary key,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count >= 0),
  updated_at timestamptz not null default now()
);
