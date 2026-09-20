import {z} from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCatalogSlug(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const blankToNullString = (max = 1000) => z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(max).nullable().optional()
);

const blankToNullHttpUrl = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([
    z.string().trim().url().refine(value => /^https?:\/\//i.test(value), 'http_url_required'),
    z.null(),
    z.undefined()
  ])
).transform(value => value ?? null);

const blankToNullableNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    value => {
      if (value === '' || value === null || value === undefined) return null;
      if (typeof value === 'string') return Number(value);
      return value;
    },
    schema.nullable()
  );

export const LocationInputSchema = z
  .object({
    slug: z.preprocess(
      normalizeCatalogSlug,
      z.string().trim().min(1).regex(slugPattern)
    ),
    nameVi: z.string().trim().min(1).max(160),
    nameEn: z.string().trim().min(1).max(160),
    addressVi: z.string().trim().min(1).max(500),
    addressEn: z.string().trim().min(1).max(500),
    district: z.string().trim().min(1).max(120),
    city: z.string().trim().min(1).max(120).default('Ho Chi Minh City'),
    latitude: blankToNullableNumber(z.number().min(-90).max(90)).optional(),
    longitude: blankToNullableNumber(z.number().min(-180).max(180)).optional(),
    phone: blankToNullString(40),
    zaloUrl: blankToNullHttpUrl,
    openingHours: z.record(z.string(), z.unknown()).default({}),
    isFeatured: z.boolean().default(false),
    sortOrder: z.coerce.number().int().default(0)
  })
  .strict();

export const UnitTypeInputSchema = z
  .object({
    slug: z.preprocess(
      normalizeCatalogSlug,
      z.string().trim().min(1).regex(slugPattern)
    ),
    nameVi: z.string().trim().min(1),
    nameEn: z.string().trim().min(1),
    areaM2: z.coerce.number().positive(),
    recommendedForVi: blankToNullString(1200),
    recommendedForEn: blankToNullString(1200),
    capacityNoteVi: blankToNullString(1200),
    capacityNoteEn: blankToNullString(1200),
    sortOrder: z.coerce.number().int().default(0)
  })
  .strict();

const nullableMoney = blankToNullableNumber(z.number().nonnegative());
const nullableCount = blankToNullableNumber(z.number().int().nonnegative());

export const PricingInputSchema = z
  .object({
    locationId: z.string().uuid(),
    unitTypeId: z.string().uuid(),
    monthlyPrice: nullableMoney,
    promoPrice: nullableMoney,
    depositAmount: nullableMoney,
    availabilityStatus: z.enum(['available', 'limited', 'sold_out', 'contact']),
    availableCount: nullableCount.optional().default(null),
    featured: z.boolean().default(false)
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.monthlyPrice !== null &&
      value.promoPrice !== null &&
      value.promoPrice > value.monthlyPrice
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['promoPrice'],
        message: 'promo_price_exceeds_monthly_price'
      });
    }
  });

export type LocationInput = z.infer<typeof LocationInputSchema>;
export type UnitTypeInput = z.infer<typeof UnitTypeInputSchema>;
export type PricingInput = z.infer<typeof PricingInputSchema>;
