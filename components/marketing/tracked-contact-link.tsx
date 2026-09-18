'use client';

import {MessageCircle, Phone} from 'lucide-react';
import {trackEvent} from '@/features/analytics/events';

export function TrackedContactLink({
  href,
  label,
  kind,
  placement,
  className,
  showIcon = true
}: {
  href: string;
  label: string;
  kind: 'phone' | 'zalo';
  placement: string;
  className?: string;
  showIcon?: boolean;
}) {
  const Icon = kind === 'phone' ? Phone : MessageCircle;

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      onClick={() => trackEvent(kind === 'phone' ? 'click_phone' : 'click_zalo', {placement})}
      className={className}
    >
      {showIcon ? <Icon aria-hidden="true" size={17} /> : null}
      {label}
    </a>
  );
}
