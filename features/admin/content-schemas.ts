import {z} from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeContentSlug(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const secretLikeKeyPattern = /(secret|token|service[_-]?role|api[_-]?key|password|salt)/i;

const blankToNullString = (max = 2000) => z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(max).nullable().optional()
);

const blogBodySchema = z
  .record(z.string(), z.unknown())
  .refine(value => JSON.stringify(value).length <= 200_000, 'blog_body_too_large');

const nullableUuid = z.preprocess(
  value => (value === '' || value === null || value === undefined ? null : value),
  z.string().uuid().nullable()
);

const blankToNullHttpUrl = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.union([
    z.string().trim().url().refine(value => /^https?:\/\//i.test(value), 'http_url_required'),
    z.null(),
    z.undefined()
  ])
).transform(value => value ?? null);

export const FaqInputSchema = z
  .object({
    questionVi: z.string().trim().min(1).max(500),
    answerVi: z.string().trim().min(1).max(6000),
    questionEn: z.string().trim().min(1).max(500),
    answerEn: z.string().trim().min(1).max(6000),
    sortOrder: z.coerce.number().int().default(0)
  })
  .strict();

export const BlogInputSchema = z
  .object({
    slug: z.preprocess(
      normalizeContentSlug,
      z.string().trim().min(1).max(160).regex(slugPattern)
    ),
    titleVi: z.string().trim().min(1).max(300),
    titleEn: z.string().trim().min(1).max(300),
    excerptVi: blankToNullString(1200),
    excerptEn: blankToNullString(1200),
    bodyVi: blogBodySchema,
    bodyEn: blogBodySchema,
    seoTitleVi: blankToNullString(300),
    seoTitleEn: blankToNullString(300),
    seoDescriptionVi: blankToNullString(1200),
    seoDescriptionEn: blankToNullString(1200),
    coverMediaId: nullableUuid.optional().default(null),
    sourceUrl: blankToNullHttpUrl
  })
  .strict();

export const MediaMetadataInputSchema = z
  .object({
    altVi: z.string().trim().min(1).max(500),
    altEn: z.string().trim().min(1).max(500),
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
