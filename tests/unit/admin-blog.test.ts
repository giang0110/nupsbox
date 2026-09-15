import {describe, expect, it} from 'vitest';
import {
  prepareBlogCreate,
  prepareBlogStatusChange,
  prepareBlogUpdate
} from '@/features/admin/blog';

const blogId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
const now = '2026-09-15T01:10:00.000Z';

const validBlogInput = {
  slug: 'huong-dan-thue-kho-mini',
  titleVi: 'Hướng dẫn thuê kho mini',
  titleEn: 'Mini storage rental guide',
  excerptVi: 'Các bước cần biết.',
  excerptEn: 'What you need to know.',
  bodyVi: {type: 'doc', text: 'Nội dung tiếng Việt'},
  bodyEn: {type: 'doc', text: 'English content'},
  seoTitleVi: 'Hướng dẫn thuê kho mini',
  seoTitleEn: 'Mini storage rental guide',
  seoDescriptionVi: 'Thông tin thuê kho mini NupsBox.',
  seoDescriptionEn: 'Information about NupsBox mini storage.',
  coverMediaId: null
};

describe('bilingual blog CMS contracts', () => {
  it('forces new posts to start as draft with VI and EN translations', () => {
    const created = prepareBlogCreate('staff', validBlogInput);
    expect(created.post).toEqual({
      slug: validBlogInput.slug,
      status: 'draft',
      cover_media_id: null
    });
    expect(created.translations.map((translation) => translation.locale)).toEqual(['vi', 'en']);
  });

  it('denies ordinary updates for viewer and locks a slug after first publication', () => {
    expect(() =>
      prepareBlogUpdate('viewer', blogId, validBlogInput, {
        slug: validBlogInput.slug,
        publishedAt: null
      })
    ).toThrow('forbidden');

    expect(() =>
      prepareBlogUpdate(
        'staff',
        blogId,
        {...validBlogInput, slug: 'slug-moi'},
        {slug: validBlogInput.slug, publishedAt: now}
      )
    ).toThrow('published_slug_immutable');
  });

  it('requires publish permission and complete bilingual bodies', () => {
    expect(() =>
      prepareBlogStatusChange(
        'viewer',
        blogId,
        'draft',
        'published',
        validBlogInput,
        null,
        now
      )
    ).toThrow('forbidden');

    expect(() =>
      prepareBlogStatusChange(
        'staff',
        blogId,
        'draft',
        'published',
        {...validBlogInput, bodyEn: {}},
        null,
        now
      )
    ).toThrow('blog_not_publishable');
  });

  it('enforces draft to published to archived lifecycle and preserves first publication time', () => {
    expect(
      prepareBlogStatusChange(
        'staff',
        blogId,
        'draft',
        'published',
        validBlogInput,
        null,
        now
      )
    ).toEqual({id: blogId, changes: {status: 'published', published_at: now}});

    expect(
      prepareBlogStatusChange(
        'staff',
        blogId,
        'published',
        'archived',
        validBlogInput,
        now,
        '2026-09-15T02:00:00.000Z'
      )
    ).toEqual({id: blogId, changes: {status: 'archived'}});

    expect(() =>
      prepareBlogStatusChange(
        'staff',
        blogId,
        'archived',
        'published',
        validBlogInput,
        now,
        '2026-09-15T02:00:00.000Z'
      )
    ).toThrow('invalid_blog_transition');
  });
});
