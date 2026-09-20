import type {AdminMedia} from '@/features/admin/media';

export type MediaLaunchSummary = {
  total: number;
  publicCount: number;
  completeAltCount: number;
  mappedLocationCount: number;
  mappedUnitCount: number;
  heroCount: number;
  issueCount: number;
  score: number;
};

function hasText(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function summarizeMediaLaunch(media: AdminMedia[]): MediaLaunchSummary {
  const total = media.length;
  const publicCount = media.filter(item => item.isPublic).length;
  const completeAltCount = media.filter(item => hasText(item.altVi) && hasText(item.altEn)).length;
  const mappedLocationCount = media.filter(item => item.locationId !== null).length;
  const mappedUnitCount = media.filter(item => item.unitTypeId !== null).length;
  const heroCount = media.filter(item => item.isPublic && item.category === 'hero' && item.locationId !== null).length;

  const publicIssues = media.filter(item =>
    item.isPublic && (
      !hasText(item.altVi) ||
      !hasText(item.altEn) ||
      item.locationId === null
    )
  ).length;

  const scoredChecks = total === 0
    ? 0
    : (
      publicCount / total +
      completeAltCount / total +
      mappedLocationCount / total +
      (heroCount > 0 ? 1 : 0)
    ) / 4;

  return {
    total,
    publicCount,
    completeAltCount,
    mappedLocationCount,
    mappedUnitCount,
    heroCount,
    issueCount: publicIssues,
    score: Math.round(scoredChecks * 100)
  };
}
