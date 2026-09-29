import {Link} from '@/i18n/navigation';
import {Container} from '@/components/ui/container';
import {buttonClassName} from '@/components/ui/button';

export function FinalCta({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  return (
    <section className="relative overflow-hidden bg-[var(--nupsbox-navy)] py-14 text-white sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(8,70,168,.34),transparent_32%),radial-gradient(circle_at_22%_90%,rgba(255,211,26,.08),transparent_26%)]" />
      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
            {vi ? 'LIÊN HỆ THƯƠNG MẠI' : 'COMMERCIAL ENQUIRIES'}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,4vw,3.3rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
            {vi ? 'Cần thêm thông tin? Trao đổi trực tiếp với NupsBox.' : 'Need more information? Talk directly with NupsBox.'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/66 sm:text-base">
            {vi
              ? 'Gửi nhu cầu hoặc câu hỏi về dịch vụ, cơ sở, mức giá tham khảo và khả năng đáp ứng. NupsBox sẽ xác nhận thông tin phù hợp tại thời điểm liên hệ.'
              : 'Send your requirements or questions about services, facilities, indicative pricing and availability. NupsBox will confirm the relevant information when you enquire.'}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/lien-he" className={buttonClassName({variant: 'primary', size: 'lg'})}>
              {vi ? 'Liên hệ NupsBox' : 'Contact NupsBox'}
            </Link>
            <Link href="/giai-phap" className={buttonClassName({variant: 'secondary', size: 'lg'})}>
              {vi ? 'Xem dịch vụ' : 'View services'}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
