import type {SupabaseClient} from '@supabase/supabase-js';
import {
  isOperationalLeadStatus,
  operationalLeadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/leads';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {DatabaseWithAppointments} from '@/types/appointment-database';

export type AdminDashboardCounts = {
  leads: number;
  activeLocations: number;
  activeUnitTypes: number;
  faqs: number;
  publishedBlogPosts: number;
};

type NullableAdminDashboardCounts = {
  [Key in keyof AdminDashboardCounts]: number | null;
};

export type AdminDashboardStatusCounts = Record<OperationalLeadStatus, number>;

export type AdminDashboardCrm = {
  newLeads: number;
  inProgressLeads: number;
  upcomingAppointments: number;
  wonLeads: number;
  lostLeads: number;
  byStatus: AdminDashboardStatusCounts;
};

export type AdminDashboardLeadItem = {
  id: string;
  fullName: string;
  phone: string;
  status: OperationalLeadStatus;
  assignedTo: string | null;
  createdAt: string;
};

export type AdminDashboardAppointmentItem = {
  id: string;
  leadId: string;
  leadName: string | null;
  status: 'pending' | 'confirmed';
  scheduledAt: string;
  overdue: boolean;
};

export type AdminDashboardSummary = {
  crm: AdminDashboardCrm;
  attention: {
    newLeads: AdminDashboardLeadItem[];
    unassignedLeads: AdminDashboardLeadItem[];
    appointments: AdminDashboardAppointmentItem[];
  };
  health: {
    activeLocations: number;
    activeUnitTypes: number;
    faqs: number;
    publishedBlogPosts: number;
  };
};

export function normalizeAdminDashboardCounts(
  counts: NullableAdminDashboardCounts
): AdminDashboardCounts {
  return {
    leads: counts.leads ?? 0,
    activeLocations: counts.activeLocations ?? 0,
    activeUnitTypes: counts.activeUnitTypes ?? 0,
    faqs: counts.faqs ?? 0,
    publishedBlogPosts: counts.publishedBlogPosts ?? 0
  };
}

export function summarizeAdminCrmCounts(
  byStatus: AdminDashboardStatusCounts,
  upcomingAppointments: number
): AdminDashboardCrm {
  return {
    newLeads: byStatus.new,
    inProgressLeads:
      byStatus.contacted +
      byStatus.qualified +
      byStatus.viewing +
      byStatus.negotiating,
    upcomingAppointments,
    wonLeads: byStatus.won,
    lostLeads: byStatus.lost,
    byStatus
  };
}

function projectDashboardLead(row: {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
}): AdminDashboardLeadItem {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    status: isOperationalLeadStatus(row.status) ? row.status : 'new',
    assignedTo: row.assigned_to,
    createdAt: row.created_at
  };
}

export async function getAdminDashboardSummary(
  now = new Date()
): Promise<AdminDashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const appointmentClient =
    supabase as unknown as SupabaseClient<DatabaseWithAppointments>;
  const nowIso = now.toISOString();

  const statusCountResults = await Promise.all(
    operationalLeadStatuses.map((status) =>
      supabase
        .from('leads')
        .select('*', {count: 'exact', head: true})
        .eq('status', status)
    )
  );

  const [
    upcomingCount,
    newLeadRows,
    unassignedRows,
    overdueRows,
    upcomingRows,
    locations,
    unitTypes,
    faqs,
    blogPosts
  ] = await Promise.all([
    appointmentClient
      .from('lead_appointments')
      .select('*', {count: 'exact', head: true})
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', nowIso),
    supabase
      .from('leads')
      .select('id, full_name, phone, status, assigned_to, created_at')
      .eq('status', 'new')
      .order('created_at', {ascending: false})
      .limit(5),
    supabase
      .from('leads')
      .select('id, full_name, phone, status, assigned_to, created_at')
      .in('status', ['new', 'contacted', 'qualified', 'viewing', 'negotiating'])
      .is('assigned_to', null)
      .order('created_at', {ascending: false})
      .limit(5),
    appointmentClient
      .from('lead_appointments')
      .select('id, lead_id, status, scheduled_at')
      .eq('status', 'confirmed')
      .lt('scheduled_at', nowIso)
      .order('scheduled_at', {ascending: false})
      .limit(5),
    appointmentClient
      .from('lead_appointments')
      .select('id, lead_id, status, scheduled_at')
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', nowIso)
      .order('scheduled_at', {ascending: true})
      .limit(5),
    supabase
      .from('locations')
      .select('*', {count: 'exact', head: true})
      .eq('status', 'active'),
    supabase
      .from('unit_types')
      .select('*', {count: 'exact', head: true})
      .eq('active', true),
    supabase
      .from('faqs')
      .select('*', {count: 'exact', head: true})
      .eq('active', true),
    supabase
      .from('blog_posts')
      .select('*', {count: 'exact', head: true})
      .eq('status', 'published')
  ]);

  const firstError = [
    ...statusCountResults.map((result) => result.error),
    upcomingCount.error,
    newLeadRows.error,
    unassignedRows.error,
    overdueRows.error,
    upcomingRows.error,
    locations.error,
    unitTypes.error,
    faqs.error,
    blogPosts.error
  ].find(Boolean);

  if (firstError) throw firstError;

  const byStatus = Object.fromEntries(
    operationalLeadStatuses.map((status, index) => [
      status,
      statusCountResults[index].count ?? 0
    ])
  ) as AdminDashboardStatusCounts;

  const appointmentRows = [
    ...(overdueRows.data ?? []),
    ...(upcomingRows.data ?? [])
  ];
  const appointmentLeadIds = [
    ...new Set(appointmentRows.map((row) => row.lead_id))
  ];

  const leadNames = new Map<string, string>();
  if (appointmentLeadIds.length > 0) {
    const leadIdentityResult = await supabase
      .from('leads')
      .select('id, full_name')
      .in('id', appointmentLeadIds);

    if (leadIdentityResult.error) throw leadIdentityResult.error;
    for (const row of leadIdentityResult.data ?? []) {
      leadNames.set(row.id, row.full_name);
    }
  }

  const appointments: AdminDashboardAppointmentItem[] = appointmentRows.flatMap((row) => {
    if (row.status !== 'pending' && row.status !== 'confirmed') return [];

    return [{
      id: row.id,
      leadId: row.lead_id,
      leadName: leadNames.get(row.lead_id) ?? null,
      status: row.status,
      scheduledAt: row.scheduled_at,
      overdue: row.status === 'confirmed' && Date.parse(row.scheduled_at) < now.getTime()
    }];
  });

  const health = normalizeAdminDashboardCounts({
    leads: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
    activeLocations: locations.count,
    activeUnitTypes: unitTypes.count,
    faqs: faqs.count,
    publishedBlogPosts: blogPosts.count
  });

  return {
    crm: summarizeAdminCrmCounts(byStatus, upcomingCount.count ?? 0),
    attention: {
      newLeads: (newLeadRows.data ?? []).map(projectDashboardLead),
      unassignedLeads: (unassignedRows.data ?? []).map(projectDashboardLead),
      appointments
    },
    health: {
      activeLocations: health.activeLocations,
      activeUnitTypes: health.activeUnitTypes,
      faqs: health.faqs,
      publishedBlogPosts: health.publishedBlogPosts
    }
  };
}
