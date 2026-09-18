import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('public shell accessibility', () => {
  it('provides a keyboard bypass link to a focusable main-content target', () => {
    const layout = source('app/[locale]/layout.tsx');

    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('id="main-content"');
    expect(layout).toContain('tabIndex={-1}');
    expect(layout).toContain('Skip to main content');
  });

  it('gives public navigation controls explicit focus-visible treatment', () => {
    const combined = [
      source('components/marketing/locale-switcher.tsx'),
      source('components/marketing/site-header.tsx'),
      source('components/marketing/site-footer.tsx'),
      source('components/marketing/mobile-action-bar.tsx')
    ].join('\n');

    expect(combined).toContain('focus-visible:ring-2');
    expect(combined).toContain('focus-visible:outline-none');
  });
});
