import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';

type ContactValue = {
  phone?: string | null;
  zalo_url?: string | null;
  email?: string | null;
  facebook_url?: string | null;
  opening_hours?: Record<string, unknown> | null;
};

export type PublicSiteSettings = {
  phone: string | null;
  zaloUrl: string | null;
  email: string | null;
  facebookUrl: string | null;
  openingHours: Record<string, unknown>;
};

const emptySettings: PublicSiteSettings = {
  phone: null,
  zaloUrl: null,
  email: null,
  facebookUrl: null,
  openingHours: {}
};

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!url || url.includes('example.supabase.co')) return emptySettings;

  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'public_contact')
    .eq('is_public', true)
    .maybeSingle();

  if (error) throw error;

  const value = (data?.value ?? {}) as ContactValue;
  return {
    phone: value.phone ?? null,
    zaloUrl: value.zalo_url ?? null,
    email: value.email ?? null,
    facebookUrl: value.facebook_url ?? null,
    openingHours: value.opening_hours ?? {}
  };
}
