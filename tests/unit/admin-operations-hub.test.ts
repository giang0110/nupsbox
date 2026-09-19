import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.7 admin operations hub', () => {
  it('keeps dashboard compact while exposing quick actions and QA', () => {
    const dashboard = source('app/admin/page.tsx');
    expect(dashboard).toContain('Tác vụ nhanh');
    expect(dashboard).toContain('QA ưu tiên');
    expect(dashboard).toContain('href="/admin/quality"');
    expect(dashboard).toContain('<details');
    expect(dashboard).toContain('Pipeline CRM · mở để xem 7 trạng thái');
  });

  it('provides a dedicated quality center and bulk media manager', () => {
    const qualityPage = source('app/admin/quality/page.tsx');
    const mediaPage = source('app/admin/content/media/page.tsx');
    expect(qualityPage).toContain('Vận hành & chất lượng dữ liệu');
    expect(qualityPage).toContain('Public & SEO readiness');
    expect(mediaPage).toContain('<MediaBulkManager');
  });
});
