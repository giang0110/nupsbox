import type {AdminPublicSetting} from '@/features/admin/settings';
import {updatePublicSiteSetting} from '@/app/admin/content/settings/actions';

type Props = {setting: AdminPublicSetting; canEdit: boolean};

const inputClass =
  'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

export function SiteSettingForm({setting, canEdit}: Props) {
  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">PUBLIC BUSINESS SETTING</p>
        <h2 className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">Liên hệ công khai</h2>
        <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">Key cố định: {setting.key}. Secrets và deployment credentials không được quản lý tại đây.</p>
      </div>

      <form action={updatePublicSiteSetting} className="space-y-4">
        <input type="hidden" name="key" value={setting.key} />
        <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Điện thoại
            <input className={inputClass} name="phone" defaultValue={setting.value.phone ?? ''} placeholder="Chưa xác nhận" />
          </label>
          <label className="text-sm font-semibold">
            Zalo URL
            <input className={inputClass} name="zaloUrl" type="url" defaultValue={setting.value.zalo_url ?? ''} placeholder="https://..." />
          </label>
        </fieldset>
        {canEdit ? (
          <button className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white">Lưu thông tin liên hệ</button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Role hiện tại chỉ có quyền xem settings.</p>
        )}
      </form>
    </article>
  );
}
