export function isCatalogFixtureMode(
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
): boolean {
  if (!supabaseUrl) return true;

  try {
    return new URL(supabaseUrl).hostname === 'example.supabase.co';
  } catch {
    return false;
  }
}
