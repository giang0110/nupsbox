import {updateCommercialBlock} from '@/app/admin/content/commercial/actions';
import {AdminMutationForm} from '@/components/admin/admin-mutation-form';
import {
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {AdminSubmitButton} from '@/components/admin/admin-submit-button';
import type {AdminCommercialBlock} from '@/features/admin/commercial-content';

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';
const textareaClass = inputClass + ' min-h-28';

const labels: Record<AdminCommercialBlock['blockKey'], string> = {
  company_profile: 'Hồ sơ doanh nghiệp / Hero',
  services: 'Dịch vụ',
  service_shop_online: 'Dịch vụ · Shop online',
  service_small_business: 'Dịch vụ · Doanh nghiệp nhỏ',
  service_inventory: 'Dịch vụ · Chứa hàng',
  service_personal: 'Dịch vụ · Cá nhân',
  capabilities: 'Cơ sở & năng lực',
  commercial_cta: 'CTA thương mại',
  seo: 'SEO trang chủ',
  seo_solutions: 'SEO · Dịch vụ',
  seo_about: 'SEO · Về NupsBox',
  seo_contact: 'SEO · Liên hệ'
};

function LocaleFields({
  localeLabel,
  suffix,
  block,
  disabled
}: {
  localeLabel: string;
  suffix: 'Vi' | 'En';
  block: AdminCommercialBlock;
  disabled: boolean;
}) {
  const content = suffix === 'Vi' ? block.contentVi : block.contentEn;
  const showEyebrow = !block.blockKey.startsWith('seo');
  const showCta = block.blockKey === 'commercial_cta';

  return (
    <AdminFieldGroup legend={localeLabel} disabled={disabled}>
      <div className="grid gap-4">
        {showEyebrow ? (
          <label className="text-sm font-semibold">
            Eyebrow
            <input
              className={inputClass}
              name={'eyebrow' + suffix}
              defaultValue={content.eyebrow ?? ''}
              maxLength={160}
              required
            />
          </label>
        ) : (
          <input type="hidden" name={'eyebrow' + suffix} value="" />
        )}

        <label className="text-sm font-semibold">
          Tiêu đề / Title
          <input
            className={inputClass}
            name={'title' + suffix}
            defaultValue={content.title}
            maxLength={300}
            required
          />
        </label>

        <label className="text-sm font-semibold">
          Mô tả / Description
          <textarea
            className={textareaClass}
            name={'description' + suffix}
            defaultValue={content.description}
            maxLength={3000}
            required
          />
        </label>

        {showCta ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Nhãn CTA chính
              <input
                className={inputClass}
                name={'primaryLabel' + suffix}
                defaultValue={content.primaryLabel ?? ''}
                maxLength={120}
                required
              />
            </label>
            <label className="text-sm font-semibold">
              Nhãn CTA phụ
              <input
                className={inputClass}
                name={'secondaryLabel' + suffix}
                defaultValue={content.secondaryLabel ?? ''}
                maxLength={120}
                required
              />
            </label>
          </div>
        ) : (
          <>
            <input type="hidden" name={'primaryLabel' + suffix} value="" />
            <input type="hidden" name={'secondaryLabel' + suffix} value="" />
          </>
        )}
      </div>
    </AdminFieldGroup>
  );
}

export function CommercialContentForm({
  block,
  canEdit
}: {
  block: AdminCommercialBlock;
  canEdit: boolean;
}) {
  return (
    <AdminPanel
      title={labels[block.blockKey]}
      description={'Block cố định: commercial/' + block.blockKey + '. Nội dung VI/EN dùng trực tiếp trên website public.'}
      actions={
        <AdminStatusBadge
          label={block.active ? 'Đang hiển thị' : 'Đang ẩn'}
          tone={block.active ? 'success' : 'neutral'}
        />
      }
    >
      <AdminMutationForm
        recoverableAction={updateCommercialBlock}
        expectedUpdatedAt={block.updatedAt}
        className="grid gap-6"
      >
        <input type="hidden" name="blockKey" value={block.blockKey} />

        <LocaleFields localeLabel="Tiếng Việt" suffix="Vi" block={block} disabled={!canEdit} />
        <LocaleFields localeLabel="English" suffix="En" block={block} disabled={!canEdit} />

        <AdminFieldGroup legend="Xuất bản" disabled={!canEdit}>
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem] sm:items-end">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                name="active"
                defaultChecked={block.active}
                className="size-4 accent-[var(--nupsbox-blue)]"
              />
              Dùng nội dung CMS này trên website (tắt = dùng nội dung fallback an toàn)
            </label>
            <label className="text-sm font-semibold">
              Thứ tự
              <input
                className={inputClass}
                name="sortOrder"
                type="number"
                min={0}
                max={1000}
                defaultValue={block.sortOrder}
              />
            </label>
          </div>
        </AdminFieldGroup>

        {canEdit ? (
          <AdminSubmitButton
            idleLabel="Lưu nội dung thương mại"
            pendingLabel="Đang lưu…"
            className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60"
          />
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Role hiện tại chỉ có quyền xem nội dung.</p>
        )}
      </AdminMutationForm>
    </AdminPanel>
  );
}
