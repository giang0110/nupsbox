import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {FaqForm} from '@/components/admin/faq-form';
import {BlogForm} from '@/components/admin/blog-form';
import type {AdminFaq} from '@/features/admin/faqs';
import type {AdminBlog} from '@/features/admin/blog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

vi.mock('@/app/admin/content/faq/actions', () => ({
  createFaq: vi.fn(),
  updateFaq: vi.fn(),
  setFaqPublication: vi.fn()
}));

vi.mock('@/app/admin/content/blog/actions', () => ({
  cancelScheduledBlogPublication: vi.fn(),
  createBlogPost: vi.fn(),
  scheduleBlogPublication: vi.fn(),
  updateBlogPost: vi.fn(),
  setBlogStatus: vi.fn()
}));

const faq: AdminFaq = {
  id: '10000000-0000-4000-8000-000000000001',
  questionVi: 'NupsBox có an toàn không?',
  answerVi: 'Có kiểm soát an ninh.',
  questionEn: 'Is NupsBox secure?',
  answerEn: 'Security controls are in place.',
  active: true,
  sortOrder: 1,
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T03:00:00.000Z'
};

const blog: AdminBlog = {
  id: '20000000-0000-4000-8000-000000000001',
  slug: 'huong-dan-kho-mini',
  status: 'published',
  publishedAt: '2026-09-15T03:00:00.000Z',
  coverMediaId: null,
  sourceUrl: null,
  authorId: null,
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T03:00:00.000Z',
  vi: {
    locale: 'vi',
    title: 'Hướng dẫn kho mini',
    excerpt: null,
    body: {type: 'doc'},
    seoTitle: null,
    seoDescription: null
  },
  en: {
    locale: 'en',
    title: 'Mini storage guide',
    excerpt: null,
    body: {type: 'doc'},
    seoTitle: null,
    seoDescription: null
  }
};

describe('admin content visual contracts', () => {
  it('shows readable publication state instead of raw uppercase status tokens', () => {
    render(
      <>
        <FaqForm faq={faq} canEdit canPublish />
        <BlogForm
          blog={blog}
          canCreate={false}
          canUpdate
          canPublish
          mediaOptions={[]}
        />
      </>
    );

    expect(screen.getByText('Đang hiển thị')).toBeInTheDocument();
    expect(screen.getByText('Đã xuất bản')).toBeInTheDocument();
    expect(screen.queryByText('PUBLISHED')).not.toBeInTheDocument();
  });
});
