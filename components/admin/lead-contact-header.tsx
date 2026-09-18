import Link from 'next/link';
import clsx from 'clsx';

const crmDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'medium',
  timeStyle: 'short'
});

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : crmDateTime.format(parsed);
}

export function LeadContactHeader({
  fullName,
  createdAt,
  preferredLanguage,
  phone,
  email,
  className
}: {
  fullName: string;
  createdAt: string;
  preferredLanguage: 'vi' | 'en';
  phone: string;
  email: string | null;
  className?: string;
}) {
  return (
    <header className={clsx('min-w-0', className)}>
      <Link
        href="/admin/leads"
        className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--nupsbox-blue)]"
      >
        ← Danh sách lead
      </Link>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
        CRM · LEAD DETAIL
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)] sm:text-4xl">
        {fullName}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--nupsbox-slate)]">
        Tiếp nhận {formatDateTime(createdAt)} · Ngôn ngữ {preferredLanguage.toUpperCase()}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={'tel:' + phone}
          className="inline-flex min-h-11 items-center rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-bold text-white"
        >
          Gọi {phone}
        </a>
        {email ? (
          <a
            href={'mailto:' + email}
            className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
          >
            {email}
          </a>
        ) : null}
      </div>
    </header>
  );
}
