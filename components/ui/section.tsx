import type {ReactNode} from 'react';
import clsx from 'clsx';
import {Container} from './container';

export function Section({
  tone = 'white',
  size = 'default',
  className,
  children
}: {
  tone?: 'white' | 'soft' | 'navy';
  size?: 'compact' | 'default';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={clsx(
        size === 'compact' ? 'py-12 sm:py-14 lg:py-16' : 'py-14 sm:py-16 lg:py-18',
        tone === 'white' && 'bg-white text-[var(--nupsbox-ink)]',
        tone === 'soft' && 'bg-[var(--nupsbox-surface)] text-[var(--nupsbox-ink)]',
        tone === 'navy' && 'bg-[var(--nupsbox-navy)] text-white',
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
