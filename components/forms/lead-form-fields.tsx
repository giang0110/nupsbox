import type {LeadEstimatedVolume, LeadNeedType} from '@/features/leads/intake';

export function LeadFormFields({
  locale,
  defaultNeedType = 'other',
  defaultEstimatedVolume = 'unknown'
}: {
  locale: 'vi' | 'en';
  defaultNeedType?: LeadNeedType;
  defaultEstimatedVolume?: LeadEstimatedVolume;
}) {
  const vi = locale === 'vi';
  const field = 'min-h-12 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 font-normal text-[var(--nupsbox-ink)] outline-none transition focus:border-[var(--nupsbox-blue)] focus:ring-2 focus:ring-[color:rgba(8,70,168,.14)]';

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold">
          {vi ? 'Tên' : 'Name'}
          <input name="fullName" required minLength={2} maxLength={120} autoComplete="name" className={field} />
        </label>
        <label className="grid gap-1.5 text-sm font-bold">
          {vi ? 'Số điện thoại' : 'Phone'}
          <input name="phone" required inputMode="tel" autoComplete="tel" className={field} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold">
          {vi ? 'Bạn cần kho cho' : 'Storage need'}
          <select name="needType" defaultValue={defaultNeedType} className={field}>
            <option value="other">{vi ? 'Chưa xác định' : 'Not sure yet'}</option>
            <option value="shop_online">{vi ? 'Shop online' : 'Online shop'}</option>
            <option value="sme">{vi ? 'Doanh nghiệp' : 'Business'}</option>
            <option value="inventory">{vi ? 'Hàng tồn kho' : 'Inventory'}</option>
            <option value="personal">{vi ? 'Đồ cá nhân' : 'Personal items'}</option>
            <option value="documents">{vi ? 'Hồ sơ / tài liệu' : 'Documents'}</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-bold">
          {vi ? 'Lượng hàng ước tính' : 'Estimated volume'}
          <select name="estimatedVolume" defaultValue={defaultEstimatedVolume} className={field}>
            <option value="unknown">{vi ? 'Chưa biết' : 'Not sure yet'}</option>
            <option value="under_20_boxes">{vi ? 'Dưới 20 thùng' : 'Under 20 boxes'}</option>
            <option value="boxes_20_50">{vi ? '20–50 thùng' : '20–50 boxes'}</option>
            <option value="over_50_boxes">{vi ? 'Trên 50 thùng' : 'Over 50 boxes'}</option>
          </select>
        </label>
      </div>

      <p className="-mt-1 text-xs leading-5 text-[var(--nupsbox-slate)]">
        {vi
          ? 'Hai lựa chọn này giúp NupsBox tư vấn nhanh hơn; bạn vẫn có thể để “Chưa xác định/Chưa biết”.'
          : 'These two fields help NupsBox advise you faster; you can leave them as “Not sure yet”.'}
      </p>

      <label className="grid gap-1.5 text-sm font-bold">
        <span>Email <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span></span>
        <input name="email" type="email" autoComplete="email" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm font-bold">
        <span>{vi ? 'Nhu cầu / ghi chú thêm' : 'Additional details'} <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span></span>
        <textarea name="message" rows={3} maxLength={2000} className={`${field} py-3`} />
      </label>
    </div>
  );
}
