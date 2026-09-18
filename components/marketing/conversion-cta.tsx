'use client';

import type {ReactNode} from 'react';
import {buttonClassName} from '@/components/ui/button';
import {trackEvent} from '@/features/analytics/events';
import {
  buildConversionHref,
  type ConversionContext,
  type ConversionIntent
} from '@/features/marketing/conversion';

export function ConversionCta({
  locale,
  intent,
  context,
  placement,
  children,
  variant = 'primary',
  size = 'lg',
  className
}: {
  locale: 'vi' | 'en';
  intent: ConversionIntent;
  context?: ConversionContext;
  placement: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'md' | 'lg';
  className?: string;
}) {
  const href = buildConversionHref(locale, intent, context);

  function handleClick() {
    const event = intent === 'finder'
      ? 'public_primary_cta_click'
      : intent === 'quote'
        ? 'quote_flow_start'
        : 'viewing_flow_start';

    trackEvent(event, {
      placement,
      locale,
      unitId: context?.unitId,
      locationId: context?.locationId
    });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={buttonClassName({variant, size, className})}
    >
      {children}
    </a>
  );
}
