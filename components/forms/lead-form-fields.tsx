'use client';

import type {
  LeadEstimatedVolume,
  LeadInquiryType,
  LeadNeedType
} from '@/features/leads/intake';

export function LeadFormFields({
  locale,
  inquiryType,
  onInquiryTypeChange,
  defaultNeedType = 'other',
  defaultEstimatedVolume = 'unknown',
  lockInquiryType = false
}: {
  locale: 'vi' | 'en';
  inquiryType: LeadInquiryType;
  onInquiryTypeChange: (value: LeadInquiryType) => void;
  defaultNeedType?: LeadNeedType;
  defaultEstimatedVolume?: LeadEstimatedVolume;
  lockInquiryType?: boolean;
}) {
  const vi = locale === 'vi';
  const storage = inquiryType === 'storage';
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

      <label className="grid gap-1.5 text-sm font-bold">
        {vi ? 'Bạn muốn liên hệ về' : 'What would you like to discuss?'}
        <select
          name="inquiryType"
          value={inquiryType}
          disabled={lockInquiryType}
          onChange={(event) => onInquiryTypeChange(event.target.value as LeadInquiryType)}
          className={field}
        >
          <option value="service_advice">{vi ? 'Tư vấn dịch vụ' : 'Service advice'}</option>
          <option value="quote">{vi ? 'Báo giá' : 'Pricing / quote'}</option>
          <option value="partnership">{vi ? 'Hợp tác' : 'Partnership'}</option>
          <option value="facility_info">{vi ? 'Thông tin cơ sở' : 'Facility information'}</option>
          <option value="storage">{vi ? 'Tư vấn lưu trữ' : 'Storage advice'}</option>
          <option value="other">{vi ? 'Yêu cầu khác' : 'Other enquiry'}</option>
        </select>
        {lockInquiryType ? <input type="hidden" name="inquiryType" value="storage" /> : null}
      </label>

      {storage ? (
        <>
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
              ? 'Hai trường này chỉ xuất hiện cho tư vấn lưu trữ và giúp NupsBox phản hồi đúng nhu cầu hơn.'
              : 'These fields appear only for storage enquiries and help NupsBox respond with more relevant information.'}
          </p>
        </>
      ) : (
        <>
          <input type="hidden" name="needType" value="other" />
          <input type="hidden" name="estimatedVolume" value="unknown" />
        </>
      )}

      <label className="grid gap-1.5 text-sm font-bold">
        <span>Email <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span></span>
        <input name="email" type="email" autoComplete="email" className={field} />
      </label>

      <label className="grid gap-1.5 text-sm font-bold">
        <span>{vi ? 'Nội dung cần trao đổi' : 'How can we help?'} <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span></span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          className={`${field} py-3`}
          placeholder={vi ? 'Mô tả ngắn thông tin bạn cần NupsBox phản hồi.' : 'Briefly describe what you would like NupsBox to respond to.'}
        />
      </label>
    </div>
  );
}
