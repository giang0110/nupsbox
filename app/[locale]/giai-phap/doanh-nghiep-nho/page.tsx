import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:small-business', {
    vi: {title: 'Kho cho doanh nghiệp nhỏ', description: 'Phân tích khi nào doanh nghiệp nhỏ nên tách hàng mẫu, thiết bị, tài liệu và tồn kho khỏi văn phòng.'},
    en: {title: 'Storage for small businesses', description: 'How small businesses can separate samples, equipment, documents and inventory from office space.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      storyKey="small-business"
      titleVi="Kho cho doanh nghiệp nhỏ"
      titleEn="Storage for small businesses"
      bodyVi="Tách phần lưu trữ khỏi diện tích làm việc để văn phòng dành cho con người và hoạt động tạo doanh thu, thay vì biến thành một kho tạm ngày càng chật."
      bodyEn="Separate storage from working space so the office is used for people and revenue-generating work instead of slowly becoming an improvised stockroom."
      fitVi={[
        {title: 'Văn phòng bị hàng hóa lấn chỗ', body: 'Hàng mẫu, POSM, hồ sơ hoặc thiết bị chiếm bàn, lối đi và khu vực tiếp khách.'},
        {title: 'Nhu cầu lưu trữ biến động', body: 'Có mùa cao điểm, dự án hoặc đợt nhập hàng khiến diện tích cần dùng tăng rồi giảm theo thời gian.'},
        {title: 'Cần tách vận hành khỏi không gian làm việc', body: 'Doanh nghiệp muốn nhân viên làm việc trong không gian gọn hơn nhưng vẫn giữ quyền kiểm soát tài sản.'}
      ]}
      fitEn={[
        {title: 'Inventory is taking over the office', body: 'Samples, promotional materials, records or equipment occupy desks, corridors and client-facing areas.'},
        {title: 'Storage demand fluctuates', body: 'Seasonal peaks, projects or purchase batches create temporary space requirements.'},
        {title: 'Operations need separation', body: 'The business wants a cleaner workspace while retaining control over stored assets.'}
      ]}
      operatingVi={[
        {title: 'Phân nhóm theo tần suất truy cập', body: 'Tài liệu hoặc thiết bị cần hàng tuần phải khác vị trí với đồ chỉ dùng theo mùa. Tần suất lấy quyết định vị trí, không phải chỉ kích thước.'},
        {title: 'Gắn trách nhiệm với danh mục tài sản', body: 'Duy trì danh sách những gì đang ở kho, ai có quyền lấy và lần thay đổi gần nhất. Điều này quan trọng hơn khi nhiều phòng ban dùng chung.'},
        {title: 'Đánh giá định kỳ thứ không còn đáng giữ', body: 'Kho ngoài văn phòng không nên trở thành nơi trì hoãn quyết định. Mỗi quý nên có vòng rà soát thanh lý, chuyển nhượng hoặc loại bỏ.'}
      ]}
      operatingEn={[
        {title: 'Zone by access frequency', body: 'Items needed weekly should not sit behind seasonal materials. Retrieval frequency should drive placement, not size alone.'},
        {title: 'Assign ownership to stored assets', body: 'Maintain a list of what is stored, who can retrieve it and when it last changed. This matters when several teams share the space.'},
        {title: 'Review what no longer deserves space', body: 'Off-site storage should not become a place to postpone decisions. Run periodic disposal, resale or transfer reviews.'}
      ]}
      checklistVi={[
        'Tách rõ tài sản cần truy cập thường xuyên và tài sản lưu trữ dài hơn.',
        'So sánh chi phí không gian lưu trữ với giá trị sử dụng của diện tích văn phòng bị chiếm.',
        'Lập danh mục tài sản trước khi chuyển kho và quy định người chịu trách nhiệm cập nhật.',
        'Chừa lối lấy các nhóm dùng thường xuyên; không xếp kín chỉ để tối đa diện tích.',
        'Xác nhận điều kiện tiếp cận, giá và tình trạng trước khi đưa tài sản doanh nghiệp vào.'
      ]}
      checklistEn={[
        'Separate frequently accessed assets from longer-term storage.',
        'Compare storage cost with the business value of office space currently occupied.',
        'Create an asset register before moving and assign responsibility for updates.',
        'Preserve retrieval paths for frequently used items instead of maximizing density alone.',
        'Confirm access conditions, pricing and availability before moving business assets.'
      ]}
      analysisVi="Bài toán của doanh nghiệp nhỏ thường không phải “thiếu một phòng kho” mà là dùng sai loại diện tích. Mỗi mét vuông văn phòng bị biến thành nơi chất đồ vừa làm giảm trải nghiệm làm việc vừa không được tổ chức như một khu lưu trữ. Tách hai chức năng giúp doanh nghiệp nhìn rõ hơn chi phí của từng loại không gian."
      analysisEn="For a small business, the issue is often not simply 'needing another stockroom' but using the wrong type of space. Office area filled with boxes is neither an effective workplace nor a well-run storage zone. Separating the two makes the cost and purpose of each space much clearer."
      relatedBlogSlug="kho-hay-mo-rong-van-phong"
      relatedBlogTitleVi="Đọc phân tích: Thuê kho riêng hay mở rộng văn phòng? →"
      relatedBlogTitleEn="Read: Separate storage or a larger office? →"
    />
  );
}
