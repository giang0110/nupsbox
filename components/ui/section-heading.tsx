import clsx from 'clsx';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'default'
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'default' | 'dark';
}) {
  const dark = tone === 'dark';

  return (
    <div className={clsx('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className={clsx(
          'text-xs font-extrabold uppercase tracking-[0.14em]',
          dark ? 'text-[var(--nupsbox-yellow)]' : 'text-[var(--nupsbox-blue)]'
        )}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={clsx(
        'mt-3 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em]',
        dark ? 'text-white' : 'text-[var(--nupsbox-navy)]'
      )}>
        {title}
      </h2>
      {description ? (
        <p className={clsx(
          'mt-4 text-base leading-7 sm:text-lg',
          dark ? 'text-white/70' : 'text-[var(--nupsbox-slate)]'
        )}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
