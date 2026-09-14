import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';

export async function readFeaturedLocationRow() {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('locations')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function readLocationRowBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function readActiveUnitRows() {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('unit_types')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function readActiveUnitRowBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('unit_types')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function readPricingRows(locationId: string) {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('location_unit_types')
    .select('*')
    .eq('location_id', locationId);
  if (error) throw error;
  return data ?? [];
}
