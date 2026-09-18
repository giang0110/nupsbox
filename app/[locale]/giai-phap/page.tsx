import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {FinalCta} from '@/components/marketing/final-cta';
import {isSupportedLocale} from '@/i18n/routing';

export default async function SolutionsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  const items = [
    ['/giai-phap/shop-online' as const, vi ? 'Shop online' : 'Online sellers', vi ? 'Tách hàng khỏi không gian sống và vận hành shop gọn hơn.' : 'Separate inventory from living space and run the shop with less clutter.'],
    ['/giai-phap/doanh-nghiep-nho' as const, vi ? 'Doanh nghiệp nhỏ' : 'Small business', vi ? 'Thêm không gian cho hàng mẫu, thiết bị và tồn kho.' : 'Add room for samples, equipment and inventory.'],
    ['/giai-phap/chua-hang' as const, vi ? 'Chứa hàng' : 'Inventory storage', vi ? 'Giữ hàng tồn và đồ ít dùng ngoài khu vực làm việc chính.' : 'Keep inventory and infrequently used items outside the main workspace.'],
    ['/giai-phap/ca-nhan' as const, vi ? 'Cá nhân' : 'Personal storage', vi ? 'Giải phóng diện tích nhà ở mà vẫn giữ đồ trong kho riêng.' : 'Free up room at home while keeping belongings in private storage.']
  ] as const;

  return (
    <main>
      <PageIntro
        eyebrow={vi ? 'GIẢI PHÁP' : 'SOLUTIONS'}
        title={vi ? 'Giải pháp lưu trữ NupsBox' : 'NupsBox storage solutions'}
        description={vi
          ? 'Bắt đầu từ tình huống của bạn, sau đó dùng Storage Finder để xác định loại kho phù hợp hơn.'
          : 'Start with your situation, then use Storage Finder to narrow down a suitable unit.'}
      />

      <Section>
        <SectionHeading
          eyebrow={vi ? 'CHỌN TÌNH HUỐNG GẦN NHẤT' : 'CHOOSE THE CLOSEST SITUATION'}
          title={vi ? 'Một nhu cầu rõ ràng giúp chọn kho nhanh hơn.' : 'A clear use case makes the next choice easier.'}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map(([href, title, body]) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-[var(--nupsbox-border)] bg-white p-6 transition hover:-translate-y-px hover:border-[var(--nupsbox-blue)] hover:shadow-[var(--nupsbox-shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
            >
              <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)] sm:text-2xl">{title}</h2>
              <p className="mt-2.5 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
              <span className="mt-4 inline-flex text-sm font-bold text-[var(--nupsbox-blue)]">
                {vi ? 'Xem giải pháp →' : 'View solution →'}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
