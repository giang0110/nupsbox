import type {ReactNode} from 'react';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {breadcrumbs ? (
          <div className="mb-3 text-sm text-[var(--nupsbox-slate)]">{breadcrumbs}</div>
        ) : null}
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl leading-7 text-[var(--nupsbox-slate)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
