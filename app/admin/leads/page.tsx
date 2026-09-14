import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Container} from '@/components/ui/container';
import {LeadStatusForm} from '@/components/admin/lead-status-form';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {isLeadStatus, leadStatuses, listAdminLeads} from '@/features/admin/leads';
import type {LeadStatus} from '@/types/database';

const statusLabels: Record<LeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  visit_scheduled: 'Đã hẹn xem kho',
  visited: 'Đã xem kho',
  won: 'Đã thuê',
  lost: 'Không chuyển đổi'
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

export default async function AdminLeadsPage({
  searchParams
}: {
  searchParams: Promise<{status?: string}>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'leads:read')) redirect('/admin');

  const query = await searchParams;
  const status = isLeadStatus(query.status) ? query.status : undefined;
  const leads = await listAdminLeads({status, limit: 100});
  const canUpdate = can(session.role, 'leads:update');

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CRM</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Khách hàng tiềm năng</h1>
            <p className="mt-4 text-[var(--nupsbox-slate)]">Tối đa 100 lead mới nhất. Dữ liệu CRM chỉ hiển thị cho role được phép.</p>
          </div>
          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs font-bold text-[var(--nupsbox-slate)]">
              Trạng thái
              <select name="status" defaultValue={status ?? ''} className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]">
                <option value="">Tất cả</option>
                {leadStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
              </select>
            </label>
            <button type="submit" className="min-h-11 rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-bold text-white">Lọc</button>
            {status ? <Link href="/admin/leads" className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 py-3 text-sm font-bold text-[var(--nupsbox-navy)]">Xóa lọc</Link> : null}
          </form>
        </div>

        <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white shadow-sm">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              <tr>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Nhu cầu</th>
                <th className="px-5 py-4">Nguồn</th>
                <th className="px-5 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-[var(--nupsbox-border)] align-top">
                  <td className="whitespace-nowrap px-5 py-5 text-[var(--nupsbox-slate)]">{dateFormatter.format(new Date(lead.createdAt))}</td>
                  <td className="px-5 py-5">
                    <p className="font-black text-[var(--nupsbox-navy)]">{lead.fullName}</p>
                    <a className="mt-1 block font-bold text-[var(--nupsbox-blue)]" href={`tel:${lead.phone}`}>{lead.phone}</a>
                    {lead.email ? <a className="mt-1 block text-[var(--nupsbox-slate)] underline" href={`mailto:${lead.email}`}>{lead.email}</a> : null}
                  </td>
                  <td className="max-w-md px-5 py-5 text-[var(--nupsbox-slate)]">
                    <p className="font-bold text-[var(--nupsbox-navy)]">{lead.needType}</p>
                    {lead.message ? <p className="mt-2 whitespace-pre-wrap leading-6">{lead.message}</p> : null}
                  </td>
                  <td className="px-5 py-5 text-[var(--nupsbox-slate)]">
                    <p>{lead.utmSource ?? 'Trực tiếp / chưa rõ'}</p>
                    {lead.utmCampaign ? <p className="mt-1 text-xs">{lead.utmCampaign}</p> : null}
                  </td>
                  <td className="px-5 py-5">
                    {canUpdate ? <LeadStatusForm leadId={lead.id} status={lead.status} /> : <span className="font-bold text-[var(--nupsbox-navy)]">{statusLabels[lead.status]}</span>}
                  </td>
                </tr>
              ))}
              {!leads.length ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-[var(--nupsbox-slate)]">Chưa có lead phù hợp bộ lọc hiện tại.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}
