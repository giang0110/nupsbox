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
  const summary = await getAdminDashboardSummary();
  const canReadLeads = can(session.role, 'leads:read');

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
      <Container className="grid gap-8">
        <AdminPageHeader
          eyebrow="ADMIN"
          title="Tổng quan vận hành"
          description="Theo dõi khối lượng CRM cần xử lý và tình trạng dữ liệu vận hành từ các bản ghi hiện có."
        />

        {crmCards.length ? (
          <section aria-label="Chỉ số CRM" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {crmCards.map((card) => (
              <AdminStatCard key={card.label} {...card} />
            ))}
          </section>
        ) : null}

        {canReadLeads ? (
          <AdminPanel
            title="Việc cần chú ý"
            description="Danh sách ngắn các bản ghi đang cần thao tác, không phải hệ thống thông báo."
          >
            <div className="grid gap-6 xl:grid-cols-3">
              <section aria-labelledby="new-leads-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 id="new-leads-title" className="font-black text-[var(--nupsbox-navy)]">
                    Lead mới nhất
                  </h3>
                  <Link className="text-sm font-bold text-[var(--nupsbox-blue)]" href="/admin/leads?status=new">
                    Xem tất cả
                  </Link>
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
                  <h3 id="unassigned-leads-title" className="font-black text-[var(--nupsbox-navy)]">
                    Chưa phân công
                  </h3>
                  <Link className="text-sm font-bold text-[var(--nupsbox-blue)]" href="/admin/leads">
                    Mở CRM
                  </Link>
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
                <h3 id="appointments-title" className="mb-3 font-black text-[var(--nupsbox-navy)]">
                  Lịch xem kho
                </h3>
                {summary.attention.appointments.length ? (
                  <div className="grid gap-2">
                    {summary.attention.appointments.map((appointment) => (
                      <Link
                        key={appointment.id}
                        href={'/admin/leads/' + appointment.leadId}
                        className="rounded-xl border border-[var(--nupsbox-border)] p-3 transition hover:border-[var(--nupsbox-blue)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <strong className="text-sm text-[var(--nupsbox-navy)]">
                            {appointment.leadName ?? 'Lead'}
                          </strong>
                          <AdminStatusBadge
                            label={appointment.overdue ? 'Quá hạn' : appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Đang chờ'}
                            tone={appointment.overdue ? 'warning' : 'neutral'}
                          />
                        </div>
                        <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">
                          {formatDateTime(appointment.scheduledAt)}
                        </p>
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
          <AdminPanel
            title="Pipeline"
            description="Số lượng lead theo đúng bảy trạng thái CRM hiện hành."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {operationalLeadStatuses.map((status) => (
                <Link
                  key={status}
                  href={'/admin/leads?status=' + status}
                  className="flex min-h-20 items-center justify-between gap-4 rounded-xl border border-[var(--nupsbox-border)] px-4 py-3 transition hover:border-[var(--nupsbox-blue)]"
                >
                  <span className="font-bold text-[var(--nupsbox-navy)]">{statusLabels[status]}</span>
                  <span className="text-2xl font-black text-[var(--nupsbox-navy)]">
                    {summary.crm.byStatus[status]}
                  </span>
                </Link>
              ))}
            </div>
          </AdminPanel>
        ) : null}

        <section aria-labelledby="operational-health-title">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
              DỮ LIỆU
            </p>
            <h2 id="operational-health-title" className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">
              Tình trạng vận hành
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Địa điểm đang hoạt động" value={summary.health.activeLocations} href="/admin/catalog/locations" />
            <AdminStatCard label="Loại kho đang hoạt động" value={summary.health.activeUnitTypes} href="/admin/catalog/unit-types" />
            <AdminStatCard label="FAQ đang hiển thị" value={summary.health.faqs} href="/admin/content/faq" />
            <AdminStatCard label="Bài viết đã xuất bản" value={summary.health.publishedBlogPosts} href="/admin/content/blog" />
          </div>
        </section>
      </Container>
    </main>
  );
}
