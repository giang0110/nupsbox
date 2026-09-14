import type {StorageVolume} from './types';

export const volumeRule: Record<StorageVolume, {preferredIndex: number; consult: boolean}> = {
  under_20: {preferredIndex: 0, consult: false},
  '20_50': {preferredIndex: 1, consult: false},
  over_50: {preferredIndex: Number.POSITIVE_INFINITY, consult: true},
  unknown: {preferredIndex: 0, consult: true}
};
