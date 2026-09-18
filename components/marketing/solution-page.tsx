import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {ConversionCta} from './conversion-cta';
import {FinalCta} from './final-cta';

export function SolutionPage({locale, titleVi, titleEn, bodyVi, bodyEn}: {locale: 'vi' | 'en'; titleVi: string; titleEn: string; bodyVi: string; bodyEn: string}) {
  const vi = locale === 'vi';
  return (
    <main>
      <Section tone="navy" size="compact">
        <div className="max-w-4xl py-4 sm:py-6">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-yellow)]">NUPSBOX SOLUTIONS</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.045em] text-white sm:text-6xl">{vi ? titleVi : titleEn}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{vi ? bodyVi : bodyEn}</p>
          <div className="mt-8">
            <ConversionCta locale={locale} intent="finder" placement="solution-hero" size="lg">
              {vi ? 'Tìm kho phù hợp' : 'Find suitable storage'}
            </ConversionCta>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow={vi ? 'BẮT ĐẦU GỌN HƠN' : 'START LEANER'}
          title={vi ? 'Không cần bắt đầu bằng một mặt bằng lớn.' : 'You do not need to start with a large commercial lease.'}
          description={vi
            ? 'Chọn một loại kho phù hợp với lượng hàng hiện tại, sau đó trao đổi với NupsBox khi nhu cầu thay đổi. Giá và tình trạng được xác nhận trước khi thuê.'
            : 'Choose a unit that fits your current inventory, then speak with NupsBox as your needs change. Pricing and status are confirmed before rental.'}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(vi
            ? [['1. Xác định nhu cầu', 'Bắt đầu từ loại hàng và lượng hàng, không cần biết trước số m².'], ['2. Xem gợi ý', 'Storage Finder đưa ra một điểm bắt đầu dựa trên loại kho đang có trong catalog.'], ['3. Xác nhận với NupsBox', 'Gửi báo giá hoặc lịch xem để NupsBox xác nhận bước tiếp theo.']]
            : [['1. Describe the need', 'Start with what you store and roughly how much; you do not need to know the square metres.'], ['2. Review a recommendation', 'Storage Finder suggests a starting point from the listed catalog.'], ['3. Confirm with NupsBox', 'Request a quote or viewing so NupsBox can confirm the next step.']]
          ).map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5">
              <h2 className="text-lg font-black text-[var(--nupsbox-navy)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
