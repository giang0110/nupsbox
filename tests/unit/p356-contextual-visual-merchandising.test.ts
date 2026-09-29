import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.56 contextual visual merchandising', () => {
  it('uses the existing editorial mapping schema without a migration', () => {
    const spec = source('docs/superpowers/specs/2026-09-30-p356-contextual-visual-merchandising.md');
    const reader = source('features/content/editorial-media.ts');

    expect(spec).toContain('No new database columns or migration');
    expect(reader).toContain('getPublicEditorialMediaForContexts');
    expect(reader).toContain(".in('context_key', keys)");
  });

  it('resolves direct blog media before topic fallback', () => {
    const visuals = source('features/content/blog-visuals.ts');

    expect(visuals).toContain("getPublicEditorialMediaForContexts('blog'");
    expect(visuals).toContain("getPublicEditorialMediaForContexts('topic'");
    expect(visuals).toContain('const selected = direct ?? fallback');
    expect(visuals).toContain("source: direct ? 'blog' : 'topic'");
  });

  it('uses contextual media on the blog hub and library before generated covers', () => {
    const hub = source('app/[locale]/blog/page.tsx');
    const library = source('components/marketing/blog-library.tsx');

    expect(hub).toContain('getBlogVisualMap');
    expect(hub).toContain('featuredVisual');
    expect(hub).toContain('ẢNH CƠ SỞ NUPSBOX');
    expect(hub).toContain('visuals={visuals}');

    expect(library).toContain('const displayUrl = post.coverUrl ?? mappedVisual?.url ?? null');
    expect(library).toContain('<EditorialCover');
    expect(library).toContain('Ảnh cơ sở NupsBox');
  });

  it('adds a compact insight visual without adding another homepage section', () => {
    const home = source('app/[locale]/page.tsx');
    const insights = source('components/marketing/home-insights.tsx');
    const compact = source('tests/unit/compact-homepage-structure.test.ts');

    expect(home).toContain('getBlogVisualMap');
    expect(home).toContain('visuals={insightVisuals}');
    expect(insights).toContain('featuredVisual');
    expect(insights).toContain('sm:grid-cols-[minmax(0,1fr)_170px]');
    expect(compact).toContain("expect(source).toContain('<HomeInsights')");
  });
});
