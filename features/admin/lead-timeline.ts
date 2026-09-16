import type {OperationalLeadStatus} from '@/features/admin/leads';

export type LeadTimelineItem = {
  id: string;
  kind: 'note' | 'lead_status' | 'appointment';
  createdAt: string;
  title: string;
  detail: string | null;
  actorName: string | null;
};

export type LeadTimelineInput = {
  notes: Array<{id: string; note: string; authorName: string | null; createdAt: string}>;
  statusHistory: Array<{
    id: string;
    fromStatus: OperationalLeadStatus | null;
    toStatus: OperationalLeadStatus;
    changedByName: string | null;
    createdAt: string;
  }>;
  appointmentHistory: Array<{id: string; eventType: string; changedByName: string | null; createdAt: string}>;
};

export function buildLeadTimeline(input: LeadTimelineInput): LeadTimelineItem[] {
  return [
    ...input.notes.map((note) => ({
      id: note.id,
      kind: 'note' as const,
      createdAt: note.createdAt,
      title: 'Internal note',
      detail: note.note,
      actorName: note.authorName
    })),
    ...input.statusHistory.map((entry) => ({
      id: entry.id,
      kind: 'lead_status' as const,
      createdAt: entry.createdAt,
      title: 'Lead status changed',
      detail: `${entry.fromStatus ?? 'new'} → ${entry.toStatus}`,
      actorName: entry.changedByName
    })),
    ...input.appointmentHistory.map((entry) => ({
      id: entry.id,
      kind: 'appointment' as const,
      createdAt: entry.createdAt,
      title: 'Appointment updated',
      detail: entry.eventType,
      actorName: entry.changedByName
    }))
  ].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}
