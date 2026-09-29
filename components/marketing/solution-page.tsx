import Link from 'next/link';
import {ArrowRight, CheckCircle2, CircleDot, Lightbulb, Rows3} from 'lucide-react';
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
  const articleHref = vi ? '/blog/' + relatedBlogSlug : '/en/blog/' + relatedBlogSlug;

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

      <Section size="compact">
        <div className="grid overflow-hidden rounded-[2rem] border border-[var(--nupsbox-border)] bg-white lg:grid-cols-3">
          <article className="p-6 sm:p-7 lg:border-r lg:border-[var(--nupsbox-border)] lg:p-8">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
              <CircleDot size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
              {vi ? 'Khi giải pháp này có ý nghĩa' : 'When this solution makes sense'}
            </h2>
            <div className="mt-5 grid gap-4">
              {fit.map(item => (
                <div key={item.title}>
                  <h3 className="text-sm font-extrabold text-[var(--nupsbox-navy)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border-t border-[var(--nupsbox-border)] p-6 sm:p-7 lg:border-r lg:border-t-0 lg:p-8">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
              <Rows3 size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
              {vi ? 'Cách tổ chức để kho thực sự hữu ích' : 'How to make the storage actually work'}
            </h2>
            <div className="mt-5 grid gap-4">
              {operating.map(item => (
                <div key={item.title}>
                  <h3 className="text-sm font-extrabold text-[var(--nupsbox-navy)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border-t border-[var(--nupsbox-border)] p-6 sm:p-7 lg:border-t-0 lg:p-8">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
              <CheckCircle2 size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-[var(--nupsbox-navy)]">
              {vi ? 'Checklist trước khi thuê' : 'Pre-rental checklist'}
            </h2>
            <ul className="mt-5 grid gap-3">
              {checklist.map(item => (
                <li key={item} className="grid grid-cols-[auto_1fr] gap-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                  <span className="mt-[0.65rem] size-1.5 rounded-full bg-[var(--nupsbox-yellow)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="mt-5 grid gap-5 rounded-[1.75rem] bg-[var(--nupsbox-navy)] p-6 text-white sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid size-12 place-items-center rounded-full bg-white/10 text-[var(--nupsbox-yellow)]">
            <Lightbulb size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
              {vi ? 'GÓC PHÂN TÍCH' : 'EDITORIAL INSIGHT'}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">{vi ? analysisVi : analysisEn}</p>
          </div>
          <Link href={articleHref} className="inline-flex min-h-11 max-w-xs items-center gap-2 font-bold text-white hover:underline">
            {vi ? relatedBlogTitleVi : relatedBlogTitleEn}
            <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
          </Link>
        </aside>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
