import Link from 'next/link';
import {AdminEmptyState, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {LeadStatusForm} from '@/components/admin/lead-status-form';
import {leadStatusMeta} from '@/features/admin/lead-workspace';
import type {AdminLeadRow} from '@/features/admin/leads';

const crmDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'short',
  timeStyle: 'short'
});

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : crmDateTime.format(parsed);
}

function sourceLabel(lead: AdminLeadRow) {
  return lead.source ?? lead.utmSource ?? 'Trực tiếp / chưa rõ';
}

function assigneeLabel(lead: AdminLeadRow, assigneeNames: Record<string, string>) {
  if (!lead.assignedTo) return 'Chưa phân công';
  return assigneeNames[lead.assignedTo] ?? 'Nhân sự hiện tại';
}

function LeadStatus({
  lead,
  canUpdate
}: {
  lead: AdminLeadRow;
  canUpdate: boolean;
}) {
  return canUpdate ? (
    <LeadStatusForm leadId={lead.id} status={lead.status} />
  ) : (
    <AdminStatusBadge
      label={leadStatusMeta[lead.status].label}
      tone={leadStatusMeta[lead.status].tone}
    />
  );
}

export function LeadList({
  leads,
  assigneeNames,
  canUpdate
}: {
  leads: AdminLeadRow[];
  assigneeNames: Record<string, string>;
  canUpdate: boolean;
}) {
  if (!leads.length) {
    return (
      <AdminEmptyState
        title="Chưa có lead phù hợp"
        description="Không có bản ghi phù hợp bộ lọc hiện tại."
      />
    );
  }

  return (
    <>
      <div
        data-admin-desktop-table
        className="hidden overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm lg:block"
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
            <tr>
              <th className="px-4 py-4">Lead</th>
              <th className="px-4 py-4">Nhu cầu</th>
              <th className="px-4 py-4">Nguồn</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Phụ trách</th>
              <th className="px-4 py-4">Cập nhật / action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--nupsbox-border)] align-top">
                <td className="px-4 py-5">
                  <strong className="text-[var(--nupsbox-navy)]">{lead.fullName}</strong>
                  <a
                    className="mt-1 block font-bold text-[var(--nupsbox-blue)]"
                    href={'tel:' + lead.phone}
                  >
                    {lead.phone}
                  </a>
                  {lead.email ? (
                    <a
                      className="mt-1 block text-[var(--nupsbox-slate)] underline"
                      href={'mailto:' + lead.email}
                    >
                      {lead.email}
                    </a>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--nupsbox-slate)]">
                    {formatDateTime(lead.createdAt)}
                  </p>
                </td>
                <td className="max-w-sm px-4 py-5">
                  <p className="font-bold text-[var(--nupsbox-navy)]">{lead.needType}</p>
                  {lead.message ? (
                    <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-[var(--nupsbox-slate)]">
                      {lead.message}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-5 text-[var(--nupsbox-slate)]">
                  <p>{sourceLabel(lead)}</p>
                  {lead.utmCampaign ? <p className="mt-1 text-xs">{lead.utmCampaign}</p> : null}
                </td>
                <td className="px-4 py-5">
                  <LeadStatus lead={lead} canUpdate={canUpdate} />
                </td>
                <td className="px-4 py-5 text-[var(--nupsbox-slate)]">
                  {assigneeLabel(lead, assigneeNames)}
                </td>
                <td className="px-4 py-5">
                  <p className="text-xs text-[var(--nupsbox-slate)]">
                    Cập nhật {formatDateTime(lead.updatedAt)}
                  </p>
                  <Link
                    href={'/admin/leads/' + lead.id}
                    className="mt-3 inline-flex min-h-11 items-center font-bold text-[var(--nupsbox-blue)]"
                  >
                    Mở hồ sơ CRM →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-admin-mobile-list className="grid gap-3 lg:hidden">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="rounded-2xl border border-[var(--nupsbox-border)] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-black text-[var(--nupsbox-navy)]">{lead.fullName}</h2>
                <a
                  className="mt-1 inline-flex min-h-11 items-center font-bold text-[var(--nupsbox-blue)]"
                  href={'tel:' + lead.phone}
                >
                  {lead.phone}
                </a>
              </div>
              {!canUpdate ? (
                <AdminStatusBadge
                  label={leadStatusMeta[lead.status].label}
                  tone={leadStatusMeta[lead.status].tone}
                />
              ) : null}
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Nhu cầu</dt>
                <dd className="mt-1 font-bold text-[var(--nupsbox-navy)]">{lead.needType}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Nguồn</dt>
                <dd className="mt-1 text-[var(--nupsbox-navy)]">{sourceLabel(lead)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Phụ trách</dt>
                <dd className="mt-1 text-[var(--nupsbox-navy)]">
                  {assigneeLabel(lead, assigneeNames)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--nupsbox-slate)]">Thời gian</dt>
                <dd className="mt-1 text-[var(--nupsbox-navy)]">{formatDateTime(lead.createdAt)}</dd>
              </div>
            </dl>

            {canUpdate ? (
              <div className="mt-4">
                <LeadStatus lead={lead} canUpdate />
              </div>
            ) : null}

            <Link
              href={'/admin/leads/' + lead.id}
              className="mt-4 inline-flex min-h-11 items-center font-bold text-[var(--nupsbox-blue)]"
            >
              Mở hồ sơ CRM →
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
