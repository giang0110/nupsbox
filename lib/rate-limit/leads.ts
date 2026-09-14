import 'server-only';

import {createHash} from 'node:crypto';
import {createSupabaseAdminClient} from '@/lib/supabase/admin';

const LIMIT = 5;
const WINDOW_SECONDS = 15 * 60;

export class LeadRateLimitError extends Error {
  constructor() {
    super('Lead submission rate limit exceeded');
    this.name = 'LeadRateLimitError';
  }
}

export function hashLeadClientKey(clientKey: string, salt: string) {
  return createHash('sha256').update(`${salt}:${clientKey}`).digest('hex');
}

export async function enforceLeadRateLimit(clientKey: string) {
  const salt = process.env.LEAD_RATE_LIMIT_SALT;
  if (!salt) throw new Error('Missing LEAD_RATE_LIMIT_SALT');

  const fingerprint = hashLeadClientKey(clientKey, salt);
  const supabase = createSupabaseAdminClient();
  const {data, error} = await supabase.rpc('consume_lead_rate_limit', {
    p_fingerprint: fingerprint,
    p_limit: LIMIT,
    p_window_seconds: WINDOW_SECONDS
  });
  if (error) throw error;
  if (data !== true) throw new LeadRateLimitError();
}
