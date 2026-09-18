import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';

export async function SiteFooter({
  phone,
  email,
  zaloUrl
}: {
  phone?: string | null;
  email?: string | null;
  zaloUrl?: string | null;
}) {
  const [nav, brand, rawLocale] = await Promise.all([
    getTranslations('nav'),
    getTranslations('brand'),
    getLocale()
  ]);
  const vi = rawLocale !== 'en';

  return (
    <footer className="bg-[var(--nupsbox-navy)] pb-28 pt-14 text-white sm:pb-12">
      <Container>
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.1fr_.8fr_.8fr]">
          <div>
            <p className="text-xl font-extrabold tracking-[-0.035em]">NUPSBOX</p>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">{brand('tagline')}</p>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">
              {vi
                ? 'Kho mini linh hoạt cho nhu cầu kinh doanh và cá nhân tại TP.HCM.'
                : 'Flexible mini storage for business and personal needs in Ho Chi Minh City.'}
            </p>
          </div>

          <nav className="grid content-start gap-3 text-sm text-white/70" aria-label="Footer navigation">
            <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/40">Explore</p>
            <Link href="/kho-mini" className="hover:text-white">{nav('storage')}</Link>
            <Link href="/bang-gia" className="hover:text-white">{nav('pricing')}</Link>
            <Link href="/giai-phap" className="hover:text-white">{nav('solutions')}</Link>
            <Link href="/dia-diem" className="hover:text-white">{nav('locations')}</Link>
            <Link href="/ve-nupsbox" className="hover:text-white">{nav('about')}</Link>
            <Link href="/lien-he" className="hover:text-white">{nav('contact')}</Link>
          </nav>

          <div className="grid content-start gap-3 text-sm text-white/70">
            <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/40">Contact</p>
            {phone ? <a href={`tel:${phone}`} className="hover:text-white">{phone}</a> : null}
            {email ? <a href={`mailto:${email}`} className="hover:text-white">{email}</a> : null}
            {zaloUrl ? <a href={zaloUrl} target="_blank" rel="noreferrer" className="hover:text-white">Zalo</a> : null}
            {!phone && !email && !zaloUrl ? <Link href="/lien-he" className="hover:text-white">{nav('contact')}</Link> : null}
          </div>
        </div>
        <p className="pt-6 text-xs text-white/45">© {new Date().getFullYear()} NupsBox. All rights reserved.</p>
      </Container>
    </footer>
  );
}
