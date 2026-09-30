import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState, AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {MediaBulkManager} from '@/components/admin/media-bulk-manager';
import {MediaEditorialManager} from '@/components/admin/media-editorial-manager';
import {MediaMetadataForm} from '@/components/admin/media-metadata-form';
import {MediaReadinessDashboard} from '@/components/admin/media-readiness-dashboard';
import {MediaUploadForm} from '@/components/admin/media-upload-form';
import {Container} from '@/components/ui/container';
import {listAdminBlogs} from '@/features/admin/blog';
import {listAdminLocations} from '@/features/admin/locations';
import {listAdminMedia} from '@/features/admin/media';
import {listAdminMediaEditorialLinks} from '@/features/admin/media-editorial';
import {listAdminUnitTypes} from '@/features/admin/unit-types';
import {summarizeMediaLaunch} from '@/features/admin/media-launch';
import {
  buildMediaReadinessSummary,
  getMediaIdsForRemediation,
  parseMediaRemediationIssue
} from '@/features/admin/media-readiness';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminMediaPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminUser();
  if (!can(session.role, 'media:read')) redirect('/admin');

  const params = await searchParams;
  const requestedLocationId = Array.isArray(params.location) ? params.location[0] : params.location;
  const requestedUnitId = Array.isArray(params.unit) ? params.unit[0] : params.unit;
  const requestedIssue = Array.isArray(params.issue) ? params.issue[0] : params.issue;
  const requestedContext = Array.isArray(params.context) ? params.context[0] : params.context;
  const activeIssue = parseMediaRemediationIssue(requestedIssue);
  const defaultEditorialContext = requestedContext && /^(solution|blog|topic):[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requestedContext)
    ? requestedContext
    : undefined;

  const [mediaRows, locations, units, editorialLinks, blogs] = await Promise.all([
    listAdminMedia(),
    listAdminLocations(),
    listAdminUnitTypes(),
    listAdminMediaEditorialLinks(),
    listAdminBlogs()
  ]);
  const canEdit = can(session.role, 'media:update');
  const canCreate = can(session.role, 'media:create');
  const canDelete = can(session.role, 'media:delete');
  const locationOptions = locations.map((location) => ({id: location.id, label: location.nameVi}));
  const unitOptions = units.map((unit) => ({id: unit.id, label: unit.nameVi + ' · ' + unit.areaM2 + ' m²'}));
  const defaultLocationId = locations.some(location => location.id === requestedLocationId) ? requestedLocationId : undefined;
  const defaultUnitTypeId = units.some(unit => unit.id === requestedUnitId) ? requestedUnitId : undefined;
  const mediaReadiness = buildMediaReadinessSummary({
    media: mediaRows,
    links: editorialLinks,
    blogs,
    locations,
    units
  });
  const remediationMediaIds = getMediaIdsForRemediation(mediaReadiness, activeIssue);
  const overusedUsageByMediaId = new Map(
    mediaReadiness.overusedMedia.map(item => [item.mediaId, item.usageCount])
  );
  const visibleMedia = mediaRows.filter(media =>
    (!defaultLocationId || media.locationId === defaultLocationId) &&
    (!defaultUnitTypeId || media.unitTypeId === defaultUnitTypeId) &&
    (!remediationMediaIds || remediationMediaIds.has(media.id))
  );
  const selectedLocation = locations.find(location => location.id === defaultLocationId);
  const selectedUnit = units.find(unit => unit.id === defaultUnitTypeId);
  const launch = summarizeMediaLaunch(visibleMedia);
  const locationSlugById = Object.fromEntries(locations.map(location => [location.id, location.slug]));
  const unitSlugById = Object.fromEntries(units.map(unit => [unit.id, unit.slug]));

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="MEDIA CMS"
          title="Hình ảnh kho & media"
          description="Upload ảnh, quản lý metadata/location và gán ảnh thật vào Blog, Solution hoặc chủ đề editorial mà không trộn lẫn asset gốc."
        />

        {selectedLocation || selectedUnit || activeIssue ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[var(--nupsbox-navy)]">
                Đang tập trung media cho: {
                  [
                    selectedLocation?.nameVi,
                    selectedUnit?.nameVi,
                    activeIssue === 'weak-alt' ? 'Alt text yếu' : null,
                    activeIssue === 'broken-mapping' ? 'Mapping lỗi/private' : null,
                    activeIssue === 'overused' ? 'Ảnh dùng nhiều ngữ cảnh' : null
                  ].filter(Boolean).join(' · ')
                }
              </p>
              {activeIssue ? (
                <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">
                  Đây là hàng đợi remediation; lưu hoặc gỡ mapping xong, tải lại trang để số lượng cập nhật.
                </p>
              ) : null}
            </div>
            <Link href="/admin/content/media" className="text-sm font-bold text-[var(--nupsbox-blue)] hover:underline">
              Xem toàn bộ media
            </Link>
          </div>
        ) : null}

        <AdminPanel
          title="Media Readiness"
          description="Đánh giá phạm vi media đang xem: public, alt song ngữ, mapping và hero. Chỉ ảnh thật đã được xác minh mới nên bật public."
          actions={<AdminStatusBadge label={launch.score + '% ready'} tone={launch.score >= 80 ? 'success' : launch.score >= 40 ? 'warning' : 'neutral'} />}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ['Tổng ảnh', launch.total],
              ['Public', launch.publicCount],
              ['Alt đủ VI/EN', launch.completeAltCount],
              ['Gắn location', launch.mappedLocationCount],
              ['Gắn unit', launch.mappedUnitCount],
              ['Hero public', launch.heroCount]
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-3">
                <p className="text-xs font-bold text-[var(--nupsbox-slate)]">{label}</p>
                <p className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">{value}</p>
              </div>
            ))}
          </div>
          {launch.issueCount ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Có {launch.issueCount} ảnh public cần rà alt VI/EN hoặc location mapping.
            </p>
          ) : null}
        </AdminPanel>

        <MediaReadinessDashboard summary={mediaReadiness} activeIssue={activeIssue} />

        {canCreate ? (
          <div id="media-upload" className="scroll-mt-24">
            <MediaUploadForm
              locationOptions={locationOptions}
              unitOptions={unitOptions}
              defaultLocationId={defaultLocationId}
              defaultUnitTypeId={defaultUnitTypeId}
            />
          </div>
        ) : null}

        {canEdit && visibleMedia.length ? (
          <MediaBulkManager media={visibleMedia} locationOptions={locationOptions} />
        ) : null}

        <div id="editorial-media-mapping" className="scroll-mt-24">
          <MediaEditorialManager
            media={mediaRows}
            links={editorialLinks}
            blogs={blogs}
            canEdit={canEdit}
            defaultContext={defaultEditorialContext}
            linkFilter={activeIssue === 'broken-mapping' ? 'broken' : 'all'}
          />
        </div>

        <section id="media-library" aria-labelledby="media-library-title" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">THƯ VIỆN MEDIA</p>
              <h2 id="media-library-title" className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                {visibleMedia.length} ảnh{selectedLocation ? ' cho ' + selectedLocation.nameVi : ''}{selectedUnit ? ' · ' + selectedUnit.nameVi : ''}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)]">
              Xem nhanh bằng card; chỉ mở “Chỉnh metadata” khi cần sửa nội dung, liên kết hoặc xoá ảnh.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {visibleMedia.length ? (
              visibleMedia.map((media) => (
                <MediaMetadataForm
                  key={media.id}
                  media={media}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  locationOptions={locationOptions}
                  unitOptions={unitOptions}
                  locationSlugById={locationSlugById}
                  unitSlugById={unitSlugById}
                  remediationIssue={activeIssue}
                  remediationUsageCount={overusedUsageByMediaId.get(media.id)}
                />
              ))
            ) : (
              <div className="md:col-span-2 2xl:col-span-3">
                <AdminEmptyState
                  title="Chưa có media"
                  description="Không có media metadata trong phạm vi hiện tại."
                />
              </div>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
