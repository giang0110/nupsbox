import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
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

        <div className="grid gap-5">
          {mediaRows.length ? (
            mediaRows.map((media) => (
              <MediaMetadataForm
                key={media.id}
                media={media}
                canEdit={canEdit}
                locationOptions={locationOptions}
                unitOptions={unitOptions}
              />
            ))
          ) : (
            <AdminEmptyState
              title="Chưa có media"
              description="Không có media metadata trong phạm vi hiện tại."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
