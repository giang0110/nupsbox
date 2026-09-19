import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.16 premium brand experience', () => {
  it('uses an editorial hero with one dominant CTA and a text secondary action', () => {
    const hero = source('components/marketing/hero.tsx');
    expect(hero).toContain('Không gian vừa đủ. Vận hành nhẹ hơn.');
    expect(hero).toContain('Xem hình ảnh thực tế →');
    expect(hero).toContain('home-hero-trust');
    expect(hero).not.toContain('buttonClassName');
    expect(hero).not.toContain('BadgeCheck');
    expect(hero).not.toContain('Sparkles');
  });

  it('replaces card-heavy proof UI with a restrained trust story', () => {
    const proof = source('components/marketing/home-proof-bento.tsx');
    expect(proof).toContain('Ít lời hứa. Nhiều thông tin hữu ích hơn.');
    expect(proof).toContain('divide-y');
    expect(proof).not.toContain('comparisonRows');
    expect(proof).not.toContain('ChevronDown');
  });

  it('keeps the location journey simple and conversion-ready', () => {
    const journey = source('components/marketing/home-location-journey.tsx');
    expect(journey).toContain('ĐỊA ĐIỂM & TRẢI NGHIỆM THUÊ');
    expect(journey).toContain('home-location-journey');
    expect(journey).toContain('03');
    expect(journey).not.toContain('LocationCard');
  });

  it('uses customer-facing gallery language and premium final CTA', () => {
    const gallery = source('components/marketing/warehouse-gallery.tsx');
    const finalCta = source('components/marketing/final-cta.tsx');
    expect(gallery).toContain('Xem các góc kho thực tế');
    expect(gallery).not.toContain('Ảnh được lấy từ Media CMS');
    expect(finalCta).toContain('Chọn đúng không gian trước khi trả tiền');
    expect(finalCta).toContain('bg-[var(--nupsbox-navy)]');
  });
});
