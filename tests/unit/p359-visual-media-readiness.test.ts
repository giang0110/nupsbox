import {describe, expect, it} from 'vitest';
import {buildMediaReadinessSummary} from '@/features/admin/media-readiness';
import type {AdminMedia} from '@/features/admin/media';
import type {AdminBlog} from '@/features/admin/blog';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminUnitType} from '@/features/admin/unit-types';

const baseMedia: AdminMedia = {
  id: '11111111-1111-4111-8111-111111111111',
  storagePath: 'a.webp',
  publicUrl: 'https://example.com/a.webp',
  altVi: 'Ảnh kho NupsBox Tân Phú',
  altEn: 'NupsBox Tan Phu storage image',
  locationId: null,
  unitTypeId: null,
  category: 'location',
  sortOrder: 0,
  isPublic: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
};

const unit = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 's',
  nameVi: 'Kho S',
  nameEn: 'Storage S',
  areaM2: 2,
  recommendedForVi: null,
  recommendedForEn: null,
  capacityNoteVi: null,
  capacityNoteEn: null,
  sortOrder: 0,
  active: true,
  publishedAt: null,
  createdAt: '',
  updatedAt: ''
} satisfies AdminUnitType;

const location = {
  id: '33333333-3333-4333-8333-333333333333',
  slug: 'tan-phu',
  nameVi: 'Tân Phú',
  nameEn: 'Tan Phu',
  addressVi: '',
  addressEn: '',
  district: 'Tân Phú',
  city: 'HCM',
  latitude: null,
  longitude: null,
  phone: null,
  zaloUrl: null,
  openingHours: {},
  status: 'active',
  isFeatured: true,
  sortOrder: 0,
  publishedAt: null,
  createdAt: '',
  updatedAt: ''
} satisfies AdminLocation;

function blog(slug: string, coverMediaId: string | null = null): AdminBlog {
  return {
    id: '44444444-4444-4444-8444-' + (slug.length.toString().padStart(12, '0')),
    slug,
    status: 'published',
    publishedAt: '2026-01-01T00:00:00Z',
    coverMediaId,
    sourceUrl: null,
    authorId: null,
    createdAt: '',
    updatedAt: '',
    vi: {locale: 'vi', title: slug, excerpt: null, body: {}, seoTitle: null, seoDescription: null},
    en: {locale: 'en', title: slug, excerpt: null, body: {}, seoTitle: null, seoDescription: null}
  };
}

describe('P3.59 media readiness', () => {
  it('counts only public assets as valid coverage', () => {
    const summary = buildMediaReadinessSummary({
      media: [
        {...baseMedia, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', unitTypeId: unit.id, category: 'unit', isPublic: false},
        {...baseMedia, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', locationId: location.id}
      ],
      links: [],
      blogs: [],
      locations: [location],
      units: [unit],
      now: new Date('2026-09-30T00:00:00Z')
    });

    expect(summary.items.find(item => item.id === 'unit:' + unit.id)?.ready).toBe(false);
    expect(summary.items.find(item => item.id === 'location:' + location.id)?.ready).toBe(true);
  });

  it('mirrors blog visual hierarchy cover then blog mapping then topic mapping', () => {
    const coverId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const directId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const topicId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const posts = [
      blog('chon-dien-tich-kho-mini', coverId),
      blog('sap-xep-kho-shop-online'),
      blog('kho-cho-shop-online-tu-nha-ra-kho-rieng')
    ];
    const summary = buildMediaReadinessSummary({
      media: [
        {...baseMedia, id: coverId},
        {...baseMedia, id: directId},
        {...baseMedia, id: topicId}
      ],
      links: [
        {id: 'l1', mediaId: directId, contextType: 'blog', contextKey: 'sap-xep-kho-shop-online', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''},
        {id: 'l2', mediaId: topicId, contextType: 'topic', contextKey: 'ecommerce', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''}
      ],
      blogs: posts,
      locations: [],
      units: [],
      now: new Date('2026-09-30T00:00:00Z')
    });

    const sources = summary.items.filter(item => item.kind === 'blog').map(item => item.source);
    expect(sources).toEqual(['cover', 'mapping', 'topic']);
  });

  it('flags private mappings, weak alt and excessive reuse without mutating data', () => {
    const sharedId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const summary = buildMediaReadinessSummary({
      media: [
        {...baseMedia, id: sharedId, altVi: 'NupsBox', altEn: 'NupsBox storage'},
        {...baseMedia, id: '99999999-9999-4999-8999-999999999999', isPublic: false}
      ],
      links: [
        {id: 'l1', mediaId: sharedId, contextType: 'solution', contextKey: 'shop-online', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''},
        {id: 'l2', mediaId: sharedId, contextType: 'solution', contextKey: 'small-business', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''},
        {id: 'l3', mediaId: sharedId, contextType: 'solution', contextKey: 'inventory', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''},
        {id: 'l4', mediaId: sharedId, contextType: 'solution', contextKey: 'personal', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''},
        {id: 'l5', mediaId: '99999999-9999-4999-8999-999999999999', contextType: 'topic', contextKey: 'personal', role: 'feature', sortOrder: 0, createdAt: '', updatedAt: ''}
      ],
      blogs: [],
      locations: [],
      units: [],
      now: new Date('2026-09-30T00:00:00Z')
    });

    expect(summary.weakAltCount).toBe(1);
    expect(summary.brokenMappingCount).toBe(1);
    expect(summary.overusedMediaCount).toBe(1);
    expect(summary.overusedMedia[0].usageCount).toBe(4);
  });
});
