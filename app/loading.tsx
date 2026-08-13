export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6 text-[#0b1020]">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-200">JC</div>
        <div className="mx-auto mt-6 h-2 w-40 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-500" />
        </div>
        <p className="mt-5 text-lg font-black">Preparing your workspace</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Loading the latest JobCraft view for you.</p>
      </div>
    </main>
  );
}
