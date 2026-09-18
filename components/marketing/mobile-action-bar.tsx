import {Phone, Search, MessageCircle, FileText} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import {ConversionCta} from './conversion-cta';

export type MobileActionBarProps = {
  phoneUrl?: string | null;
  zaloUrl?: string | null;
  mode?: 'default' | 'viewing';
};

export async function MobileActionBar({phoneUrl, zaloUrl, mode = 'default'}: MobileActionBarProps) {
  const [t, rawLocale] = await Promise.all([getTranslations('actions'), getLocale()]);
  const locale = rawLocale === 'en' ? 'en' : 'vi';
  const contextualIntent = mode === 'viewing' ? 'viewing' : 'quote';
  const contextualLabel = mode === 'viewing' ? t('viewing') : t('quote');
  const contactAction = phoneUrl
    ? {href: phoneUrl, label: t('phone'), Icon: Phone}
    : zaloUrl
      ? {href: zaloUrl, label: t('zalo'), Icon: MessageCircle}
      : null;

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-2.5 bottom-[max(.6rem,env(safe-area-inset-bottom))] z-[60] grid grid-cols-2 gap-1 rounded-[1.1rem] border border-black/10 bg-white/96 p-1 shadow-[0_14px_42px_rgba(7,26,56,0.2)] backdrop-blur-xl lg:hidden"
    >
      <ConversionCta
        locale={locale}
        intent="finder"
        placement="mobile-action-bar"
        size="md"
        className="min-h-12 rounded-[0.85rem] px-3 text-xs"
      >
        <Search aria-hidden="true" size={18} />
        {t('findStorage')}
      </ConversionCta>

      <ConversionCta
        locale={locale}
        intent={contextualIntent}
        placement="mobile-action-bar"
        variant="secondary"
        size="md"
        className="min-h-12 rounded-[0.85rem] px-3 text-xs"
      >
        <FileText aria-hidden="true" size={18} />
        {contextualLabel}
      </ConversionCta>

      {contactAction ? (
        <a
          href={contactAction.href}
          target={contactAction.href.startsWith('http') ? '_blank' : undefined}
          rel={contactAction.href.startsWith('http') ? 'noreferrer' : undefined}
          className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-[0.85rem] text-xs font-semibold text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)]"
        >
          <contactAction.Icon aria-hidden="true" size={17} />
          {contactAction.label}
        </a>
      ) : null}
    </nav>
  );
}
