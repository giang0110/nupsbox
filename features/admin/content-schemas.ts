import {z} from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const secretLikeKeyPattern = /(secret|token|service[_-]?role|api[_-]?key|password|salt)/i;

const blankToNullString = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().nullable().optional()
);

const nullableUuid = z.preprocess(
  value => (value === '' || value === null || value === undefined ? null : value),
  z.string().uuid().nullable()
);

export const FaqInputSchema = z
  .object({
    questionVi: z.string().trim().min(1),
    answerVi: z.string().trim().min(1),
    questionEn: z.string().trim().min(1),
    answerEn: z.string().trim().min(1),
    sortOrder: z.coerce.number().int().default(0)
  })
  .strict();

export const BlogInputSchema = z
  .object({
    slug: z.string().trim().min(1).regex(slugPattern),
    titleVi: z.string().trim().min(1),
    titleEn: z.string().trim().min(1),
    excerptVi: blankToNullString,
    excerptEn: blankToNullString,
    bodyVi: z.record(z.string(), z.unknown()),
    bodyEn: z.record(z.string(), z.unknown()),
    seoTitleVi: blankToNullString,
    seoTitleEn: blankToNullString,
    seoDescriptionVi: blankToNullString,
    seoDescriptionEn: blankToNullString,
    coverMediaId: nullableUuid.optional().default(null)
  })
  .strict();

export const MediaMetadataInputSchema = z
  .object({
    altVi: z.string().trim().min(1),
    altEn: z.string().trim().min(1),
    category: z.enum(['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle', 'blog']),
    sortOrder: z.coerce.number().int().default(0),
    isPublic: z.boolean(),
    locationId: nullableUuid.optional().default(null),
    unitTypeId: nullableUuid.optional().default(null)
  })
  .strict();

export const SiteSettingInputSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9_]+$/)
      .refine(value => !secretLikeKeyPattern.test(value), 'secret_like_setting_key'),
    value: z.unknown(),
    isPublic: z.boolean()
  })
  .strict();

export type FaqInput = z.infer<typeof FaqInputSchema>;
export type BlogInput = z.infer<typeof BlogInputSchema>;
export type MediaMetadataInput = z.infer<typeof MediaMetadataInputSchema>;
export type SiteSettingInput = z.infer<typeof SiteSettingInputSchema>;
