import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f2ea] text-[#173f33]">
      <header className="sticky top-0 z-50 border-b border-[#e2ddd3] bg-[#f7f4ed]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-[#173f33] no-underline">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f49a48] text-xl">✣</span>
            <span className="jc-serif text-[27px] font-bold">JobCraft</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-[#6f887f] lg:flex">
            <Link href="/jobs" className="hover:text-[#278363]">Discover roles</Link>
            <Link href="/resume" className="hover:text-[#278363]">Resume studio</Link>
            <Link href="/applications" className="hover:text-[#278363]">Application plan</Link>
            <Link href="/career-assistant" className="hover:text-[#278363]">Career assistant</Link>
          </nav>
          <div className="flex items-center gap-2"><Link href="/?auth=login" scroll={false} className="hidden px-4 py-2 text-sm font-extrabold text-[#49685e] sm:block">Log in</Link><Link href="/?auth=signup" scroll={false} className="jc-button-primary">Join free →</Link></div>
        </div>
      </header>

      <section className="relative border-b border-[#e2ddd3]">
        <div className="absolute left-[-120px] top-[-90px] h-80 w-80 rounded-full bg-[#f49a48]/10 blur-3xl" />
        <div className="mx-auto grid max-w-[1450px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:py-24">
          <div>
            <p className="jc-eyebrow">CAREER SEARCH, WITH INTENTION</p>
            <h1 className="jc-page-title !text-[clamp(3.4rem,6vw,6.6rem)]">Your career search,<br/>made clearer.</h1>
            <p className="jc-page-copy max-w-xl text-lg">Discover better-fit jobs, understand the evidence behind each match, prepare factual resume versions and keep every application moving in one workspace built for India.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/jobs" className="jc-button-primary !px-7 !py-4">Discover roles →</Link><Link href="/?auth=signup" scroll={false} className="jc-button-secondary !px-7 !py-4">Build your profile</Link></div>
            <div className="mt-8 flex flex-wrap gap-2">{["₹ salary filters", "Evidence-aware match", "ATS resume studio", "Application plan", "Private certificates"].map((item) => <span key={item} className="jc-chip">✓ {item}</span>)}</div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto max-w-[1450px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-2xl"><p className="jc-eyebrow">ONE CONNECTED WORKSPACE</p><h2 className="jc-page-title !text-[clamp(2.8rem,5vw,4.6rem)]">From search to offer, without the spreadsheet chaos.</h2></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Feature number="01" title="Discover roles" text="Search title, company, city, work mode, salary, experience and skills without hiding missing provider data." href="/jobs" />
          <Feature number="02" title="Know your fit" text="See matched skills, gaps and evidence coverage so sparse listings do not create fake confidence." href="/jobs" />
          <Feature number="03" title="Prepare evidence" text="Build ATS-friendly resumes, keep certificates private and create role-specific plans without inventing experience." href="/resume" />
          <Feature number="04" title="Keep momentum" text="Move saved roles through applied, screening, interview and offer in a clean application board." href="/applications" />
        </div>
      </section>

      <section className="border-y border-[#d9d3c8] bg-[#19483a] text-white">
        <div className="mx-auto grid max-w-[1450px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20">
          <div><p className="jc-eyebrow !text-[#f49a48]">READY WHEN YOU ARE</p><h2 className="jc-serif mt-4 max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-.05em] sm:text-6xl">Build a stronger career signal, then spend your energy on the roles that deserve it.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[#adc0b8]">JobCraft&apos;s MVP keeps matching and guidance deterministic and grounded. Model-backed AI features come later, after the core workflow is trustworthy.</p></div>
          <Link href="/?auth=signup" scroll={false} className="rounded-[15px] bg-[#f49a48] px-7 py-4 text-center font-black text-[#173f33]">Start free →</Link>
        </div>
      </section>

      <footer className="bg-[#f7f4ed]"><div className="mx-auto flex max-w-[1450px] flex-col gap-6 px-5 py-9 text-sm text-[#789087] sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f49a48] text-sm text-[#173f33]">✣</span><b className="jc-serif text-xl text-[#173f33]">JobCraft</b></div><p className="mt-2">Career tools designed for the Indian market.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 font-bold"><Link href="/jobs">Roles</Link><Link href="/resume">Resume</Link><Link href="/applications">Applications</Link><Link href="/career-assistant">Career assistant</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>
    </main>
  );
}

function ProductPreview() {
  return <div className="overflow-hidden rounded-[26px] border border-[#d7d0c4] bg-[#fbfaf6] shadow-[0_30px_80px_rgba(35,49,43,.13)]">
    <div className="grid min-h-[540px] grid-cols-[165px_1fr] sm:grid-cols-[205px_1fr]">
      <aside className="bg-[#19483a] p-4 text-white sm:p-5"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f49a48] text-[#173f33]">✣</span><b className="jc-serif hidden text-xl sm:block">JobCraft</b></div><p className="mt-10 text-[8px] font-bold tracking-[.13em] text-[#8da69c] sm:text-[9px]">YOUR COMMAND CENTER</p><div className="mt-3 grid gap-2">{["Workspace", "Discover roles", "Applications", "My profile"].map((item, index) => <div key={item} className={`rounded-[13px] px-3 py-3 text-[10px] font-bold sm:text-[11px] ${index === 0 ? "border-l-[3px] border-[#f49a48] bg-[#326554] text-white" : "text-[#a9bcb5]"}`}>{item}</div>)}</div><div className="mt-auto" /></aside>
      <div className="min-w-0 bg-[#f5f2ea]">
        <div className="flex h-14 items-center border-b border-[#e0dbd1] px-5 text-[10px] text-[#789087]"><span className="mr-2 h-2 w-2 rounded-full bg-[#f49a48]" /> Search with intention.</div>
        <div className="p-5 sm:p-7"><p className="jc-eyebrow !text-[8px]">YOUR WORKSPACE</p><h3 className="jc-serif mt-2 text-3xl font-bold text-[#19483a] sm:text-4xl">Good morning.</h3><div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">{[["Matches", "4"], ["Saved", "2"], ["In motion", "3"], ["Interviews", "1"]].map(([label, value]) => <div key={label} className="rounded-[14px] border border-[#ddd7cb] bg-[#fbfaf6] p-3"><p className="text-[9px] text-[#789087]">{label}</p><p className="jc-serif mt-4 text-2xl text-[#19483a]">{value}</p></div>)}</div><div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_.75fr]"><div className="rounded-[16px] border border-[#ddd7cb] bg-[#fbfaf6] p-4"><p className="jc-eyebrow !text-[7px]">CURATED FOR YOU</p><h4 className="jc-serif mt-2 text-xl font-bold">Roles worth your energy</h4><div className="mt-3 divide-y divide-[#e5dfd5]">{[["DA", "Data Analyst", "82% match"], ["BA", "Business Analyst", "76% match"], ["BI", "Power BI Developer", "71% match"]].map(([mark, role, match]) => <div key={role} className="flex items-center gap-3 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#121716] text-[8px] font-bold text-white">{mark}</span><span className="min-w-0 flex-1 truncate text-[10px] font-bold">{role}</span><span className="rounded-full bg-[#eee5d6] px-2 py-1 text-[8px] font-bold text-[#278363]">{match}</span></div>)}</div></div><div className="rounded-[16px] bg-[#19483a] p-4 text-white"><p className="text-[7px] font-bold tracking-[.12em] text-[#f49a48]">KEEP THE MOMENTUM</p><h4 className="jc-serif mt-2 text-xl font-bold">Coming up</h4><div className="mt-4 border-t border-white/10 pt-4 text-[9px] leading-5 text-[#a8bdb5]"><b className="block text-white">Follow up with recruiter</b>Data Analyst application<br/><span className="text-[#f49a48]">Tomorrow</span></div></div></div></div>
      </div>
    </div>
  </div>;
}

function Feature({ number, title, text, href }: { number: string; title: string; text: string; href: string }) {
  return <Link href={href} className="jc-card group block p-6 text-inherit no-underline transition hover:-translate-y-1"><span className="font-mono text-xs font-black text-[#f49a48]">{number}</span><h3 className="jc-section-title mt-5 !text-[25px]">{title}</h3><p className="jc-section-subtitle">{text}</p><span className="mt-6 inline-block text-sm font-black text-[#278363]">Explore →</span></Link>;
}
