'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState, type DragEvent} from 'react';
import {updateLeadStatusValue} from '@/app/admin/leads/actions';
import {AdminStatusBadge} from '@/components/admin/admin-primitives';
import type {AdminLeadAppointmentSummary} from '@/features/admin/lead-appointment-summary';
import {
  groupLeadsByStatus,
  leadStatusMeta
} from '@/features/admin/lead-workspace';
import {
  operationalLeadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/lead-status';
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

export function LeadPipeline({
  leads,
  assigneeNames,
  appointmentSummaries,
  canUpdate
}: {
  leads: AdminLeadRow[];
  assigneeNames: Record<string, string>;
  appointmentSummaries: Record<string, AdminLeadAppointmentSummary>;
  canUpdate: boolean;
}) {
  const router = useRouter();
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [optimisticStatusById, setOptimisticStatusById] = useState<
    Record<string, OperationalLeadStatus>
  >({});
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function effectiveStatus(leadId: string): OperationalLeadStatus {
    return optimisticStatusById[leadId] ?? leads.find((lead) => lead.id === leadId)?.status ?? 'new';
  }

  async function commitStatus(
    leadId: string,
    nextStatus: OperationalLeadStatus
  ) {
    const current = effectiveStatus(leadId);
    if (current === nextStatus || pendingLeadId === leadId) return;

    setError(null);
    setPendingLeadId(leadId);
    setOptimisticStatusById((value) => ({...value, [leadId]: nextStatus}));

    try {
      const result = await updateLeadStatusValue(leadId, nextStatus);
      if (!result.ok) {
        setOptimisticStatusById((value) => {
          const next = {...value};
          delete next[leadId];
          return next;
        });
        setError(result.message);
        return;
      }

      router.refresh();
    } catch {
      setOptimisticStatusById((value) => {
        const next = {...value};
        delete next[leadId];
        return next;
      });
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setPendingLeadId(null);
    }
  }

  const effectiveLeads = leads.map((lead) => ({
    ...lead,
    status: optimisticStatusById[lead.id] ?? lead.status
  }));
  const grouped = groupLeadsByStatus(effectiveLeads);

  function dropOnStatus(
    event: DragEvent<HTMLElement>,
    status: OperationalLeadStatus
  ) {
    event.preventDefault();
    if (!canUpdate || !dragLeadId) return;

    const leadId = dragLeadId;
    setDragLeadId(null);
    void commitStatus(leadId, status);
  }

  return (
    <section aria-label="Pipeline CRM" className="grid gap-3">
      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[112rem] grid-cols-7 gap-3">
          {operationalLeadStatuses.map((status) => (
            <section
              key={status}
              aria-labelledby={'pipeline-' + status}
              onDragOver={(event) => {
                if (canUpdate) event.preventDefault();
              }}
              onDrop={(event) => dropOnStatus(event, status)}
              className="min-h-[28rem] rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2
                  id={'pipeline-' + status}
                  className="text-sm font-black text-[var(--nupsbox-navy)]"
                >
                  {leadStatusMeta[status].label}
                </h2>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[var(--nupsbox-slate)]">
                  {grouped[status].length}
                </span>
              </div>

              <div className="grid gap-3">
                {grouped[status].map((lead) => {
                  const appointment = appointmentSummaries[lead.id];
                  const pending = pendingLeadId === lead.id;
                  const assignee = lead.assignedTo
                    ? assigneeNames[lead.assignedTo] ?? 'Nhân sự hiện tại'
                    : 'Chưa phân công';

                  return (
                    <article
                      key={lead.id}
                      draggable={canUpdate && !pending}
                      onDragStart={() => {
                        if (canUpdate && !pending) setDragLeadId(lead.id);
                      }}
                      onDragEnd={() => setDragLeadId(null)}
                      className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-black text-[var(--nupsbox-navy)]">
                            {lead.fullName}
                          </h3>
                          <a
                            href={'tel:' + lead.phone}
                            className="mt-1 inline-flex min-h-11 items-center text-sm font-bold text-[var(--nupsbox-blue)]"
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

                      <dl className="mt-2 grid gap-2 text-xs">
                        <div>
                          <dt className="font-bold text-[var(--nupsbox-slate)]">Nhu cầu</dt>
                          <dd className="mt-0.5 text-[var(--nupsbox-navy)]">{lead.needType}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-[var(--nupsbox-slate)]">Phụ trách</dt>
                          <dd className="mt-0.5 text-[var(--nupsbox-navy)]">{assignee}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-[var(--nupsbox-slate)]">Nguồn</dt>
                          <dd className="mt-0.5 text-[var(--nupsbox-navy)]">{sourceLabel(lead)}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-[var(--nupsbox-slate)]">Tiếp nhận</dt>
                          <dd className="mt-0.5 text-[var(--nupsbox-navy)]">
                            {formatDateTime(lead.createdAt)}
                          </dd>
                        </div>
                      </dl>

                      {appointment ? (
                        <p className="mt-3 rounded-lg bg-[var(--nupsbox-surface)] px-2.5 py-2 text-xs text-[var(--nupsbox-navy)]">
                          <strong>
                            {appointment.overdue ? 'Lịch gần nhất · Quá hạn' : 'Lịch gần nhất'}
                          </strong>
                          {' · '}
                          {formatDateTime(appointment.scheduledAt)}
                        </p>
                      ) : null}

                      {canUpdate ? (
                        <label className="mt-3 grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
                          <span>Chuyển trạng thái {lead.fullName}</span>
                          <select
                            aria-label={'Chuyển trạng thái ' + lead.fullName}
                            value={lead.status}
                            disabled={pending}
                            onChange={(event) =>
                              void commitStatus(
                                lead.id,
                                event.target.value as OperationalLeadStatus
                              )
                            }
                            className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-2 text-sm text-[var(--nupsbox-navy)] disabled:cursor-wait disabled:opacity-60"
                          >
                            {operationalLeadStatuses.map((nextStatus) => (
                              <option key={nextStatus} value={nextStatus}>
                                {leadStatusMeta[nextStatus].label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      <Link
                        href={'/admin/leads/' + lead.id}
                        className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[var(--nupsbox-blue)]"
                      >
                        Mở hồ sơ CRM →
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
