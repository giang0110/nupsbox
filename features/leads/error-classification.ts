export type LeadSubmitDiagnostic =
  | 'missing_rate_limit_salt'
  | 'missing_supabase_config'
  | 'backend_error'
  | 'unknown_error';

export function classifyLeadSubmitError(error: unknown): LeadSubmitDiagnostic {
  if (error instanceof Error) {
    if (error.message === 'Missing LEAD_RATE_LIMIT_SALT') return 'missing_rate_limit_salt';
    if (error.message === 'Missing server Supabase configuration') return 'missing_supabase_config';
    return 'backend_error';
  }

  if (typeof error === 'object' && error !== null) return 'backend_error';
  return 'unknown_error';
}
