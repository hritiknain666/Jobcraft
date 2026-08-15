import Link from "next/link";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-10 text-[#173f33] sm:px-8 sm:py-14">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[#d9d2c6] bg-[#fbfaf6] p-6 shadow-[0_20px_55px_rgba(35,49,43,.07)] sm:p-10">
        <div className="flex items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3 text-inherit no-underline"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f49a48] text-lg">✣</span><span className="jc-serif text-2xl font-bold">JobCraft</span></Link><Link href="/" className="jc-text-link">← Home</Link></div>
        <div className="mt-10"><p className="jc-eyebrow">CLEAR EXPECTATIONS</p><h1 className="jc-page-title !text-[clamp(2.8rem,6vw,4.8rem)]">Terms of Use</h1><p className="mt-3 text-sm text-[#789087]">Launch draft · Last updated 15 August 2026</p></div>
        <div className="mt-9 space-y-7 text-sm leading-8 text-[#5f786f]">
          <Section title="Using JobCraft">JobCraft provides job-discovery, career-profile, resume, application-tracking and career-assistance tools. You are responsible for information you submit and for reviewing matched, drafted or generated content before relying on it.</Section>
          <Section title="Job matches and career tools">Match scores and career suggestions are decision-support signals, not guarantees of employment, interviews, salary, eligibility or employer outcomes. Always verify important job information with the employer or original listing provider.</Section>
          <Section title="Listings and external services">Live listings may originate from third-party providers and link to provider or employer websites. JobCraft identifies the listing source but does not control whether an external vacancy remains available, whether the employer responds, or the terms and privacy practices of an external service. Never pay money merely to receive a job offer, and verify an employer before sharing sensitive information.</Section>
          <Section title="Prototype data">Internal JobCraft sample roles may be retained for testing, but they are kept out of the active public vacancy feed and must not be treated as real employer opportunities.</Section>
          <Section title="Acceptable use">Do not misuse the service, attempt unauthorized access, interfere with its operation, submit unlawful content, impersonate others, or use automated access in ways that violate applicable rules or third-party rights.</Section>
          <Section title="Availability">Features and third-party data sources may change as JobCraft develops. We may suspend features or provider integrations when needed for security, maintenance, legal compliance, data quality or provider availability.</Section>
          <section className="rounded-[20px] border border-[#ead1af] bg-[#fbf0df] p-5 text-[#76573b]"><p className="jc-eyebrow !text-[#b86e2d]">PRE-LAUNCH NOTICE</p><p className="mt-3 text-sm leading-7">These are provisional launch terms. The responsible business/legal identity, official contact details, governing-law terms and other required provisions will be completed before full public launch.</p></section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-[#e5dfd5] pt-6"><h2 className="jc-serif text-2xl font-bold text-[#173f33]">{title}</h2><p className="mt-3">{children}</p></section>;
}
