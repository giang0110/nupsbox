import {
  isOperationalLeadStatus,
  operationalLeadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/leads';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export type AnalyticsWindowDays = 7 | 30 | 90;

export type AdminAnalyticsBreakdownItem = {
  key: string;
  label: string;
  count: number;
  share: number;
};

export type AdminAnalyticsDailyItem = {
  date: string;
  count: number;
};

export type AdminLeadFunnelStage = {
  key: 'lead' | 'contacted' | 'qualified' | 'viewing' | 'won';
  label: string;
  count: number;
  shareOfLeads: number;
};

export type AdminLeadAnalytics = {
  days: AnalyticsWindowDays;
  fromIso: string;
  totalLeads: number;
  sampleSize: number;
  truncated: boolean;
  wonLeads: number;
  activeLeads: number;
  conversionRate: number;
  funnel: AdminLeadFunnelStage[];
  byStatus: Array<{status: OperationalLeadStatus; count: number; share: number}>;
  bySource: AdminAnalyticsBreakdownItem[];
  byNeedType: AdminAnalyticsBreakdownItem[];
  byLandingPage: AdminAnalyticsBreakdownItem[];
  byLanguage: AdminAnalyticsBreakdownItem[];
  byCampaign: AdminAnalyticsBreakdownItem[];
  daily: AdminAnalyticsDailyItem[];
};

type AnalyticsLeadRow = {
  created_at: string;
  status: string;
  source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  need_type: string;
  preferred_language: string;
};

type StatusCounts = Record<OperationalLeadStatus, number>;

const activeStatuses: OperationalLeadStatus[] = [
  'contacted',
  'qualified',
  'viewing',
  'negotiating'
];

export function normalizeAnalyticsDays(value: unknown): AnalyticsWindowDays {
  if (value === 7 || value === '7') return 7;
  if (value === 90 || value === '90') return 90;
  return 30;
}

export function hcmWindowStart(now: Date, days: AnalyticsWindowDays): Date {
  const hcmOffsetMs = 7 * 60 * 60 * 1000;
  const shifted = new Date(now.getTime() + hcmOffsetMs);
  shifted.setUTCDate(shifted.getUTCDate() - (days - 1));
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - hcmOffsetMs);
}

function hcmDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function normalizeLandingPage(value: string | null): string {
  if (!value) return 'Không xác định';
  const clean = value.trim().split('?')[0].split('#')[0].slice(0, 120);
  return clean.startsWith('/') ? clean : 'Khác';
}

function acquisitionSource(row: AnalyticsLeadRow): string {
  return row.utm_source?.trim() || row.source?.trim() || 'Direct / chưa xác định';
}

function campaign(row: AnalyticsLeadRow): string {
  return row.utm_campaign?.trim() || 'Không có campaign';
}

function breakdown(
  rows: AnalyticsLeadRow[],
  keyFor: (row: AnalyticsLeadRow) => string,
  limit = 8
): AdminAnalyticsBreakdownItem[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyFor(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const denominator = rows.length || 1;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({
      key,
      label: key,
      count,
      share: count / denominator
    }));
}

function buildDaily(rows: AnalyticsLeadRow[], days: AnalyticsWindowDays, now: Date): AdminAnalyticsDailyItem[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = hcmDateKey(row.created_at);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const output: AdminAnalyticsDailyItem[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const key = formatter.format(date);
    output.push({date: key, count: counts.get(key) ?? 0});
  }
  return output;
}

export function summarizeLeadAnalytics(
  rows: AnalyticsLeadRow[],
  statusCounts: StatusCounts,
  totalLeads: number,
  days: AnalyticsWindowDays,
  fromIso: string,
  now = new Date()
): AdminLeadAnalytics {
  const safeTotal = Math.max(totalLeads, 0);
  const wonLeads = statusCounts.won;
  const activeLeads = activeStatuses.reduce((sum, status) => sum + statusCounts[status], 0);
  const statusDenominator = safeTotal || 1;

  const reached = {
    lead: safeTotal,
    contacted: statusCounts.contacted + statusCounts.qualified + statusCounts.viewing + statusCounts.negotiating + statusCounts.won,
    qualified: statusCounts.qualified + statusCounts.viewing + statusCounts.negotiating + statusCounts.won,
    viewing: statusCounts.viewing + statusCounts.negotiating + statusCounts.won,
    won: statusCounts.won
  };
  const funnel: AdminLeadFunnelStage[] = [
    {key: 'lead', label: 'Lead', count: reached.lead, shareOfLeads: safeTotal ? 1 : 0},
    {key: 'contacted', label: 'Đã liên hệ+', count: reached.contacted, shareOfLeads: safeTotal ? reached.contacted / safeTotal : 0},
    {key: 'qualified', label: 'Qualified+', count: reached.qualified, shareOfLeads: safeTotal ? reached.qualified / safeTotal : 0},
    {key: 'viewing', label: 'Xem kho+', count: reached.viewing, shareOfLeads: safeTotal ? reached.viewing / safeTotal : 0},
    {key: 'won', label: 'Đã thuê', count: reached.won, shareOfLeads: safeTotal ? reached.won / safeTotal : 0}
  ];

  return {
    days,
    fromIso,
    totalLeads: safeTotal,
    sampleSize: rows.length,
    truncated: safeTotal > rows.length,
    wonLeads,
    activeLeads,
    conversionRate: safeTotal ? wonLeads / safeTotal : 0,
    funnel,
    byStatus: operationalLeadStatuses.map(status => ({
      status,
      count: statusCounts[status],
      share: statusCounts[status] / statusDenominator
    })),
    bySource: breakdown(rows, acquisitionSource),
    byNeedType: breakdown(rows, row => row.need_type || 'other', 6),
    byLandingPage: breakdown(rows, row => normalizeLandingPage(row.landing_page), 8),
    byLanguage: breakdown(rows, row => row.preferred_language === 'en' ? 'English' : 'Tiếng Việt', 4),
    byCampaign: breakdown(rows, campaign, 8),
    daily: buildDaily(rows, days, now)
  };
}

export async function getAdminLeadAnalytics(
  days: AnalyticsWindowDays,
  now = new Date()
): Promise<AdminLeadAnalytics> {
  const supabase = await createSupabaseServerClient();
  const fromIso = hcmWindowStart(now, days).toISOString();

  const statusResults = await Promise.all(
    operationalLeadStatuses.map(status =>
      supabase
        .from('leads')
        .select('*', {count: 'exact', head: true})
        .eq('status', status)
        .gte('created_at', fromIso)
    )
  );

  const [totalResult, rowsResult] = await Promise.all([
    supabase
      .from('leads')
      .select('*', {count: 'exact', head: true})
      .gte('created_at', fromIso),
    supabase
      .from('leads')
      .select('created_at, status, source, utm_source, utm_campaign, landing_page, need_type, preferred_language')
      .gte('created_at', fromIso)
      .order('created_at', {ascending: false})
      .limit(1000)
  ]);

  const firstError = [
    ...statusResults.map(result => result.error),
    totalResult.error,
    rowsResult.error
  ].find(Boolean);
  if (firstError) throw firstError;

  const statusCounts = Object.fromEntries(
    operationalLeadStatuses.map((status, index) => [
      status,
      statusResults[index].count ?? 0
    ])
  ) as StatusCounts;

  const rows = (rowsResult.data ?? []).filter(row => isOperationalLeadStatus(row.status));

  return summarizeLeadAnalytics(
    rows as AnalyticsLeadRow[],
    statusCounts,
    totalResult.count ?? 0,
    days,
    fromIso,
    now
  );
}
