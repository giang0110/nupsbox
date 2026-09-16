const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function hoChiMinhLocalToIso(value: string): string {
  if (!pattern.test(value)) throw new Error('invalid_local_datetime');

  const parsed = new Date(`${value}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid_local_datetime');

  return parsed.toISOString();
}
