import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
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
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="SITE SETTINGS"
          title="Cấu hình business công khai"
          description="Chỉ các key đã được phê duyệt trong application contract mới xuất hiện. Không có editor cho secrets hoặc environment variables."
        />

        <div className="grid gap-5">
          {settings.length ? (
            settings.map((setting) => (
              <SiteSettingForm key={setting.key} setting={setting} canEdit={canEdit} />
            ))
          ) : (
            <AdminEmptyState
              title="Chưa có setting allowlisted"
              description="Workspace này không tự tạo key mới."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
