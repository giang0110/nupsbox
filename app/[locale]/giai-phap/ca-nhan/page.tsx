import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {SolutionPage} from '@/components/marketing/solution-page';
import {createStaticPageMetadata} from '@/features/seo/static-page';
import {isSupportedLocale} from '@/i18n/routing';

export function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  return createStaticPageMetadata(params, 'solution:personal', {
    vi: {title: 'Kho mini cho cá nhân', description: 'Cách dùng kho riêng khi chuyển nhà, sửa nhà, cất đồ theo mùa hoặc cần giải phóng không gian sống.'},
    en: {title: 'Mini storage for personal use', description: 'How to use private storage for moving, renovation, seasonal rotation or freeing up living space.'}
  });
}

export default async function Page({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <SolutionPage
      locale={locale}
      titleVi="Kho mini cho cá nhân"
      titleEn="Mini storage for personal use"
      bodyVi="Dùng kho như một phần mở rộng có tổ chức của ngôi nhà: chỉ giữ những thứ còn giá trị sử dụng, biết chúng nằm ở đâu và vẫn lấy được khi cần."
      bodyEn="Use storage as an organized extension of the home: keep only things that still have value, know where they are and keep them retrievable."
      fitVi={[
        {title: 'Chuyển nhà hoặc chờ bàn giao', body: 'Có một khoảng thời gian hai nơi ở không khớp nhau và cần giữ đồ ở một điểm trung gian.'},
        {title: 'Sửa nhà', body: 'Đồ nội thất và vật dụng cần được đưa ra khỏi khu vực thi công để tạo không gian làm việc.'},
        {title: 'Đồ theo mùa hoặc ít dùng', body: 'Vali, đồ trang trí, thiết bị hoặc vật dụng vẫn cần giữ nhưng không đáng chiếm diện tích sống hằng ngày.'}
      ]}
      fitEn={[
        {title: 'Moving between homes', body: 'There is a gap between move-out and move-in dates and belongings need a temporary intermediate location.'},
        {title: 'Renovation', body: 'Furniture and belongings need to leave the work zone so contractors have room and items are separated from the project.'},
        {title: 'Seasonal or occasional items', body: 'Luggage, decorations, equipment or belongings are worth keeping but not worth permanent living-space occupancy.'}
      ]}
      operatingVi={[
        {title: 'Lập danh sách trước khi đóng thùng', body: 'Danh sách theo số hộp và nhóm đồ giúp bạn tìm lại món cần dùng mà không mở mọi thùng.'},
        {title: 'Đồ cần trước để gần lối đi', body: 'Giấy tờ, vali, đồ trẻ em hoặc vật dụng có khả năng cần lại sớm nên nằm trong vùng dễ tiếp cận.'},
        {title: 'Không biến kho thành nơi trì hoãn bỏ đồ', body: 'Mỗi lần gia hạn là một dịp xem món nào thực sự còn đáng giữ so với chi phí và diện tích.'}
      ]}
      operatingEn={[
        {title: 'Inventory before boxing', body: 'A simple list by box number and category makes retrieval possible without opening every carton.'},
        {title: 'Keep likely-needed items accessible', body: 'Documents, luggage, children’s items or anything likely to be needed soon should stay near the access path.'},
        {title: 'Do not use storage to postpone decisions forever', body: 'Each renewal is a useful moment to ask which belongings are still worth their space and cost.'}
      ]}
      checklistVi={[
        'Phân loại giữ lâu, cần lấy sớm và có thể thanh lý trước khi đóng gói.',
        'Đánh số hộp và ghi nhóm đồ ở bên ngoài; lưu một danh sách trên điện thoại hoặc bảng tính.',
        'Không xếp kín lối nếu dự kiến còn lấy đồ trong thời gian thuê.',
        'Ưu tiên bao bọc đồ dễ trầy, dễ vỡ và tránh để vật nặng lên đồ mềm.',
        'Xác nhận điều kiện tiếp cận, thời gian thuê dự kiến và chi phí trước khi chuyển đồ.'
      ]}
      checklistEn={[
        'Separate long-term items, near-term retrieval items and things that can be sold or donated before packing.',
        'Number boxes and label categories outside; keep a matching list on a phone or spreadsheet.',
        'Do not fill the access path if you expect to retrieve items during the rental period.',
        'Protect scratch- and breakage-prone items and avoid placing heavy items on soft belongings.',
        'Confirm access conditions, expected rental duration and cost before moving belongings.'
      ]}
      analysisVi="Kho cá nhân có giá trị nhất khi nó trả lại diện tích sống mà không làm bạn mất kiểm soát đồ đạc. Nếu mọi thứ chỉ được chất vào thùng mà không có danh sách, vài tháng sau bạn có thêm một vấn đề tìm kiếm. Tổ chức từ lúc đóng gói thường quan trọng hơn việc cố nhồi thêm vài hộp vào cùng diện tích."
      analysisEn="Personal storage is most valuable when it gives living space back without making belongings harder to control. If everything is boxed without an inventory, months later the storage unit becomes a search problem. Organization at packing time is usually more valuable than squeezing a few extra boxes into the same footprint."
      relatedBlogSlug="kho-ca-nhan-chuyen-nha-sua-nha"
      relatedBlogTitleVi="Đọc phân tích: Cách dùng kho cá nhân khi chuyển nhà, sửa nhà và xoay vòng đồ →"
      relatedBlogTitleEn="Read: Personal storage for moving, renovation and seasonal rotation →"
    />
  );
}
