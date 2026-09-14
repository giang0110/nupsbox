import {describe, expect, it} from 'vitest';
import {PRIVATE_AREA_METADATA} from '@/features/seo/private-metadata';

describe('private route metadata', () => {
  it('keeps admin and auth surfaces out of search indexes', () => {
    expect(PRIVATE_AREA_METADATA.robots).toEqual({index: false, follow: false});
  });
});
