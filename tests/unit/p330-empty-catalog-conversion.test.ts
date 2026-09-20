import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {normalizeLeadNeed, normalizeLeadVolume} from '@/features/leads/intake';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.30 empty catalog conversion', () => {
  it('maps Finder context into CRM-safe lead values', () => {
    expect(normalizeLeadNeed('business')).toBe('sme');
    expect(normalizeLeadNeed('shop_online')).toBe('shop_online');
    expect(normalizeLeadNeed('unexpected')).toBe('other');

    expect(normalizeLeadVolume('under_20')).toBe('under_20_boxes');
    expect(normalizeLeadVolume('20_50')).toBe('boxes_20_50');
    expect(normalizeLeadVolume('over_50')).toBe('over_50_boxes');
    expect(normalizeLeadVolume('unexpected')).toBe('unknown');
  });

  it('captures optional intake fields and keeps finder handoff on quote/viewing pages', () => {
    const fields = source('components/forms/lead-form-fields.tsx');
    const form = source('components/forms/lead-form.tsx');
    const contact = source('app/[locale]/lien-he/page.tsx');
    const booking = source('app/[locale]/dat-kho/page.tsx');
    const compare = source('components/units/unit-compare.tsx');
    const emptyCatalog = source('components/marketing/empty-catalog-conversion.tsx');
    const unitsPage = source('app/[locale]/kho-mini/page.tsx');
    const pricingPage = source('app/[locale]/bang-gia/page.tsx');

    expect(fields).toContain('name="needType"');
    expect(fields).toContain('name="estimatedVolume"');
    expect(form).toContain("form.get('needType')");
    expect(form).toContain("form.get('estimatedVolume')");
    expect(contact).toContain('normalizeLeadNeed(query.need)');
    expect(booking).toContain('normalizeLeadVolume(query.volume)');
    expect(compare).toContain('TƯ VẤN TRƯỚC, CHỌN SAU');
    expect(compare).toContain('unit-compare-empty');
    expect(emptyCatalog).toContain('Không hiển thị dữ liệu giả');
    expect(emptyCatalog).toContain('intent="quote"');
    expect(emptyCatalog).toContain('intent="viewing"');
    expect(unitsPage).toContain('context="units"');
    expect(pricingPage).toContain('context="pricing"');
  });
});
