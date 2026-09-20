import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  BlogInputSchema,
  FaqInputSchema,
  MediaMetadataInputSchema
} from '@/features/admin/content-schemas';

const validBlog = {
  slug: 'production-readiness',
  titleVi: 'Sẵn sàng vận hành',
  titleEn: 'Production readiness',
  excerptVi: '',
  excerptEn: '',
  bodyVi: {type: 'doc', text: 'Nội dung'},
  bodyEn: {type: 'doc', text: 'Content'},
  seoTitleVi: '',
  seoTitleEn: '',
  seoDescriptionVi: '',
  seoDescriptionEn: '',
  coverMediaId: null,
  sourceUrl: ''
};

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.37 final production readiness', () => {
  it('bounds bilingual CMS payloads before they reach the database', () => {
    expect(BlogInputSchema.safeParse({
      ...validBlog,
      titleVi: 'x'.repeat(301)
    }).success).toBe(false);

    expect(BlogInputSchema.safeParse({
      ...validBlog,
      bodyVi: {text: 'x'.repeat(200_001)}
    }).success).toBe(false);

    expect(FaqInputSchema.safeParse({
      questionVi: 'Q',
      answerVi: 'x'.repeat(6001),
      questionEn: 'Q',
      answerEn: 'A',
      sortOrder: 0
    }).success).toBe(false);

    expect(MediaMetadataInputSchema.safeParse({
      altVi: 'x'.repeat(501),
      altEn: 'Storage image',
      category: 'location',
      sortOrder: 0,
      isPublic: true,
      locationId: null,
      unitTypeId: null
    }).success).toBe(false);
  });

  it('uses atomic RPCs for bilingual blog create and update', () => {
    const actions = source('app/admin/content/blog/actions.ts');
    expect(actions).toContain("rpc('create_blog_post_atomic'");
    expect(actions).toContain("rpc('update_blog_post_atomic'");
    expect(actions).not.toContain(".from('blog_translations')\n    .insert");
    expect(actions).not.toContain(".from('blog_translations')\n    .upsert");
  });

  it('enforces JSON media type and true UTF-8 byte limits for telemetry', () => {
    const route = source('app/api/telemetry/web-vitals/route.ts');
    expect(route).toContain("error: 'unsupported_media_type'");
    expect(route).toContain("new TextEncoder().encode(body).byteLength");
    expect(route).toContain("request.headers.get('content-length')");
  });

  it('records storage cleanup failures after metadata insert errors', () => {
    const actions = source('app/admin/content/media/actions.ts');
    expect(actions).toContain('media_upload_cleanup_failed');
    expect(actions).toContain('cleanupRows.length !== 1');
  });
});
