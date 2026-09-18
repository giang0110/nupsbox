import type {LeadStatus} from '@/types/database';

export const operationalLeadStatuses = [
  'new',
  'contacted',
  'qualified',
  'viewing',
  'negotiating',
  'won',
  'lost'
] as const satisfies readonly LeadStatus[];

export const leadStatuses = operationalLeadStatuses;

export type OperationalLeadStatus = (typeof operationalLeadStatuses)[number];

export function isOperationalLeadStatus(
  value: unknown
): value is OperationalLeadStatus {
  return (
    typeof value === 'string' &&
    (operationalLeadStatuses as readonly string[]).includes(value)
  );
}
