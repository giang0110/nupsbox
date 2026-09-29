import Link from 'next/link';
import {ArrowRight, CheckCircle2, CircleDot, Lightbulb, Rows3} from 'lucide-react';
import {PageIntro} from '@/components/ui/page-intro';
import {Section} from '@/components/ui/section';
import {ConversionCta} from './conversion-cta';
import {FinalCta} from './final-cta';

export type SolutionKind = 'shop-online' | 'small-business' | 'inventory' | 'personal';

type SolutionProfile = {
  fitTitle: string;
  fit: string[];
  modelTitle: string;
  model: string[];
  checklistTitle: string;
  checklist: string[];
  insightTitle: string;
  insightBody: string;
  insightSlug: string;
};

const profiles: Record<'vi' | 'en', Record<SolutionKind, SolutionProfile>> = {
  vi: {
    'shop-online': {
      fitTitle: 'Phù hợp khi shop bắt đầu “tràn” khỏi nhà',
      fit: [
        'Hàng chiếm phòng ngủ, hành lang hoặc khu sinh hoạt.',
        'Số SKU tăng khiến việc tìm – lấy – đóng gói chậm hơn.',
        'Cần một điểm chứa hàng riêng nhưng chưa cần thuê kho lớn.'
      ],
      modelTitle: 'Tổ chức theo luồng lấy hàng',
      model: [
        'Đưa SKU bán nhanh ra vùng dễ tiếp cận nhất.',
        'Đặt mã kệ/bin nhất quán để giảm thời gian tìm hàng.',
        'Tách hàng chậm bán khỏi khu vực picking chính.'
      ],
      checklistTitle: 'Ba số liệu nên chuẩn bị',
      checklist: [
        'Số SKU và số thùng đang có.',
        'Đơn hàng trung bình mỗi ngày/tuần.',
        'Kích thước kiện lớn nhất cần lưu.'
      ],
      insightTitle: 'Kho nhỏ vẫn có thể vận hành như một micro-warehouse',
      insightBody: 'Điểm mấu chốt không phải nhồi được nhiều hàng nhất, mà là giữ tuyến lấy hàng ngắn, mã vị trí rõ và hàng bán nhanh luôn dễ tiếp cận.',
      insightSlug: 'sap-xep-kho-shop-online'
    },
    'small-business': {
      fitTitle: 'Phù hợp khi văn phòng đang gánh cả vai trò kho',
      fit: [
        'Hàng mẫu, vật tư hoặc thiết bị chiếm chỗ làm việc.',
        'Muốn tách phần lưu trữ khỏi khu vực tiếp khách và vận hành.',
        'Nhu cầu diện tích thay đổi theo dự án hoặc mùa.'
      ],
      modelTitle: 'Tách “không gian làm việc” khỏi “không gian lưu trữ”',
      model: [
        'Giữ tại văn phòng những gì cần dùng hàng ngày.',
        'Đưa hàng mẫu, vật tư và tồn kho ít truy cập sang kho riêng.',
        'Đánh giá tổng chi phí thay vì chỉ so đơn giá m².'
      ],
      checklistTitle: 'Trước khi quyết định',
      checklist: [
        'Tần suất cần lấy hàng từ kho.',
        'Nhóm tài sản nào phải ở lại văn phòng.',
        'Chi phí cơ hội của diện tích văn phòng đang bị chiếm.'
      ],
      insightTitle: 'Thuê thêm văn phòng hay tách riêng kho?',
      insightBody: 'Hai lựa chọn giải quyết hai bài toán khác nhau. Nếu nhu cầu chính là chứa hàng và thiết bị, một không gian lưu trữ riêng có thể giữ văn phòng tập trung hơn vào công việc tạo doanh thu.',
      insightSlug: 'kho-hay-mo-rong-van-phong'
    },
    inventory: {
      fitTitle: 'Phù hợp với hàng tồn không cần nằm cạnh điểm bán',
      fit: [
        'Có nhóm hàng chậm luân chuyển nhưng vẫn cần giữ.',
        'Kho tại shop/văn phòng bị lẫn hàng bán nhanh và bán chậm.',
        'Cần giải phóng diện tích mà vẫn giữ khả năng kiểm soát tồn.'
      ],
      modelTitle: 'Chia hàng theo mức độ ưu tiên',
      model: [
        'Nhóm A: hàng quan trọng/bán nhanh, kiểm soát chặt và dễ lấy.',
        'Nhóm B: hàng trung bình, bố trí ở vùng tiếp cận vừa phải.',
        'Nhóm C: hàng chậm, nên rà lại mức tồn và chi phí chiếm chỗ.'
      ],
      checklistTitle: 'Dữ liệu nên có',
      checklist: [
        'Danh sách SKU và lượng tồn.',
        'Tần suất xuất hàng theo nhóm.',
        'Hàng nào có thể xếp chồng hoặc cần lối tiếp cận riêng.'
      ],
      insightTitle: 'Hàng chậm luân chuyển không nên chiếm vị trí tốt nhất',
      insightBody: 'Phân loại tồn kho giúp dành không gian dễ tiếp cận cho hàng quan trọng, đồng thời nhìn rõ nhóm hàng đang khóa vốn và diện tích.',
      insightSlug: 'quan-ly-hang-ton-cham-luan-chuyen'
    },
    personal: {
      fitTitle: 'Phù hợp khi nhà ở cần “thở” thêm',
      fit: [
        'Chuyển nhà nhưng hai thời điểm bàn giao không trùng nhau.',
        'Sửa nhà và cần đưa đồ ra khỏi khu thi công.',
        'Đồ theo mùa hoặc đồ ít dùng vẫn muốn giữ lâu dài.'
      ],
      modelTitle: 'Lưu theo khả năng cần lấy lại',
      model: [
        'Đồ cần sớm đặt gần lối tiếp cận.',
        'Đồ theo mùa gom theo nhóm và ghi nhãn rõ.',
        'Hộp nặng ở dưới; đồ dễ vỡ tách riêng và tránh bị đè.'
      ],
      checklistTitle: 'Trước khi đóng đồ',
      checklist: [
        'Lập danh sách nhóm đồ cần lưu.',
        'Đo các món cồng kềnh thay vì ước lượng bằng mắt.',
        'Đánh dấu hộp cần lấy sớm và hộp lưu dài hạn.'
      ],
      insightTitle: 'Đừng thuê kho theo cảm giác “chắc phải rộng”',
      insightBody: 'Một danh sách đồ đơn giản và cách xếp theo nhóm thường giúp ước lượng thực tế hơn, tránh thuê dư diện tích nhưng vẫn giữ lối tiếp cận cần thiết.',
      insightSlug: 'kho-ca-nhan-chuyen-nha-sua-nha'
    }
  },
  en: {
    'shop-online': {
      fitTitle: 'A fit when inventory starts spilling out of home',
      fit: [
        'Stock is taking over bedrooms, corridors or living areas.',
        'A growing SKU count is slowing picking and packing.',
        'You need a separate stock point without a large warehouse lease.'
      ],
      modelTitle: 'Organize around the picking flow',
      model: [
        'Keep fast-moving SKUs in the easiest-to-reach zone.',
        'Use consistent shelf/bin codes to reduce search time.',
        'Move slow stock away from the primary picking area.'
      ],
      checklistTitle: 'Three numbers to prepare',
      checklist: [
        'SKU count and number of cartons on hand.',
        'Average orders per day or week.',
        'Largest carton or item dimensions.'
      ],
      insightTitle: 'A small unit can still work like a micro-warehouse',
      insightBody: 'The goal is not to pack in the maximum amount. It is to shorten picking paths, keep locations clear and make fast movers easy to reach.',
      insightSlug: 'sap-xep-kho-shop-online'
    },
    'small-business': {
      fitTitle: 'A fit when the office is doubling as a stockroom',
      fit: [
        'Samples, supplies or equipment are taking over work areas.',
        'You want storage separated from client-facing and operating space.',
        'Space needs move up and down with projects or seasons.'
      ],
      modelTitle: 'Separate work space from storage space',
      model: [
        'Keep only daily-use items at the office.',
        'Move samples, supplies and slower stock to dedicated storage.',
        'Compare total occupancy cost, not only price per square metre.'
      ],
      checklistTitle: 'Before you decide',
      checklist: [
        'How often staff need to retrieve stored items.',
        'Which assets must remain at the office.',
        'The opportunity cost of office area used for storage.'
      ],
      insightTitle: 'More office space or separate storage?',
      insightBody: 'They solve different problems. If the requirement is mainly inventory and equipment, separate storage can help keep office space focused on revenue-producing work.',
      insightSlug: 'kho-hay-mo-rong-van-phong'
    },
    inventory: {
      fitTitle: 'A fit for stock that does not need to sit beside the sales floor',
      fit: [
        'You hold slower-moving products that still need to be kept.',
        'Fast and slow inventory are mixed together in the same workspace.',
        'You need more room without losing stock visibility.'
      ],
      modelTitle: 'Segment stock by priority',
      model: [
        'A: important/fast stock, closely controlled and easy to reach.',
        'B: medium movers, stored in moderately accessible positions.',
        'C: slow movers, reviewed for stock level and space cost.'
      ],
      checklistTitle: 'Data worth preparing',
      checklist: [
        'SKU list and on-hand quantities.',
        'Retrieval frequency by stock group.',
        'Which products can stack and which need direct access.'
      ],
      insightTitle: 'Slow inventory should not occupy your best positions',
      insightBody: 'Inventory segmentation reserves accessible space for important stock while making the space and cash tied up in slow movers more visible.',
      insightSlug: 'quan-ly-hang-ton-cham-luan-chuyen'
    },
    personal: {
      fitTitle: 'A fit when your home needs breathing room',
      fit: [
        'Moving dates do not line up cleanly.',
        'Renovation work requires belongings to leave the work area.',
        'Seasonal or infrequently used belongings are still worth keeping.'
      ],
      modelTitle: 'Store by how soon you may need an item again',
      model: [
        'Keep near-term items close to the access path.',
        'Group and label seasonal belongings.',
        'Place heavy boxes low and protect fragile items from load.'
      ],
      checklistTitle: 'Before packing',
      checklist: [
        'List the groups of belongings you plan to store.',
        'Measure bulky items instead of guessing.',
        'Mark near-term boxes separately from long-term storage.'
      ],
      insightTitle: 'Do not choose unit size by the feeling that “bigger is safer”',
      insightBody: 'A simple inventory list and grouped packing plan usually produce a better estimate, reducing excess space while preserving the access path you need.',
      insightSlug: 'kho-ca-nhan-chuyen-nha-sua-nha'
    }
  }
};

export function SolutionPage({
  locale,
  kind,
  titleVi,
  titleEn,
  bodyVi,
  bodyEn
}: {
  locale: 'vi' | 'en';
  kind: SolutionKind;
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
}) {
  const vi = locale === 'vi';
  const data = profiles[locale][kind];
  const articleHref = vi ? '/blog/' + data.insightSlug : '/en/blog/' + data.insightSlug;

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
          {[
            {icon: CircleDot, title: data.fitTitle, items: data.fit},
            {icon: Rows3, title: data.modelTitle, items: data.model},
            {icon: CheckCircle2, title: data.checklistTitle, items: data.checklist}
          ].map(({icon: Icon, title, items}, index) => (
            <article
              key={title}
              className={
                'p-6 sm:p-7 lg:p-8 ' +
                (index < 2 ? 'border-b border-[var(--nupsbox-border)] lg:border-b-0 lg:border-r' : '')
              }
            >
              <span className="grid size-10 place-items-center rounded-full bg-[var(--nupsbox-surface)] text-[var(--nupsbox-blue)]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[var(--nupsbox-navy)]">{title}</h2>
              <ul className="mt-5 grid gap-3">
                {items.map(item => (
                  <li key={item} className="grid grid-cols-[auto_1fr] gap-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                    <span className="mt-[0.65rem] size-1.5 rounded-full bg-[var(--nupsbox-yellow)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <aside className="mt-5 grid gap-5 rounded-[1.75rem] bg-[var(--nupsbox-navy)] p-6 text-white sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <span className="grid size-12 place-items-center rounded-full bg-white/10 text-[var(--nupsbox-yellow)]">
            <Lightbulb size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">
              {vi ? 'GÓC PHÂN TÍCH' : 'EDITORIAL INSIGHT'}
            </p>
            <h2 className="mt-2 text-xl font-extrabold tracking-[-0.025em]">{data.insightTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/68">{data.insightBody}</p>
          </div>
          <Link href={articleHref} className="inline-flex min-h-11 items-center gap-2 font-bold text-white hover:underline">
            {vi ? 'Đọc bài chuyên sâu' : 'Read the full analysis'}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </Section>

      <FinalCta locale={locale} />
    </main>
  );
}
