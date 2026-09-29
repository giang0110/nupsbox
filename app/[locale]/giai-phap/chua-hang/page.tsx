import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:inventory', {
    vi: {title: 'Kho chứa hàng linh hoạt', description: 'Cách tổ chức hàng tồn chậm luân chuyển, hàng dự phòng và lượng hàng chưa cần đặt tại cửa hàng hoặc văn phòng.'},
    en: {title: 'Flexible inventory storage', description: 'How to organize slow-moving, buffer and overflow inventory outside the main shop or office.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      titleVi="Kho chứa hàng linh hoạt"
      titleEn="Flexible inventory storage"
      bodyVi="Đưa phần tồn kho không cần nằm ngay tại điểm bán ra một khu lưu trữ có cấu trúc, nhưng vẫn giữ khả năng kiểm soát, kiểm kê và bổ sung hàng."
      bodyEn="Move inventory that does not need to sit at the point of sale into a structured storage area while keeping it controlled, countable and replenishable."
      fitVi={[
        {title: 'Hàng chậm luân chuyển chiếm chỗ', body: 'Nhóm bán chậm đang cạnh tranh diện tích với hàng tạo doanh thu nhanh hơn tại cửa hàng hoặc văn phòng.'},
        {title: 'Có tồn kho dự phòng', body: 'Doanh nghiệp cần giữ buffer stock nhưng không muốn mọi thùng hàng nằm ở điểm vận hành chính.'},
        {title: 'Có đợt nhập lớn theo mùa', body: 'Hàng về theo lô khiến không gian chính quá tải trong một số giai đoạn.'}
      ]}
      fitEn={[
        {title: 'Slow movers consume prime space', body: 'Lower-velocity stock competes with faster-selling products for room at the main operating location.'},
        {title: 'You hold buffer inventory', body: 'The business needs safety stock without keeping every carton at the primary site.'},
        {title: 'Inbound volume is seasonal', body: 'Large purchasing batches temporarily overwhelm the main workspace.'}
      ]}
      operatingVi={[
        {title: 'Tách nhanh – trung bình – chậm', body: 'Không nên xếp mọi SKU theo cùng một logic. Tốc độ bán và tần suất bổ sung quyết định khu vực ưu tiên.'},
        {title: 'Theo dõi tuổi tồn kho', body: 'Một món hàng ở kho càng lâu càng cần được xem lại về giá, nhu cầu hoặc phương án giải phóng. Không gian lưu trữ không làm mất đi chi phí vốn.'},
        {title: 'Kiểm kê theo chu kỳ', body: 'Thay vì chờ một lần kiểm kê lớn, có thể đếm luân phiên nhóm quan trọng hoặc dễ sai để phát hiện lệch sớm.'}
      ]}
      operatingEn={[
        {title: 'Separate fast, medium and slow movers', body: 'Not every SKU should follow the same storage logic. Sales velocity and replenishment frequency should drive priority zones.'},
        {title: 'Track inventory age', body: 'The longer an item sits, the more it deserves a pricing, demand or clearance review. Storage does not remove the cost of tied-up capital.'},
        {title: 'Use cycle counts', body: 'Instead of waiting for one large stocktake, rotate counts through high-value or discrepancy-prone groups to catch errors earlier.'}
      ]}
      checklistVi={[
        'Xác định SKU nào thật sự cần nằm tại điểm bán và SKU nào có thể để ngoài.',
        'Theo dõi ngày nhập hoặc tuổi tồn kho để tránh “cất rồi quên”.',
        'Đặt nhóm bổ sung thường xuyên gần lối tiếp cận và nhóm chậm hơn ở phía sâu.',
        'Duy trì số lượng trên hệ thống khớp với lượng hàng thực tế bằng kiểm kê định kỳ.',
        'Không dùng thêm diện tích như một lý do để tiếp tục giữ hàng không còn hiệu quả kinh tế.'
      ]}
      checklistEn={[
        'Identify which SKUs truly need to stay at the selling location and which can be stored elsewhere.',
        'Track receipt date or inventory age so stock is not simply stored and forgotten.',
        'Keep frequently replenished products closer to access and slower items deeper inside.',
        'Reconcile system quantities with physical stock through regular counts.',
        'Do not use extra space as a reason to keep economically unproductive inventory indefinitely.'
      ]}
      analysisVi="Kho linh hoạt giải quyết vấn đề không gian, nhưng quản trị tồn kho mới quyết định hiệu quả vốn. Nếu hàng chậm luân chuyển được đưa ra ngoài mà không theo dõi tuổi tồn, doanh nghiệp chỉ chuyển sự lộn xộn sang một địa điểm khác. Mục tiêu tốt hơn là vừa giải phóng điểm bán vừa tạo kỷ luật cho luồng hàng."
      analysisEn="Flexible storage solves a space constraint, but inventory discipline determines capital efficiency. If slow-moving stock is moved off-site without aging and count controls, the business has only relocated the clutter. A better outcome is to free the primary site while imposing clearer rules on stock flow."
      relatedBlogSlug="quan-ly-hang-ton-cham-luan-chuyen"
      relatedBlogTitleVi="Đọc phân tích: Quản lý hàng tồn chậm luân chuyển mà không mất kiểm soát →"
      relatedBlogTitleEn="Read: Managing slow-moving inventory without losing control →"
    />
  );
}
