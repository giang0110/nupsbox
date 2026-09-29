import Link from 'next/link';
import {ArrowRight, CheckCircle2} from 'lucide-react';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {ConversionCta} from './conversion-cta';
import {FinalCta} from './final-cta';

type InsightItem = {
  title: string;
  body: string;
};

export function SolutionPage({
  locale,
  titleVi,
  titleEn,
  bodyVi,
  bodyEn,
  fitVi,
  fitEn,
  operatingVi,
  operatingEn,
  checklistVi,
  checklistEn,
  analysisVi,
  analysisEn,
  relatedBlogSlug,
  relatedBlogTitleVi,
  relatedBlogTitleEn
}: {
  locale: 'vi' | 'en';
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
  fitVi: InsightItem[];
  fitEn: InsightItem[];
  operatingVi: InsightItem[];
  operatingEn: InsightItem[];
  checklistVi: string[];
  checklistEn: string[];
  analysisVi: string;
  analysisEn: string;
  relatedBlogSlug: string;
  relatedBlogTitleVi: string;
  relatedBlogTitleEn: string;
}) {
  const vi = locale === 'vi';
  const fit = vi ? fitVi : fitEn;
  const operating = vi ? operatingVi : operatingEn;
  const checklist = vi ? checklistVi : checklistEn;
  const blogHref = vi ? '/blog/' + relatedBlogSlug : '/en/blog/' + relatedBlogSlug;

  return (
    <main>
      <PageIntro
        tone="navy"
        eyebrow="NUPSBOX SOLUTIONS"
        title={vi ? titleVi : titleEn}
        description={vi ? bodyVi : bodyEn}
      >
        <ConversionCta locale={locale} intent="finder" placement="solution-hero" size="lg">
          {vi ? 'Tìm điểm bắt đầu phù hợp' : 'Find a suitable starting point'}
        </ConversionCta>
      </PageIntro>

      <Section size="compact">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-12">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">
              {vi ? 'KHI NÀO PHÙ HỢP' : 'WHEN IT FITS'}
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[var(--nupsbox-navy)]">
              {vi ? 'Kho chỉ hiệu quả khi giải quyết đúng nút thắt.' : 'Storage works when it solves the right constraint.'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--nupsbox-slate)]">
              {vi
                ? 'Đừng bắt đầu bằng câu hỏi “cần bao nhiêu mét vuông”. Hãy bắt đầu bằng cách hàng hóa hoặc đồ dùng đang chiếm chỗ, di chuyển và được lấy ra như thế nào.'
                : 'Do not start with “how many square metres?” Start with how goods or belongings occupy space, move and need to be accessed.'}
            </p>
          </div>

          <div className="grid border-t border-[var(--nupsbox-border)] sm:grid-cols-3">
            {fit.map((item, index) => (
              <article key={item.title} className="border-b border-[var(--nupsbox-border)] py-5 sm:border-r sm:px-5 sm:last:border-r-0">
                <span className="text-xs font-black text-[var(--nupsbox-blue)]">0{index + 1}</span>
                <h3 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-[var(--nupsbox-navy)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="soft" size="compact">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">
              {vi ? 'TỔ CHỨC ĐỂ DÙNG ĐƯỢC' : 'ORGANIZE FOR USE'}
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[var(--nupsbox-navy)]">
              {vi ? 'Một kho gọn phải giúp lấy đúng thứ nhanh hơn.' : 'A useful storage unit should make retrieval faster.'}
            </h2>

            <div className="mt-7 divide-y divide-[var(--nupsbox-border)] border-y border-[var(--nupsbox-border)]">
              {operating.map((item) => (
                <article key={item.title} className="py-5">
                  <h3 className="font-extrabold text-[var(--nupsbox-navy)]">{item.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--nupsbox-slate)]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] bg-white p-6 shadow-[0_18px_55px_rgba(7,26,56,.07)] sm:p-7">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-blue)]">
              {vi ? 'CHECKLIST TRƯỚC KHI THUÊ' : 'PRE-RENTAL CHECKLIST'}
            </p>
            <ul className="mt-5 grid gap-4">
              {checklist.map((item) => (
                <li key={item} className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-6 text-[var(--nupsbox-slate)]">
                  <CheckCircle2 size={18} className="mt-0.5 text-[var(--nupsbox-blue)]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 border-t border-[var(--nupsbox-border)] pt-6">
              <ConversionCta locale={locale} intent="quote" placement="solution-checklist">
                {vi ? 'Hỏi NupsBox theo nhu cầu này' : 'Ask NupsBox about this need'}
              </ConversionCta>
            </div>
          </aside>
        </div>
      </Section>

      <Section size="compact">
        <div className="grid overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-[var(--nupsbox-navy)] text-white lg:grid-cols-[.78fr_1.22fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--nupsbox-yellow)]">
              {vi ? 'GÓC PHÂN TÍCH' : 'ANALYSIS'}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em]">
              {vi ? 'Đừng tối ưu riêng tiền thuê. Tối ưu cả cách vận hành.' : 'Do not optimize rent alone. Optimize the operating model.'}
            </h2>
          </div>
          <div className="border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-base leading-8 text-white/72">{vi ? analysisVi : analysisEn}</p>
            <Link href={blogHref} className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-[var(--nupsbox-yellow)] hover:underline">
              {vi ? relatedBlogTitleVi : relatedBlogTitleEn}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
