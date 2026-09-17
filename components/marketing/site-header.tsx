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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,26,56,0.94)] text-white shadow-[0_8px_30px_rgba(7,26,56,0.12)] backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="NupsBox home">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--nupsbox-yellow)] font-black tracking-[-0.08em] text-[var(--nupsbox-navy)] shadow-[0_8px_30px_rgba(255,211,26,0.18)]">
            NB
          </span>
          <span className="text-lg font-extrabold tracking-[-0.04em]">NUPSBOX</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navigation.map(({href, key}) => (
            <Link
              key={key}
              href={href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-white/78 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ConversionCta
            locale={locale}
            intent="finder"
            placement="header"
            size="md"
            className="hidden sm:inline-flex"
          >
            {t('findStorage')}
          </ConversionCta>

          <details className="relative lg:hidden">
            <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Menu">
              <Menu size={20} aria-hidden="true" />
            </summary>
            <nav className="absolute right-0 top-13 w-64 rounded-2xl border border-black/10 bg-white p-2 text-[var(--nupsbox-navy)] shadow-[var(--nupsbox-shadow-lg)]" aria-label="Mobile navigation">
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
