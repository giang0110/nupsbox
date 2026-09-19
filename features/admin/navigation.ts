import {can, type AppAction} from '@/features/auth/permissions';
import type {AppRole} from '@/types/database';

export type AdminNavigationItem = {
  href: string;
  label: string;
  action: AppAction;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

const navigation: AdminNavigationGroup[] = [
  {
    label: 'Tổng quan',
    items: [{href: '/admin', label: 'Dashboard', action: 'dashboard:read'}]
  },
  {
    label: 'CRM',
    items: [{href: '/admin/leads', label: 'Khách hàng', action: 'leads:read'}]
  },
  {
    label: 'Vận hành',
    items: [
      {href: '/admin/quality', label: 'Vận hành & QA', action: 'dashboard:read'},
      {href: '/admin/analytics', label: 'Lead Analytics', action: 'leads:read'},
      {href: '/admin/seo', label: 'SEO & Publish', action: 'content:read'},
      {href: '/admin/audit', label: 'Audit log', action: 'audit:read'}
    ]
  },
  {
    label: 'Catalog',
    items: [
      {href: '/admin/catalog', label: 'Tổng quan catalog', action: 'catalog:read'},
      {href: '/admin/catalog/locations', label: 'Địa điểm', action: 'catalog:read'},
      {href: '/admin/catalog/unit-types', label: 'Loại kho', action: 'catalog:read'},
      {href: '/admin/catalog/pricing', label: 'Bảng giá', action: 'catalog:read'}
    ]
  },
  {
    label: 'Content',
    items: [
      {href: '/admin/content', label: 'Tổng quan nội dung', action: 'content:read'},
      {href: '/admin/content/faq', label: 'FAQ', action: 'content:read'},
      {href: '/admin/content/blog', label: 'Blog', action: 'content:read'},
      {href: '/admin/content/media', label: 'Media', action: 'media:read'},
      {href: '/admin/content/settings', label: 'Settings', action: 'settings:read'}
    ]
  }
];

export function getAdminNavigation(role: AppRole): AdminNavigationGroup[] {
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(role, item.action))
    }))
    .filter((group) => group.items.length > 0);
}

export function isAdminRouteActive(pathname: string, href: string): boolean {
  if (href === '/admin' || href === '/admin/catalog' || href === '/admin/content') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(href + '/');
}
