export default function GlobalSearch() {
  return (
    <form action="/search" method="get" className="relative w-full max-w-[620px]" role="search">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#789087]"
        aria-hidden="true"
      >
        ⌕
      </span>
      <input
        type="search"
        name="q"
        aria-label="Search JobCraft tools and jobs"
        placeholder="Search jobs, skills, companies or JobCraft tools..."
        className="w-full rounded-[14px] border border-[#ddd7cb] bg-white px-10 py-2.5 text-sm font-semibold text-[#173f33] outline-none transition placeholder:text-[#8ca098] focus:border-[#278363] focus:ring-2 focus:ring-[#278363]/15"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[10px] bg-[#173f33] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.08em] text-white"
      >
        Search
      </button>
    </form>
  );
}
