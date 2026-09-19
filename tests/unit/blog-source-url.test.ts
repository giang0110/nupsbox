import {describe, expect, it} from 'vitest';
import {BlogInputSchema} from '@/features/admin/content-schemas';
import {prepareBlogCreate} from '@/features/admin/blog';

const base = {
  slug: 'gioi-thieu-nupsbox',
  titleVi: 'Giới thiệu NupsBox',
  titleEn: 'Introducing NupsBox',
  excerptVi: '',
  excerptEn: '',
  bodyVi: {type: 'doc'},
  bodyEn: {type: 'doc'},
  seoTitleVi: '',
  seoTitleEn: '',
  seoDescriptionVi: '',
  seoDescriptionEn: '',
  coverMediaId: null
};

describe('blog source links', () => {
  it('accepts HTTPS source links and persists them on the post contract', () => {
    const input = {...base, sourceUrl: 'https://www.facebook.com/example'};
    expect(BlogInputSchema.parse(input).sourceUrl).toBe('https://www.facebook.com/example');
    expect(prepareBlogCreate('staff', input).post.source_url).toBe('https://www.facebook.com/example');
  });

  it('normalizes blank links and rejects non-http schemes', () => {
    expect(BlogInputSchema.parse({...base, sourceUrl: ''}).sourceUrl).toBeNull();
    expect(() => BlogInputSchema.parse({...base, sourceUrl: 'javascript:alert(1)'})).toThrow();
  });
});
