import Link from 'next/link';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {
  AdminEmptyState,
  AdminPanel,
  AdminStatCard,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {Container} from '@/components/ui/container';
import {getAdminDashboardSummary} from '@/features/admin/dashboard';
import {
  operationalLeadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/leads';
import {
  buildAdminQualityIssues,
  getAdminQualitySnapshot,
  type AdminQualityTone
} from '@/features/admin/quality';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const statusLabels: Record<OperationalLeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  qualified: 'Đã xác nhận nhu cầu',
  viewing: 'Đang xem kho',
  negotiating: 'Đang thương lượng',
  won: 'Đã thuê',
  lost: 'Không chuyển đổi'
};

const toneLabel: Record<AdminQualityTone, string> = {
  danger: 'Ưu tiên cao',
  warning: 'Cần xử lý',
  info: 'Theo dõi'
};

const crmDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'short',
  timeStyle: 'short'
});

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : crmDateTime.format(parsed);
}

export default async function AdminDashboardPage() {
  const session = await requireAdminUser();
  const [summary, qualitySnapshot] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminQualitySnapshot()
  ]);
  const qualityIssues = buildAdminQualityIssues(qualitySnapshot);
  const canReadLeads = can(session.role, 'leads:read');

  const quickActions = [
    can(session.role, 'catalog:create')
      ? {label: 'Thêm địa điểm', detail: 'Tạo cơ sở mới', href: '/admin/catalog/locations'}
      : null,
    can(session.role, 'catalog:create')
      ? {label: 'Thêm loại kho', detail: 'Kích thước & tư vấn', href: '/admin/catalog/unit-types'}
      : null,
    can(session.role, 'catalog:update')
      ? {label: 'Cấu hình giá', detail: 'Location × loại kho', href: '/admin/catalog/pricing'}
      : null,
    can(session.role, 'media:create')
      ? {label: 'Upload ảnh', detail: 'Gallery & cover', href: '/admin/content/media'}
      : null,
    can(session.role, 'content:create')
      ? {label: 'Viết blog', detail: 'Bài VI/EN & nguồn', href: '/admin/content/blog'}
      : null,
    can(session.role, 'settings:update')
      ? {label: 'Cập nhật liên hệ', detail: 'Phone · Zalo · Facebook', href: '/admin/content/settings'}
      : null
  ].filter((item): item is {label: string; detail: string; href: string} => Boolean(item));

  const crmCards = canReadLeads
    ? [
        {label: 'Lead mới', value: summary.crm.newLeads, href: '/admin/leads?status=new'},
        {label: 'Đang xử lý', value: summary.crm.inProgressLeads, href: '/admin/leads'},
        {
          label: 'Lịch xem kho sắp tới',
          value: summary.crm.upcomingAppointments,
          href: '/admin/leads'
        },
        {label: 'Đã thuê', value: summary.crm.wonLeads, href: '/admin/leads?status=won'},
        {label: 'Không chuyển đổi', value: summary.crm.lostLeads, href: '/admin/leads?status=lost'}
      ]
    : [];

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-7">
        <AdminPageHeader
          eyebrow="ADMIN"
          title="Trung tâm vận hành"
          description="Tác vụ thường dùng, việc cần xử lý và chất lượng dữ liệu production trong một màn hình."
          actions={
            <Link
              href="/admin/quality"
              className="inline-flex min-h-11 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
            >
              Mở Vận hành & QA
            </Link>
          }
        />

        <section className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
          <AdminPanel
            title="Tác vụ nhanh"
            description="Đi thẳng đến các thao tác quản trị thường dùng theo quyền hiện tại."
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[var(--nupsbox-border)] px-4 py-3 transition hover:border-[var(--nupsbox-blue)] hover:bg-blue-50/40"
                >
                  <strong className="text-sm text-[var(--nupsbox-navy)]">{item.label}</strong>
                  <p className="mt-1 text-xs leading-5 text-[var(--nupsbox-slate)]">{item.detail}</p>
                </Link>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title="QA ưu tiên"
            description={qualityIssues.length ? 'Hiển thị tối đa 5 việc cần chú ý nhất.' : 'Không có cảnh báo theo các rule hiện tại.'}
            actions={
              qualityIssues.length ? (
                <Link href="/admin/quality" className="text-sm font-bold text-[var(--nupsbox-blue)]">
                  Xem tất cả ({qualityIssues.length})
                </Link>
              ) : null
            }
          >
            {qualityIssues.length ? (
              <div className="grid gap-2">
                {qualityIssues.slice(0, 5).map((issue) => (
                  <Link
                    key={issue.id}
                    href={issue.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--nupsbox-border)] p-3 transition hover:border-[var(--nupsbox-blue)]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[var(--nupsbox-navy)]">{issue.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--nupsbox-slate)]">{issue.detail}</p>
                    </div>
                    <AdminStatusBadge
                      label={issue.count == null ? toneLabel[issue.tone] : String(issue.count)}
                      tone={issue.tone}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--nupsbox-slate)]">Dữ liệu hiện không vi phạm các rule QA đang theo dõi.</p>
            )}
          </AdminPanel>
        </section>

        {crmCards.length ? (
          <section aria-label="Chỉ số CRM" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {crmCards.map((card) => (
              <AdminStatCard key={card.label} {...card} />
            ))}
          </section>
        ) : null}

        {canReadLeads ? (
          <AdminPanel
            title="Việc cần chú ý"
            description="Danh sách ngắn các bản ghi đang cần thao tác; SLA chi tiết được tổng hợp trong Vận hành & QA."
          >
            <div className="grid gap-6 xl:grid-cols-3">
              <section aria-labelledby="new-leads-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 id="new-leads-title" className="font-black text-[var(--nupsbox-navy)]">Lead mới nhất</h3>
                  <Link className="text-sm font-bold text-[var(--nupsbox-blue)]" href="/admin/leads?status=new">Xem tất cả</Link>
                </div>
                {summary.attention.newLeads.length ? (
                  <div className="grid gap-2">
                    {summary.attention.newLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={'/admin/leads/' + lead.id}
                        className="rounded-xl border border-[var(--nupsbox-border)] p-3 transition hover:border-[var(--nupsbox-blue)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <strong className="text-sm text-[var(--nupsbox-navy)]">{lead.fullName}</strong>
                          <AdminStatusBadge label={statusLabels[lead.status]} tone="info" />
                        </div>
                        <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">{lead.phone}</p>
                        <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{formatDateTime(lead.createdAt)}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState title="Không có lead mới" description="Hiện không có bản ghi trạng thái Mới." />
                )}
              </section>

              <section aria-labelledby="unassigned-leads-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 id="unassigned-leads-title" className="font-black text-[var(--nupsbox-navy)]">Chưa phân công</h3>
                  <Link className="text-sm font-bold text-[var(--nupsbox-blue)]" href="/admin/leads">Mở CRM</Link>
                </div>
                {summary.attention.unassignedLeads.length ? (
                  <div className="grid gap-2">
                    {summary.attention.unassignedLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={'/admin/leads/' + lead.id}
                        className="rounded-xl border border-[var(--nupsbox-border)] p-3 transition hover:border-[var(--nupsbox-blue)]"
                      >
                        <strong className="text-sm text-[var(--nupsbox-navy)]">{lead.fullName}</strong>
                        <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">{lead.phone}</p>
                        <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">{statusLabels[lead.status]}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState title="Đã phân công" description="Không có lead đang xử lý nào thiếu người phụ trách." />
                )}
              </section>

              <section aria-labelledby="appointments-title">
                <h3 id="appointments-title" className="mb-3 font-black text-[var(--nupsbox-navy)]">Lịch xem kho</h3>
                {summary.attention.appointments.length ? (
                  <div className="grid gap-2">
                    {summary.attention.appointments.map((appointment) => (
                      <Link
                        key={appointment.id}
                        href={'/admin/leads/' + appointment.leadId}
                        className="rounded-xl border border-[var(--nupsbox-border)] p-3 transition hover:border-[var(--nupsbox-blue)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <strong className="text-sm text-[var(--nupsbox-navy)]">{appointment.leadName ?? 'Lead'}</strong>
                          <AdminStatusBadge
                            label={appointment.overdue ? 'Quá hạn' : appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'}
                            tone={appointment.overdue ? 'warning' : 'neutral'}
                          />
                        </div>
                        <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">{formatDateTime(appointment.scheduledAt)}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState title="Chưa có lịch cần chú ý" description="Không có lịch sắp tới hoặc quá hạn trong hàng đợi hiện tại." />
                )}
              </section>
            </div>
          </AdminPanel>
        ) : null}

        {canReadLeads ? (
          <details className="rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm">
            <summary className="cursor-pointer px-5 py-4 font-black text-[var(--nupsbox-navy)]">
              Pipeline CRM · mở để xem 7 trạng thái
            </summary>
            <div className="grid gap-3 border-t border-[var(--nupsbox-border)] p-5 sm:grid-cols-2 xl:grid-cols-4">
              {operationalLeadStatuses.map((status) => (
                <Link
                  key={status}
                  href={'/admin/leads?status=' + status}
                  className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-[var(--nupsbox-border)] px-4 py-3 transition hover:border-[var(--nupsbox-blue)]"
                >
                  <span className="font-bold text-[var(--nupsbox-navy)]">{statusLabels[status]}</span>
                  <span className="text-2xl font-black text-[var(--nupsbox-navy)]">{summary.crm.byStatus[status]}</span>
                </Link>
              ))}
            </div>
          </details>
        ) : null}

        <section aria-label="Tình trạng dữ liệu" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <AdminStatCard label="Địa điểm active" value={qualitySnapshot.catalog.activeLocations} href="/admin/catalog/locations" />
          <AdminStatCard label="Loại kho active" value={qualitySnapshot.catalog.activeUnitTypes} href="/admin/catalog/unit-types" />
          <AdminStatCard label="Cấu hình giá" value={qualitySnapshot.catalog.pricingRows} href="/admin/catalog/pricing" />
          <AdminStatCard label="Ảnh public" value={qualitySnapshot.media.publicCount} href="/admin/content/media" />
          <AdminStatCard label="FAQ public" value={summary.health.faqs} href="/admin/content/faq" />
          <AdminStatCard label="Blog public" value={qualitySnapshot.blog.published} href="/admin/content/blog" />
        </section>
      </Container>
    </main>
  );
}
