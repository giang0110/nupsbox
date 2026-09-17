import {Suspense} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {LeadForm} from '@/components/forms/lead-form';
import {Container} from '@/components/ui/container';
import {getPublicSiteSettings} from '@/features/content/site-settings';
import {isSupportedLocale} from '@/i18n/routing';

export const metadata: Metadata = {robots: {index: false, follow: true}};

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  const settings = await getPublicSiteSettings().catch(() => ({
    phone: null,
    zaloUrl: null,
    email: null,
    openingHours: {}
  }));
  const vi = locale === 'vi';

  return (
    <main>
      <section className="py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--nupsbox-blue)]">LIGHT BOOKING</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-[-0.055em] text-[var(--nupsbox-navy)] sm:text-6xl">
              {vi ? 'Đề xuất lịch xem kho' : 'Request a storage viewing'}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--nupsbox-slate)]">
              {vi
                ? 'Gửi nhu cầu thuê kho và, nếu muốn, đề xuất một thời gian xem kho. NupsBox sẽ liên hệ để xác nhận lịch phù hợp.'
                : 'Send your storage requirements and optionally propose a viewing time. NupsBox will contact you to confirm a suitable appointment.'}
            </p>
            <div className="mt-8 rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5 text-sm leading-6 text-[var(--nupsbox-slate)]">
              <p className="font-black text-[var(--nupsbox-navy)]">{vi ? 'Lưu ý' : 'Important'}</p>
              <p className="mt-2">
                {vi
                  ? 'Đây là yêu cầu đặt lịch xem kho, không phải đặt cọc, thanh toán hay giữ chỗ kho theo thời gian thực.'
                  : 'This is a viewing request, not a deposit, payment, or real-time storage reservation.'}
              </p>
            </div>
          </div>

          <Suspense fallback={<div className="min-h-[38rem] rounded-[2rem] bg-[var(--nupsbox-surface)]" aria-hidden="true" />}>
            <LeadForm
              locale={locale}
              fallbackPhone={settings.phone}
              fallbackZalo={settings.zaloUrl}
              appointmentMode
            />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
