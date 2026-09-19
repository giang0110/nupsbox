import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('lead analytics privacy and admin integration', () => {
  it('queries only non-PII lead fields for analytics breakdowns', () => {
    const analytics = source('features/admin/analytics.ts');
    const selectCall = analytics.match(/\.select\('created_at, status,[^']+'\)/)?.[0] ?? '';

    expect(selectCall).not.toContain('full_name');
    expect(selectCall).not.toContain('phone');
    expect(selectCall).not.toContain('email');
    expect(selectCall).not.toContain('message');
    expect(selectCall).not.toContain('referrer');
  });

  it('exposes analytics in navigation and dashboard without adding a new permission class', () => {
    const navigation = source('features/admin/navigation.ts');
    const dashboard = source('app/admin/page.tsx');

    expect(navigation).toContain("href: '/admin/analytics'");
    expect(navigation).toContain("action: 'leads:read'");
    expect(dashboard).toContain("href: '/admin/analytics'");
    expect(dashboard).toContain('Lead Analytics');
  });

  it('provides 7, 30 and 90 day reporting windows', () => {
    const page = source('app/admin/analytics/page.tsx');
    expect(page).toContain('[7, 30, 90]');
    expect(page).toContain('Không hiển thị tên, số điện thoại, email hoặc nội dung tin nhắn');
  });
});
