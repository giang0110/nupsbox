import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));

import {
  prepareMediaEditorialLinkCreate,
  prepareMediaEditorialLinkDelete
} from '@/features/admin/media-editorial';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.55 real media and commercial storytelling', () => {
  it('allows staff/admin to manage editorial mappings but rejects viewer writes', () => {
    const mediaId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
    const linkId = 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1';

    expect(prepareMediaEditorialLinkCreate('staff', {
      mediaId,
      contextType: 'blog',
      contextKey: 'chon-dien-tich-kho-mini',
      role: 'inline',
      sortOrder: 10
    })).toEqual({
      media_id: mediaId,
      context_type: 'blog',
      context_key: 'chon-dien-tich-kho-mini',
      role: 'inline',
      sort_order: 10
    });

    expect(prepareMediaEditorialLinkDelete('admin', linkId)).toEqual({id: linkId});

    expect(() => prepareMediaEditorialLinkCreate('viewer', {
      mediaId,
      contextType: 'solution',
      contextKey: 'shop-online',
      role: 'feature',
      sortOrder: 0
    })).toThrow('forbidden');
  });

  it('rejects malformed context keys and unsupported roles', () => {
    const mediaId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';

    expect(() => prepareMediaEditorialLinkCreate('staff', {
      mediaId,
      contextType: 'blog',
      contextKey: '../unsafe',
      role: 'inline',
      sortOrder: 0
    })).toThrow();

    expect(() => prepareMediaEditorialLinkCreate('staff', {
      mediaId,
      contextType: 'blog',
      contextKey: 'safe-slug',
      role: 'hero',
      sortOrder: 0
    })).toThrow();
  });

  it('keeps public storytelling explicitly labelled as real facility imagery', () => {
    const story = source('components/marketing/real-media-story.tsx');
    const solution = source('components/marketing/solution-page.tsx');
    const article = source('app/[locale]/blog/[slug]/page.tsx');

    expect(story).toContain('ẢNH CƠ SỞ THỰC TẾ');
    expect(story).toContain('không phải ảnh minh họa giả lập');
    expect(solution).toContain("getPublicEditorialMedia('solution'");
    expect(article).toContain("getPublicEditorialMedia('blog'");
    expect(solution).toContain('<RealMediaStory');
    expect(article).toContain('<RealMediaStory');
  });

  it('adds admin mapping controls and protects referenced media from deletion', () => {
    const admin = source('components/admin/media-editorial-manager.tsx');
    const page = source('app/admin/content/media/page.tsx');
    const actions = source('app/admin/content/media/actions.ts');

    expect(admin).toContain('Editorial Media Mapping');
    expect(admin).toContain('name="context"');
    expect(page).toContain('<MediaEditorialManager');
    expect(actions).toContain("from('media_editorial_links')");
    expect(actions).toContain('Hãy gỡ Editorial Media Mapping trước khi xoá ảnh');
  });

  it('ships RLS, audit and data-dependent seed mapping in one migration', () => {
    const migration = source('supabase/migrations/20260930000100_p355_real_media_storytelling.sql');

    expect(migration).toContain('create table public.media_editorial_links');
    expect(migration).toContain('media_editorial_links_public_read');
    expect(migration).toContain('media_editorial_links_staff_insert');
    expect(migration).toContain('media_editorial_links_cms_audit');
    expect(migration).toContain("('solution', 'shop-online', 'feature', 'lifestyle'");
    expect(migration).toContain("('blog', 'quan-ly-hang-ton-cham-luan-chuyen', 'inline', 'unit'");
    expect(migration).toContain('on conflict (media_id, context_type, context_key, role) do nothing');
  });
});
