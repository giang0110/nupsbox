import {FileText, MessageCircleMore, Search} from 'lucide-react';
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
  const hasDirectContact = Boolean(phoneUrl || zaloUrl || facebookUrl);

  return (
    <nav
      aria-label={locale === 'vi' ? 'Hành động nhanh' : 'Quick actions'}
      className="fixed inset-x-3 bottom-[max(.65rem,env(safe-area-inset-bottom))] z-[60] grid grid-cols-2 gap-1 rounded-2xl border border-black/8 bg-white/94 p-1 shadow-[0_10px_30px_rgba(7,26,56,0.14)] backdrop-blur-xl lg:hidden"
    >
      <ConversionCta locale={locale} intent="finder" placement="mobile-action-bar" size="md" className="min-h-12 rounded-[0.9rem] gap-1.5 px-3 text-xs sm:text-sm">
        <Search aria-hidden="true" size={17} />
        {t('findStorage')}
      </ConversionCta>

      {hasDirectContact ? (
        <details className="group relative">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-center gap-1.5 rounded-[0.9rem] border border-[var(--nupsbox-border)] bg-white px-3 text-xs font-bold text-[var(--nupsbox-navy)] transition hover:border-[var(--nupsbox-blue)] sm:text-sm">
            <MessageCircleMore aria-hidden="true" size={17} />
            {locale === 'vi' ? 'Liên hệ' : 'Contact'}
          </summary>

          <div className="absolute bottom-[3.55rem] right-0 w-[min(88vw,22rem)] overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-white p-2 shadow-[0_20px_60px_rgba(7,26,56,.25)]">
            <p className="px-3 pb-2 pt-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--nupsbox-slate)]">
              {locale === 'vi' ? 'Chọn cách liên hệ' : 'Choose a contact method'}
            </p>

            <ConversionCta locale={locale} intent={contextualIntent} placement="mobile-contact-sheet" variant="secondary" size="md" className="w-full justify-start rounded-xl px-3">
              <FileText aria-hidden="true" size={17} />
              {contextualLabel}
            </ConversionCta>

            <div className="mt-1 grid gap-1">
              {phoneUrl ? (
                <TrackedContactLink href={phoneUrl} label={t('phone')} kind="phone" placement="mobile-contact-sheet" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)]" />
              ) : null}
              {zaloUrl ? (
                <TrackedContactLink href={zaloUrl} label="Zalo" kind="zalo" placement="mobile-contact-sheet" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)]" />
              ) : null}
              {facebookUrl ? (
                <TrackedContactLink href={facebookUrl} label="Facebook" kind="facebook" placement="mobile-contact-sheet" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)]" />
              ) : null}
            </div>
          </div>
        </details>
      ) : (
        <ConversionCta locale={locale} intent={contextualIntent} placement="mobile-action-bar" variant="secondary" size="md" className="min-h-12 rounded-[0.9rem] gap-1.5 px-3 text-xs sm:text-sm">
          <FileText aria-hidden="true" size={17} />
          {contextualLabel}
        </ConversionCta>
      )}
    </nav>
  );
}
