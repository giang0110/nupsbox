import {Phone, Search, MessageCircle} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export type MobileActionBarProps = {
  phoneUrl: string;
  zaloUrl: string;
};

export async function MobileActionBar({phoneUrl, zaloUrl}: MobileActionBarProps) {
  const t = await getTranslations('actions');

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-3 bottom-3 z-[60] grid grid-cols-3 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-[0_16px_50px_rgba(7,26,56,0.24)] backdrop-blur-xl lg:hidden"
    >
      <a href={phoneUrl} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-[var(--nupsbox-navy)] hover:bg-[var(--nupsbox-surface)]">
        <Phone aria-hidden="true" size={19} />
        {t('phone')}
      </a>
      <a href={zaloUrl} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-[var(--nupsbox-blue)] hover:bg-[var(--nupsbox-surface)]">
        <MessageCircle aria-hidden="true" size={19} />
        {t('zalo')}
      </a>
      <Link href="/kho-mini" className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl bg-[var(--nupsbox-yellow)] text-xs font-bold text-[var(--nupsbox-navy)]">
        <Search aria-hidden="true" size={19} />
        {t('findStorage')}
      </Link>
    </nav>
  );
}
