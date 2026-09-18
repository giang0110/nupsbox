'use client';

import Link from 'next/link';

export default function AdminError({
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-700">
        KHU VỰC QUẢN TRỊ
      </p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">
        Không tải được nội dung quản trị.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Dữ liệu hoặc kết nối có thể đang gặp sự cố tạm thời. Hãy thử lại trước khi thực hiện thay đổi khác.
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-700 px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Thử lại
        </button>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Về Dashboard
        </Link>
      </div>
    </section>
  );
}
