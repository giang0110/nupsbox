const pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function hoChiMinhLocalToIso(value: string): string {
  const match = value.match(pattern);
  if (!match) throw new Error('invalid_local_datetime');

  const parsed = new Date(`${value}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid_local_datetime');

  const local = new Date(parsed.getTime() + 7 * 60 * 60 * 1000);
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (
    local.getUTCFullYear() !== year ||
    local.getUTCMonth() + 1 !== month ||
    local.getUTCDate() !== day ||
    local.getUTCHours() !== hour ||
    local.getUTCMinutes() !== minute
  ) {
    throw new Error('invalid_local_datetime');
  }

  return parsed.toISOString();
}
