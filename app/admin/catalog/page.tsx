import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import {CatalogTables} from '@/components/admin/catalog-tables';
import {Container} from '@/components/ui/container';
import {getAdminCatalog} from '@/features/admin/catalog';
import {buildCatalogLaunchReadiness} from '@/features/admin/catalog-launch';
import {buildLocationLaunchReadiness} from '@/features/admin/location-launch';
import {summarizeMediaLaunch} from '@/features/admin/media-launch';
import {listAdminMedia} from '@/features/admin/media';
import {summarizePricingLaunch} from '@/features/admin/pricing-launch';
import {listAdminPricing} from '@/features/admin/pricing';
import {summarizeUnitTypeLaunch} from '@/features/admin/unit-type-launch';
import {listAdminUnitTypes} from '@/features/admin/unit-types';
import {listAdminLocations} from '@/features/admin/locations';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminCatalogPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'catalog:read')) redirect('/admin');
  const [catalog, locations, units, pricing, media] = await Promise.all([
    getAdminCatalog(),
    listAdminLocations(),
    listAdminUnitTypes(),
    listAdminPricing(),
    listAdminMedia()
  ]);
  const launch = buildCatalogLaunchReadiness(catalog);
  const unitLaunch = summarizeUnitTypeLaunch(units);
  const pricingLaunch = summarizePricingLaunch(locations, units, pricing);
  const mediaLaunch = summarizeMediaLaunch(media);
  const activeLocations = locations.filter(location => location.status === 'active');
  const locationRows = activeLocations.map(location => ({
    location,
    readiness: buildLocationLaunchReadiness(location, media, pricing)
  }));
  const launchBlockers = [
    activeLocations.length === 0 ? 'Chưa có location active' : null,
    unitLaunch.active === 0 ? 'Chưa có Unit Type active' : null,
    pricingLaunch.usableMappings === 0 ? 'Chưa có mapping giá usable' : null
  ].filter(Boolean) as string[];

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CATALOG"
          title="Kho & bảng giá"
          description="Quản lý địa điểm, loại kho và dữ liệu giá vận hành."
        />
        <AdminPanel
          title="Catalog Launch"
          description="Luồng ngắn nhất để đưa dữ liệu kho ra public mà không bỏ sót prerequisite."
          actions={
            <div className="text-right">
              <p className="text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">{launch.score}%</p>
              <p className="text-xs font-bold text-[var(--nupsbox-slate)]">{launch.readyCount}/{launch.totalCount} bước đạt</p>
            </div>
          }
        >
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {launch.steps.map(step => (
              <Link
                key={step.id}
                href={step.href}
                target={step.id === 'preview' ? '_blank' : undefined}
                className={
                  'rounded-xl border p-4 transition ' +
                  (step.current
                    ? 'border-[var(--nupsbox-blue)] bg-blue-50/50'
                    : 'border-[var(--nupsbox-border)] bg-white hover:border-[var(--nupsbox-blue)]')
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <strong className="text-sm text-[var(--nupsbox-navy)]">{step.label}</strong>
                  <AdminStatusBadge
                    label={step.ready ? 'Đạt' : step.current ? 'Tiếp theo' : 'Chờ'}
                    tone={step.ready ? 'success' : step.current ? 'warning' : 'neutral'}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">{step.detail}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--nupsbox-surface)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--nupsbox-navy)]">
              Bước nên làm tiếp: {launch.nextLabel}
            </p>
            <Link
              href={launch.nextHref}
              className="inline-flex min-h-10 items-center rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white"
            >
              Mở bước tiếp theo
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Launch Operations Center"
          description="Một màn hình để biết catalog đang thiếu gì theo dữ liệu thật và mở đúng nơi cần xử lý."
          actions={
            <AdminStatusBadge
              label={launchBlockers.length ? launchBlockers.length + ' blocker' : 'Core flow ready'}
              tone={launchBlockers.length ? 'warning' : 'success'}
            />
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Link href="/admin/catalog/locations" className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-4 transition hover:border-[var(--nupsbox-blue)]">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm text-[var(--nupsbox-navy)]">Locations</strong>
                <AdminStatusBadge label={activeLocations.length + ' active'} tone={activeLocations.length ? 'success' : 'danger'} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">
                {locationRows.length
                  ? locationRows.filter(row => row.readiness.qualityScore >= 80).length + '/' + locationRows.length + ' cơ sở đạt quality ≥80%.'
                  : 'Chưa có cơ sở active để đánh giá.'}
              </p>
            </Link>

            <Link href="/admin/catalog/unit-types" className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-4 transition hover:border-[var(--nupsbox-blue)]">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm text-[var(--nupsbox-navy)]">Unit Types</strong>
                <AdminStatusBadge label={unitLaunch.active + ' active'} tone={unitLaunch.active ? 'success' : 'danger'} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">
                {unitLaunch.readyDrafts} draft sẵn sàng · {unitLaunch.drafts} draft tổng.
              </p>
            </Link>

            <Link href="/admin/catalog/pricing" className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-4 transition hover:border-[var(--nupsbox-blue)]">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm text-[var(--nupsbox-navy)]">Pricing</strong>
                <AdminStatusBadge label={pricingLaunch.score + '% coverage'} tone={pricingLaunch.ready ? 'success' : 'warning'} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">
                {pricingLaunch.usableMappings} usable · {pricingLaunch.missingPairs} pair còn thiếu.
              </p>
            </Link>

            <Link href="/admin/content/media" className="rounded-xl border border-[var(--nupsbox-border)] bg-white p-4 transition hover:border-[var(--nupsbox-blue)]">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm text-[var(--nupsbox-navy)]">Media</strong>
                <AdminStatusBadge label={mediaLaunch.score + '% ready'} tone={mediaLaunch.score >= 80 ? 'success' : mediaLaunch.score >= 40 ? 'warning' : 'neutral'} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">
                {mediaLaunch.publicCount} public · {mediaLaunch.heroCount} hero · {mediaLaunch.issueCount} cần rà.
              </p>
            </Link>
          </div>

          {launchBlockers.length ? (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-sm font-black text-amber-900">Core blockers</p>
              <p className="mt-1 text-xs leading-5 text-amber-800">{launchBlockers.join(' · ')}</p>
            </div>
          ) : null}

          {locationRows.length ? (
            <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--nupsbox-border)]">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.4fr_.7fr_.7fr_.7fr_.7fr] bg-[var(--nupsbox-surface)] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
                  <span>Location</span><span>Quality</span><span>Media</span><span>Pricing</span><span>Next</span>
                </div>
                {locationRows.map(({location, readiness}) => {
                  const nextHref = readiness.recommendedNext === 'media'
                    ? '/admin/content/media?location=' + location.id
                    : readiness.recommendedNext === 'pricing'
                      ? '/admin/catalog/pricing?location=' + location.id
                      : '/dia-diem/' + location.slug;
                  const nextLabel = readiness.recommendedNext === 'media'
                    ? 'Media'
                    : readiness.recommendedNext === 'pricing'
                      ? 'Pricing'
                      : 'Preview';
                  return (
                    <div key={location.id} className="grid grid-cols-[1.4fr_.7fr_.7fr_.7fr_.7fr] items-center border-t border-[var(--nupsbox-border)] px-4 py-3 text-sm">
                      <div className="min-w-0 pr-4">
                        <p className="truncate font-black text-[var(--nupsbox-navy)]">{location.nameVi}</p>
                        <p className="mt-0.5 truncate text-xs text-[var(--nupsbox-slate)]">{location.district}</p>
                      </div>
                      <span className="font-black text-[var(--nupsbox-navy)]">{readiness.qualityScore}%</span>
                      <span className="text-[var(--nupsbox-slate)]">{readiness.publicMediaCount} public</span>
                      <span className="text-[var(--nupsbox-slate)]">{readiness.pricingCount} mapping</span>
                      <Link
                        href={nextHref}
                        target={readiness.recommendedNext === 'preview' ? '_blank' : undefined}
                        className="font-black text-[var(--nupsbox-blue)] hover:underline"
                      >
                        {nextLabel} →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </AdminPanel>

        <CatalogTables catalog={catalog} />
      </Container>
    </main>
  );
}
