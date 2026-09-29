import {ListTree} from 'lucide-react';
import type {BlogOutlineItem} from '@/features/content/blog-structure';

export function BlogTableOfContents({
  items,
  locale
}: {
  items: BlogOutlineItem[];
  locale: 'vi' | 'en';
}) {
  if (items.length < 2) return null;

  const vi = locale === 'vi';

  return (
    <nav
      aria-label={vi ? 'Mục lục bài viết' : 'Article contents'}
      className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-5 lg:sticky lg:top-24"
    >
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">
        <ListTree size={15} aria-hidden="true" />
        {vi ? 'TRONG BÀI NÀY' : 'IN THIS ARTICLE'}
      </p>
      <ol className="mt-4 grid gap-2.5">
        {items.map(item => (
          <li key={item.id} className={item.level >= 3 ? 'pl-3' : ''}>
            <a
              href={'#' + item.id}
              className="block text-sm font-semibold leading-5 text-[var(--nupsbox-slate)] transition hover:text-[var(--nupsbox-blue)]"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
