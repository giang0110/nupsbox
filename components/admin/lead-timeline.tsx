import {AdminEmptyState, AdminPanel} from '@/components/admin/admin-primitives';
import type {LeadTimelineItem} from '@/features/admin/lead-timeline';

const crmDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'medium',
  timeStyle: 'short'
});

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : crmDateTime.format(parsed);
}

const kindLabels: Record<LeadTimelineItem['kind'], string> = {
  note: 'Ghi chú',
  lead_status: 'Lead',
  appointment: 'Lịch hẹn'
};

export function LeadTimeline({items}: {items: LeadTimelineItem[]}) {
  return (
    <AdminPanel
      title="Timeline CRM"
      description="Lịch sử lead, ghi chú nội bộ và thay đổi lịch hẹn theo thứ tự thời gian."
    >
      {items.length ? (
        <ol className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.kind + '-' + item.id}
              className="rounded-xl border border-[var(--nupsbox-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--nupsbox-blue)]">
                  {kindLabels[item.kind]}
                </span>
                <strong className="text-[var(--nupsbox-navy)]">{item.title}</strong>
              </div>
              {item.detail ? (
                <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-navy)]">
                  {item.detail}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--nupsbox-slate)]">
                {formatDateTime(item.createdAt)}
                {item.actorName ? ' · ' + item.actorName : ''}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <AdminEmptyState
          title="Chưa có hoạt động CRM"
          description="Timeline sẽ hiển thị khi có thay đổi trạng thái, ghi chú hoặc lịch hẹn."
        />
      )}
    </AdminPanel>
  );
}
