import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';

export function FinalCta({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';

  return (
    <section className="bg-[var(--nupsbox-blue)] py-14 text-white sm:py-16">
      <Container className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/64">
          {vi ? 'BƯỚC TIẾP THEO' : 'NEXT STEP'}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
          {vi ? 'Bạn chưa chắc cần kho bao nhiêu m²?' : 'Not sure how many square metres you need?'}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/76">
          {vi
            ? 'Trả lời hai câu hỏi ngắn để có gợi ý ban đầu, sau đó bạn có thể chọn báo giá hoặc đề xuất lịch xem kho.'
            : 'Answer two quick questions for a starting recommendation, then choose a quote or viewing request.'}
        </p>
        <ConversionCta locale={locale} intent="finder" placement="final-cta" size="lg" variant="dark" className="mt-6">
          {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
        </ConversionCta>
      </Container>
    </section>
  );
}
