import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.15 UI/UX refinement', () => {
  it('renders media as a responsive visual library', () => {
    const page = source('app/admin/content/media/page.tsx');
    const card = source('components/admin/media-metadata-form.tsx');
    expect(page).toContain('md:grid-cols-2 2xl:grid-cols-3');
    expect(card).toContain('aspect-[4/3]');
    expect(card).toContain('Chỉnh metadata');
    expect(card).toContain('<details');
    expect(card).toContain('<MediaDeleteForm');
  });

  it('keeps upload and bulk media tools collapsed until needed', () => {
    expect(source('components/admin/media-upload-form.tsx')).toContain('<details');
    expect(source('components/admin/media-bulk-manager.tsx')).toContain('<details');
  });

  it('makes homepage FAQs easier to scan without dropping content', () => {
    const faq = source('components/marketing/home-faq.tsx');
    expect(faq).toContain('open={index === 0}');
    expect(faq).toContain('ChevronDown');
    expect(faq).toContain('Xem tất cả câu hỏi');
  });
});
