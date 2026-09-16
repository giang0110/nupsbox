import {z} from 'zod';
import {PublicAppointmentRequestSchema} from '@/features/appointments/schema';
import {LeadInputSchema} from './schema';

export const PublicLeadRequestSchema = LeadInputSchema.extend({
  appointment: PublicAppointmentRequestSchema.optional()
}).strict();

export type PublicLeadRequest = z.infer<typeof PublicLeadRequestSchema>;
