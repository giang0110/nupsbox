export default function PublicLoading() {
  return (
    <main aria-busy="true" aria-label="Đang tải / Loading">
      <section className="bg-[var(--nupsbox-navy)] py-10 text-white sm:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.06fr_.94fr] lg:px-8">
          <div className="space-y-4">
            <div className="h-7 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-14 max-w-xl animate-pulse rounded-2xl bg-white/10" />
            <div className="h-14 max-w-md animate-pulse rounded-2xl bg-white/8" />
            <div className="flex gap-3">
              <div className="h-12 w-40 animate-pulse rounded-full bg-[var(--nupsbox-yellow)]/70" />
              <div className="h-12 w-36 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
          <div className="min-h-72 animate-pulse rounded-3xl border border-white/10 bg-white/8" />
        </div>
      </section>

      <section className="bg-[var(--nupsbox-surface)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--nupsbox-border)]" />
          <div className="mt-4 h-10 max-w-xl animate-pulse rounded-xl bg-[var(--nupsbox-border)]" />
          <div className="mt-7 min-h-52 animate-pulse rounded-3xl border border-[var(--nupsbox-border)] bg-white" />
        </div>
      </section>
    </main>
  );
}
