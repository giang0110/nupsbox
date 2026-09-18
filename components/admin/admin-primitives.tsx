import type {ReactNode} from 'react';
import clsx from 'clsx';

export function AdminPanel({
  title,
  description,
  actions,
  children,
  className
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm',
        className
      )}
    >
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--nupsbox-border)] px-5 py-4">
          <div>
            {title ? (
              <h2 className="text-lg font-black text-[var(--nupsbox-navy)]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  href
}: {
  label: string;
  value: number | string;
  detail?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-sm font-bold text-[var(--nupsbox-slate)]">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">{detail}</p> : null}
    </>
  );

  return href ? (
    <a
      href={href}
      className="block min-h-28 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]"
    >
      {content}
    </a>
  ) : (
    <article className="min-h-28 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}

const statusToneClass = {
  neutral: 'bg-[var(--nupsbox-surface)] text-[var(--nupsbox-navy)]',
  info: 'bg-blue-50 text-blue-800',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-900',
  danger: 'bg-rose-50 text-rose-800'
} as const;

export function AdminStatusBadge({
  label,
  tone = 'neutral'
}: {
  label: string;
  tone?: keyof typeof statusToneClass;
}) {
  return (
    <span
      data-tone={tone}
      className={clsx(
        'inline-flex min-h-7 items-center rounded-full border border-[var(--nupsbox-border)] px-2.5 text-xs font-black',
        statusToneClass[tone]
      )}
    >
      {label}
    </span>
  );
}

export function AdminEmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--nupsbox-border)] p-7 text-center">
      <h3 className="font-black text-[var(--nupsbox-navy)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminFieldGroup({
  legend,
  disabled = false,
  children
}: {
  legend: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset disabled={disabled} className="grid gap-4">
      <legend className="mb-2 text-sm font-black text-[var(--nupsbox-navy)]">{legend}</legend>
      {children}
    </fieldset>
  );
}

export function AdminActionBar({children}: {children: ReactNode}) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
