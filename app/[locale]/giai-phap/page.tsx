import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Container} from '@/components/ui/container';
import {Link} from '@/i18n/navigation';
import {isSupportedLocale} from '@/i18n/routing';

export default async function SolutionsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const vi = locale === 'vi';
  const items = [
    ['/giai-phap/shop-online' as const, vi ? 'Shop online' : 'Online sellers'],
    ['/giai-phap/doanh-nghiep-nho' as const, vi ? 'Doanh nghiệp nhỏ' : 'Small business'],
    ['/giai-phap/chua-hang' as const, vi ? 'Chứa hàng' : 'Inventory storage'],
    ['/giai-phap/ca-nhan' as const, vi ? 'Cá nhân' : 'Personal storage']
  ] as const;
  return <main><section className="py-20"><Container><h1 className="text-5xl font-black tracking-[-0.055em] text-[var(--nupsbox-navy)] sm:text-6xl">{vi ? 'Giải pháp lưu trữ NupsBox' : 'NupsBox storage solutions'}</h1><div className="mt-10 grid gap-4 md:grid-cols-2">{items.map(([href,title])=><Link key={href} href={href} className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-7 text-2xl font-black text-[var(--nupsbox-navy)] hover:border-[var(--nupsbox-blue)]">{title} →</Link>)}</div></Container></section></main>;
}
