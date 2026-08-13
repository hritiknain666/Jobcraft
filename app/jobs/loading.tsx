export default function JobsLoading() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] text-[#0b1020]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
          <div className="h-4 w-28 animate-pulse rounded bg-violet-100" />
          <div className="mt-4 h-12 max-w-xl animate-pulse rounded-2xl bg-slate-200" />
          <div className="mt-4 h-6 max-w-2xl animate-pulse rounded bg-slate-100" />
          <div className="mt-8 h-24 animate-pulse rounded-[28px] border border-slate-200 bg-slate-50" />
        </div>
      </div>
      <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-[26px] border border-slate-200 bg-white shadow-sm" />
            ))}
          </div>
          <div className="hidden h-64 animate-pulse rounded-[24px] border border-slate-200 bg-white lg:block" />
        </div>
      </section>
    </main>
  );
}
