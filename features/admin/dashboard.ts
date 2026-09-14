import {createSupabaseServerClient} from '@/lib/supabase/server';

export type AdminDashboardCounts = {
  leads: number;
  activeLocations: number;
  activeUnitTypes: number;
  faqs: number;
  publishedBlogPosts: number;
};

type NullableAdminDashboardCounts = {
  [Key in keyof AdminDashboardCounts]: number | null;
};

export function normalizeAdminDashboardCounts(
  counts: NullableAdminDashboardCounts
): AdminDashboardCounts {
  return {
    leads: counts.leads ?? 0,
    activeLocations: counts.activeLocations ?? 0,
    activeUnitTypes: counts.activeUnitTypes ?? 0,
    faqs: counts.faqs ?? 0,
    publishedBlogPosts: counts.publishedBlogPosts ?? 0
  };
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardCounts> {
  const supabase = await createSupabaseServerClient();
  const [leads, locations, unitTypes, faqs, blogPosts] = await Promise.all([
    supabase.from('leads').select('*', {count: 'exact', head: true}),
    supabase.from('locations').select('*', {count: 'exact', head: true}).eq('status', 'active'),
    supabase.from('unit_types').select('*', {count: 'exact', head: true}).eq('active', true),
    supabase.from('faqs').select('*', {count: 'exact', head: true}).eq('active', true),
    supabase.from('blog_posts').select('*', {count: 'exact', head: true}).eq('status', 'published')
  ]);

  const firstError = [leads.error, locations.error, unitTypes.error, faqs.error, blogPosts.error].find(Boolean);
  if (firstError) throw firstError;

  return normalizeAdminDashboardCounts({
    leads: leads.count,
    activeLocations: locations.count,
    activeUnitTypes: unitTypes.count,
    faqs: faqs.count,
    publishedBlogPosts: blogPosts.count
  });
}
