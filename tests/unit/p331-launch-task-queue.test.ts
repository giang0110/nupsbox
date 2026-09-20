import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.31 launch task queue', () => {
  const catalog = source('app/admin/catalog/page.tsx');

  it('derives a prioritized queue from live readiness summaries', () => {
    expect(catalog).toContain('const launchTasks = [');
    expect(catalog).toContain("id: 'location'");
    expect(catalog).toContain("id: 'unit'");
    expect(catalog).toContain("id: 'pricing'");
    expect(catalog).toContain("id: 'media'");
    expect(catalog).toContain('.sort((a, b) =>');
  });

  it('keeps catalog dependencies in launch order', () => {
    const location = catalog.indexOf("id: 'location'");
    const unit = catalog.indexOf("id: 'unit'");
    const pricing = catalog.indexOf("id: 'pricing'");
    const media = catalog.indexOf("id: 'media'");

    expect(location).toBeGreaterThan(-1);
    expect(unit).toBeGreaterThan(location);
    expect(pricing).toBeGreaterThan(unit);
    expect(media).toBeGreaterThan(pricing);
  });

  it('renders direct admin actions and safe public previews', () => {
    expect(catalog).toContain('title="Launch Task Queue"');
    expect(catalog).toContain('{task.cta} →');
    expect(catalog).toContain('Preview bảng giá ↗');
    expect(catalog).toContain('Preview kho mini ↗');
  });

  it('does not create or publish catalog data automatically', () => {
    expect(catalog).not.toContain('autoPublish');
    expect(catalog).not.toContain('seedCatalog');
    expect(catalog).not.toContain('insertSynthetic');
  });
});
