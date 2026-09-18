import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import {UnitCard} from '@/components/units/unit-card';
import type {PublicUnitType} from '@/features/catalog/types';

export function FeaturedUnits({units, locale}: {units: PublicUnitType[]; locale: 'vi' | 'en'}) {
  if (!units.length) return null;
  const vi = locale === 'vi';

  return (
    <Section>
      <SectionHeading
        eyebrow={vi ? 'LOẠI KHO' : 'UNIT TYPES'}
        title={vi ? 'Xem nhanh những lựa chọn phổ biến.' : 'See the most relevant options at a glance.'}
        description={vi
          ? 'Diện tích, mục đích sử dụng và giá chỉ hiển thị khi có dữ liệu được NupsBox cập nhật. Không có số ước tính hoặc tình trạng giả.'
          : 'Area, use-case guidance and pricing are shown only when maintained by NupsBox. No estimated prices or invented status.'}
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {units.map((unit) => <UnitCard key={unit.id} unit={unit} locale={locale} />)}
      </div>
    </Section>
  );
}
