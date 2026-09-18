export type LeadTimelineItem = {
  id: string;
  kind: 'note' | 'lead_status' | 'appointment';
  createdAt: string;
  title: string;
  detail: string | null;
  actorName: string | null;
};

type NoteInput = {
  id: string;
  note: string;
  authorName: string | null;
  createdAt: string;
};

type StatusHistoryInput = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByName: string | null;
  createdAt: string;
};

type AppointmentHistoryInput = {
  id: string;
  eventType: string;
  changedByName: string | null;
  createdAt: string;
};

export type LeadTimelineInput = {
  notes: readonly NoteInput[];
  statusHistory: readonly StatusHistoryInput[];
  appointmentHistory: readonly AppointmentHistoryInput[];
};

const appointmentEventLabels: Record<string, string> = {
  created: 'Tạo lịch hẹn',
  rescheduled: 'Đổi thời gian',
  location_changed: 'Đổi địa điểm',
  unit_type_changed: 'Đổi loại kho',
  assignee_changed: 'Đổi người phụ trách',
  status_changed: 'Đổi trạng thái',
  details_changed: 'Cập nhật chi tiết'
};

function timestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildLeadTimeline(input: LeadTimelineInput): LeadTimelineItem[] {
  const notes: LeadTimelineItem[] = input.notes.map((note) => ({
    id: note.id,
    kind: 'note',
    createdAt: note.createdAt,
    title: 'Ghi chú nội bộ',
    detail: note.note,
    actorName: note.authorName
  }));

  const leadStatuses: LeadTimelineItem[] = input.statusHistory.map((entry) => ({
    id: entry.id,
    kind: 'lead_status',
    createdAt: entry.createdAt,
    title: 'Trạng thái lead',
    detail: (entry.fromStatus ?? '—') + ' → ' + entry.toStatus,
    actorName: entry.changedByName
  }));

  const appointments: LeadTimelineItem[] = input.appointmentHistory.map((entry) => ({
    id: entry.id,
    kind: 'appointment',
    createdAt: entry.createdAt,
    title: 'Lịch hẹn',
    detail: appointmentEventLabels[entry.eventType] ?? entry.eventType,
    actorName: entry.changedByName
  }));

  return [...notes, ...leadStatuses, ...appointments]
    .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
}
