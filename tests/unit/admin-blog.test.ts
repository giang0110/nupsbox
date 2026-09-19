import {describe, expect, it} from 'vitest';
import {
  getBlogPublicationState,
  hcmDateTimeLocalToIso,
  prepareBlogCreate,
  prepareBlogSchedule,
  prepareBlogScheduleCancellation,
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
  coverMediaId: null,
  sourceUrl: null
};

describe('bilingual blog CMS contracts', () => {
  it('forces new posts to start as draft with VI and EN translations', () => {
    const created = prepareBlogCreate('staff', validBlogInput);
    expect(created.post).toEqual({
      slug: validBlogInput.slug,
      status: 'draft',
      cover_media_id: null,
      source_url: null
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

  it('converts datetime-local from Ho Chi Minh City to UTC', () => {
    expect(hcmDateTimeLocalToIso('2026-09-20T09:30')).toBe('2026-09-20T02:30:00.000Z');
    expect(() => hcmDateTimeLocalToIso('2026-02-31T09:30')).toThrow('invalid_schedule_time');
  });

  it('schedules a publish time in the future and allows cancellation before it goes live', () => {
    const scheduledAt = '2026-09-20T02:30:00.000Z';

    expect(
      prepareBlogSchedule(
        'staff',
        blogId,
        'draft',
        validBlogInput,
        scheduledAt,
        '2026-09-19T05:00:00.000Z'
      )
    ).toEqual({
      id: blogId,
      changes: {
        status: 'published',
        published_at: scheduledAt
      }
    });

    expect(
      getBlogPublicationState(
        {status: 'published', publishedAt: scheduledAt},
        new Date('2026-09-19T05:00:00.000Z')
      )
    ).toBe('scheduled');

    expect(
      prepareBlogScheduleCancellation(
        'staff',
        blogId,
        'published',
        scheduledAt,
        '2026-09-19T05:00:00.000Z'
      )
    ).toEqual({
      id: blogId,
      changes: {
        status: 'draft',
        published_at: null
      }
    });
  });

  it('rejects past schedules, incomplete content and cancellation after publication time', () => {
    expect(() =>
      prepareBlogSchedule(
        'staff',
        blogId,
        'draft',
        validBlogInput,
        '2026-09-18T02:30:00.000Z',
        '2026-09-19T05:00:00.000Z'
      )
    ).toThrow('schedule_must_be_future');

    expect(() =>
      prepareBlogSchedule(
        'staff',
        blogId,
        'draft',
        {...validBlogInput, bodyEn: {}},
        '2026-09-20T02:30:00.000Z',
        '2026-09-19T05:00:00.000Z'
      )
    ).toThrow('blog_not_publishable');

    expect(() =>
      prepareBlogScheduleCancellation(
        'staff',
        blogId,
        'published',
        '2026-09-19T04:00:00.000Z',
        '2026-09-19T05:00:00.000Z'
      )
    ).toThrow('blog_not_scheduled');
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
