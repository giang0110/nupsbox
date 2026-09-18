import {updatePublicSiteSetting} from '@/app/admin/content/settings/actions';
import {
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import type {AdminPublicSetting} from '@/features/admin/settings';

type Props = {
  setting: AdminPublicSetting;
  canEdit: boolean;
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function SiteSettingForm({setting, canEdit}: Props) {
  return (
    <AdminPanel
      title="Liên hệ công khai"
      description={'Key cố định: ' + setting.key + '. Secrets và deployment credentials không được quản lý tại đây.'}
      actions={
        <AdminStatusBadge
          label={setting.isPublic ? 'Công khai' : 'Nội bộ'}
          tone={setting.isPublic ? 'success' : 'neutral'}
        />
      }
    >
      <form action={updatePublicSiteSetting} className="grid gap-6">
        <input type="hidden" name="key" value={setting.key} />

        <AdminFieldGroup legend="Liên hệ công khai" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Điện thoại
              <input
                className={inputClass}
                name="phone"
                defaultValue={setting.value.phone ?? ''}
                placeholder="Chưa xác nhận"
              />
            </label>
            <label className="text-sm font-semibold">
              Zalo URL
              <input
                className={inputClass}
                name="zaloUrl"
                type="url"
                defaultValue={setting.value.zalo_url ?? ''}
                placeholder="https://..."
              />
            </label>
          </div>
        </AdminFieldGroup>

        {canEdit ? (
          <button className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
            Lưu thông tin liên hệ
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Role hiện tại chỉ có quyền xem settings.</p>
        )}
      </form>
    </AdminPanel>
  );
}
