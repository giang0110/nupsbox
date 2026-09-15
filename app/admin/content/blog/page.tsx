import Link from 'next/link';
import {redirect} from 'next/navigation';
import {BlogForm} from '@/components/admin/blog-form';
import {Container} from '@/components/ui/container';
import {listAdminBlogs} from '@/features/admin/blog';
import {listAdminMedia} from '@/features/admin/media';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminBlogPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const [blogs, media] = await Promise.all([listAdminBlogs(), listAdminMedia()]);
  const canCreate = can(session.role, 'content:create');
  const mediaOptions = media.map((item) => ({id: item.id, label: item.storagePath}));

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">BLOG CMS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Blog song ngữ</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            Bài mới luôn là draft. Chỉnh nội dung và thay đổi trạng thái là hai thao tác tách biệt; slug bị khóa sau lần xuất bản đầu tiên.
          </p>
        </div>

        {canCreate ? (
          <div className="mt-10">
            <BlogForm
              canCreate
              canUpdate={false}
              canPublish={false}
              mediaOptions={mediaOptions}
            />
          </div>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--nupsbox-border)] px-6 py-5">
            <h2 className="text-xl font-black text-[var(--nupsbox-navy)]">Bài viết</h2>
          </div>
          <div className="divide-y divide-[var(--nupsbox-border)]">
            {blogs.length ? blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/admin/content/blog/${blog.id}`}
                className="grid gap-2 px-6 py-5 transition hover:bg-[var(--nupsbox-surface)] md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-black text-[var(--nupsbox-navy)]">{blog.vi.title || blog.en.title || blog.slug}</p>
                  <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">/{blog.slug} · {blog.en.title || 'Thiếu title EN'}</p>
                </div>
                <span className="h-fit rounded-full bg-[var(--nupsbox-surface)] px-3 py-1 text-xs font-black uppercase text-[var(--nupsbox-navy)]">{blog.status}</span>
              </Link>
            )) : (
              <p className="px-6 py-8 text-sm text-[var(--nupsbox-slate)]">Chưa có bài blog.</p>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
