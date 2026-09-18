import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {PageIntro} from '@/components/ui/page-intro';
import {buttonClassName} from '@/components/ui/button';

describe('public UI primitives', () => {
  it('renders a semantic section heading with optional description', () => {
    render(
      <Section>
        <SectionHeading eyebrow="MINI STORAGE" title="Find your fit" description="Two quick questions." />
      </Section>
    );

    expect(screen.getByRole('heading', {level: 2, name: 'Find your fit'})).toBeInTheDocument();
    expect(screen.getByText('Two quick questions.')).toBeInTheDocument();
  });

  it('supports dark section heading contrast', () => {
    render(<SectionHeading tone="dark" eyebrow="TRUST" title="Clear before you rent" description="No invented claims." />);
    expect(screen.getByRole('heading', {name: 'Clear before you rent'})).toHaveClass('text-white');
    expect(screen.getByText('No invented claims.')).toHaveClass('text-white/70');
  });

  it('exposes a dark button variant with a practical touch target', () => {
    const classes = buttonClassName({variant: 'dark', size: 'lg'});
    expect(classes).toContain('min-h-12');
    expect(classes).toContain('bg-[var(--nupsbox-navy)]');
  });

  it('uses the refined compact section density', () => {
    const {container} = render(<Section size="compact"><p>Compact</p></Section>);
    expect(container.firstElementChild).toHaveClass('py-12');
  });

  it('renders a reusable page intro with one semantic h1', () => {
    render(
      <PageIntro
        eyebrow="PRICING"
        title="Mini storage pricing"
        description="Clear choices before you enquire."
      >
        <a href="#next">Next</a>
      </PageIntro>
    );

    expect(screen.getByRole('heading', {level: 1, name: 'Mini storage pricing'})).toBeInTheDocument();
    expect(screen.getByText('Clear choices before you enquire.')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Next'})).toBeInTheDocument();
  });

  it('uses a lighter hierarchy for secondary section headings', () => {
    render(<SectionHeading eyebrow="LOCATION" title="See the space" description="Before you decide." />);
    expect(screen.getByRole('heading', {level: 2, name: 'See the space'})).toHaveClass('font-extrabold');
  });
});
