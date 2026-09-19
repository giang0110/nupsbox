import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {TrackedContactLink} from './tracked-contact-link';

export async function SiteFooter({
  phone,
  email,
  zaloUrl,
  facebookUrl
}: {
  phone?: string | null;
  email?: string | null;
  zaloUrl?: string | null;
  facebookUrl?: string | null;
}) {
  const [nav, brand, rawLocale] = await Promise.all([
    getTranslations('nav'),
    getTranslations('brand'),
    getLocale()
  ]);
  const vi = rawLocale !== 'en';

  return (
    <footer className="bg-[var(--nupsbox-navy)] pb-24 pt-14 text-white sm:pb-12">
      <Container>
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_.8fr_.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] text-sm font-black tracking-[-0.08em] text-[var(--nupsbox-navy)]">NB</span>
              <div>
                <p className="text-xl font-extrabold tracking-[-0.04em]">NUPSBOX</p>
                <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/38">Mini Storage · TP.HCM</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/66">{brand('tagline')}</p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
              {vi
                ? 'Kho mini linh hoạt cho hàng hóa kinh doanh và nhu cầu cá nhân tại TP.HCM.'
                : 'Flexible mini storage for business inventory and personal needs in Ho Chi Minh City.'}
            </p>
          </div>

          <nav className="grid content-start gap-3 text-sm text-white/70" aria-label={vi ? 'Điều hướng chân trang' : 'Footer navigation'}>
            <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/40">{vi ? 'Khám phá' : 'Explore'}</p>
            <Link href="/kho-mini" className="hover:text-white">{nav('storage')}</Link>
            <Link href="/bang-gia" className="hover:text-white">{nav('pricing')}</Link>
            <Link href="/giai-phap" className="hover:text-white">{nav('solutions')}</Link>
            <Link href="/dia-diem" className="hover:text-white">{nav('locations')}</Link>
            <Link href="/ve-nupsbox" className="hover:text-white">{nav('about')}</Link>
            <Link href="/lien-he" className="hover:text-white">{nav('contact')}</Link>
          </nav>

          <div className="grid content-start gap-3 text-sm text-white/70">
            <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/40">{vi ? 'Liên hệ' : 'Contact'}</p>
            {phone ? (
              <TrackedContactLink
                href={`tel:${phone}`}
                label={phone}
                kind="phone"
                placement="footer"
                showIcon={false}
                className="hover:text-white"
              />
            ) : null}
            {email ? <a href={`mailto:${email}`} className="hover:text-white">{email}</a> : null}
            {zaloUrl ? (
              <TrackedContactLink
                href={zaloUrl}
                label="Zalo"
                kind="zalo"
                placement="footer"
                showIcon={false}
                className="hover:text-white"
              />
            ) : null}
            {facebookUrl ? (
              <TrackedContactLink
                href={facebookUrl}
                label="Facebook"
                kind="facebook"
                placement="footer"
                showIcon={false}
                className="hover:text-white"
              />
            ) : null}
            {!phone && !email && !zaloUrl && !facebookUrl ? <Link href="/lien-he" className="hover:text-white">{nav('contact')}</Link> : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NupsBox. All rights reserved.</p>
          <p>{vi ? 'Thông tin giá và tình trạng được xác nhận tại thời điểm liên hệ.' : 'Pricing and availability are confirmed at enquiry time.'}</p>
        </div>
      </Container>
    </footer>
  );
}
