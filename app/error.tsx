"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6 text-[#0b1020]">
      <div className="w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-xl font-black text-rose-600">
          !
        </div>
        <p className="mt-6 text-xs font-black tracking-[.16em] text-violet-600">
          SOMETHING WENT WRONG
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.04em]">
          JobCraft hit a temporary problem.
        </h1>
        <p className="mt-3 leading-7 text-slate-500">
          Your data has not been intentionally changed. Try loading this view again.
        </p>
        <button
          onClick={reset}
          className="mt-7 rounded-xl bg-violet-600 px-6 py-3.5 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
