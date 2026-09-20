import 'server-only';

import {enforceLeadRateLimit} from '@/lib/rate-limit/leads';
import {assertPublicAppointmentNotPast} from './appointment-guard';
import {assertPublicCatalogReferences} from './catalog-reference-guard';
import {PublicLeadRequestSchema, type PublicLeadRequest} from './request-schema';
import {insertLeadRequest} from './repository';

export type LeadRequestContext = {
  clientKey: string;
};

export async function createLead(input: unknown, requestContext: LeadRequestContext) {
  const parsed: PublicLeadRequest = PublicLeadRequestSchema.parse(input);
  assertPublicAppointmentNotPast(parsed.appointment);
  await enforceLeadRateLimit(requestContext.clientKey);
  await assertPublicCatalogReferences(parsed.locationId, parsed.unitTypeId);
  const result = await insertLeadRequest(parsed);
  return {ok: true as const, ...result};
}
