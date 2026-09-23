const SCOPES = ['public', 'admin', 'global'] as const;
type ClientErrorScope = (typeof SCOPES)[number];

export type ClientErrorEvent = {
  scope: ClientErrorScope;
  digest: string | null;
  path: string;
};

function safeToken(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().slice(0, max);
  return normalized && /^[A-Za-z0-9._:/-]+$/.test(normalized) ? normalized : null;
}

export function normalizeClientErrorEvent(input: unknown): ClientErrorEvent | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const scope = typeof record.scope === 'string' && SCOPES.includes(record.scope as ClientErrorScope)
    ? record.scope as ClientErrorScope
    : null;
  const path = safeToken(record.path, 240);
  const digest = record.digest == null ? null : safeToken(record.digest, 120);

  if (!scope || !path || (record.digest != null && !digest)) return null;
  return {scope, digest, path};
}
