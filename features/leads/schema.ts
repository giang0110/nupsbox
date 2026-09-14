import {z} from 'zod';

const optionalText = (max: number) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().max(max).optional()
);

const optionalEmail = z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().email().max(254).optional()
);

export const LeadInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().transform((value) => value.replace(/[\s().-]+/g, '')).pipe(
    z.string().regex(/^\+?[0-9]{8,15}$/)
  ),
  email: optionalEmail,
  preferredLanguage: z.enum(['vi', 'en']).default('vi'),
  locationId: z.uuid().optional(),
  unitTypeId: z.uuid().optional(),
  needType: z.enum(['shop_online', 'sme', 'inventory', 'personal', 'documents', 'other']).default('other'),
  estimatedVolume: z.enum(['under_20_boxes', 'boxes_20_50', 'over_50_boxes', 'unknown']).default('unknown'),
  message: optionalText(2000),
  website: z.string().max(0).optional().default(''),
  source: optionalText(120),
  landingPage: optionalText(500),
  referrer: optionalText(500),
  utmSource: optionalText(200),
  utmMedium: optionalText(200),
  utmCampaign: optionalText(200),
  utmContent: optionalText(200)
});

export type LeadInput = z.infer<typeof LeadInputSchema>;
