import {describe, expect, it} from 'vitest';
import {
  MAX_MEDIA_FILE_BYTES,
  prepareMediaUpload
} from '@/features/admin/media';

const metadata = {
  altVi: 'Hành lang kho',
  altEn: 'Storage corridor',
  category: 'location' as const,
  sortOrder: 10,
  isPublic: true,
  locationId: null,
  unitTypeId: null
};

describe('admin media upload contracts', () => {
  it('allows staff/admin image uploads with generated extension metadata', () => {
    expect(
      prepareMediaUpload('staff', metadata, {
        name: 'warehouse.webp',
        type: 'image/webp',
        size: 1024
      })
    ).toEqual({
      metadata: {
        alt_vi: 'Hành lang kho',
        alt_en: 'Storage corridor',
        category: 'location',
        sort_order: 10,
        is_public: true,
        location_id: null,
        unit_type_id: null
      },
      extension: 'webp'
    });
  });

  it('denies viewer uploads and unsafe or oversized files', () => {
    expect(() =>
      prepareMediaUpload('viewer', metadata, {
        name: 'warehouse.jpg',
        type: 'image/jpeg',
        size: 1024
      })
    ).toThrow('forbidden');

    expect(() =>
      prepareMediaUpload('staff', metadata, {
        name: 'payload.svg',
        type: 'image/svg+xml',
        size: 1024
      })
    ).toThrow('media_type_not_allowed');

    expect(() =>
      prepareMediaUpload('staff', metadata, {
        name: 'large.jpg',
        type: 'image/jpeg',
        size: MAX_MEDIA_FILE_BYTES + 1
      })
    ).toThrow('media_file_too_large');
  });
});
