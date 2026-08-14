import Link from "next/link";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-12 text-[#0b1020] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-black text-violet-600">← JobCraft</Link>
        <h1 className="mt-6 text-4xl font-black tracking-[-.04em]">Terms of Use</h1>
        <p className="mt-3 text-sm text-slate-500">Launch draft · Last updated 14 August 2026</p>
        <div className="mt-8 space-y-6 leading-7 text-slate-600">
          <section><h2 className="text-xl font-black text-slate-950">Using JobCraft</h2><p className="mt-2">JobCraft provides job-discovery, career-profile, resume, application-tracking and career-assistance tools. You are responsible for information you submit and for reviewing generated or matched content before relying on it.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">Job matches and career tools</h2><p className="mt-2">Match scores and career suggestions are decision-support signals, not guarantees of employment, interviews, salary, eligibility or employer outcomes. Always verify important job information with the employer or original listing provider.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">Listings and external services</h2><p className="mt-2">Sample roles are demonstrations and are labeled as such. Future live listings may originate from third-party providers and may link to external services. Their availability, accuracy and terms are controlled by those providers.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">Acceptable use</h2><p className="mt-2">Do not misuse the service, attempt unauthorized access, interfere with its operation, submit unlawful content, impersonate others, or use automated access in ways that violate applicable rules or third-party rights.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">Availability</h2><p className="mt-2">Features may change as JobCraft develops. We may suspend features when needed for security, maintenance, legal compliance or provider availability.</p></section>
          <section className="rounded-2xl bg-amber-50 p-5 text-amber-950"><h2 className="font-black">Pre-launch notice</h2><p className="mt-1 text-sm leading-6">These are provisional launch terms. The responsible business/legal identity, official contact details, governing-law terms and other required provisions will be completed before full public launch.</p></section>
        </div>
      </article>
    </main>
  );
}
