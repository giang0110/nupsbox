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
    <Section tone={dark ? 'navy' : 'soft'} size="compact">
      <div className="max-w-3xl py-1 sm:py-2">
        {eyebrow ? (
          <p className={clsx(
            'text-xs font-extrabold uppercase tracking-[0.14em]',
            dark ? 'text-[var(--nupsbox-yellow)]' : 'text-[var(--nupsbox-blue)]'
          )}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={clsx(
          'mt-3 text-[clamp(2.55rem,5vw,4.35rem)] font-extrabold leading-[1.02] tracking-[-0.045em]',
          dark ? 'text-white' : 'text-[var(--nupsbox-navy)]'
        )}>
          {title}
        </h1>
        {description ? (
          <p className={clsx(
            'mt-4 max-w-2xl text-base leading-7 sm:text-lg',
            dark ? 'text-white/70' : 'text-[var(--nupsbox-slate)]'
          )}>
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </Section>
  );
}
