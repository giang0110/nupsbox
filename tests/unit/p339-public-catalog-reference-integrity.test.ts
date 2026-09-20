import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.39 public catalog reference integrity', () => {
  it('validates catalog references after rate limiting and before insert', () => {
    const createLead = source('features/leads/create-lead.ts');
    const rateIndex = createLead.indexOf('enforceLeadRateLimit');
    const guardIndex = createLead.indexOf('assertPublicCatalogReferences(parsed.locationId, parsed.unitTypeId)');
    const insertIndex = createLead.indexOf('insertLeadRequest(parsed)');
    expect(rateIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeGreaterThan(rateIndex);
    expect(insertIndex).toBeGreaterThan(guardIndex);
  });

  it('maps invalid catalog references to a controlled 400 response', () => {
    const route = source('app/api/leads/route.ts');
    expect(route).toContain('error instanceof PublicCatalogReferenceError');
    expect(route).toContain("error: 'invalid_catalog_reference'");
    expect(route).toContain('{status: 400}');
  });

  it('keeps the public RPC restricted to service_role', () => {
    const migration = source('supabase/migrations/20260920110000_p339_public_catalog_reference_integrity.sql');
    expect(migration).toContain('invalid public location reference');
    expect(migration).toContain('invalid public unit reference');
    expect(migration).toContain('invalid public location unit pair');
    expect(migration).toContain('grant execute on function public.submit_public_lead_request(jsonb, jsonb) to service_role');
  });
});
