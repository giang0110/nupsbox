import type {AdminBlog} from '@/features/admin/blog';
import {getBlogPublicationState} from '@/features/admin/blog';

export type AdminContentCalendar = {
  scheduled: AdminBlog[];
  next7Days: AdminBlog[];
  drafts: AdminBlog[];
  recentPublished: AdminBlog[];
  archived: number;
};

export function buildAdminContentCalendar(
  blogs: AdminBlog[],
  now = new Date()
): AdminContentCalendar {
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const scheduled = blogs
    .filter(blog => getBlogPublicationState(blog, now) === 'scheduled')
    .sort((a, b) => Date.parse(a.publishedAt ?? '') - Date.parse(b.publishedAt ?? ''));

  const next7Days = scheduled.filter(blog => {
    const value = Date.parse(blog.publishedAt ?? '');
    return Number.isFinite(value) && value <= sevenDaysFromNow.getTime();
  });

  const drafts = blogs
    .filter(blog => getBlogPublicationState(blog, now) === 'draft')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const recentPublished = blogs
    .filter(blog => {
      if (getBlogPublicationState(blog, now) !== 'published' || !blog.publishedAt) return false;
      const value = Date.parse(blog.publishedAt);
      return Number.isFinite(value) && value >= thirtyDaysAgo.getTime();
    })
    .sort((a, b) => Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? ''));

  return {
    scheduled,
    next7Days,
    drafts,
    recentPublished,
    archived: blogs.filter(blog => getBlogPublicationState(blog, now) === 'archived').length
  };
}
