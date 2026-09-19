'use client';

import Image from 'next/image';
import {ChevronLeft, ChevronRight, Expand, Images, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Section} from '@/components/ui/section';
import {SectionHeading} from '@/components/ui/section-heading';
import type {PublicGalleryItem} from '@/features/content/public-media';

export function WarehouseGallery({locale, items}: {locale: 'vi' | 'en'; items: PublicGalleryItem[]}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const vi = locale === 'vi';

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + items.length) % items.length);
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % items.length);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items.length, lightboxOpen]);

  if (!items.length) return null;
  const active = items[activeIndex] ?? items[0];

  function move(delta: number) {
    setActiveIndex((index) => (index + delta + items.length) % items.length);
  }

  return (
    <Section size="compact">
      <div id="warehouse-gallery" className="scroll-mt-24">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <SectionHeading
            eyebrow={vi ? 'KHÔNG GIAN THỰC TẾ' : 'REAL STORAGE SPACE'}
            title={vi ? 'Xem kho thật trước khi chọn.' : 'See the real space before you choose.'}
            description={vi
              ? 'Ảnh được lấy từ Media CMS và chỉ xuất hiện khi đã gắn đúng cơ sở, có mô tả và được công khai.'
              : 'Images come from the Media CMS and appear only when mapped to the correct facility, described and published.'}
          />
          <p className="max-w-xl text-sm leading-6 text-[var(--nupsbox-slate)] lg:justify-self-end lg:text-right">
            {vi
              ? 'Chạm vào ảnh để xem toàn màn hình. Dùng thumbnail hoặc phím mũi tên để chuyển nhanh giữa các góc kho.'
              : 'Open any image full screen. Use thumbnails or arrow keys to move quickly between warehouse views.'}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-[var(--nupsbox-navy)] shadow-[0_28px_72px_rgba(7,26,56,.18)]">
          <div className="relative aspect-[16/10] min-h-72 sm:aspect-[2/1] lg:min-h-[420px]">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={vi ? 'Mở ảnh kho toàn màn hình' : 'Open warehouse image full screen'}
              className="group absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--nupsbox-yellow)]"
            >
              <span className="absolute right-4 top-4 z-20 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 text-xs font-bold text-white backdrop-blur-md">
                <Expand size={15} aria-hidden="true" />
                {vi ? 'Phóng to' : 'Expand'}
              </span>
            </button>
            <Image key={active.id} src={active.url} alt={active.alt} fill sizes="(max-width: 1024px) 100vw, 1180px" className="object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.88)] via-transparent to-black/10" />
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-5 pt-20 text-white sm:p-7">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--nupsbox-yellow)]">{active.category}</p>
                <p className="mt-1.5 max-w-2xl text-base font-bold leading-6 sm:text-xl">{active.alt}</p>
                <p className="mt-2 text-xs text-white/55">
                  {vi ? items.length + ' ảnh đã được công bố' : items.length + ' published images'}
                </p>
              </div>
              {items.length > 1 ? (
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => move(-1)} aria-label={vi ? 'Ảnh trước' : 'Previous image'} className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur transition hover:bg-black/50">
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => move(1)} aria-label={vi ? 'Ảnh tiếp theo' : 'Next image'} className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur transition hover:bg-black/50">
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto border-t border-white/10 p-3 sm:p-4" aria-label={vi ? 'Danh sách ảnh kho' : 'Warehouse image list'}>
            <span className="hidden shrink-0 items-center gap-2 px-2 text-xs font-bold text-white/55 sm:inline-flex"><Images size={15} aria-hidden="true" />{items.length}</span>
            {items.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActiveIndex(index)} aria-label={item.alt} aria-current={index === activeIndex ? 'true' : undefined} className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border-2 border-transparent opacity-65 transition hover:opacity-100 aria-[current=true]:border-[var(--nupsbox-yellow)] aria-[current=true]:opacity-100 sm:w-32">
                <Image src={item.url} alt="" fill sizes="128px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <div role="dialog" aria-modal="true" aria-label={vi ? 'Xem ảnh kho toàn màn hình' : 'Full-screen warehouse gallery'} className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(3,12,28,.96)] p-3 sm:p-6">
          <button type="button" onClick={() => setLightboxOpen(false)} aria-label={vi ? 'Đóng ảnh' : 'Close image'} className="absolute right-4 top-4 z-20 grid size-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20">
            <X size={22} aria-hidden="true" />
          </button>
          <div className="relative h-[min(78vh,820px)] w-full max-w-6xl overflow-hidden rounded-2xl">
            <Image src={active.url} alt={active.alt} fill sizes="100vw" className="object-contain" priority />
          </div>
          {items.length > 1 ? (
            <>
              <button type="button" onClick={() => move(-1)} aria-label={vi ? 'Ảnh trước' : 'Previous image'} className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:left-6"><ChevronLeft size={24} aria-hidden="true" /></button>
              <button type="button" onClick={() => move(1)} aria-label={vi ? 'Ảnh tiếp theo' : 'Next image'} className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:right-6"><ChevronRight size={24} aria-hidden="true" /></button>
            </>
          ) : null}
          <div className="absolute inset-x-4 bottom-4 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center text-sm text-white/80 backdrop-blur">
            {active.alt} · {activeIndex + 1}/{items.length}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
