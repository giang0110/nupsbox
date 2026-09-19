import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {ConversionCta} from './conversion-cta';
import {FinalCta} from './final-cta';

export function SolutionPage({
  locale,
  titleVi,
  titleEn,
  bodyVi,
  bodyEn
}: {
  locale: 'vi' | 'en';
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
}) {
  const vi = locale === 'vi';

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow="NUPSBOX SOLUTIONS"
        title={vi ? titleVi : titleEn}
        description={vi ? bodyVi : bodyEn}
      >
        <ConversionCta locale={locale} intent="finder" placement="solution-hero" size="lg">
          {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
        </ConversionCta>
      </PageIntro>

      <Section>
        <SectionHeading
          eyebrow={vi ? 'BẮT ĐẦU GỌN HƠN' : 'START LEANER'}
          title={vi ? 'Không cần bắt đầu bằng một mặt bằng lớn.' : 'You do not need to start with a large commercial lease.'}
          description={vi
            ? 'Chọn một loại kho phù hợp với lượng hàng hiện tại, sau đó trao đổi với NupsBox khi nhu cầu thay đổi. Giá và tình trạng được xác nhận trước khi thuê.'
            : 'Choose a unit that fits your current inventory, then speak with NupsBox as your needs change. Pricing and status are confirmed before rental.'}
        />
        <div className="mt-8 grid gap-0 border-y border-[var(--nupsbox-border)] md:grid-cols-3">
          {(vi
            ? [['1. Xác định nhu cầu', 'Bắt đầu từ loại hàng và lượng hàng, không cần biết trước số m².'], ['2. Xem gợi ý', 'Storage Finder đưa ra một điểm bắt đầu dựa trên loại kho đang có trong catalog.'], ['3. Xác nhận với NupsBox', 'Gửi báo giá hoặc lịch xem để NupsBox xác nhận bước tiếp theo.']]
            : [['1. Describe the need', 'Start with what you store and roughly how much; you do not need to know the square metres.'], ['2. Review a recommendation', 'Storage Finder suggests a starting point from the listed catalog.'], ['3. Confirm with NupsBox', 'Request a quote or viewing so NupsBox can confirm the next step.']]
          ).map(([title, text], index) => (
            <article key={title} className="relative py-6 md:px-6 md:py-7 md:first:pl-0 md:last:pr-0 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[var(--nupsbox-border)] md:[&:not(:last-child)]:border-b-0 md:[&:not(:last-child)]:border-r">
              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">0{index + 1}</span>
              <h2 className="mt-3 text-lg font-extrabold tracking-[-0.02em] text-[var(--nupsbox-navy)]">{title.replace(/^\d+\.\s*/, '')}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
