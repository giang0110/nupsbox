'use client';

import {ExternalLink, MessageCircle, Phone} from 'lucide-react';
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
  kind: 'phone' | 'zalo' | 'facebook';
  placement: string;
  className?: string;
  showIcon?: boolean;
}) {
  const Icon = kind === 'phone' ? Phone : kind === 'zalo' ? MessageCircle : ExternalLink;
  const event = kind === 'phone' ? 'click_phone' : kind === 'zalo' ? 'click_zalo' : 'click_facebook';

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      onClick={() => trackEvent(event, {placement})}
      className={className}
    >
      {showIcon ? <Icon aria-hidden="true" size={17} /> : null}
      {label}
    </a>
  );
}
