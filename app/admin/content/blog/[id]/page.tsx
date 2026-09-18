import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {BlogForm} from '@/components/admin/blog-form';
import {Container} from '@/components/ui/container';
import {getAdminBlog} from '@/features/admin/blog';
import {listAdminMedia} from '@/features/admin/media';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminBlogDetailPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const {id} = await params;
  const [blog, media] = await Promise.all([getAdminBlog(id), listAdminMedia()]);
  if (!blog) notFound();

  const mediaOptions = media.map((item) => ({id: item.id, label: item.storagePath}));

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="BLOG DETAIL"
          title={blog.vi.title || blog.en.title || blog.slug}
          description={
            blog.publishedAt
              ? 'Bài viết đã từng xuất bản; slug đang được khóa theo contract hiện tại.'
              : 'Bài viết chưa từng xuất bản; nội dung và publication state vẫn là hai thao tác tách biệt.'
          }
          actions={
            <Link
              href="/admin/content/blog"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              ← Blog CMS
            </Link>
          }
        />

        <BlogForm
          blog={blog}
          canCreate={false}
          canUpdate={can(session.role, 'content:update')}
          canPublish={can(session.role, 'content:publish')}
          mediaOptions={mediaOptions}
        />
      </Container>
    </main>
  );
}
