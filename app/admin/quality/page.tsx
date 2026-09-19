import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminPanel, AdminStatCard, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {Container} from '@/components/ui/container';
import {
  buildAdminQualityIssues,
  getAdminQualitySnapshot,
  type AdminQualityArea,
  type AdminQualityTone
} from '@/features/admin/quality';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const areaCopy: Record<AdminQualityArea, {title: string; description: string}> = {
  public: {
    title: 'Public & SEO readiness',
    description: 'Catalog, pricing và contact cần đủ dữ liệu trước khi website truyền đạt thông tin business.'
  },
  content: {
    title: 'Content & media',
    description: 'Ảnh kho, alt text và blog phải đủ nguồn, đúng mapping và đúng trạng thái publish.'
  },
  crm: {
    title: 'CRM follow-up',
    description: 'Tập trung vào lead chậm xử lý, chưa phân công hoặc không cập nhật trong thời gian dài.'
  }
};

const toneLabel: Record<AdminQualityTone, string> = {
  danger: 'Ưu tiên cao',
  warning: 'Cần xử lý',
  info: 'Theo dõi'
};

export default async function AdminQualityPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'dashboard:read')) redirect('/admin');

  const snapshot = await getAdminQualitySnapshot();
  const issues = buildAdminQualityIssues(snapshot);
  const countTone = (tone: AdminQualityTone) => issues.filter(issue => issue.tone === tone).length;

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="OPERATIONS / QA"
          title="Vận hành & chất lượng dữ liệu"
          description="Một nơi để biết production đang thiếu gì, việc nào cần ưu tiên và đường dẫn xử lý trực tiếp."
          actions={
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              ← Dashboard
            </Link>
          }
        />

        <section aria-label="Tổng quan cảnh báo" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Ưu tiên cao" value={countTone('danger')} />
          <AdminStatCard label="Cần xử lý" value={countTone('warning')} />
          <AdminStatCard label="Theo dõi" value={countTone('info')} />
          <AdminStatCard label="Tổng việc QA" value={issues.length} />
        </section>

        {(['public', 'content', 'crm'] as const).map((area) => {
          const areaIssues = issues.filter(issue => issue.area === area);
          return (
            <AdminPanel
              key={area}
              title={areaCopy[area].title}
              description={areaCopy[area].description}
            >
              {areaIssues.length ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {areaIssues.map((issue) => (
                    <Link
                      key={issue.id}
                      href={issue.href}
                      className="rounded-2xl border border-[var(--nupsbox-border)] p-4 transition hover:border-[var(--nupsbox-blue)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-black text-[var(--nupsbox-navy)]">{issue.title}</h3>
                        <AdminStatusBadge
                          label={issue.count == null ? toneLabel[issue.tone] : toneLabel[issue.tone] + ' · ' + issue.count}
                          tone={issue.tone}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{issue.detail}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-[var(--nupsbox-slate)]">
                  Không có cảnh báo theo các rule hiện tại.
                </p>
              )}
            </AdminPanel>
          );
        })}
      </Container>
    </main>
  );
}
