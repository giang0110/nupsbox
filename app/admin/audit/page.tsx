import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState, AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {Container} from '@/components/ui/container';
import {
  auditTargetHref,
  listAdminAuditFacets,
  listAdminAuditLog,
  normalizeAuditQuery,
  summarizeAuditMetadata
} from '@/features/admin/audit';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'short',
  timeStyle: 'medium'
});

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateTime.format(parsed);
}

export default async function AdminAuditPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'audit:read')) redirect('/admin');

  const filters = normalizeAuditQuery(await searchParams);
  const [rows, facets] = await Promise.all([
    listAdminAuditLog(filters),
    listAdminAuditFacets()
  ]);

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="AUDIT"
          title="Nhật ký thay đổi"
          description="Dòng thời gian các thay đổi CRM/CMS đã được database ghi nhận. Chỉ Admin được phép đọc theo RLS production."
          actions={
            <Link
              href="/admin/quality"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              Vận hành & QA
            </Link>
          }
        />

        <form
          method="get"
          className="grid gap-3 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
        >
          <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
            Bảng dữ liệu
            <select
              name="table"
              defaultValue={filters.table ?? ''}
              className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]"
            >
              <option value="">Tất cả</option>
              {facets.tables.map(table => <option key={table} value={table}>{table}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
            Hành động
            <select
              name="action"
              defaultValue={filters.action ?? ''}
              className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]"
            >
              <option value="">Tất cả</option>
              {facets.actions.map(action => <option key={action} value={action}>{action}</option>)}
            </select>
          </label>

          <button
            type="submit"
            className="min-h-11 self-end rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-bold text-white"
          >
            Lọc
          </button>
          <Link
            href="/admin/audit"
            className="inline-flex min-h-11 items-center justify-center self-end rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
          >
            Xóa lọc
          </Link>
        </form>

        <AdminPanel
          title="100 thay đổi gần nhất"
          description="Metadata chỉ hiển thị các trường audit đã biết; không render tùy ý dữ liệu JSON có thể chứa thông tin nhạy cảm trong tương lai."
        >
          {rows.length ? (
            <div className="divide-y divide-[var(--nupsbox-border)]">
              {rows.map(row => {
                const href = auditTargetHref(row.tableName, row.rowId);
                const metadata = summarizeAuditMetadata(row.metadata);
                const body = (
                  <div className="grid gap-2 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm text-[var(--nupsbox-navy)]">{row.action}</strong>
                        <AdminStatusBadge label={row.tableName} tone="neutral" />
                      </div>
                      <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">
                        {row.actorName ?? row.actorId ?? 'System / trigger'}
                      </p>
                      {metadata ? (
                        <p className="mt-1 break-words text-xs leading-5 text-[var(--nupsbox-slate)]">{metadata}</p>
                      ) : null}
                    </div>
                    <time className="text-xs font-semibold text-[var(--nupsbox-slate)]" dateTime={row.createdAt}>
                      {formatDate(row.createdAt)}
                    </time>
                  </div>
                );

                return href ? (
                  <Link key={row.id} href={href} className="block transition hover:bg-[var(--nupsbox-surface)]">
                    {body}
                  </Link>
                ) : (
                  <div key={row.id}>{body}</div>
                );
              })}
            </div>
          ) : (
            <AdminEmptyState
              title="Không có audit phù hợp"
              description="Không tìm thấy bản ghi audit theo bộ lọc hiện tại."
            />
          )}
        </AdminPanel>
      </Container>
    </main>
  );
}
