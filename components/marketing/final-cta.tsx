import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';

export function FinalCta({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  return (
    <section className="relative overflow-hidden bg-[var(--nupsbox-navy)] py-14 text-white sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(8,70,168,.34),transparent_32%),radial-gradient(circle_at_22%_90%,rgba(255,211,26,.08),transparent_26%)]" />
      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--nupsbox-yellow)]">
            {vi ? 'BẮT ĐẦU TỪ NHU CẦU CỦA BẠN' : 'START WITH WHAT YOU NEED'}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,4vw,3.3rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
            {vi ? 'Chọn đúng không gian trước khi trả tiền cho phần bạn không dùng.' : 'Choose the right amount of space before paying for what you do not use.'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/66 sm:text-base">
            {vi
              ? 'Trả lời vài câu hỏi ngắn để có gợi ý ban đầu, sau đó nhận báo giá hoặc đề xuất lịch xem kho.'
              : 'Answer a few quick questions for an initial recommendation, then request pricing or a facility viewing.'}
          </p>
          <ConversionCta locale={locale} intent="finder" placement="final-cta" size="lg" className="mt-7">
            {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
          </ConversionCta>
        </div>
      </Container>
    </section>
  );
}
