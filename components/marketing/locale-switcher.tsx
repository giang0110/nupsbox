'use client';

import {useParams} from 'next/navigation';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import type {AppLocale} from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const nextLocale: AppLocale = locale === 'vi' ? 'en' : 'vi';

  return (
    <button
      type="button"
      aria-label={locale === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
      onClick={() =>
        router.replace(
          // @ts-expect-error -- `pathname` and `params` are read from the same current route.
          {pathname, params},
          {locale: nextLocale}
        )
      }
    >
      {locale === 'vi' ? 'EN' : 'VI'}
    </button>
  );
}
