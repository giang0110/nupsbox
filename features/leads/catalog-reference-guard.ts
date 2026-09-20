import 'server-only';

import {createSupabaseAdminClient} from '@/lib/supabase/admin';

export class PublicCatalogReferenceError extends Error {
  constructor(message = 'invalid_catalog_reference') {
    super(message);
    this.name = 'PublicCatalogReferenceError';
  }
}

export async function assertPublicCatalogReferences(
  locationId?: string,
  unitTypeId?: string
) {
  if (!locationId && !unitTypeId) return;

  const supabase = createSupabaseAdminClient();

  if (locationId) {
    const {data: location, error} = await supabase
      .from('locations')
      .select('id')
      .eq('id', locationId)
      .eq('status', 'active')
      .maybeSingle();
    if (error) throw error;
    if (!location) throw new PublicCatalogReferenceError();
  }

  if (unitTypeId) {
    const {data: unit, error} = await supabase
      .from('unit_types')
      .select('id')
      .eq('id', unitTypeId)
      .eq('active', true)
      .maybeSingle();
    if (error) throw error;
    if (!unit) throw new PublicCatalogReferenceError();
  }

  if (locationId && unitTypeId) {
    const {data: mapping, error} = await supabase
      .from('location_unit_types')
      .select('id')
      .eq('location_id', locationId)
      .eq('unit_type_id', unitTypeId)
      .maybeSingle();
    if (error) throw error;
    if (!mapping) throw new PublicCatalogReferenceError();
  }
}
