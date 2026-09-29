import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:shop-online', {
    vi: {title: 'Kho mini cho shop online', description: 'Cách tách tồn kho khỏi nhà ở, tổ chức SKU và xây một điểm lưu trữ gọn cho shop online tại TP.HCM.'},
    en: {title: 'Mini storage for online sellers', description: 'How to separate inventory from living space, organize SKUs and build a compact storage base for ecommerce operations in Ho Chi Minh City.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      storyKey="shop-online"
      titleVi="Kho mini cho shop online"
      titleEn="Mini storage for online sellers"
      bodyVi="Tách tồn kho khỏi không gian sống và biến kho thành một điểm vận hành có cấu trúc: nhập hàng, phân loại, lấy hàng và kiểm kê rõ ràng hơn."
      bodyEn="Move inventory out of your living space and turn storage into a structured operating base for receiving, sorting, picking and stock checks."
      fitVi={[
        {title: 'Nhà ở bắt đầu quá tải', body: 'Thùng hàng, vật tư đóng gói và hàng hoàn chiếm chỗ sinh hoạt hoặc làm việc tại nhà.'},
        {title: 'SKU tăng nhanh', body: 'Nhiều mẫu, màu hoặc size khiến việc tìm đúng món hàng chậm hơn và dễ lệch tồn kho.'},
        {title: 'Chưa cần thuê mặt bằng lớn', body: 'Shop cần thêm không gian nhưng chưa cần gánh chi phí của một cửa hàng hoặc văn phòng lớn hơn.'}
      ]}
      fitEn={[
        {title: 'Home space is overloaded', body: 'Cartons, packing materials and returns are taking over living or working space.'},
        {title: 'SKU count is growing', body: 'More styles, colours or sizes make picking slower and stock discrepancies more likely.'},
        {title: 'A larger lease is premature', body: 'The business needs room without the cost and commitment of a larger shop or office.'}
      ]}
      operatingVi={[
        {title: 'Chia kho theo tốc độ bán', body: 'Đặt nhóm bán nhanh gần lối lấy hàng; hàng chậm hơn ở phía sâu hơn. Cách này giảm thời gian đi lại mỗi lần soạn đơn.'},
        {title: 'Một SKU – một vị trí chính', body: 'Dùng nhãn vị trí cố định theo kệ/tầng/hộp thay vì nhớ bằng mắt. Khi có nhiều người cùng lấy hàng, quy tắc này giúp giảm nhầm lẫn.'},
        {title: 'Tách hàng bán, hàng hoàn và vật tư', body: 'Không trộn hàng có thể bán ngay với hàng chờ kiểm tra hoặc vật tư đóng gói. Ba luồng khác nhau nên có ba vùng rõ ràng.'}
      ]}
      operatingEn={[
        {title: 'Zone by sales velocity', body: 'Keep fast movers closest to the picking path and slower movers deeper inside. This reduces repeated walking during fulfilment.'},
        {title: 'One primary location per SKU', body: 'Use fixed shelf, level and bin labels instead of visual memory. This becomes more important when multiple people pick orders.'},
        {title: 'Separate sellable stock, returns and packing', body: 'Do not mix ready-to-sell inventory with returns awaiting checks or packing materials. They are different operational flows.'}
      ]}
      checklistVi={[
        'Liệt kê số SKU và nhóm sản phẩm bán nhanh nhất trước khi ước lượng diện tích.',
        'Ước lượng số kiện nhập lớn nhất trong một đợt, không chỉ mức tồn trung bình.',
        'Chừa lối tiếp cận cho nhóm hàng lấy thường xuyên thay vì lấp kín toàn bộ thể tích.',
        'Quy định cách đánh mã vị trí ngay từ ngày đầu để việc kiểm kê không phụ thuộc trí nhớ.',
        'Xác nhận giá, tình trạng kho và cách tiếp cận cơ sở trước khi chuyển hàng vào.'
      ]}
      checklistEn={[
        'List your SKU count and fastest-selling product groups before estimating space.',
        'Estimate the largest inbound batch, not only average inventory.',
        'Keep an access path to frequently picked stock instead of filling every cubic metre.',
        'Define location codes from day one so stock checks do not depend on memory.',
        'Confirm pricing, availability and facility access before moving inventory in.'
      ]}
      analysisVi="Với shop online, chi phí thật không chỉ là tiền thuê kho. Mỗi phút tìm SKU, xử lý hàng hoàn hoặc kiểm đếm lại vì sai vị trí đều là chi phí vận hành. Một kho nhỏ nhưng được chia theo tốc độ bán và luồng hàng có thể hiệu quả hơn một không gian lớn nhưng không có quy tắc."
      analysisEn="For an online seller, the real cost is not only rent. Every minute spent searching for SKUs, sorting returns or recounting misplaced stock is an operating cost. A smaller unit organized around sales velocity and stock flows can outperform a larger but unstructured space."
      relatedBlogSlug="kho-cho-shop-online-tu-nha-ra-kho-rieng"
      relatedBlogTitleVi="Đọc phân tích: Khi nào shop online nên tách tồn kho khỏi nhà →"
      relatedBlogTitleEn="Read: When should an online seller move inventory out of the home? →"
    />
  );
}
