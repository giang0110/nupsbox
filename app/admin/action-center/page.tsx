import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminEmptyState, AdminPanel, AdminStatCard, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {Container} from '@/components/ui/container';
import {buildAdminActionCenter, type AdminActionArea} from '@/features/admin/action-center';
import {listAdminBlogs} from '@/features/admin/blog';
import {buildAdminContentCalendar} from '@/features/admin/content-calendar';
import {getAdminDashboardSummary} from '@/features/admin/dashboard';
import {buildAdminQualityIssues, getAdminQualitySnapshot, type AdminQualityTone} from '@/features/admin/quality';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const areaCopy: Record<AdminActionArea, {title: string; description: string}> = {
  crm: {
    title: 'CRM cần hành động',
    description: 'Lead, phân công và lịch xem kho cần được xử lý trước.'
  },
  content: {
    title: 'Nội dung & lịch xuất bản',
    description: 'Draft, media, SEO và bài sắp tự xuất bản.'
  },
  public: {
    title: 'Website & dữ liệu public',
    description: 'Catalog, giá và thông tin liên hệ ảnh hưởng trực tiếp tới website.'
  }
};

const toneLabel: Record<AdminQualityTone, string> = {
  danger: 'Ưu tiên cao',
  warning: 'Cần xử lý',
  info: 'Theo dõi'
};

export default async function AdminActionCenterPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'dashboard:read')) redirect('/admin');

  const [qualitySnapshot, dashboard, blogs] = await Promise.all([
    getAdminQualitySnapshot(),
    getAdminDashboardSummary(),
    listAdminBlogs()
  ]);

  const actionCenter = buildAdminActionCenter({
    qualityIssues: buildAdminQualityIssues(qualitySnapshot),
    calendar: buildAdminContentCalendar(blogs),
    dashboard
  });

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="OPERATIONS / ACTION CENTER"
          title="Việc cần làm"
          description="Một hàng đợi ngắn gọn để biết việc nào cần xử lý trước, thay vì phải mở từng màn hình quản trị."
          actions={
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              ← Dashboard
            </Link>
          }
        />

        <section aria-label="Tổng quan việc cần làm" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Ưu tiên cao" value={actionCenter.counts.danger} />
          <AdminStatCard label="Cần xử lý" value={actionCenter.counts.warning} />
          <AdminStatCard label="Theo dõi" value={actionCenter.counts.info} />
          <AdminStatCard label="Tổng hàng đợi" value={actionCenter.items.length} />
        </section>

        {actionCenter.items.length === 0 ? (
          <AdminEmptyState
            title="Không có việc nổi bật"
            description="Các rule vận hành hiện tại chưa phát hiện hạng mục cần hành động."
          />
        ) : (
          (['crm', 'content', 'public'] as const).map(area => {
            const items = actionCenter.items.filter(item => item.area === area);
            if (!items.length) return null;

            return (
              <AdminPanel
                key={area}
                title={areaCopy[area].title}
                description={areaCopy[area].description}
              >
                <div className="grid gap-3 lg:grid-cols-2">
                  {items.map(item => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="rounded-2xl border border-[var(--nupsbox-border)] p-4 transition hover:border-[var(--nupsbox-blue)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-black text-[var(--nupsbox-navy)]">{item.title}</h3>
                        <AdminStatusBadge
                          label={
                            item.count == null
                              ? toneLabel[item.tone]
                              : toneLabel[item.tone] + ' · ' + item.count
                          }
                          tone={item.tone}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{item.detail}</p>
                    </Link>
                  ))}
                </div>
              </AdminPanel>
            );
          })
        )}
      </Container>
    </main>
  );
}
