import {Container} from '@/components/ui/container';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {getAdminDashboardSummary} from '@/features/admin/dashboard';

export default async function AdminDashboardPage() {
  const session = await requireAdminUser();
  const summary = await getAdminDashboardSummary();

  const cards = [
    ...(can(session.role, 'leads:read')
      ? [{label: 'Lead trong CRM', value: summary.leads}]
      : []),
    {label: 'Địa điểm đang hoạt động', value: summary.activeLocations},
    {label: 'Loại kho đang hoạt động', value: summary.activeUnitTypes},
    {label: 'FAQ đang hiển thị', value: summary.faqs},
    {label: 'Bài viết đã xuất bản', value: summary.publishedBlogPosts}
  ];

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">ADMIN</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">
            Tổng quan NupsBox
          </h1>
          <p className="mt-4 text-[var(--nupsbox-slate)]">
            Theo dõi nhanh dữ liệu vận hành đang được tài khoản của bạn phép truy cập.
          </p>
        </div>

        <section aria-label="Chỉ số tổng quan" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <article key={card.label} className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[var(--nupsbox-slate)]">{card.label}</p>
              <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-[var(--nupsbox-navy)]">{card.value}</p>
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}
