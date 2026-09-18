import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

const {trackEvent} = vi.hoisted(() => ({
  trackEvent: vi.fn()
}));

vi.mock('@/features/analytics/events', () => ({trackEvent}));

import {TrackedContactLink} from '@/components/marketing/tracked-contact-link';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('tracked contact links', () => {
  it('tracks phone clicks without sending the phone number in analytics payload', () => {
    render(
      <TrackedContactLink
        href="tel:0900000000"
        label="0900000000"
        kind="phone"
        placement="footer"
      />
    );

    fireEvent.click(screen.getByRole('link', {name: '0900000000'}));

    expect(trackEvent).toHaveBeenCalledWith('click_phone', {placement: 'footer'});
  });

  it('tracks Zalo clicks by placement and keeps external-link safety', () => {
    render(
      <TrackedContactLink
        href="https://zalo.me/example"
        label="Zalo"
        kind="zalo"
        placement="mobile-action-bar"
      />
    );

    const link = screen.getByRole('link', {name: 'Zalo'});
    fireEvent.click(link);

    expect(trackEvent).toHaveBeenCalledWith('click_zalo', {placement: 'mobile-action-bar'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});
