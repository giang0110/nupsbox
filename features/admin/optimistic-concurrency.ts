export const STALE_ADMIN_WRITE = 'stale_admin_write';

export function requireExpectedUpdatedAt(value: FormDataEntryValue | null): string {
  const expected = String(value ?? '').trim();
  if (!expected || Number.isNaN(Date.parse(expected))) {
    throw new Error('invalid_expected_updated_at');
  }
  return expected;
}

export function assertFreshAdminWrite<T>(row: T | null): T {
  if (!row) throw new Error(STALE_ADMIN_WRITE);
  return row;
}
