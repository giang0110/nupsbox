import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState, AdminPanel, AdminStatCard, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {Container} from '@/components/ui/container';
import {getBlogPublicationState} from '@/features/admin/blog';
import {getAdminSeoSnapshot} from '@/features/admin/seo';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminSeoPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const now = new Date();
  const snapshot = await getAdminSeoSnapshot(now);
  const publishedBlogs = snapshot.blogs.filter(
    blog => getBlogPublicationState(blog, now) === 'published'
  );

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="SEO / PUBLISH"
          title="SEO & Publishing Center"
          description="Kiểm tra coverage, metadata và public preview trước khi nội dung được index. Đây là QA read-only; không tự sửa business facts hoặc tự publish."
          actions={
            <Link
              href="/admin/quality"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              Vận hành & QA
            </Link>
          }
        />

        <section aria-label="SEO coverage" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard label="Route pairs VI/EN" value={snapshot.routePairs} />
          <AdminStatCard label="URL indexable" value={snapshot.indexableUrls} />
          <AdminStatCard label="Location pages" value={snapshot.activeLocations} href="/admin/catalog/locations" />
          <AdminStatCard label="Unit pages" value={snapshot.activeUnitTypes} href="/admin/catalog/unit-types" />
          <AdminStatCard
            label="Blog articles"
            value={snapshot.publishedBlogs}
            detail={snapshot.scheduledBlogs ? snapshot.scheduledBlogs + ' bài đã lên lịch' : undefined}
            href="/admin/content/blog"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
          <AdminPanel title="Index controls" description="Các endpoint SEO public hiện hành.">
            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border border-[var(--nupsbox-border)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">Canonical origin</p>
                <p className="mt-1 break-all font-bold text-[var(--nupsbox-navy)]">{snapshot.siteOrigin}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--nupsbox-border)] font-bold text-[var(--nupsbox-blue)]"
                >
                  Mở sitemap.xml ↗
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--nupsbox-border)] font-bold text-[var(--nupsbox-blue)]"
                >
                  Mở robots.txt ↗
                </a>
              </div>
              <p className="text-xs leading-5 text-[var(--nupsbox-slate)]">
                Sitemap chỉ lấy location active, unit active và blog đã đến thời điểm xuất bản; bài hẹn giờ chưa vào sitemap trước giờ.
              </p>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Metadata cần rà"
            description={snapshot.issues.length ? 'Warning là thiếu metadata; Info là heuristic về độ dài.' : 'Không có vấn đề theo các rule hiện tại.'}
          >
            {snapshot.issues.length ? (
              <div className="grid max-h-[30rem] gap-2 overflow-y-auto pr-1">
                {snapshot.issues.map(issue => (
                  <Link
                    key={issue.id}
                    href={issue.href}
                    className="rounded-xl border border-[var(--nupsbox-border)] p-3 transition hover:border-[var(--nupsbox-blue)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <strong className="text-sm text-[var(--nupsbox-navy)]">{issue.title}</strong>
                      <AdminStatusBadge
                        label={issue.tone === 'warning' ? 'Cần rà' : 'Gợi ý'}
                        tone={issue.tone}
                      />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--nupsbox-slate)]">{issue.detail}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                title="Metadata ổn theo rule hiện tại"
                description="Không phát hiện blog publish thiếu SEO metadata hoặc public media thiếu alt."
              />
            )}
          </AdminPanel>
        </section>

        <AdminPanel
          title="Bài Blog đã publish"
          description="Preview URL NupsBox riêng cho từng locale; source URL bên ngoài chỉ là nguồn tham khảo."
        >
          {publishedBlogs.length ? (
            <div className="divide-y divide-[var(--nupsbox-border)]">
              {publishedBlogs.map(blog => (
                <div key={blog.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-black text-[var(--nupsbox-navy)]">{blog.vi.title || blog.en.title || blog.slug}</p>
                    <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">/{blog.slug}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <AdminStatusBadge label={blog.vi.seoTitle ? 'SEO VI ✓' : 'SEO VI thiếu'} tone={blog.vi.seoTitle ? 'success' : 'warning'} />
                      <AdminStatusBadge label={blog.en.seoTitle ? 'SEO EN ✓' : 'SEO EN thiếu'} tone={blog.en.seoTitle ? 'success' : 'warning'} />
                      <AdminStatusBadge label={blog.coverMediaId ? 'Cover ✓' : 'Cover thiếu'} tone={blog.coverMediaId ? 'success' : 'warning'} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={'/blog/' + blog.slug}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-blue)]"
                    >
                      Preview VI ↗
                    </a>
                    <a
                      href={'/en/blog/' + blog.slug}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-blue)]"
                    >
                      Preview EN ↗
                    </a>
                    <Link
                      href={'/admin/content/blog/' + blog.id}
                      className="inline-flex min-h-11 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
                    >
                      Chỉnh bài
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="Chưa có bài Blog published"
              description="Khi bài được publish, URL VI/EN và trạng thái SEO sẽ xuất hiện tại đây."
            />
          )}
        </AdminPanel>
      </Container>
    </main>
  );
}
