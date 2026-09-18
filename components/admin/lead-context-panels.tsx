import {AdminPanel} from '@/components/admin/admin-primitives';
import type {AdminLeadDetail} from '@/features/admin/leads';

const needTypeLabels: Record<string, string> = {
  shop_online: 'Bán hàng online',
  sme: 'Doanh nghiệp nhỏ / SME',
  inventory: 'Lưu hàng hóa / tồn kho',
  personal: 'Đồ dùng cá nhân',
  documents: 'Hồ sơ / tài liệu',
  other: 'Nhu cầu khác'
};

const volumeLabels: Record<string, string> = {
  under_20_boxes: 'Dưới 20 thùng',
  boxes_20_50: '20–50 thùng',
  over_50_boxes: 'Trên 50 thùng',
  unknown: 'Chưa xác định'
};

function Field({
  label,
  value,
  fallbackId
}: {
  label: string;
  value: string | null;
  fallbackId?: string | null;
}) {
  const shown = value ?? fallbackId;

  return (
    <div className="rounded-xl bg-[var(--nupsbox-surface)] p-4">
      <dt className="text-xs font-black uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
        {label}
      </dt>
      <dd className="mt-2 break-words font-bold text-[var(--nupsbox-navy)]">
        {shown ?? 'Chưa có'}
      </dd>
      {!value && fallbackId ? (
        <p className="mt-1 text-[0.68rem] text-[var(--nupsbox-muted)]">ID tham chiếu</p>
      ) : null}
    </div>
  );
}

export function LeadContextPanels({
  lead,
  locationLabel,
  unitTypeLabel,
  className
}: {
  lead: AdminLeadDetail;
  locationLabel: string | null;
  unitTypeLabel: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <AdminPanel
        title="Nhu cầu lưu trữ"
        description="Thông tin nghiệp vụ cần ưu tiên khi trao đổi với khách hàng."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Nhu cầu" value={needTypeLabels[lead.needType] ?? lead.needType} />
          <Field
            label="Quy mô ước tính"
            value={volumeLabels[lead.estimatedVolume] ?? lead.estimatedVolume}
          />
          <Field label="Địa điểm" value={locationLabel} fallbackId={lead.locationId} />
          <Field label="Loại kho" value={unitTypeLabel} fallbackId={lead.unitTypeId} />
        </dl>
        {lead.message ? (
          <div className="mt-4 rounded-xl border border-[var(--nupsbox-border)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              Tin nhắn khách hàng
            </p>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-[var(--nupsbox-navy)]">
              {lead.message}
            </p>
          </div>
        ) : null}
      </AdminPanel>

      <details className="mt-4 rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm">
        <summary className="min-h-11 cursor-pointer px-5 py-4 font-black text-[var(--nupsbox-navy)]">
          Nguồn & attribution
        </summary>
        <dl className="grid gap-3 border-t border-[var(--nupsbox-border)] p-5 sm:grid-cols-2">
          <Field label="Nguồn" value={lead.source} />
          <Field label="UTM source" value={lead.utmSource} />
          <Field label="UTM medium" value={lead.utmMedium} />
          <Field label="UTM campaign" value={lead.utmCampaign} />
          <Field label="UTM content" value={lead.utmContent} />
          <Field label="Landing page" value={lead.landingPage} />
          <Field label="Referrer" value={lead.referrer} />
        </dl>
      </details>
    </div>
  );
}
