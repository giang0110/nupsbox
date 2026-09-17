const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const HO_CHI_MINH_OFFSET_HOURS = 7;

export function hoChiMinhLocalToIso(value: string): string {
  const match = localDateTimePattern.exec(value);
  if (!match) throw new Error('invalid_local_datetime');

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    throw new Error('invalid_local_datetime');
  }

  const utcMillis = Date.UTC(
    year,
    month - 1,
    day,
    hour - HO_CHI_MINH_OFFSET_HOURS,
    minute,
    0,
    0
  );
  const parsed = new Date(utcMillis);
  if (Number.isNaN(parsed.getTime())) throw new Error('invalid_local_datetime');

  // Round-trip through UTC+7 so impossible dates such as 31 February
  // cannot be silently normalized by JavaScript's Date implementation.
  const localRoundTrip = new Date(utcMillis + HO_CHI_MINH_OFFSET_HOURS * 60 * 60 * 1000);
  if (
    localRoundTrip.getUTCFullYear() !== year ||
    localRoundTrip.getUTCMonth() !== month - 1 ||
    localRoundTrip.getUTCDate() !== day ||
    localRoundTrip.getUTCHours() !== hour ||
    localRoundTrip.getUTCMinutes() !== minute
  ) {
    throw new Error('invalid_local_datetime');
  }

  return parsed.toISOString();
}
