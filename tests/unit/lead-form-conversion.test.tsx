import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {
  trackEvent,
  captureUtm,
  persistAttribution,
  readPersistedAttribution
} = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  captureUtm: vi.fn(() => ({})),
  persistAttribution: vi.fn(),
  readPersistedAttribution: vi.fn(() => ({}))
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams()
}));

vi.mock('@/features/analytics/events', () => ({trackEvent}));
vi.mock('@/features/leads/utm', () => ({
  captureUtm,
  persistAttribution,
  readPersistedAttribution
}));

import {LeadForm} from '@/components/forms/lead-form';

describe('lead form conversion measurement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, status: 201}));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('tracks a successful lead without adding analytics fields to the API payload', async () => {
    render(
      <LeadForm
        locale="vi"
        locationId="loc-1"
        unitTypeId="unit-1"
        needType="sme"
        estimatedVolume="unknown"
      />
    );

    fireEvent.change(screen.getByLabelText('Tên'), {target: {value: 'Nguyen Van A'}});
    fireEvent.change(screen.getByLabelText('Số điện thoại'), {target: {value: '0900000000'}});
    fireEvent.submit(screen.getByRole('button', {name: 'Gửi yêu cầu tư vấn'}).closest('form')!);

    const status = await screen.findByRole('status');
    await waitFor(() => expect(status).toHaveFocus());

    expect(trackEvent).toHaveBeenCalledWith('lead_submit', {
      outcome: 'success',
      locale: 'vi',
      mode: 'quote',
      appointmentRequested: false,
      hasLocation: true,
      hasUnit: true,
      needType: 'sme',
      estimatedVolume: 'unknown'
    });

    const fetchMock = vi.mocked(fetch);
    const request = fetchMock.mock.calls[0][1];
    const body = JSON.parse(String(request?.body));

    expect(body).toMatchObject({
      fullName: 'Nguyen Van A',
      phone: '0900000000',
      locationId: 'loc-1',
      unitTypeId: 'unit-1',
      needType: 'sme',
      estimatedVolume: 'unknown'
    });
    expect(body).not.toHaveProperty('outcome');
    expect(body).not.toHaveProperty('appointmentRequested');
    expect(body).not.toHaveProperty('hasLocation');
    expect(body).not.toHaveProperty('hasUnit');
  });

  it('focuses rate-limit feedback and records only non-sensitive funnel context', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: false, status: 429}));

    render(<LeadForm locale="en" />);

    fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Example User'}});
    fireEvent.change(screen.getByLabelText('Phone'), {target: {value: '0900000000'}});
    fireEvent.submit(screen.getByRole('button', {name: 'Request advice'}).closest('form')!);

    const alert = await screen.findByRole('alert');
    await waitFor(() => expect(alert).toHaveFocus());

    expect(trackEvent).toHaveBeenCalledWith('lead_submit', expect.objectContaining({
      outcome: 'rate_limited',
      locale: 'en',
      mode: 'quote',
      hasLocation: false,
      hasUnit: false
    }));

    const analyticsPayload = trackEvent.mock.calls[0][1];
    expect(analyticsPayload).not.toHaveProperty('fullName');
    expect(analyticsPayload).not.toHaveProperty('phone');
    expect(analyticsPayload).not.toHaveProperty('email');
    expect(analyticsPayload).not.toHaveProperty('message');
  });
});
