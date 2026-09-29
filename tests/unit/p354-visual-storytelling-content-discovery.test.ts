import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {extractBlogOutline} from '@/features/content/blog-structure';
import {
  getEditorialProfile,
  getEditorialTopicOptions,
  rankRelatedEditorial
} from '@/features/content/editorial-taxonomy';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.54 visual storytelling and content discovery', () => {
  it('classifies the six foundation articles without a database schema change', () => {
    expect(getEditorialProfile('chon-dien-tich-kho-mini').topic).toBe('space-planning');
    expect(getEditorialProfile('sap-xep-kho-shop-online').topic).toBe('ecommerce');
    expect(getEditorialProfile('quan-ly-hang-ton-cham-luan-chuyen').topic).toBe('inventory');
    expect(getEditorialProfile('kho-ca-nhan-chuyen-nha-sua-nha').topic).toBe('personal');
    expect(getEditorialTopicOptions('vi').length).toBe(5);
  });

  it('ranks same-topic related reading first', () => {
    const ranked = rankRelatedEditorial([
      {slug: 'kho-ca-nhan-chuyen-nha-sua-nha'},
      {slug: 'sap-xep-kho-shop-online'},
      {slug: 'kho-hay-mo-rong-van-phong'}
    ], 'kho-cho-shop-online-tu-nha-ra-kho-rieng');

    expect(ranked[0].slug).toBe('sap-xep-kho-shop-online');
  });

  it('extracts stable article anchors from structured headings', () => {
    const outline = extractBlogOutline({
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: 'Bước một'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Nội dung'}]},
        {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: 'Chi tiết'}]}
      ]
    });

    expect(outline).toEqual([
      {id: 'article-blog-node-0', title: 'Bước một', level: 2},
      {id: 'article-blog-node-2', title: 'Chi tiết', level: 3}
    ]);
  });

  it('ships topic filtering, editorial covers and sticky contents', () => {
    const hub = source('app/[locale]/blog/page.tsx');
    const library = source('components/marketing/blog-library.tsx');
    const article = source('app/[locale]/blog/[slug]/page.tsx');
    const body = source('components/marketing/blog-body.tsx');

    expect(hub).toContain('<BlogLibrary');
    expect(hub).toContain('<EditorialCover');
    expect(library).toContain('aria-pressed={activeTopic');
    expect(article).toContain('<BlogTableOfContents');
    expect(article).toContain('rankRelatedEditorial');
    expect(article).toContain('THE QUESTION THIS ARTICLE SOLVES');
    expect(body).toContain('scroll-mt-24');
  });

  it('keeps P3.54 schema-free and adds blog routes to production smoke', () => {
    const workflow = source('.github/workflows/ci.yml');
    expect(workflow).toContain('"/blog"');
    expect(workflow).toContain('"/en/blog"');
    expect(workflow).toContain('"/blog/chon-dien-tich-kho-mini"');

    const spec = source('docs/superpowers/specs/2026-09-30-p354-visual-storytelling-content-discovery.md');
    expect(spec).toContain('No new database columns or migration');
  });
});
