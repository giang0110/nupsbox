import Image from 'next/image';
import {Camera, ExternalLink} from 'lucide-react';
import type {PublicEditorialMedia} from '@/features/content/editorial-media';

export function RealMediaStory({
  items,
  locale,
  compact = false
}: {
  items: PublicEditorialMedia[];
  locale: 'vi' | 'en';
  compact?: boolean;
}) {
  if (!items.length) return null;
  const vi = locale === 'vi';

  return (
    <section
      aria-label={vi ? 'Ảnh cơ sở thực tế NupsBox' : 'Real NupsBox facility imagery'}
      className="overflow-hidden rounded-[1.75rem] border border-[var(--nupsbox-border)] bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nupsbox-border)] px-5 py-4 sm:px-6">
        <div>
          <p className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
            <Camera size={15} aria-hidden="true" />
            {vi ? 'ẢNH CƠ SỞ THỰC TẾ' : 'REAL FACILITY IMAGERY'}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">
            {vi
              ? 'Ảnh NupsBox đã được công bố; dùng để hình dung không gian thực tế, không phải ảnh minh họa giả lập cho tình huống trong bài.'
              : 'Published NupsBox imagery for understanding the real facility; it is not a staged depiction of the scenario discussed.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nupsbox-surface)] px-3 py-1.5 text-xs font-black text-[var(--nupsbox-navy)]">
          {items.length} {vi ? 'ảnh' : 'image' + (items.length === 1 ? '' : 's')}
        </span>
      </div>

      <div className={'grid ' + (items.length === 1 ? '' : compact ? 'sm:grid-cols-2' : 'md:grid-cols-2')}>
        {items.map((item, index) => (
          <figure
            key={item.linkId}
            className={
              'group relative overflow-hidden bg-[var(--nupsbox-surface)] ' +
              (items.length > 1 && index > 0 ? 'border-t border-[var(--nupsbox-border)] sm:border-l sm:border-t-0' : '')
            }
          >
            <div className={compact ? 'relative aspect-[16/9]' : 'relative aspect-[16/10]'}>
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes={items.length === 1 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                className="object-cover transition duration-500 group-hover:scale-[1.015]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(7,26,56,.68)] via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--nupsbox-yellow)]">
                  {item.category}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-bold leading-5">{item.alt}</p>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] px-5 py-3 text-xs font-semibold text-[var(--nupsbox-slate)] sm:px-6">
        <ExternalLink size={14} aria-hidden="true" />
        {vi ? 'Media được quản lý từ Admin Media và chỉ hiển thị khi đang public.' : 'Media is managed in Admin Media and only appears while public.'}
      </div>
    </section>
  );
}
