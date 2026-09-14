import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';

export async function SiteFooter() {
  const nav = await getTranslations('nav');
  const brand = await getTranslations('brand');

  return (
    <footer className="bg-[var(--nupsbox-navy)] pb-28 pt-14 text-white sm:pb-10">
      <Container>
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-2xl font-black tracking-[-0.04em]">NUPSBOX</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/65">{brand('tagline')}</p>
          </div>
          <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/70" aria-label="Footer navigation">
            <Link href="/kho-mini" className="hover:text-white">{nav('storage')}</Link>
            <Link href="/bang-gia" className="hover:text-white">{nav('pricing')}</Link>
            <Link href="/giai-phap" className="hover:text-white">{nav('solutions')}</Link>
            <Link href="/dia-diem" className="hover:text-white">{nav('locations')}</Link>
            <Link href="/ve-nupsbox" className="hover:text-white">{nav('about')}</Link>
            <Link href="/lien-he" className="hover:text-white">{nav('contact')}</Link>
          </nav>
        </div>
        <p className="pt-6 text-xs text-white/45">© {new Date().getFullYear()} NupsBox. All rights reserved.</p>
      </Container>
    </footer>
  );
}
