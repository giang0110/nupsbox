import Link from 'next/link';
import {
  buildLeadWorkspaceHref,
  leadStatusMeta,
  type LeadWorkspaceFilters
} from '@/features/admin/lead-workspace';
import {operationalLeadStatuses} from '@/features/admin/lead-status';
import type {LeadAssigneeOption} from '@/features/admin/leads';

export function LeadFilterBar({
  filters,
  assignees,
  sources
}: {
  filters: LeadWorkspaceFilters;
  assignees: LeadAssigneeOption[];
  sources: string[];
}) {
  const clearHref = buildLeadWorkspaceHref(filters, {
    status: undefined,
    assignee: undefined,
    source: undefined,
    q: undefined
  });
  const tableHref = buildLeadWorkspaceHref(filters, {view: 'table'});
  const pipelineHref = buildLeadWorkspaceHref(filters, {view: 'pipeline'});

  return (
    <form
      method="get"
      className="grid gap-3 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(13rem,2fr)_repeat(3,minmax(10rem,1fr))_auto_auto]"
    >
      <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-full">
        <Link
          href={tableHref}
          aria-current={filters.view === 'table' ? 'page' : undefined}
          className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)] aria-[current=page]:border-[var(--nupsbox-blue)] aria-[current=page]:bg-blue-50 aria-[current=page]:text-[var(--nupsbox-blue)]"
        >
          Bảng
        </Link>
        <Link
          href={pipelineHref}
          aria-current={filters.view === 'pipeline' ? 'page' : undefined}
          className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)] aria-[current=page]:border-[var(--nupsbox-blue)] aria-[current=page]:bg-blue-50 aria-[current=page]:text-[var(--nupsbox-blue)]"
        >
          Pipeline
        </Link>
      </div>

      {filters.view === 'pipeline' ? <input type="hidden" name="view" value="pipeline" /> : null}

      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
        Tìm kiếm
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ''}
          maxLength={80}
          placeholder="Tên, số điện thoại hoặc email"
          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]"
        />
      </label>

      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
        Trạng thái
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]"
        >
          <option value="">Tất cả</option>
          {operationalLeadStatuses.map((status) => (
            <option key={status} value={status}>
              {leadStatusMeta[status].label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
        Phụ trách
        <select
          name="assignee"
          defaultValue={filters.assignee ?? ''}
          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]"
        >
          <option value="">Tất cả</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.fullName}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
        Nguồn
        <select
          name="source"
          defaultValue={filters.source ?? ''}
          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]"
        >
          <option value="">Tất cả</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="min-h-11 self-end rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-bold text-white"
      >
        Lọc
      </button>
      <Link
        href={clearHref}
        className="inline-flex min-h-11 items-center justify-center self-end rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
      >
        Xóa lọc
      </Link>
    </form>
  );
}
