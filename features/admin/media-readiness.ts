import type {AdminBlog} from '@/features/admin/blog';
import type {AdminLocation} from '@/features/admin/locations';
import type {AdminMedia} from '@/features/admin/media';
import type {AdminMediaEditorialLink} from '@/features/admin/media-editorial';
import type {AdminUnitType} from '@/features/admin/unit-types';
import {getEditorialProfile} from '@/features/content/editorial-taxonomy';

export type VisualCoverageKind = 'solution' | 'unit' | 'location' | 'blog';

export type VisualCoverageItem = {
  id: string;
  kind: VisualCoverageKind;
  label: string;
  ready: boolean;
  source: 'mapping' | 'asset' | 'cover' | 'topic' | 'missing';
  href: string;
  note: string;
};

export type OverusedMedia = {
  mediaId: string;
  label: string;
  usageCount: number;
};

export type MediaRemediationIssue = 'weak-alt' | 'broken-mapping' | 'overused';

export type MediaReadinessSummary = {
  totalContexts: number;
  coveredContexts: number;
  missingContexts: number;
  score: number;
  weakAltCount: number;
  brokenMappingCount: number;
  overusedMediaCount: number;
  weakAltMediaIds: string[];
  brokenMappingIds: string[];
  brokenMappingMediaIds: string[];
  items: VisualCoverageItem[];
  overusedMedia: OverusedMedia[];
};

const solutionContexts = [
  {key: 'shop-online', label: 'Giải pháp · Shop online'},
  {key: 'small-business', label: 'Giải pháp · Doanh nghiệp nhỏ'},
  {key: 'inventory', label: 'Giải pháp · Hàng tồn'},
  {key: 'personal', label: 'Giải pháp · Cá nhân'}
] as const;

const locationCategories = new Set(['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle']);
const unitCategories = new Set(['unit', 'hero', 'lifestyle', 'location']);

export function hasWeakMediaAlt(item: AdminMedia) {
  const vi = item.altVi.trim().toLowerCase();
  const en = item.altEn.trim().toLowerCase();
  const generic = new Set(['nupsbox', 'nupsbox storage']);
  return vi.length < 10 || en.length < 10 || generic.has(vi) || generic.has(en);
}

function isLiveBlog(blog: AdminBlog, now: Date) {
  if (blog.status !== 'published') return false;
  if (!blog.publishedAt) return true;
  const publishedAt = new Date(blog.publishedAt);
  return !Number.isNaN(publishedAt.getTime()) && publishedAt.getTime() <= now.getTime();
}

export function buildMediaReadinessSummary({
  media,
  links,
  blogs,
  locations,
  units,
  now = new Date()
}: {
  media: AdminMedia[];
  links: AdminMediaEditorialLink[];
  blogs: AdminBlog[];
  locations: AdminLocation[];
  units: AdminUnitType[];
  now?: Date;
}): MediaReadinessSummary {
  const mediaById = new Map(media.map(item => [item.id, item]));
  const publicMedia = media.filter(item => item.isPublic);
  const publicMediaIds = new Set(publicMedia.map(item => item.id));
  const usableLinks = links.filter(link => publicMediaIds.has(link.mediaId));
  const linkKeys = new Set(usableLinks.map(link => `${link.contextType}:${link.contextKey}`));
  const items: VisualCoverageItem[] = [];

  for (const solution of solutionContexts) {
    const ready = linkKeys.has(`solution:${solution.key}`);
    items.push({
      id: `solution:${solution.key}`,
      kind: 'solution',
      label: solution.label,
      ready,
      source: ready ? 'mapping' : 'missing',
      href: `/admin/content/media?context=${encodeURIComponent(`solution:${solution.key}`)}#editorial-media-mapping`,
      note: ready ? 'Có mapping tới asset public.' : 'Thiếu mapping solution tới asset public.'
    });
  }

  for (const unit of units.filter(item => item.active)) {
    const ready = publicMedia.some(item =>
      item.unitTypeId === unit.id && unitCategories.has(item.category)
    );
    items.push({
      id: `unit:${unit.id}`,
      kind: 'unit',
      label: `Loại kho · ${unit.nameVi}`,
      ready,
      source: ready ? 'asset' : 'missing',
      href: `/admin/content/media?unit=${unit.id}#media-upload`,
      note: ready ? 'Có asset public gắn đúng loại kho.' : 'Thiếu asset public gắn đúng unit_type_id.'
    });
  }

  for (const location of locations.filter(item => item.status === 'active')) {
    const ready = publicMedia.some(item =>
      item.locationId === location.id && locationCategories.has(item.category)
    );
    items.push({
      id: `location:${location.id}`,
      kind: 'location',
      label: `Địa điểm · ${location.nameVi}`,
      ready,
      source: ready ? 'asset' : 'missing',
      href: `/admin/content/media?location=${location.id}#media-upload`,
      note: ready ? 'Có gallery asset public cho địa điểm.' : 'Thiếu gallery asset public gắn đúng location_id.'
    });
  }

  for (const blog of blogs.filter(item => isLiveBlog(item, now))) {
    const coverReady = Boolean(blog.coverMediaId && publicMediaIds.has(blog.coverMediaId));
    const directReady = linkKeys.has(`blog:${blog.slug}`);
    const topic = getEditorialProfile(blog.slug).topic;
    const topicReady = linkKeys.has(`topic:${topic}`);
    const source = coverReady ? 'cover' : directReady ? 'mapping' : topicReady ? 'topic' : 'missing';
    items.push({
      id: `blog:${blog.id}`,
      kind: 'blog',
      label: `Blog · ${blog.vi.title || blog.slug}`,
      ready: source !== 'missing',
      source,
      href: source === 'cover'
        ? '/admin/content/blog'
        : `/admin/content/media?context=${encodeURIComponent(`blog:${blog.slug}`)}#editorial-media-mapping`,
      note: source === 'cover'
        ? 'Có cover public.'
        : source === 'mapping'
          ? 'Có mapping trực tiếp tới asset public.'
          : source === 'topic'
            ? `Dùng fallback topic: ${topic}.`
            : 'Thiếu cover public, mapping blog và mapping topic.'
    });
  }

  const weakAltMediaIds = publicMedia.filter(hasWeakMediaAlt).map(item => item.id);
  const brokenMappings = links.filter(link => !publicMediaIds.has(link.mediaId));
  const brokenMappingIds = brokenMappings.map(link => link.id);
  const brokenMappingMediaIds = [...new Set(
    brokenMappings
      .map(link => link.mediaId)
      .filter(mediaId => mediaById.has(mediaId))
  )];
  const brokenMappingCount = brokenMappings.length;
  const usageByMedia = new Map<string, Set<string>>();

  function addUsage(mediaId: string | null | undefined, key: string) {
    if (!mediaId || !mediaById.has(mediaId)) return;
    const current = usageByMedia.get(mediaId) ?? new Set<string>();
    current.add(key);
    usageByMedia.set(mediaId, current);
  }

  for (const link of usableLinks) addUsage(link.mediaId, `editorial:${link.contextType}:${link.contextKey}`);
  for (const blog of blogs.filter(item => isLiveBlog(item, now))) addUsage(blog.coverMediaId, `cover:${blog.slug}`);
  for (const item of publicMedia) {
    if (item.locationId) addUsage(item.id, `location:${item.locationId}`);
    if (item.unitTypeId) addUsage(item.id, `unit:${item.unitTypeId}`);
  }

  const overusedMedia = [...usageByMedia.entries()]
    .filter(([, usages]) => usages.size > 3)
    .map(([mediaId, usages]) => {
      const item = mediaById.get(mediaId);
      return {
        mediaId,
        label: item?.altVi || item?.storagePath || mediaId,
        usageCount: usages.size
      };
    })
    .sort((a, b) => b.usageCount - a.usageCount);

  const coveredContexts = items.filter(item => item.ready).length;
  const totalContexts = items.length;
  const missingContexts = totalContexts - coveredContexts;

  return {
    totalContexts,
    coveredContexts,
    missingContexts,
    score: totalContexts ? Math.round((coveredContexts / totalContexts) * 100) : 100,
    weakAltCount: weakAltMediaIds.length,
    brokenMappingCount,
    overusedMediaCount: overusedMedia.length,
    weakAltMediaIds,
    brokenMappingIds,
    brokenMappingMediaIds,
    items,
    overusedMedia
  };
}


export function getMediaIdsForRemediation(
  summary: MediaReadinessSummary,
  issue: MediaRemediationIssue | null
): Set<string> | null {
  if (!issue) return null;
  if (issue === 'weak-alt') return new Set(summary.weakAltMediaIds);
  if (issue === 'broken-mapping') return new Set(summary.brokenMappingMediaIds);
  return new Set(summary.overusedMedia.map(item => item.mediaId));
}
