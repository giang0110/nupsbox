import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminEmptyState, AdminPanel, AdminStatCard, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {Container} from '@/components/ui/container';
import {listAdminBlogs} from '@/features/admin/blog';
import {buildAdminContentCalendar} from '@/features/admin/content-calendar';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const hcmDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'medium',
  timeStyle: 'short'
});

function label(blog: Awaited<ReturnType<typeof listAdminBlogs>>[number]) {
  return blog.vi.title || blog.en.title || blog.slug;
}

export default async function AdminContentCalendarPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const blogs = await listAdminBlogs();
  const calendar = buildAdminContentCalendar(blogs);

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CONTENT / CALENDAR"
          title="Lịch nội dung"
          description="Theo dõi bài draft, bài đã hẹn giờ và bài vừa xuất bản. Lịch dùng múi giờ TP.HCM."
          actions={
            <Link
              href="/admin/content/blog"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              ← Blog CMS
            </Link>
          }
        />

        <section aria-label="Content calendar summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Đã lên lịch" value={calendar.scheduled.length} />
          <AdminStatCard label="Trong 7 ngày tới" value={calendar.next7Days.length} />
          <AdminStatCard label="Draft" value={calendar.drafts.length} />
          <AdminStatCard label="Publish 30 ngày" value={calendar.recentPublished.length} />
        </section>

        <AdminPanel
          title="Sắp xuất bản"
          description="Bài chỉ trở thành public và vào sitemap khi thời điểm published_at đã đến."
        >
          {calendar.scheduled.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {calendar.scheduled.map(blog => (
                <Link
                  key={blog.id}
                  href={'/admin/content/blog/' + blog.id}
                  className="rounded-2xl border border-[var(--nupsbox-border)] p-4 transition hover:border-[var(--nupsbox-blue)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <strong className="text-[var(--nupsbox-navy)]">{label(blog)}</strong>
                    <AdminStatusBadge label="Đã lên lịch" tone="warning" />
                  </div>
                  <p className="mt-2 text-sm font-bold text-[var(--nupsbox-blue)]">
                    {blog.publishedAt ? hcmDateTime.format(new Date(blog.publishedAt)) : ''}
                  </p>
                  <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">/{blog.slug}</p>
                </Link>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="Chưa có bài được hẹn giờ"
              description="Mở một draft trong Blog CMS để chọn ngày giờ xuất bản."
            />
          )}
        </AdminPanel>

        <section className="grid gap-4 xl:grid-cols-2">
          <AdminPanel title="Draft cần chuẩn bị" description="Sắp xếp theo lần cập nhật gần nhất.">
            {calendar.drafts.length ? (
              <div className="divide-y divide-[var(--nupsbox-border)]">
                {calendar.drafts.slice(0, 10).map(blog => (
                  <Link
                    key={blog.id}
                    href={'/admin/content/blog/' + blog.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="min-w-0 truncate text-sm font-bold text-[var(--nupsbox-navy)]">{label(blog)}</span>
                    <AdminStatusBadge label="Draft" tone="neutral" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--nupsbox-slate)]">Không có draft.</p>
            )}
          </AdminPanel>

          <AdminPanel title="Đã xuất bản gần đây" description="Các bài public trong 30 ngày gần nhất.">
            {calendar.recentPublished.length ? (
              <div className="divide-y divide-[var(--nupsbox-border)]">
                {calendar.recentPublished.slice(0, 10).map(blog => (
                  <Link
                    key={blog.id}
                    href={'/admin/content/blog/' + blog.id}
                    className="grid gap-1 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-bold text-[var(--nupsbox-navy)]">{label(blog)}</span>
                    <span className="text-xs text-[var(--nupsbox-slate)]">
                      {blog.publishedAt ? hcmDateTime.format(new Date(blog.publishedAt)) : ''}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--nupsbox-slate)]">Chưa có bài public trong 30 ngày gần đây.</p>
            )}
          </AdminPanel>
        </section>
      </Container>
    </main>
  );
}
