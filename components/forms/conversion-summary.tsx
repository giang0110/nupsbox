export function ConversionSummary({
  locale,
  unitName,
  locationName,
  appointmentMode = false
}: {
  locale: 'vi' | 'en';
  unitName?: string | null;
  locationName?: string | null;
  appointmentMode?: boolean;
}) {
  if (!unitName && !locationName) return null;
  const vi = locale === 'vi';

  return (
    <aside
      className="rounded-2xl border border-[rgba(8,70,168,.12)] bg-[linear-gradient(145deg,#f7f9fc,#eef4fb)] p-4"
      aria-label={vi ? 'Thông tin đã chọn' : 'Selected context'}
    >
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-[var(--nupsbox-blue)]">
        {vi ? 'THÔNG TIN ĐÃ CHỌN' : 'SELECTED CONTEXT'}
      </p>
      <div className="mt-2.5 grid gap-1.5 text-sm">
        {unitName ? <p><span className="font-semibold text-[var(--nupsbox-slate)]">{vi ? 'Loại kho:' : 'Unit:'}</span> <strong className="text-[var(--nupsbox-navy)]">{unitName}</strong></p> : null}
        {locationName ? <p><span className="font-semibold text-[var(--nupsbox-slate)]">{vi ? 'Địa điểm:' : 'Location:'}</span> <strong className="text-[var(--nupsbox-navy)]">{locationName}</strong></p> : null}
      </div>
      {appointmentMode ? (
        <p className="mt-2.5 text-xs leading-5 text-[var(--nupsbox-slate)]">
          {vi
            ? 'Đây là yêu cầu để NupsBox xác nhận lịch, không phải giữ chỗ hoặc xác nhận tức thời.'
            : 'This is a request for NupsBox to confirm, not a reservation or instant confirmation.'}
        </p>
      ) : null}
    </aside>
  );
}
