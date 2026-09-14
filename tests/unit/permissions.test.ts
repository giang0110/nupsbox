import {describe, expect, it} from 'vitest';
import {can} from '@/features/auth/permissions';

describe('phase2 permission matrix', () => {
  it('allows admin all Phase 2 management actions', () => {
    expect(can('admin', 'catalog:create')).toBe(true);
    expect(can('admin', 'catalog:publish')).toBe(true);
    expect(can('admin', 'content:create')).toBe(true);
    expect(can('admin', 'content:publish')).toBe(true);
    expect(can('admin', 'media:read')).toBe(true);
    expect(can('admin', 'media:update')).toBe(true);
    expect(can('admin', 'leads:assign')).toBe(true);
    expect(can('admin', 'leads:note')).toBe(true);
    expect(can('admin', 'leads:export')).toBe(true);
    expect(can('admin', 'settings:update')).toBe(true);
  });

  it('allows staff operational work but not sensitive settings or export', () => {
    expect(can('staff', 'catalog:create')).toBe(true);
    expect(can('staff', 'catalog:publish')).toBe(true);
    expect(can('staff', 'content:create')).toBe(true);
    expect(can('staff', 'content:publish')).toBe(true);
    expect(can('staff', 'media:read')).toBe(true);
    expect(can('staff', 'media:update')).toBe(true);
    expect(can('staff', 'leads:update')).toBe(true);
    expect(can('staff', 'leads:assign')).toBe(true);
    expect(can('staff', 'leads:note')).toBe(true);
    expect(can('staff', 'leads:export')).toBe(false);
    expect(can('staff', 'settings:update')).toBe(false);
  });

  it('keeps viewer read only while allowing CRM reads', () => {
    expect(can('viewer', 'dashboard:read')).toBe(true);
    expect(can('viewer', 'catalog:read')).toBe(true);
    expect(can('viewer', 'content:read')).toBe(true);
    expect(can('viewer', 'media:read')).toBe(true);
    expect(can('viewer', 'settings:read')).toBe(true);
    expect(can('viewer', 'leads:read')).toBe(true);
    expect(can('viewer', 'catalog:update')).toBe(false);
    expect(can('viewer', 'leads:update')).toBe(false);
    expect(can('viewer', 'leads:note')).toBe(false);
    expect(can('viewer', 'leads:export')).toBe(false);
  });
});
