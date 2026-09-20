import type {AdminUnitType} from '@/features/admin/unit-types';
import {getUnitTypePublicationReadiness} from '@/features/admin/unit-types';

export type UnitTypeLaunchSummary = {
  total: number;
  drafts: number;
  readyDrafts: number;
  active: number;
  nextAction: 'create' | 'complete' | 'publish' | 'pricing';
  nextHref: string;
  nextLabel: string;
};

export function summarizeUnitTypeLaunch(units: AdminUnitType[]): UnitTypeLaunchSummary {
  const active = units.filter(unit => unit.active);
  const drafts = units.filter(unit => !unit.active);
  const readyDrafts = drafts.filter(unit => getUnitTypePublicationReadiness(unit).ready);

  if (units.length === 0) {
    return {
      total: 0,
      drafts: 0,
      readyDrafts: 0,
      active: 0,
      nextAction: 'create',
      nextHref: '#new-unit',
      nextLabel: 'Tạo loại kho đầu tiên'
    };
  }

  if (readyDrafts.length > 0) {
    return {
      total: units.length,
      drafts: drafts.length,
      readyDrafts: readyDrafts.length,
      active: active.length,
      nextAction: 'publish',
      nextHref: '#saved-units',
      nextLabel: 'Xuất bản draft đã sẵn sàng'
    };
  }

  if (drafts.length > 0) {
    return {
      total: units.length,
      drafts: drafts.length,
      readyDrafts: 0,
      active: active.length,
      nextAction: 'complete',
      nextHref: '#saved-units',
      nextLabel: 'Hoàn thiện draft còn thiếu'
    };
  }

  return {
    total: units.length,
    drafts: 0,
    readyDrafts: 0,
    active: active.length,
    nextAction: 'pricing',
    nextHref: '/admin/catalog/pricing',
    nextLabel: 'Tiếp tục cấu hình giá'
  };
}
