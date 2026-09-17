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
    <aside className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4" aria-label={vi ? 'Thông tin đã chọn' : 'Selected context'}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">{vi ? 'THÔNG TIN ĐÃ CHỌN' : 'SELECTED CONTEXT'}</p>
      <div className="mt-3 grid gap-2 text-sm">
        {unitName ? <p><span className="font-semibold text-[var(--nupsbox-slate)]">{vi ? 'Loại kho:' : 'Unit:'}</span> <strong className="text-[var(--nupsbox-navy)]">{unitName}</strong></p> : null}
        {locationName ? <p><span className="font-semibold text-[var(--nupsbox-slate)]">{vi ? 'Địa điểm:' : 'Location:'}</span> <strong className="text-[var(--nupsbox-navy)]">{locationName}</strong></p> : null}
      </div>
      {appointmentMode ? <p className="mt-3 text-xs leading-5 text-[var(--nupsbox-slate)]">{vi ? 'Đây là yêu cầu để NupsBox xác nhận lịch, không phải giữ chỗ hoặc xác nhận tức thời.' : 'This is a request for NupsBox to confirm, not a reservation or instant confirmation.'}</p> : null}
    </aside>
  );
}
