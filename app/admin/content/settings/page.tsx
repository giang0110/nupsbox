import {redirect} from 'next/navigation';
import {SiteSettingForm} from '@/components/admin/site-setting-form';
import {Container} from '@/components/ui/container';
import {listAdminSettings} from '@/features/admin/settings';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminSettingsPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'settings:read')) redirect('/admin');

  const settings = await listAdminSettings();
  const canEdit = can(session.role, 'settings:update');

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">SITE SETTINGS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Cấu hình business công khai</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            Chỉ các key đã được phê duyệt trong application contract mới xuất hiện. Staff/viewer chỉ xem; admin mới được cập nhật. Không có editor cho secrets hoặc environment variables.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {settings.length ? settings.map((setting) => (
            <SiteSettingForm key={setting.key} setting={setting} canEdit={canEdit} />
          )) : (
            <div className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-6 text-sm text-[var(--nupsbox-slate)] shadow-sm">
              Chưa có setting allowlisted trong database. Workspace này không tự tạo key mới.
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
