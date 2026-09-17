import 'server-only';

import {enforceLeadRateLimit} from '@/lib/rate-limit/leads';
import {PublicLeadRequestSchema, type PublicLeadRequest} from './request-schema';
import {insertLeadRequest} from './repository';

export type LeadRequestContext = {
  clientKey: string;
};

export async function createLead(input: unknown, requestContext: LeadRequestContext) {
  const parsed: PublicLeadRequest = PublicLeadRequestSchema.parse(input);
  await enforceLeadRateLimit(requestContext.clientKey);
  const result = await insertLeadRequest(parsed);
  return {ok: true as const, ...result};
}
