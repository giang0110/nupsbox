import {ArrowUpRight, Building2, Newspaper, PackageSearch} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';

export function CommercialOverview({locale}: {locale: 'vi' | 'en'}) {
  const vi = locale === 'vi';
  const items = [
    {
      href: '/giai-phap' as const,
      icon: PackageSearch,
      eyebrow: vi ? 'DỊCH VỤ' : 'SERVICES',
      title: vi ? 'Giải pháp lưu trữ' : 'Storage solutions',
      body: vi
        ? 'Tìm hiểu các nhóm nhu cầu NupsBox đang phục vụ cho shop online, doanh nghiệp nhỏ, hàng hóa và cá nhân.'
        : 'Explore the storage needs NupsBox serves for online sellers, small businesses, inventory and personal use.'
    },
    {
      href: '/dia-diem' as const,
      icon: Building2,
      eyebrow: vi ? 'CƠ SỞ & NĂNG LỰC' : 'FACILITIES & CAPABILITY',
      title: vi ? 'Không gian và hình ảnh thực tế' : 'Facilities and real imagery',
      body: vi
        ? 'Xem địa điểm, thông tin cơ sở và thư viện hình ảnh đã được công bố để đánh giá trước khi liên hệ.'
        : 'Review published locations, facility information and real imagery before making an enquiry.'
    },
    {
      href: '/blog' as const,
      icon: Newspaper,
      eyebrow: vi ? 'THÔNG TIN' : 'INSIGHTS',
      title: vi ? 'Bài viết và cập nhật' : 'Articles and updates',
      body: vi
        ? 'Theo dõi nội dung hướng dẫn, thông tin dịch vụ và các cập nhật thương mại do NupsBox công bố.'
        : 'Read guidance, service information and commercial updates published by NupsBox.'
    }
  ] as const;

  return (
    <Section size="compact">
      <SectionHeading
        eyebrow={vi ? 'THÔNG TIN THƯƠNG MẠI' : 'COMMERCIAL INFORMATION'}
        title={vi ? 'Hiểu NupsBox trước khi quyết định liên hệ.' : 'Understand NupsBox before you decide to get in touch.'}
        description={vi
          ? 'Website ưu tiên thông tin về dịch vụ, cơ sở, nội dung và kênh liên hệ. Giá và tình trạng chỉ được xem là thông tin cần xác nhận tại thời điểm trao đổi.'
          : 'The website prioritizes service, facility, content and contact information. Pricing and availability remain subject to confirmation at enquiry time.'}
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {items.map(({href, icon: Icon, eyebrow, title, body}) => (
          <Link
            key={href}
            href={href}
            className="group rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[rgba(8,70,168,.28)] hover:shadow-[0_18px_46px_rgba(7,26,56,.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
                <Icon size={19} aria-hidden="true" />
              </span>
              <ArrowUpRight size={18} aria-hidden="true" className="text-[var(--nupsbox-slate)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <p className="mt-6 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">{eyebrow}</p>
            <h2 className="mt-2 text-xl font-extrabold tracking-[-0.025em] text-[var(--nupsbox-navy)]">{title}</h2>
            <p className="mt-2.5 text-sm leading-6 text-[var(--nupsbox-slate)]">{body}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
