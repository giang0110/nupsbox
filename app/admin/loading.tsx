export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Đang tải khu vực quản trị">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-5 max-w-xl animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({length: 4}, (_, index) => (
          <div key={index} className="min-h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>

      <div className="min-h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
