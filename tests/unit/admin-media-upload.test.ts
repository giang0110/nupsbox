import {describe, expect, it} from 'vitest';
import {
  MAX_MEDIA_FILE_BYTES,
  prepareMediaBulkUpdate,
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

  it('supports safe bulk metadata operations for staff', () => {
    const first = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
    const second = 'b8ba1e58-ece7-4a8a-844c-3b5edcbf8ab1';
    const location = 'c8ba1e58-ece7-4a8a-844c-3b5edcbf8ab2';

    expect(
      prepareMediaBulkUpdate('staff', [first, second, first], {
        visibility: 'public',
        category: 'security',
        locationId: location
      })
    ).toEqual({
      ids: [first, second],
      changes: {
        is_public: true,
        category: 'security',
        location_id: location
      }
    });

    expect(
      prepareMediaBulkUpdate('admin', [first], {
        visibility: 'keep',
        category: 'keep',
        locationId: '__clear__'
      })
    ).toEqual({ids: [first], changes: {location_id: null}});
  });

  it('rejects viewer, empty selection and no-op bulk media requests', () => {
    const id = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';

    expect(() =>
      prepareMediaBulkUpdate('viewer', [id], {
        visibility: 'public',
        category: 'keep',
        locationId: '__keep__'
      })
    ).toThrow('forbidden');

    expect(() =>
      prepareMediaBulkUpdate('staff', [], {
        visibility: 'public',
        category: 'keep',
        locationId: '__keep__'
      })
    ).toThrow();

    expect(() =>
      prepareMediaBulkUpdate('staff', [id], {
        visibility: 'keep',
        category: 'keep',
        locationId: '__keep__'
      })
    ).toThrow('bulk_media_no_changes');
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
