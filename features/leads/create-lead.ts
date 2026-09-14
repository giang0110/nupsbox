import 'server-only';

import {enforceLeadRateLimit} from '@/lib/rate-limit/leads';
import {LeadInputSchema, type LeadInput} from './schema';
import {insertLead} from './repository';

export type LeadRequestContext = {
  clientKey: string;
};

export async function createLead(input: unknown, requestContext: LeadRequestContext) {
  const parsed: LeadInput = LeadInputSchema.parse(input);
  await enforceLeadRateLimit(requestContext.clientKey);
  const leadId = await insertLead(parsed);
  return {ok: true as const, leadId};
}
