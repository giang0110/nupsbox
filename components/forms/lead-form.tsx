'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useSearchParams} from 'next/navigation';
import {captureUtm, persistAttribution, readPersistedAttribution} from '@/features/leads/utm';
import {buildOptionalPublicAppointment} from '@/features/leads/public-booking';
import {Button} from '@/components/ui/button';

type Props = {
  locale: 'vi' | 'en';
  fallbackPhone?: string | null;
  fallbackZalo?: string | null;
  locationId?: string;
  unitTypeId?: string;
  needType?: 'shop_online' | 'sme' | 'inventory' | 'personal' | 'documents' | 'other';
  estimatedVolume?: 'under_20_boxes' | 'boxes_20_50' | 'over_50_boxes' | 'unknown';
  appointmentMode?: boolean;
};

export function LeadForm({
  locale,
  fallbackPhone,
  fallbackZalo,
  locationId,
  unitTypeId,
  needType = 'other',
  estimatedVolume = 'unknown',
  appointmentMode = false
}: Props) {
  const vi = locale === 'vi';
  const searchParams = useSearchParams();
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error' | 'rate_limited'>('idle');
  const [wantsViewing, setWantsViewing] = useState(false);

  useEffect(() => {
    const captured = captureUtm(searchParams);
    persistAttribution(captured);
  }, [searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    const form = new FormData(event.currentTarget);
    const attribution = {...readPersistedAttribution(), ...captureUtm(searchParams)};

    let appointment;
    try {
      appointment = buildOptionalPublicAppointment(
        appointmentMode && wantsViewing,
        String(form.get('viewingTime') ?? ''),
        String(form.get('viewingNote') ?? '')
      );
    } catch {
      setState('error');
      return;
    }

    const payload = {
      fullName: String(form.get('fullName') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
      website: String(form.get('website') ?? ''),
      preferredLanguage: locale,
      locationId,
      unitTypeId,
      needType,
      estimatedVolume,
      landingPage: window.location.pathname,
      referrer: document.referrer || undefined,
      ...attribution,
      ...(appointment ? {appointment} : {})
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(payload)
      });
      if (response.status === 429) {
        setState('rate_limited');
        return;
      }
      setState(response.ok ? 'success' : 'error');
      if (response.ok) {
        event.currentTarget.reset();
        setWantsViewing(false);
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return <div role="status" className="rounded-[2rem] bg-white p-7 text-[var(--nupsbox-navy)] shadow-sm"><h2 className="text-2xl font-black">{vi ? 'Đã nhận yêu cầu.' : 'Request received.'}</h2><p className="mt-3 text-[var(--nupsbox-slate)]">{appointmentMode ? (vi ? 'NupsBox sẽ liên hệ xác nhận lịch xem kho. Đây chưa phải giữ chỗ.' : 'NupsBox will contact you to confirm the viewing time. This is not a reservation.') : (vi ? 'NupsBox sẽ liên hệ với bạn sớm.' : 'NupsBox will contact you soon.')}</p></div>;
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-[2rem] bg-white p-6 text-[var(--nupsbox-navy)] shadow-sm sm:p-8">
      <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Tên' : 'Name'}<input name="fullName" required minLength={2} maxLength={120} className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4 font-normal" /></label>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Số điện thoại' : 'Phone'}<input name="phone" required inputMode="tel" autoComplete="tel" className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4 font-normal" /></label>
      <label className="grid gap-2 text-sm font-bold">Email <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span><input name="email" type="email" autoComplete="email" className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4 font-normal" /></label>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Nhu cầu' : 'What do you need?'}<textarea name="message" rows={4} maxLength={2000} className="rounded-xl border border-[var(--nupsbox-border)] px-4 py-3 font-normal" /></label>

      {appointmentMode ? (
        <div className="grid gap-4 rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4">
          <label className="flex items-start gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={wantsViewing}
              onChange={(event) => setWantsViewing(event.target.checked)}
              className="mt-1 size-4"
            />
            <span>{vi ? 'Tôi muốn đề xuất thời gian xem kho' : 'I want to propose a storage viewing time'}</span>
          </label>
          {wantsViewing ? (
            <>
              <label className="grid gap-2 text-sm font-bold">
                {vi ? 'Thời gian mong muốn (giờ TP.HCM)' : 'Preferred time (Ho Chi Minh City time)'}
                <input name="viewingTime" type="datetime-local" required className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 font-normal" />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                {vi ? 'Ghi chú cho lịch xem' : 'Viewing note'} <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span>
                <input name="viewingNote" maxLength={1000} className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 font-normal" placeholder={vi ? 'Ví dụ: vui lòng gọi trước 15 phút' : 'Example: please call 15 minutes before'} />
              </label>
              <p className="text-xs leading-5 text-[var(--nupsbox-slate)]">{vi ? 'Thời gian này là đề xuất để NupsBox xác nhận, không phải giữ chỗ kho.' : 'This time is a request for NupsBox to confirm, not a storage reservation.'}</p>
            </>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={state === 'submitting'}>{state === 'submitting' ? (vi ? 'Đang gửi…' : 'Sending…') : (appointmentMode ? (vi ? 'Gửi yêu cầu đặt lịch' : 'Send viewing request') : (vi ? 'Gửi yêu cầu tư vấn' : 'Request advice'))}</Button>
      {state === 'error' || state === 'rate_limited' ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{state === 'rate_limited' ? (vi ? 'Bạn đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau.' : 'Too many requests were sent recently. Please try again later.') : (vi ? 'Không gửi được yêu cầu lúc này. Vui lòng kiểm tra lại thông tin và thời gian xem kho.' : 'We could not submit your request right now. Please check the form and viewing time.')}</p>{fallbackPhone || fallbackZalo ? <p className="mt-2">{fallbackPhone ? <a className="font-bold underline" href={`tel:${fallbackPhone}`}>{vi ? 'Gọi NupsBox' : 'Call NupsBox'}</a> : null}{fallbackPhone && fallbackZalo ? ' · ' : null}{fallbackZalo ? <a className="font-bold underline" href={fallbackZalo} target="_blank" rel="noreferrer">Zalo</a> : null}</p> : null}</div> : null}
      <p className="text-xs leading-5 text-[var(--nupsbox-slate)]">{vi ? 'Thông tin này chỉ được dùng để NupsBox phản hồi yêu cầu thuê kho của bạn.' : 'This information is used only to respond to your storage enquiry.'}</p>
    </form>
  );
}
