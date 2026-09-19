import {describe, expect, it} from 'vitest';
import {buildAdminContentCalendar} from '@/features/admin/content-calendar';
import type {AdminBlog} from '@/features/admin/blog';

function blog(
  id: string,
  status: AdminBlog['status'],
  publishedAt: string | null,
  updatedAt = '2026-09-19T03:00:00.000Z'
): AdminBlog {
  return {
    id,
    slug: 'post-' + id,
    status,
    publishedAt,
    coverMediaId: null,
    sourceUrl: null,
    authorId: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt,
    vi: {
      locale: 'vi',
      title: 'Bài ' + id,
      excerpt: null,
      body: {type: 'doc'},
      seoTitle: null,
      seoDescription: null
    },
    en: {
      locale: 'en',
      title: 'Post ' + id,
      excerpt: null,
      body: {type: 'doc'},
      seoTitle: null,
      seoDescription: null
    }
  };
}

describe('admin content calendar', () => {
  const now = new Date('2026-09-19T05:00:00.000Z');

  it('separates scheduled, draft and recently published content', () => {
    const calendar = buildAdminContentCalendar([
      blog('scheduled-soon', 'published', '2026-09-20T02:00:00.000Z'),
      blog('scheduled-later', 'published', '2026-10-05T02:00:00.000Z'),
      blog('published', 'published', '2026-09-18T02:00:00.000Z'),
      blog('draft', 'draft', null),
      blog('archived', 'archived', '2026-08-01T02:00:00.000Z')
    ], now);

    expect(calendar.scheduled.map(item => item.id)).toEqual(['scheduled-soon', 'scheduled-later']);
    expect(calendar.next7Days.map(item => item.id)).toEqual(['scheduled-soon']);
    expect(calendar.drafts.map(item => item.id)).toEqual(['draft']);
    expect(calendar.recentPublished.map(item => item.id)).toEqual(['published']);
    expect(calendar.archived).toBe(1);
  });
});
