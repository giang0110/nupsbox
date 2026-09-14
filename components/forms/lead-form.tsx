'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useSearchParams} from 'next/navigation';
import {captureUtm, persistAttribution, readPersistedAttribution} from '@/features/leads/utm';
import {Button} from '@/components/ui/button';

type Props = {
  locale: 'vi' | 'en';
  fallbackPhone?: string | null;
  fallbackZalo?: string | null;
  locationId?: string;
  unitTypeId?: string;
  needType?: 'shop_online' | 'sme' | 'inventory' | 'personal' | 'documents' | 'other';
  estimatedVolume?: 'under_20_boxes' | 'boxes_20_50' | 'over_50_boxes' | 'unknown';
};

export function LeadForm({locale, fallbackPhone, fallbackZalo, locationId, unitTypeId, needType = 'other', estimatedVolume = 'unknown'}: Props) {
  const vi = locale === 'vi';
  const searchParams = useSearchParams();
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error' | 'rate_limited'>('idle');

  useEffect(() => {
    const captured = captureUtm(searchParams);
    persistAttribution(captured);
  }, [searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    const form = new FormData(event.currentTarget);
    const attribution = {...readPersistedAttribution(), ...captureUtm(searchParams)};
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
      ...attribution
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
      if (response.ok) event.currentTarget.reset();
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return <div role="status" className="rounded-[2rem] bg-white p-7 text-[var(--nupsbox-navy)] shadow-sm"><h2 className="text-2xl font-black">{vi ? 'Đã nhận yêu cầu.' : 'Request received.'}</h2><p className="mt-3 text-[var(--nupsbox-slate)]">{vi ? 'NupsBox sẽ liên hệ với bạn sớm.' : 'NupsBox will contact you soon.'}</p></div>;
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-[2rem] bg-white p-6 text-[var(--nupsbox-navy)] shadow-sm sm:p-8">
      <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Tên' : 'Name'}<input name="fullName" required minLength={2} maxLength={120} className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4 font-normal" /></label>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Số điện thoại' : 'Phone'}<input name="phone" required inputMode="tel" autoComplete="tel" className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4 font-normal" /></label>
      <label className="grid gap-2 text-sm font-bold">Email <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span><input name="email" type="email" autoComplete="email" className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4 font-normal" /></label>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Nhu cầu' : 'What do you need?'}<textarea name="message" rows={4} maxLength={2000} className="rounded-xl border border-[var(--nupsbox-border)] px-4 py-3 font-normal" /></label>
      <Button type="submit" size="lg" disabled={state === 'submitting'}>{state === 'submitting' ? (vi ? 'Đang gửi…' : 'Sending…') : (vi ? 'Gửi yêu cầu tư vấn' : 'Request advice')}</Button>
      {state === 'error' || state === 'rate_limited' ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{state === 'rate_limited' ? (vi ? 'Bạn đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau.' : 'Too many requests were sent recently. Please try again later.') : (vi ? 'Không gửi được yêu cầu lúc này.' : 'We could not submit your request right now.')}</p>{fallbackPhone || fallbackZalo ? <p className="mt-2">{fallbackPhone ? <a className="font-bold underline" href={`tel:${fallbackPhone}`}>{vi ? 'Gọi NupsBox' : 'Call NupsBox'}</a> : null}{fallbackPhone && fallbackZalo ? ' · ' : null}{fallbackZalo ? <a className="font-bold underline" href={fallbackZalo} target="_blank" rel="noreferrer">Zalo</a> : null}</p> : null}</div> : null}
      <p className="text-xs leading-5 text-[var(--nupsbox-slate)]">{vi ? 'Thông tin này chỉ được dùng để NupsBox phản hồi yêu cầu thuê kho của bạn.' : 'This information is used only to respond to your storage enquiry.'}</p>
    </form>
  );
}
