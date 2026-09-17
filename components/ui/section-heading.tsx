import clsx from 'clsx';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left'
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={clsx('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--nupsbox-blue)]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)] sm:text-5xl">{title}</h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-[var(--nupsbox-slate)] sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
