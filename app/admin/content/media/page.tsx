import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
import {MediaBulkManager} from '@/components/admin/media-bulk-manager';
import {MediaMetadataForm} from '@/components/admin/media-metadata-form';
import {MediaUploadForm} from '@/components/admin/media-upload-form';
import {Container} from '@/components/ui/container';
import {listAdminLocations} from '@/features/admin/locations';
import {listAdminMedia} from '@/features/admin/media';
import {listAdminUnitTypes} from '@/features/admin/unit-types';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminMediaPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'media:read')) redirect('/admin');

  const [mediaRows, locations, units] = await Promise.all([
    listAdminMedia(),
    listAdminLocations(),
    listAdminUnitTypes()
  ]);
  const canEdit = can(session.role, 'media:update');
  const canCreate = can(session.role, 'media:create');
  const canDelete = can(session.role, 'media:delete');
  const locationOptions = locations.map((location) => ({id: location.id, label: location.nameVi}));
  const unitOptions = units.map((unit) => ({id: unit.id, label: unit.nameVi + ' · ' + unit.areaM2 + ' m²'}));

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="MEDIA CMS"
          title="Hình ảnh kho & media"
          description="Upload ảnh, xem preview, quản lý alt text song ngữ, category, thứ tự, trạng thái public và liên kết đúng địa điểm/loại kho."
        />

        {canCreate ? (
          <MediaUploadForm locationOptions={locationOptions} unitOptions={unitOptions} />
        ) : null}

        {canEdit && mediaRows.length ? (
          <MediaBulkManager media={mediaRows} locationOptions={locationOptions} />
        ) : null}

        <section aria-labelledby="media-library-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">THƯ VIỆN MEDIA</p>
              <h2 id="media-library-title" className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--nupsbox-navy)]">
                ${mediaRows.length} ảnh
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)]">
              Xem nhanh bằng card; chỉ mở “Chỉnh metadata” khi cần sửa nội dung, liên kết hoặc xoá ảnh.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {mediaRows.length ? (
              mediaRows.map((media) => (
                <MediaMetadataForm
                  key={media.id}
                  media={media}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  locationOptions={locationOptions}
                  unitOptions={unitOptions}
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
