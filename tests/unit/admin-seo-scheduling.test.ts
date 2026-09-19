import {describe, expect, it} from 'vitest';
import {buildAdminSeoIssues} from '@/features/admin/seo';
import type {AdminBlog} from '@/features/admin/blog';

function blog(publishedAt: string): AdminBlog {
  return {
    id: '20000000-0000-4000-8000-000000000001',
    slug: 'scheduled-post',
    status: 'published',
    publishedAt,
    coverMediaId: null,
    sourceUrl: null,
    authorId: null,
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: '2026-09-19T00:00:00.000Z',
    vi: {locale: 'vi', title: 'Bài hẹn giờ', excerpt: null, body: {type: 'doc'}, seoTitle: null, seoDescription: null},
    en: {locale: 'en', title: 'Scheduled post', excerpt: null, body: {type: 'doc'}, seoTitle: null, seoDescription: null}
  };
}

describe('SEO scheduling readiness', () => {
  it('runs metadata QA for scheduled content before it becomes indexable', () => {
    const issues = buildAdminSeoIssues(
      [blog('2026-09-20T02:00:00.000Z')],
      [],
      new Date('2026-09-19T05:00:00.000Z')
    );

    expect(issues.map(issue => issue.id)).toContain('blog-cover:20000000-0000-4000-8000-000000000001');
    expect(issues.map(issue => issue.id)).toContain('blog-seo-title:20000000-0000-4000-8000-000000000001:vi');
  });
});
