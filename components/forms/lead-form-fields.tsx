export function LeadFormFields({locale}: {locale: 'vi' | 'en'}) {
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
      <label className="grid gap-1.5 text-sm font-bold">
        <span>Email <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span></span>
        <input name="email" type="email" autoComplete="email" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm font-bold">
        <span>{vi ? 'Nhu cầu' : 'What do you need?'} <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span></span>
        <textarea name="message" rows={3} maxLength={2000} className={`${field} py-3`} />
      </label>
    </div>
  );
}
