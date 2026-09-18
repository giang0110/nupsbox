import {Container} from '@/components/ui/container';
import {ConversionCta} from './conversion-cta';

export function FinalCta({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  return (
    <section className="bg-[var(--nupsbox-blue)] py-18 text-white sm:py-20">
      <Container className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/65">{vi ? 'BƯỚC TIẾP THEO' : 'NEXT STEP'}</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">{vi ? 'Bạn chưa chắc cần kho bao nhiêu m²?' : 'Not sure how many square metres you need?'}</h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/78">{vi ? 'Trả lời hai câu hỏi ngắn để có gợi ý ban đầu, sau đó bạn có thể chọn báo giá hoặc đề xuất lịch xem kho.' : 'Answer two quick questions for a starting recommendation, then choose a quote or viewing request.'}</p>
        <ConversionCta locale={locale} intent="finder" placement="final-cta" size="lg" variant="dark" className="mt-8">
          {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
        </ConversionCta>
      </Container>
    </section>
  );
}
