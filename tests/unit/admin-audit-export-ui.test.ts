import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.8 audit and export UI contracts', () => {
  it('guards Audit Log with the dedicated admin-only permission', () => {
    const page = source('app/admin/audit/page.tsx');
    expect(page).toContain("can(session.role, 'audit:read')");
    expect(page).toContain('Nhật ký thay đổi');
    expect(page).toContain('summarizeAuditMetadata');
  });

  it('guards CSV export and exposes it only from the lead workspace permission check', () => {
    const route = source('app/admin/leads/export/route.ts');
    const page = source('app/admin/leads/page.tsx');

    expect(route).toContain("can(session.role, 'leads:export')");
    expect(route).toContain("'cache-control': 'private, no-store'");
    expect(page).toContain("const canExport = can(session.role, 'leads:export')");
    expect(page).toContain('Xuất CSV theo bộ lọc');
  });
});
