import {Container} from '@/components/ui/container';
import {Link} from '@/i18n/navigation';
import {buttonClassName} from '@/components/ui/button';

export function FinalCta({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  return (
    <section className="bg-[var(--nupsbox-blue)] py-18 text-white sm:py-20">
      <Container className="text-center">
        <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">{vi ? 'Bạn chưa chắc cần kho bao nhiêu m²?' : 'Not sure how many square metres you need?'}</h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/75">{vi ? 'Gửi nhu cầu của bạn. NupsBox sẽ xác nhận loại kho và báo giá phù hợp thay vì để bạn phải tự đoán.' : 'Tell NupsBox what you store. We will help confirm a suitable unit and current quote instead of making you guess.'}</p>
        <Link href="/lien-he" className={buttonClassName({size: 'lg', className: 'mt-8'})}>{vi ? 'Nhận tư vấn' : 'Get advice'}</Link>
      </Container>
    </section>
  );
}
