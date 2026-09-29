import {
  isOperationalLeadStatus,
  operationalLeadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/lead-status';
import type {AdminLeadRow} from '@/features/admin/leads';
import type {LeadInquiryType} from '@/features/leads/intake';

export type LeadWorkspaceView = 'table' | 'pipeline';

export const leadInquiryTypes: LeadInquiryType[] = [
  'service_advice',
  'quote',
  'partnership',
  'facility_info',
  'storage',
  'other'
];

export const leadInquiryTypeLabels: Record<LeadInquiryType, string> = {
  service_advice: 'Tư vấn dịch vụ',
  quote: 'Báo giá',
  partnership: 'Hợp tác',
  facility_info: 'Thông tin cơ sở',
  storage: 'Tư vấn lưu trữ',
  other: 'Yêu cầu khác'
};

function isLeadInquiryType(value: unknown): value is LeadInquiryType {
  return typeof value === 'string' && leadInquiryTypes.includes(value as LeadInquiryType);
}

export type LeadWorkspaceFilters = {
  view: LeadWorkspaceView;
  status?: OperationalLeadStatus;
  inquiryType?: LeadInquiryType;
  assignee?: string;
  source?: string;
  q?: string;
};

export const leadStatusMeta: Record<
  OperationalLeadStatus,
  {
    label: string;
    tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  }
> = {
  new: {label: 'Mới', tone: 'info'},
  contacted: {label: 'Đã liên hệ', tone: 'neutral'},
  qualified: {label: 'Đã xác nhận nhu cầu', tone: 'info'},
  viewing: {label: 'Đang xem kho', tone: 'warning'},
  negotiating: {label: 'Đang thương lượng', tone: 'warning'},
  won: {label: 'Đã thuê', tone: 'success'},
  lost: {label: 'Không chuyển đổi', tone: 'danger'}
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SearchParamValue = string | string[] | undefined;
type LeadWorkspaceSearchParams = Record<string, SearchParamValue>;

function firstString(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeShortText(value: SearchParamValue): string | undefined {
  const normalized = firstString(value)?.trim().slice(0, 80);
  return normalized ? normalized : undefined;
}

export function normalizeLeadWorkspaceQuery(
  searchParams: LeadWorkspaceSearchParams
): LeadWorkspaceFilters {
  const view = firstString(searchParams.view) === 'pipeline' ? 'pipeline' : 'table';
  const rawStatus = firstString(searchParams.status);
  const status = isOperationalLeadStatus(rawStatus) ? rawStatus : undefined;
  const rawInquiryType = firstString(searchParams.inquiry);
  const inquiryType = isLeadInquiryType(rawInquiryType) ? rawInquiryType : undefined;
  const rawAssignee = firstString(searchParams.assignee)?.trim();
  const assignee = rawAssignee && uuidPattern.test(rawAssignee) ? rawAssignee : undefined;
  const source = normalizeShortText(searchParams.source);
  const q = normalizeShortText(searchParams.q);

  return {
    view,
    ...(status ? {status} : {}),
    ...(inquiryType ? {inquiryType} : {}),
    ...(assignee ? {assignee} : {}),
    ...(source ? {source} : {}),
    ...(q ? {q} : {})
  };
}

export function buildLeadWorkspaceHref(
  filters: LeadWorkspaceFilters,
  patch: Partial<LeadWorkspaceFilters>
): string {
  const next = {...filters, ...patch};
  const params = new URLSearchParams();

  if (next.view === 'pipeline') params.set('view', 'pipeline');
  if (next.status) params.set('status', next.status);
  if (next.inquiryType) params.set('inquiry', next.inquiryType);
  if (next.assignee) params.set('assignee', next.assignee);
  if (next.source) params.set('source', next.source);
  if (next.q) params.set('q', next.q);

  const query = params.toString();
  return query ? '/admin/leads?' + query : '/admin/leads';
}

export function groupLeadsByStatus(
  leads: AdminLeadRow[]
): Record<OperationalLeadStatus, AdminLeadRow[]> {
  const grouped = Object.fromEntries(
    operationalLeadStatuses.map((status) => [status, [] as AdminLeadRow[]])
  ) as Record<OperationalLeadStatus, AdminLeadRow[]>;

  for (const lead of leads) {
    grouped[lead.status].push(lead);
  }

  return grouped;
}
