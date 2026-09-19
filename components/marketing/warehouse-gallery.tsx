'use client';

import Image from 'next/image';
import {ChevronLeft, ChevronRight, Images} from 'lucide-react';
import {useState} from 'react';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicGalleryItem} from '@/features/content/public-media';

export function WarehouseGallery({
  locale,
  items
}: {
  locale: 'vi' | 'en';
  items: PublicGalleryItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!items.length) return null;

  const vi = locale === 'vi';
  const active = items[activeIndex] ?? items[0];

  function move(delta: number) {
    setActiveIndex((index) => (index + delta + items.length) % items.length);
  }

  return (
    <Section size="compact">
      <SectionHeading
        eyebrow={vi ? 'HÌNH ẢNH KHO' : 'WAREHOUSE GALLERY'}
        title={vi ? 'Xem không gian kho trước khi liên hệ.' : 'See the storage space before you enquire.'}
        description={vi
          ? 'Ảnh được quản lý từ Admin CMS và chỉ hiển thị khi đã gắn đúng cơ sở, có alt text và được đánh dấu công khai.'
          : 'Images are managed from Admin CMS and appear only when linked to the correct facility, described with alt text and marked public.'}
      />

      <div className="mt-7 overflow-hidden rounded-3xl border border-[var(--nupsbox-border)] bg-white shadow-[var(--nupsbox-shadow-sm)]">
        <div className="relative aspect-[16/9] min-h-64 bg-[var(--nupsbox-navy)] sm:aspect-[2/1]">
          <Image
            key={active.id}
            src={active.url}
            alt={active.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1180px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 text-white sm:p-5">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/70">{active.category}</p>
              <p className="mt-1 truncate text-sm font-bold sm:text-base">{active.alt}</p>
            </div>
            {items.length > 1 ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label={vi ? 'Ảnh trước' : 'Previous image'}
                  className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label={vi ? 'Ảnh tiếp theo' : 'Next image'}
                  className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto p-3 sm:p-4" aria-label={vi ? 'Danh sách ảnh kho' : 'Warehouse image list'}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={item.alt}
              aria-current={index === activeIndex ? 'true' : undefined}
              className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border-2 border-transparent aria-[current=true]:border-[var(--nupsbox-blue)] sm:w-32"
            >
              <Image src={item.url} alt="" fill sizes="128px" className="object-cover" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--nupsbox-border)] px-4 py-3 text-xs text-[var(--nupsbox-slate)]">
          <Images size={15} aria-hidden="true" />
          {vi ? `${items.length} ảnh đã được công bố` : `${items.length} published images`}
        </div>
      </div>
    </Section>
  );
}
