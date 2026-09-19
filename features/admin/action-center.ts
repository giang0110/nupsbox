import type {AdminContentCalendar} from '@/features/admin/content-calendar';
import type {AdminDashboardSummary} from '@/features/admin/dashboard';
import type {
  AdminQualityIssue,
  AdminQualityTone
} from '@/features/admin/quality';

export type AdminActionArea = 'crm' | 'content' | 'public';

export type AdminActionItem = {
  id: string;
  area: AdminActionArea;
  tone: AdminQualityTone;
  title: string;
  detail: string;
  href: string;
  count?: number;
};

export type AdminActionCenter = {
  items: AdminActionItem[];
  counts: Record<AdminQualityTone, number>;
  crmCount: number;
  contentCount: number;
  publicCount: number;
};

const toneOrder: Record<AdminQualityTone, number> = {
  danger: 0,
  warning: 1,
  info: 2
};

function qualityItem(issue: AdminQualityIssue): AdminActionItem {
  return {
    id: 'qa:' + issue.id,
    area: issue.area,
    tone: issue.tone,
    title: issue.title,
    detail: issue.detail,
    href: issue.href,
    count: issue.count
  };
}

export function buildAdminActionCenter(input: {
  qualityIssues: AdminQualityIssue[];
  calendar: AdminContentCalendar;
  dashboard: AdminDashboardSummary;
}): AdminActionCenter {
  const items: AdminActionItem[] = input.qualityIssues.map(qualityItem);

  const overdueAppointments = input.dashboard.attention.appointments.filter(
    appointment => appointment.overdue
  );

  if (overdueAppointments.length > 0) {
    items.push({
      id: 'crm:overdue-appointments',
      area: 'crm',
      tone: 'danger',
      title: 'Lịch xem kho đã quá giờ',
      detail: 'Có lịch đã xác nhận nhưng thời điểm xem kho đã qua. Mở CRM để cập nhật kết quả hoặc bước tiếp theo.',
      href: '/admin/leads',
      count: overdueAppointments.length
    });
  }

  if (input.calendar.next7Days.length > 0) {
    items.push({
      id: 'content:scheduled-next-7-days',
      area: 'content',
      tone: 'info',
      title: 'Nội dung sắp tự xuất bản',
      detail: 'Rà lại bài đã hẹn giờ trong 7 ngày tới trước khi nội dung trở thành public.',
      href: '/admin/content/calendar',
      count: input.calendar.next7Days.length
    });
  }

  if (input.calendar.drafts.length > 0) {
    items.push({
      id: 'content:drafts',
      area: 'content',
      tone: 'info',
      title: 'Draft đang chờ hoàn thiện',
      detail: 'Rà nội dung song ngữ, cover, nguồn và metadata trước khi xuất bản hoặc lên lịch.',
      href: '/admin/content/calendar',
      count: input.calendar.drafts.length
    });
  }

  items.sort((a, b) => {
    const toneDifference = toneOrder[a.tone] - toneOrder[b.tone];
    if (toneDifference !== 0) return toneDifference;
    return a.title.localeCompare(b.title, 'vi');
  });

  return {
    items,
    counts: {
      danger: items.filter(item => item.tone === 'danger').length,
      warning: items.filter(item => item.tone === 'warning').length,
      info: items.filter(item => item.tone === 'info').length
    },
    crmCount: items.filter(item => item.area === 'crm').length,
    contentCount: items.filter(item => item.area === 'content').length,
    publicCount: items.filter(item => item.area === 'public').length
  };
}
