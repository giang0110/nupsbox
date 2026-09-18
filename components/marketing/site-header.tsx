import {Menu} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';
import {LocaleSwitcher} from './locale-switcher';

const navigation = [
  {href: '/kho-mini' as const, key: 'storage'},
  {href: '/bang-gia' as const, key: 'pricing'},
  {href: '/giai-phap' as const, key: 'solutions'},
  {href: '/dia-diem' as const, key: 'locations'},
  {href: '/ve-nupsbox' as const, key: 'about'}
] as const;

export async function SiteHeader() {
  const [t, rawLocale] = await Promise.all([getTranslations('nav'), getLocale()]);
  const locale = rawLocale === 'en' ? 'en' : 'vi';

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(7,26,56,0.95)] text-white shadow-[0_10px_28px_rgba(7,26,56,0.1)] backdrop-blur-xl">
      <Container className="flex min-h-16 items-center justify-between gap-3">
        <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-2.5" aria-label={locale === 'vi' ? 'Trang chủ NupsBox' : 'NupsBox home'}>
          <span className="grid size-9 place-items-center rounded-[0.7rem] bg-[var(--nupsbox-yellow)] text-sm font-black tracking-[-0.08em] text-[var(--nupsbox-navy)] shadow-[0_7px_24px_rgba(255,211,26,0.16)]">
            NB
          </span>
          <span className="text-[1.05rem] font-extrabold tracking-[-0.035em]">NUPSBOX</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={locale === 'vi' ? 'Điều hướng chính' : 'Primary navigation'}>
          {navigation.map(({href, key}) => (
            <Link
              key={key}
              href={href}
              className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[0.86rem] font-semibold text-white/72 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <ConversionCta
            locale={locale}
            intent="finder"
            placement="header"
            size="md"
            className="hidden min-h-11 px-4 sm:inline-flex"
          >
            {t('findStorage')}
          </ConversionCta>

          <details className="relative lg:hidden">
            <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label={locale === 'vi' ? 'Mở menu điều hướng' : 'Open navigation menu'}>
              <Menu size={20} aria-hidden="true" />
            </summary>
            <nav className="absolute right-0 top-12 w-64 rounded-2xl border border-black/10 bg-white p-2 text-[var(--nupsbox-navy)] shadow-[var(--nupsbox-shadow-lg)]" aria-label={locale === 'vi' ? 'Điều hướng di động' : 'Mobile navigation'}>
              {navigation.map(({href, key}) => (
                <Link key={key} href={href} className="block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[var(--nupsbox-surface)]">
                  {t(key)}
                </Link>
              ))}
              <ConversionCta locale={locale} intent="finder" placement="mobile-menu" size="md" className="mt-2 w-full">
                {t('findStorage')}
              </ConversionCta>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
