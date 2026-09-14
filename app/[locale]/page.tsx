import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {isSupportedLocale} from '@/i18n/routing';
import {Container} from '@/components/ui/container';
import {buttonClassName} from '@/components/ui/button';
import {StorageFinder} from '@/components/storage-finder/storage-finder';

const finderUnits = [
  {id: 's', slug: 's', name: 'Kho S', areaM2: 1.64, sortOrder: 10},
  {id: 'm', slug: 'm', name: 'Kho M', areaM2: 5.43, sortOrder: 20}
];

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <main>
      <section className="overflow-hidden bg-[var(--nupsbox-navy)] py-16 text-white sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <p className="text-xs font-black tracking-[0.18em] text-[var(--nupsbox-yellow)]">{t('eyebrow')}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{t('title')}</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{t('subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kho-mini" className={buttonClassName({size: 'lg'})}>{t('primaryCta')}</Link>
              <Link href="/bang-gia" className={buttonClassName({variant: 'ghost', size: 'lg', className: 'text-white ring-1 ring-white/20 hover:bg-white/10'})}>{t('secondaryCta')}</Link>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-[var(--nupsbox-surface)] py-10 sm:py-14">
        <Container><StorageFinder units={finderUnits} /></Container>
      </section>
    </main>
  );
}
