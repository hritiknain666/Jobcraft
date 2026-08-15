import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-10 text-[#173f33] sm:px-8 sm:py-14">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[#d9d2c6] bg-[#fbfaf6] p-6 shadow-[0_20px_55px_rgba(35,49,43,.07)] sm:p-10">
        <div className="flex items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3 text-inherit no-underline"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f49a48] text-lg">✣</span><span className="jc-serif text-2xl font-bold">JobCraft</span></Link><Link href="/" className="jc-text-link">← Home</Link></div>
        <div className="mt-10"><p className="jc-eyebrow">YOUR DATA, MADE CLEAR</p><h1 className="jc-page-title !text-[clamp(2.8rem,6vw,4.8rem)]">Privacy Policy</h1><p className="mt-3 text-sm text-[#789087]">Launch draft · Last updated 15 August 2026</p></div>
        <div className="mt-9 space-y-7 text-sm leading-8 text-[#5f786f]">
          <p>JobCraft uses account, profile, resume, certificate, application-tracking and job-preference information to provide the features you choose to use. We aim to collect only information needed to operate, secure and improve those features.</p>
          <Section title="Information we use">This may include your account details, career profile, skills, experience, uploaded career documents, saved jobs and application activity. Authentication, application data and private career files are handled through configured infrastructure providers.</Section>
          <Section title="How it is used">Information may be used to authenticate you, calculate evidence-aware job-fit signals, build or tailor career documents, maintain your application tracker, provide requested career features, secure the service and diagnose reliability problems.</Section>
          <Section title="Job listings and external links">JobCraft displays live vacancies from third-party job sources and identifies the source on the listing. Opening an application or source link may take you to an external website. That provider or employer controls its own privacy practices and application process. Internal prototype listings are kept separate from the active public job feed.</Section>
          <Section title="Your choices">You can update relevant profile information and remove supported career records through available product controls. Additional privacy requests will be handled through the official privacy contact published before full public launch.</Section>
          <Section title="Retention and deletion">JobCraft will document final retention periods before full public launch. Until then, account and career data should be treated as retained only as needed to provide the service, maintain security and meet applicable obligations. A complete account deletion/export workflow remains a launch requirement.</Section>
          <section className="rounded-[20px] border border-[#ead1af] bg-[#fbf0df] p-5 text-[#76573b]"><p className="jc-eyebrow !text-[#b86e2d]">PRE-LAUNCH NOTICE</p><p className="mt-3 text-sm leading-7">This is a launch draft, not the final legal policy. JobCraft will publish the responsible business/legal identity, privacy contact, final retention details and any jurisdiction-specific disclosures before full public launch.</p></section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-[#e5dfd5] pt-6"><h2 className="jc-serif text-2xl font-bold text-[#173f33]">{title}</h2><p className="mt-3">{children}</p></section>;
}
