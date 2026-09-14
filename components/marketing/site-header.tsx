import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {buttonClassName} from '@/components/ui/button';
import {LocaleSwitcher} from './locale-switcher';

const navigation = [
  {href: '/kho-mini' as const, key: 'storage'},
  {href: '/bang-gia' as const, key: 'pricing'},
  {href: '/giai-phap' as const, key: 'solutions'},
  {href: '/dia-diem' as const, key: 'locations'},
  {href: '/ve-nupsbox' as const, key: 'about'}
] as const;

export async function SiteHeader() {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,26,56,0.94)] text-white backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-5">
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
              className="rounded-full px-3.5 py-2 text-sm font-medium text-white/78 transition hover:bg-white/8 hover:text-white"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link href="/lien-he" className={buttonClassName({className: 'hidden sm:inline-flex'})}>
            {t('quote')}
          </Link>
        </div>
      </Container>
    </header>
  );
}
