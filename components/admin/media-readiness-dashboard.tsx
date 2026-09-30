import Link from 'next/link';
import {AlertTriangle, CheckCircle2, ImageOff} from 'lucide-react';
import {AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import type {MediaReadinessSummary, VisualCoverageKind} from '@/features/admin/media-readiness';

const kindLabel: Record<VisualCoverageKind, string> = {
  solution: 'Solution',
  unit: 'Loại kho',
  location: 'Địa điểm',
  blog: 'Blog'
};

export function MediaReadinessDashboard({
  summary,
  activeIssue = null
}: {
  summary: MediaReadinessSummary;
  activeIssue?: 'weak-alt' | 'broken-mapping' | 'overused' | null;
}) {
  const missing = summary.items.filter(item => !item.ready);

  return (
    <AdminPanel
      title="Visual Coverage"
      description="Theo dõi coverage ảnh trên các surface public thực tế: Solution, loại kho, địa điểm và Blog."
      actions={
        <AdminStatusBadge
          label={summary.score + '% covered'}
          tone={summary.score >= 90 ? 'success' : summary.score >= 60 ? 'warning' : 'danger'}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-3">
          <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Surface đã phủ</p>
          <p className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">{summary.coveredContexts}/{summary.totalContexts}</p>
        </div>
        <div className="rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-3">
          <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Đang thiếu ảnh</p>
          <p className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">{summary.missingContexts}</p>
        </div>
        <Link
          href="/admin/content/media?issue=weak-alt#media-library"
          aria-current={activeIssue === 'weak-alt' ? 'page' : undefined}
          className="rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-3 transition hover:border-[var(--nupsbox-blue)] aria-[current=page]:border-[var(--nupsbox-blue)] aria-[current=page]:bg-blue-50"
        >
          <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Alt yếu</p>
          <p className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">{summary.weakAltCount}</p>
        </Link>
        <Link
          href="/admin/content/media?issue=broken-mapping#editorial-media-mapping"
          aria-current={activeIssue === 'broken-mapping' ? 'page' : undefined}
          className="rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-3 transition hover:border-[var(--nupsbox-blue)] aria-[current=page]:border-[var(--nupsbox-blue)] aria-[current=page]:bg-blue-50"
        >
          <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Mapping lỗi/private</p>
          <p className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">{summary.brokenMappingCount}</p>
        </Link>
        <Link
          href="/admin/content/media?issue=overused#media-library"
          aria-current={activeIssue === 'overused' ? 'page' : undefined}
          className="rounded-xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-3 transition hover:border-[var(--nupsbox-blue)] aria-[current=page]:border-[var(--nupsbox-blue)] aria-[current=page]:bg-blue-50"
        >
          <p className="text-xs font-bold text-[var(--nupsbox-slate)]">Ảnh dùng &gt;3 ngữ cảnh</p>
          <p className="mt-1 text-2xl font-black text-[var(--nupsbox-navy)]">{summary.overusedMediaCount}</p>
        </Link>
      </div>

      {missing.length ? (
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <ImageOff size={17} className="text-amber-700" aria-hidden="true" />
            <h3 className="font-black text-[var(--nupsbox-navy)]">Surface cần bổ sung visual</h3>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {missing.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 transition hover:border-amber-400"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge label={kindLabel[item.kind]} tone="warning" />
                  <p className="font-black text-[var(--nupsbox-navy)]">{item.label}</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-amber-900">{item.note}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 size={17} aria-hidden="true" />
          Tất cả surface public đang theo dõi đều có visual coverage.
        </div>
      )}

      {summary.brokenMappingCount || summary.weakAltCount || summary.overusedMediaCount ? (
        <div className="mt-5 rounded-xl border border-[var(--nupsbox-border)] p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-amber-700" aria-hidden="true" />
            <h3 className="font-black text-[var(--nupsbox-navy)]">Quality signals</h3>
          </div>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
            {summary.weakAltCount ? (
              <p>• {summary.weakAltCount} asset public có alt VI/EN quá ngắn hoặc generic. <Link href="/admin/content/media?issue=weak-alt#media-library" className="font-black text-[var(--nupsbox-blue)] hover:underline">Xử lý →</Link></p>
            ) : null}
            {summary.brokenMappingCount ? (
              <p>• {summary.brokenMappingCount} editorial mapping đang trỏ tới asset private hoặc không còn tồn tại. <Link href="/admin/content/media?issue=broken-mapping#editorial-media-mapping" className="font-black text-[var(--nupsbox-blue)] hover:underline">Xử lý →</Link></p>
            ) : null}
            {summary.overusedMedia.length ? (
              <div>
                <p>• Ảnh tái sử dụng nhiều ngữ cảnh:</p>
                <ul className="mt-1 grid gap-1 pl-4">
                  {summary.overusedMedia.slice(0, 5).map(item => (
                    <li key={item.mediaId}>— {item.label} · {item.usageCount} ngữ cảnh</li>
                  ))}
                  <li>
                    <Link href="/admin/content/media?issue=overused#media-library" className="font-black text-[var(--nupsbox-blue)] hover:underline">
                      Mở hàng đợi ảnh dùng nhiều →
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminPanel>
  );
}
