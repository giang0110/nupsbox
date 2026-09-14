import {describe, expect, it} from 'vitest';
import {can} from '@/features/auth/permissions';

describe('admin permissions', () => {
  it('allows admin to manage settings', () => {
    expect(can('admin', 'settings:update')).toBe(true);
  });

  it('allows staff to manage leads but not settings', () => {
    expect(can('staff', 'leads:update')).toBe(true);
    expect(can('staff', 'settings:update')).toBe(false);
  });

  it('keeps viewer read only', () => {
    expect(can('viewer', 'leads:update')).toBe(false);
    expect(can('viewer', 'dashboard:read')).toBe(true);
  });
});
