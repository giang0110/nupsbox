import {
  Boxes,
  Building2,
  Home,
  PackageSearch,
  Ruler,
  ShoppingCart
} from 'lucide-react';
import {getEditorialProfile} from '@/features/content/editorial-taxonomy';

function EditorialIcon({slug}: {slug: string}) {
  const {visualKey} = getEditorialProfile(slug);
  const props = {size: 28, strokeWidth: 1.8, 'aria-hidden': true as const};

  if (visualKey === 'picking') return <ShoppingCart {...props} />;
  if (visualKey === 'flow') return <Boxes {...props} />;
  if (visualKey === 'workspace') return <Building2 {...props} />;
  if (visualKey === 'abc') return <PackageSearch {...props} />;
  if (visualKey === 'home') return <Home {...props} />;
  return <Ruler {...props} />;
}

export function EditorialCover({
  slug,
  locale,
  className = ''
}: {
  slug: string;
  locale: 'vi' | 'en';
  className?: string;
}) {
  const profile = getEditorialProfile(slug);
  const label = locale === 'vi' ? profile.labelVi : profile.labelEn;

  return (
    <div
      aria-hidden="true"
      className={'relative isolate overflow-hidden bg-[var(--nupsbox-navy)] text-white ' + className}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,211,26,.26),transparent_26%),radial-gradient(circle_at_15%_85%,rgba(59,130,246,.22),transparent_30%)]" />
      <div className="absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute -right-2 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-[var(--nupsbox-yellow)] backdrop-blur">
          <EditorialIcon slug={slug} />
        </span>
        <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white/70 backdrop-blur">
          NUPSBOX INSIGHTS
        </span>
      </div>
      <div className="absolute inset-x-5 bottom-5">
        <p className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-none tracking-[-0.07em] text-white/12">
          {profile.mark}
        </p>
        <p className="mt-2 max-w-[18rem] text-xs font-black uppercase tracking-[0.15em] text-[var(--nupsbox-yellow)]">
          {label}
        </p>
      </div>
    </div>
  );
}
