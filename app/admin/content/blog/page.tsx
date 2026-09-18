import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {
  AdminEmptyState,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {BlogForm} from '@/components/admin/blog-form';
import {Container} from '@/components/ui/container';
import {listAdminBlogs} from '@/features/admin/blog';
import {listAdminMedia} from '@/features/admin/media';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

function blogStatusLabel(status: 'draft' | 'published' | 'archived') {
  if (status === 'published') return 'Đã xuất bản';
  if (status === 'archived') return 'Đã lưu trữ';
  return 'Bản nháp';
}

export default async function AdminBlogPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const [blogs, media] = await Promise.all([listAdminBlogs(), listAdminMedia()]);
  const canCreate = can(session.role, 'content:create');
  const mediaOptions = media.map((item) => ({id: item.id, label: item.storagePath}));

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="BLOG CMS"
          title="Blog song ngữ"
          description="Bài mới luôn là draft. Chỉnh nội dung và thay đổi trạng thái là hai thao tác tách biệt; slug bị khóa sau lần xuất bản đầu tiên."
        />

        {canCreate ? (
          <BlogForm
            canCreate
            canUpdate={false}
            canPublish={false}
            mediaOptions={mediaOptions}
          />
        ) : null}

        <AdminPanel title="Bài viết">
          {blogs.length ? (
            <div className="divide-y divide-[var(--nupsbox-border)]">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={'/admin/content/blog/' + blog.id}
                  className="grid min-h-16 gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-black text-[var(--nupsbox-navy)]">
                      {blog.vi.title || blog.en.title || blog.slug}
                    </p>
                    <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">
                      /{blog.slug} · {blog.en.title || 'Thiếu title EN'}
                    </p>
                  </div>
                  <AdminStatusBadge
                    label={blogStatusLabel(blog.status)}
                    tone={blog.status === 'published' ? 'success' : 'neutral'}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="Chưa có bài blog"
              description="Chưa có bài blog nào trong cơ sở dữ liệu."
            />
          )}
        </AdminPanel>
      </Container>
    </main>
  );
}
