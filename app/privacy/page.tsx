import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-10 text-[#173f33] sm:px-8 sm:py-14">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[#d9d2c6] bg-[#fbfaf6] p-6 shadow-[0_20px_55px_rgba(35,49,43,.07)] sm:p-10">
        <div className="flex items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3 text-inherit no-underline"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f49a48] text-lg">✣</span><span className="jc-serif text-2xl font-bold">JobCraft</span></Link><Link href="/" className="jc-text-link">← Home</Link></div>
        <div className="mt-10"><p className="jc-eyebrow">YOUR DATA, MADE CLEAR</p><h1 className="jc-page-title !text-[clamp(2.8rem,6vw,4.8rem)]">Privacy Policy</h1><p className="mt-3 text-sm text-[#789087]">Launch draft · Last updated 14 August 2026</p></div>
        <div className="mt-9 space-y-7 text-sm leading-8 text-[#5f786f]">
          <p>JobCraft uses account, profile, resume, certificate, application-tracking and job-preference information to provide the features you choose to use. We aim to collect only information needed to operate and improve those features.</p>
          <Section title="Information we use">This may include your account details, career profile, skills, experience, uploaded career documents, saved jobs and application activity. Authentication and application data are stored through our configured service providers.</Section>
          <Section title="How it is used">Information may be used to authenticate you, calculate job-fit signals, build or tailor career documents, maintain your application tracker, provide requested career features, secure the service and diagnose reliability problems.</Section>
          <Section title="Job listings">Prototype/sample roles are identified separately from future live provider listings. When third-party job sources are enabled, their links may take you to an external site whose privacy practices are governed by that provider.</Section>
          <Section title="Your choices">You should be able to update relevant profile information and remove information through available product controls. Additional privacy requests will be handled through the official privacy contact published before public launch.</Section>
          <section className="rounded-[20px] border border-[#ead1af] bg-[#fbf0df] p-5 text-[#76573b]"><p className="jc-eyebrow !text-[#b86e2d]">PRE-LAUNCH NOTICE</p><p className="mt-3 text-sm leading-7">This is a launch draft, not the final legal policy. JobCraft will publish the responsible business/legal identity, privacy contact, retention details and any jurisdiction-specific disclosures before full public launch.</p></section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-[#e5dfd5] pt-6"><h2 className="jc-serif text-2xl font-bold text-[#173f33]">{title}</h2><p className="mt-3">{children}</p></section>;
}
