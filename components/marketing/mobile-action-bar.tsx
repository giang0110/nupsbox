import {Search, FileText} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import {ConversionCta} from './conversion-cta';
import {TrackedContactLink} from './tracked-contact-link';

export type MobileActionBarProps = {
  phoneUrl?: string | null;
  zaloUrl?: string | null;
  facebookUrl?: string | null;
  mode?: 'default' | 'viewing';
};

export async function MobileActionBar({phoneUrl, zaloUrl, facebookUrl, mode = 'default'}: MobileActionBarProps) {
  const [t, rawLocale] = await Promise.all([getTranslations('actions'), getLocale()]);
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const contextualIntent = mode === 'viewing' ? 'viewing' : 'quote';
  const contextualLabel = mode === 'viewing' ? t('viewing') : t('quote');
  const contactAction = phoneUrl
    ? {href: phoneUrl, label: t('phone'), kind: 'phone' as const}
    : zaloUrl
      ? {href: zaloUrl, label: t('zalo'), kind: 'zalo' as const}
      : facebookUrl
        ? {href: facebookUrl, label: 'Facebook', kind: 'facebook' as const}
        : null;

  return (
    <nav
      aria-label={locale === 'vi' ? 'Hành động nhanh' : 'Quick actions'}
      className={`fixed inset-x-2.5 bottom-[max(.6rem,env(safe-area-inset-bottom))] z-[60] grid ${
        contactAction ? 'grid-cols-3' : 'grid-cols-2'
      } gap-1 rounded-[1.1rem] border border-black/10 bg-white/96 p-1 shadow-[0_14px_42px_rgba(7,26,56,0.2)] backdrop-blur-xl lg:hidden`}
    >
      <ConversionCta
        locale={locale}
        intent="finder"
        placement="mobile-action-bar"
        size="md"
        className="min-h-12 rounded-[0.85rem] gap-1 px-2 text-[0.68rem] leading-tight sm:text-xs"
      >
        <Search aria-hidden="true" size={17} />
        {t('findStorage')}
      </ConversionCta>

      <ConversionCta
        locale={locale}
        intent={contextualIntent}
        placement="mobile-action-bar"
        variant="secondary"
        size="md"
        className="min-h-12 rounded-[0.85rem] gap-1 px-2 text-[0.68rem] leading-tight sm:text-xs"
      >
        <FileText aria-hidden="true" size={17} />
        {contextualLabel}
      </ConversionCta>

      {contactAction ? (
        <TrackedContactLink
          href={contactAction.href}
          label={contactAction.label}
          kind={contactAction.kind}
          placement="mobile-action-bar"
          className="flex min-h-12 items-center justify-center gap-1 rounded-[0.85rem] px-2 text-center text-[0.68rem] font-semibold leading-tight text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nupsbox-blue)] focus-visible:ring-offset-2 sm:text-xs"
        />
      ) : null}
    </nav>
  );
}
