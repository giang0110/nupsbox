import {describe, expect, it} from 'vitest';
import {toggleComparedUnit} from '@/features/catalog/compare';

describe('toggleComparedUnit', () => {
  it('adds and removes units', () => {
    expect(toggleComparedUnit([], 's')).toEqual(['s']);
    expect(toggleComparedUnit(['s'], 's')).toEqual([]);
  });

  it('caps comparison at three units without dropping prior choices', () => {
    expect(toggleComparedUnit(['s', 'm', 'l'], 'xl')).toEqual(['s', 'm', 'l']);
  });
});
