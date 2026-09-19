import type {ReactNode} from 'react';
import clsx from 'clsx';
import {Section} from './section';

export function PageIntro({
  eyebrow,
  title,
  description,
  tone = 'light',
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: 'light' | 'navy';
  children?: ReactNode;
}) {
  const dark = tone === 'navy';

  return (
    <Section
      tone={dark ? 'navy' : 'soft'}
      size="compact"
      className={clsx(
        'relative isolate overflow-hidden border-b',
        dark ? 'border-white/8' : 'border-[var(--nupsbox-border)]'
      )}
    >
      <div
        aria-hidden="true"
        className={clsx(
          'pointer-events-none absolute inset-0 -z-10',
          dark
            ? 'bg-[radial-gradient(circle_at_82%_18%,rgba(255,211,26,.12),transparent_28%),radial-gradient(circle_at_12%_84%,rgba(8,70,168,.22),transparent_30%)]'
            : 'bg-[radial-gradient(circle_at_86%_15%,rgba(8,70,168,.08),transparent_26%),radial-gradient(circle_at_8%_78%,rgba(255,211,26,.10),transparent_24%)]'
        )}
      />
      <div className="max-w-4xl py-2 sm:py-3">
        {eyebrow ? (
          <p className={clsx(
            'inline-flex rounded-full border px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em]',
            dark
              ? 'border-white/12 bg-white/5 text-[var(--nupsbox-yellow)]'
              : 'border-[var(--nupsbox-border)] bg-white/80 text-[var(--nupsbox-blue)]'
          )}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={clsx(
          'mt-4 max-w-4xl text-[clamp(2.45rem,5vw,4.5rem)] font-extrabold leading-[.98] tracking-[-0.052em] text-balance',
          dark ? 'text-white' : 'text-[var(--nupsbox-navy)]'
        )}>
          {title}
        </h1>
        {description ? (
          <p className={clsx(
            'mt-5 max-w-2xl text-[1.02rem] leading-7 sm:text-lg sm:leading-8',
            dark ? 'text-white/68' : 'text-[var(--nupsbox-slate)]'
          )}>
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </Section>
  );
}
