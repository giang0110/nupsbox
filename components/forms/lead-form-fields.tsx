export function LeadFormFields({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const field = 'min-h-12 rounded-xl border border-[var(--nupsbox-border)] bg-white px-4 font-normal text-[var(--nupsbox-ink)] outline-none transition focus:border-[var(--nupsbox-blue)] focus:ring-2 focus:ring-[color:rgba(8,70,168,.14)]';
  return (
    <>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Tên' : 'Name'}<input name="fullName" required minLength={2} maxLength={120} autoComplete="name" className={field} /></label>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Số điện thoại' : 'Phone'}<input name="phone" required inputMode="tel" autoComplete="tel" className={field} /></label>
      <label className="grid gap-2 text-sm font-bold">Email <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span><input name="email" type="email" autoComplete="email" className={field} /></label>
      <label className="grid gap-2 text-sm font-bold">{vi ? 'Nhu cầu' : 'What do you need?'} <span className="font-normal text-[var(--nupsbox-slate)]">({vi ? 'không bắt buộc' : 'optional'})</span><textarea name="message" rows={4} maxLength={2000} className={`${field} py-3`} /></label>
    </>
  );
}
