import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {BlogForm} from '@/components/admin/blog-form';
import {Container} from '@/components/ui/container';
import {getAdminBlog} from '@/features/admin/blog';
import {listAdminMedia} from '@/features/admin/media';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminBlogDetailPage({params}: {params: Promise<{id: string}>}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const {id} = await params;
  const [blog, media] = await Promise.all([getAdminBlog(id), listAdminMedia()]);
  if (!blog) notFound();

  const mediaOptions = media.map((item) => ({id: item.id, label: item.storagePath}));

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <Link href="/admin/content/blog" className="text-sm font-bold text-[var(--nupsbox-blue)]">← Blog CMS</Link>
        <div className="mt-6 max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">BLOG DETAIL</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">{blog.vi.title || blog.en.title || blog.slug}</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            Trạng thái: <strong>{blog.status}</strong>{blog.publishedAt ? ` · xuất bản lần đầu ${blog.publishedAt}` : ''}.
          </p>
        </div>

        <div className="mt-10">
          <BlogForm
            blog={blog}
            canCreate={false}
            canUpdate={can(session.role, 'content:update')}
            canPublish={can(session.role, 'content:publish')}
            mediaOptions={mediaOptions}
          />
        </div>
      </Container>
    </main>
  );
}
