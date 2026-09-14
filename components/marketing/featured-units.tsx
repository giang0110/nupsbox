import {Container} from '@/components/ui/container';
import {UnitCard} from '@/components/units/unit-card';
import type {PublicUnitType} from '@/features/catalog/types';

export function FeaturedUnits({units, locale}: {units: PublicUnitType[]; locale: 'vi' | 'en'}) {
  if (!units.length) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">{locale === 'vi' ? 'LOẠI KHO' : 'UNIT TYPES'}</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">
            {locale === 'vi' ? 'Chọn không gian vừa đủ cho lượng hàng.' : 'Choose the space that fits your inventory.'}
          </h2>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            {locale === 'vi' ? 'Giá và trạng thái chỉ hiển thị khi có dữ liệu được NupsBox cập nhật; nếu chưa có, website sẽ hướng bạn liên hệ để xác nhận.' : 'Pricing and status are only shown when maintained by NupsBox; otherwise the website asks you to enquire for confirmation.'}
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {units.map((unit) => <UnitCard key={unit.id} unit={unit} locale={locale} />)}
        </div>
      </Container>
    </section>
  );
}
