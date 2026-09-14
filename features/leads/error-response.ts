export function buildLeadSubmitFailureResponse() {
  return {ok: false as const, error: 'submit_failed' as const};
}
