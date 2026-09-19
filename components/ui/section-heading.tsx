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
          'text-[0.68rem] font-black uppercase tracking-[0.15em]',
          dark ? 'text-[var(--nupsbox-yellow)]' : 'text-[var(--nupsbox-blue)]'
        )}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={clsx(
        'mt-3 max-w-3xl text-[clamp(1.9rem,3.7vw,3.2rem)] font-black leading-[1.02] tracking-[-0.045em] text-balance',
        dark ? 'text-white' : 'text-[var(--nupsbox-navy)]'
      )}>
        {title}
      </h2>
      {description ? (
        <p className={clsx(
          'mt-4 max-w-2xl text-[0.98rem] leading-7 sm:text-[1.05rem]',
          dark ? 'text-white/70' : 'text-[var(--nupsbox-slate)]'
        )}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
