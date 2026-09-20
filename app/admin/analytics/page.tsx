import Link from 'next/link';
import {redirect} from 'next/navigation';
import {
  AdminEmptyState,
  AdminPanel,
  AdminStatCard
} from '@/components/admin/admin-primitives';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {Container} from '@/components/ui/container';
import {
  getAdminLeadAnalytics,
  normalizeAnalyticsDays,
  type AdminAnalyticsBreakdownItem
} from '@/features/admin/analytics';
import type {OperationalLeadStatus} from '@/features/admin/leads';
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

const needLabels: Record<string, string> = {
  shop_online: 'Shop online',
  sme: 'Doanh nghiệp nhỏ',
  inventory: 'Hàng tồn',
  personal: 'Cá nhân',
  documents: 'Tài liệu',
  other: 'Khác'
};

function percent(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    maximumFractionDigits: 1
  }).format(value);
}

function BarList({
  items,
  emptyLabel,
  labelFor
}: {
  items: AdminAnalyticsBreakdownItem[];
  emptyLabel: string;
  labelFor?: (item: AdminAnalyticsBreakdownItem) => string;
}) {
  if (!items.length) {
    return <p className="text-sm text-[var(--nupsbox-slate)]">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map(item => item.count), 1);
  return (
    <div className="grid gap-3">
      {items.map(item => (
        <div key={item.key}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-bold text-[var(--nupsbox-navy)]">
              {labelFor ? labelFor(item) : item.label}
            </span>
            <span className="shrink-0 text-xs font-bold text-[var(--nupsbox-slate)]">
              {item.count} · {percent(item.share)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--nupsbox-surface)]">
            <div
              className="h-full rounded-full bg-[var(--nupsbox-blue)]"
              style={{width: `${Math.max((item.count / max) * 100, 3)}%`}}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'leads:read')) redirect('/admin');

  const params = await searchParams;
  const rawDays = Array.isArray(params.days) ? params.days[0] : params.days;
  const days = normalizeAnalyticsDays(rawDays);
  const analytics = await getAdminLeadAnalytics(days);
  const maxDaily = Math.max(...analytics.daily.map(item => item.count), 1);

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CRM / ANALYTICS"
          title="Lead Analytics"
          description="Phân tích nguồn lead và funnel từ dữ liệu CRM hiện có. Không hiển thị tên, số điện thoại, email hoặc nội dung tin nhắn."
          actions={
            <div className="flex flex-wrap gap-2">
              {[7, 30, 90].map(windowDays => (
                <Link
                  key={windowDays}
                  href={'/admin/analytics?days=' + windowDays}
                  aria-current={days === windowDays ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)] aria-[current=page]:border-[var(--nupsbox-blue)] aria-[current=page]:bg-blue-50"
                >
                  {windowDays} ngày
                </Link>
              ))}
            </div>
          }
        />

        <section aria-label="Chỉ số lead" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard label="Tổng lead" value={analytics.totalLeads} />
          <AdminStatCard label="Đã thuê" value={analytics.wonLeads} />
          <AdminStatCard label="Tỷ lệ đã thuê" value={percent(analytics.conversionRate)} />
          <AdminStatCard label="Đang xử lý" value={analytics.activeLeads} />
          <AdminStatCard
            label="Dữ liệu breakdown"
            value={analytics.sampleSize}
            detail={analytics.truncated ? 'Breakdown dùng tối đa 1.000 lead mới nhất.' : 'Bao phủ toàn bộ lead trong kỳ.'}
          />
        </section>

        {analytics.totalLeads === 0 ? (
          <AdminEmptyState
            title="Chưa có lead trong khoảng thời gian này"
            description="Analytics sẽ tự xuất hiện khi CRM có lead mới. Không cần cấu hình tracking bổ sung cho các trường source/UTM đã được lưu cùng lead."
          />
        ) : (
          <>
            <AdminPanel
              title={'Xu hướng ' + days + ' ngày'}
              description="Số lead tạo mới theo ngày, quy đổi theo múi giờ TP.HCM."
            >
              <div
                className="grid min-h-40 items-end gap-1 overflow-x-auto pt-4"
                style={{gridTemplateColumns: `repeat(${analytics.daily.length}, minmax(${days === 90 ? 5 : 10}px, 1fr))`}}
                aria-label="Biểu đồ lead theo ngày"
              >
                {analytics.daily.map(item => (
                  <div key={item.date} className="grid h-36 min-w-0 items-end gap-1">
                    <div
                      className="w-full rounded-t bg-[var(--nupsbox-blue)]"
                      style={{height: `${item.count ? Math.max((item.count / maxDaily) * 100, 6) : 2}%`}}
                      title={item.date + ': ' + item.count + ' lead'}
                      aria-label={item.date + ': ' + item.count + ' lead'}
                    />
                    {days === 7 ? (
                      <span className="truncate text-center text-[0.62rem] text-[var(--nupsbox-slate)]">
                        {item.date.slice(5)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </AdminPanel>

            <section className="grid gap-4 xl:grid-cols-2">
              <AdminPanel
                title="Funnel chuyển đổi CRM"
                description="Funnel tích lũy suy ra từ trạng thái hiện tại: mỗi bước “+” gồm lead đang ở bước đó hoặc đã tiến xa hơn. Không phải lịch sử event trước lead."
              >
                <div className="grid gap-3">
                  {analytics.funnel.map(stage => (
                    <div key={stage.key}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-[var(--nupsbox-navy)]">{stage.label}</span>
                        <span className="text-xs font-bold text-[var(--nupsbox-slate)]">
                          {stage.count} · {percent(stage.shareOfLeads)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--nupsbox-surface)]">
                        <div
                          className="h-full rounded-full bg-[var(--nupsbox-blue)]"
                          style={{width: `${stage.shareOfLeads ? Math.max(stage.shareOfLeads * 100, 3) : 0}%`}}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-[var(--nupsbox-slate)]">
                  Event trước khi tạo lead như Finder start/complete và Quote/View start vẫn được phát qua analytics taxonomy hiện có; khi cần attribution đầy đủ có thể nối dataLayer với GTM/GA4 mà không đổi flow public.
                </p>
              </AdminPanel>

              <AdminPanel
                title="Nguồn lead"
                description="Ưu tiên UTM source; nếu thiếu thì dùng source của lead. Không hiển thị referrer URL."
              >
                <BarList items={analytics.bySource} emptyLabel="Chưa có dữ liệu nguồn." />
              </AdminPanel>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <AdminPanel
                title="Nhu cầu lưu trữ"
                description="Nhóm nhu cầu mà khách đã chọn khi gửi yêu cầu."
              >
                <BarList
                  items={analytics.byNeedType}
                  emptyLabel="Chưa có dữ liệu nhu cầu."
                  labelFor={item => needLabels[item.key] ?? item.label}
                />
              </AdminPanel>

              <AdminPanel
                title="Landing page"
                description="Top đường dẫn tạo lead. Query string và fragment được loại bỏ trước khi tổng hợp."
              >
                <BarList items={analytics.byLandingPage} emptyLabel="Chưa có landing page." />
              </AdminPanel>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <AdminPanel
                title="Campaign"
                description="UTM campaign của lead; “Không có campaign” gồm direct hoặc traffic chưa gắn campaign."
              >
                <BarList items={analytics.byCampaign} emptyLabel="Chưa có campaign." />
              </AdminPanel>

              <AdminPanel
                title="Ngôn ngữ"
                description="Ngôn ngữ public flow tại thời điểm khách gửi lead."
              >
                <BarList items={analytics.byLanguage} emptyLabel="Chưa có dữ liệu ngôn ngữ." />
              </AdminPanel>
            </section>

            {analytics.truncated ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Kỳ này có {analytics.totalLeads} lead. KPI và funnel dùng exact counts; các breakdown nguồn/campaign/landing page/xu hướng đang dựa trên {analytics.sampleSize} lead mới nhất để giữ truy vấn Admin gọn nhẹ.
              </p>
            ) : null}
          </>
        )}
      </Container>
    </main>
  );
}
