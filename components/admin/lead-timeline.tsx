import type {LeadTimelineItem} from '@/features/admin/lead-timeline';

type Props = {items: LeadTimelineItem[]};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh'
});

const kindLabels = {
  note: 'Ghi chú',
  lead_status: 'Trạng thái lead',
  appointment: 'Cuộc hẹn'
} as const;

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function LeadTimeline({items}: Props) {
  return (
    <section id="timeline" className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--nupsbox-blue)]">Hoạt động</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--nupsbox-navy)]">Timeline</h2>
        </div>
        <span className="text-xs font-bold text-[var(--nupsbox-slate)]">Audit từ database</span>
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <article key={`${item.kind}-${item.id}`} className="rounded-2xl border border-[var(--nupsbox-border)] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-black text-[var(--nupsbox-navy)]">{kindLabels[item.kind]} · {item.title}</p>
              <p className="text-xs text-[var(--nupsbox-slate)]">{formatDate(item.createdAt)}</p>
            </div>
            {item.detail ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--nupsbox-slate)]">{item.detail}</p> : null}
            <p className="mt-2 text-xs font-bold text-[var(--nupsbox-slate)]">{item.actorName ?? 'Hệ thống'}</p>
          </article>
        ))}
        {!items.length ? <p className="py-8 text-center text-sm text-[var(--nupsbox-slate)]">Chưa có hoạt động nào được ghi nhận.</p> : null}
      </div>
    </section>
  );
}
