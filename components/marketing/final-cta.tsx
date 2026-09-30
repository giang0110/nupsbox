import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {buttonClassName} from '@/components/ui/button';
import {getCommercialContent, getCommercialFallback, type CommercialCopy} from '@/features/content/commercial-content';

export async function FinalCta({locale, content}: {locale: 'vi' | 'en'; content?: CommercialCopy}) {
  const vi = locale === 'vi';
  const copy = content ?? (await getCommercialContent(locale).catch(() => getCommercialFallback(locale))).cta;

  return (
    <section className="relative overflow-hidden bg-[var(--nupsbox-navy)] py-10 text-white sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(8,70,168,.34),transparent_32%),radial-gradient(circle_at_22%_90%,rgba(255,211,26,.08),transparent_26%)]" />
      <Container className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div className="max-w-3xl text-center lg:text-left">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
            {copy.eyebrow ?? (vi ? 'LIÊN HỆ THƯƠNG MẠI' : 'COMMERCIAL ENQUIRIES')}
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.85rem,3.3vw,2.8rem)] font-extrabold leading-[1.03] tracking-[-0.04em]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/66 sm:text-base lg:mx-0">
            {copy.description}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
          <Link href="/lien-he" className={buttonClassName({variant: 'primary', size: 'lg'})}>
            {copy.primaryLabel ?? (vi ? 'Liên hệ NupsBox' : 'Contact NupsBox')}
          </Link>
          <Link href="/giai-phap" className={buttonClassName({variant: 'secondary', size: 'lg'})}>
            {copy.secondaryLabel ?? (vi ? 'Xem dịch vụ' : 'View services')}
          </Link>
        </div>
      </Container>
    </section>
  );
}
