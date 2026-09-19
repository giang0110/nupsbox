import {describe, expect, it} from 'vitest';
import {getAdminNavigation, isAdminRouteActive} from '@/features/admin/navigation';

describe('admin navigation', () => {
  it('groups the approved Admin information architecture', () => {
    const groups = getAdminNavigation('staff');
    expect(groups.map((group) => group.label)).toEqual([
      'Tổng quan',
      'CRM',
      'Vận hành',
      'Catalog',
      'Content'
    ]);
    expect(groups.flatMap((group) => group.items.map((item) => item.href))).toEqual([
      '/admin',
      '/admin/leads',
      '/admin/quality',
      '/admin/seo',
      '/admin/catalog',
      '/admin/catalog/locations',
      '/admin/catalog/unit-types',
      '/admin/catalog/pricing',
      '/admin/content',
      '/admin/content/faq',
      '/admin/content/blog',
      '/admin/content/media',
      '/admin/content/settings'
    ]);
  });

  it('adds Audit Log only for admin while staff keeps the operational QA surface', () => {
    const adminHrefs = getAdminNavigation('admin').flatMap(group => group.items.map(item => item.href));
    const staffHrefs = getAdminNavigation('staff').flatMap(group => group.items.map(item => item.href));

    expect(adminHrefs).toContain('/admin/audit');
    expect(staffHrefs).not.toContain('/admin/audit');
    expect(staffHrefs).toContain('/admin/quality');
    expect(staffHrefs).toContain('/admin/seo');
    expect(adminHrefs).toContain('/admin/seo');
  });

  it('treats section overviews as exact while keeping nested routes active', () => {
    expect(isAdminRouteActive('/admin', '/admin')).toBe(true);
    expect(isAdminRouteActive('/admin/leads', '/admin')).toBe(false);
    expect(isAdminRouteActive('/admin/leads/abc', '/admin/leads')).toBe(true);
    expect(isAdminRouteActive('/admin/content/blog/abc', '/admin/content')).toBe(false);
    expect(isAdminRouteActive('/admin/content/blog/abc', '/admin/content/blog')).toBe(true);
  });
});
