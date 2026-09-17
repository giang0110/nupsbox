import {z} from 'zod';
import {appointmentStatuses} from './domain';

const createUuid = z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.uuid().optional()
);

const patchUuid = z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? null : value,
  z.uuid().nullable().optional()
);

const optionalText = (max: number) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().max(max).optional()
);

const patchText = (max: number) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? null : value,
  z.string().trim().max(max).nullable().optional()
);

export const PublicAppointmentRequestSchema = z.object({
  scheduledAt: z.iso.datetime({offset: true}),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  customerNote: optionalText(1000)
}).strict();

export const AppointmentCreateInputSchema = z.object({
  leadId: z.uuid(),
  locationId: createUuid,
  unitTypeId: createUuid,
  assignedTo: createUuid,
  scheduledAt: z.iso.datetime({offset: true}),
  durationMinutes: z.coerce.number().int().min(15).max(180).default(30),
  customerNote: optionalText(1000),
  internalNote: optionalText(2000)
}).strict();

export const AppointmentUpdateInputSchema = z.object({
  appointmentId: z.uuid(),
  leadId: z.uuid(),
  expectedUpdatedAt: z.iso.datetime({offset: true}),
  locationId: patchUuid,
  unitTypeId: patchUuid,
  assignedTo: patchUuid,
  scheduledAt: z.iso.datetime({offset: true}).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(180).optional(),
  status: z.enum(appointmentStatuses).optional(),
  customerNote: patchText(1000),
  internalNote: patchText(2000)
}).strict();

export type PublicAppointmentRequest = z.infer<typeof PublicAppointmentRequestSchema>;
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateInputSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateInputSchema>;
