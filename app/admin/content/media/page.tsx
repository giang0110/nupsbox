import {redirect} from 'next/navigation';
import {MediaMetadataForm} from '@/components/admin/media-metadata-form';
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
  const locationOptions = locations.map((location) => ({id: location.id, label: location.nameVi}));
  const unitOptions = units.map((unit) => ({id: unit.id, label: `${unit.nameVi} · ${unit.areaM2} m²`}));

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">MEDIA CMS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Media metadata</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            Chỉnh alt text song ngữ, category, thứ tự, trạng thái public và liên kết catalog. P2.2 không thêm upload, thay file hoặc hard-delete.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {mediaRows.map((media) => (
            <MediaMetadataForm
              key={media.id}
              media={media}
              canEdit={canEdit}
              locationOptions={locationOptions}
              unitOptions={unitOptions}
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
