import {describe, expect, it} from 'vitest';
import {prepareMediaDelete} from '@/features/admin/media';

describe('media deletion guard', () => {
  const id = '11111111-1111-4111-8111-111111111111';

  it('allows admin to delete a valid media id', () => {
    expect(prepareMediaDelete('admin', id)).toEqual({id});
  });

  it('rejects staff and viewer deletion', () => {
    expect(() => prepareMediaDelete('staff', id)).toThrow('forbidden');
    expect(() => prepareMediaDelete('viewer', id)).toThrow('forbidden');
  });

  it('rejects malformed media ids before any mutation', () => {
    expect(() => prepareMediaDelete('admin', 'not-an-id')).toThrow();
  });
});
