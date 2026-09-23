'use client';

import {ClientErrorReporter} from '@/components/ops/client-error-reporter';
export default function PublicError({
  error,
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  const en = typeof document !== 'undefined' && document.documentElement.lang === 'en';

  return (
    <main className="bg-[var(--nupsbox-surface)] px-4 py-16 sm:px-6 sm:py-24">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[var(--nupsbox-border)] bg-white p-6 text-center shadow-[var(--nupsbox-shadow-sm)] sm:p-8">
        <ClientErrorReporter scope="public" digest={error.digest} />
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
          {en ? 'TEMPORARY ISSUE' : 'SỰ CỐ TẠM THỜI'}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[var(--nupsbox-navy)]">
          {en ? 'This page could not be loaded.' : 'Trang này chưa tải được.'}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)] sm:text-base">
          {en
            ? 'You can retry now. If the issue continues, return to the homepage or contact NupsBox.'
            : 'Bạn có thể thử tải lại ngay. Nếu vẫn gặp lỗi, hãy về trang chủ hoặc liên hệ NupsBox.'}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--nupsbox-yellow)] px-5 text-sm font-bold text-[var(--nupsbox-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {en ? 'Try again' : 'Thử lại'}
          </button>
          <a
            href={en ? '/en' : '/'}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--nupsbox-border)] px-5 text-sm font-bold text-[var(--nupsbox-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {en ? 'Back to homepage' : 'Về trang chủ'}
          </a>
          <a
            href={en ? '/en/contact' : '/lien-he'}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold text-[var(--nupsbox-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            {en ? 'Contact NupsBox' : 'Liên hệ NupsBox'}
          </a>
        </div>
      </section>
    </main>
  );
}
