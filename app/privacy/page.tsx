import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-5 py-12 text-[#0b1020] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-black text-violet-600">← JobCraft</Link>
        <h1 className="mt-6 text-4xl font-black tracking-[-.04em]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Launch draft · Last updated 14 August 2026</p>
        <div className="mt-8 space-y-6 leading-7 text-slate-600">
          <p>JobCraft uses account, profile, resume, certificate, application-tracking and job-preference information to provide the features you choose to use. We aim to collect only information needed to operate and improve those features.</p>
          <section><h2 className="text-xl font-black text-slate-950">Information we use</h2><p className="mt-2">This may include your account details, career profile, skills, experience, uploaded career documents, saved jobs and application activity. Authentication and application data are stored through our configured service providers.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">How it is used</h2><p className="mt-2">Information may be used to authenticate you, calculate job-fit signals, build or tailor career documents, maintain your application tracker, provide requested career features, secure the service and diagnose reliability problems.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">Job listings</h2><p className="mt-2">Prototype/sample roles are identified separately from future live provider listings. When third-party job sources are enabled, their links may take you to an external site whose privacy practices are governed by that provider.</p></section>
          <section><h2 className="text-xl font-black text-slate-950">Your choices</h2><p className="mt-2">You should be able to update relevant profile information and remove information through available product controls. Additional privacy requests will be handled through the official privacy contact published before public launch.</p></section>
          <section className="rounded-2xl bg-amber-50 p-5 text-amber-950"><h2 className="font-black">Pre-launch notice</h2><p className="mt-1 text-sm leading-6">This is a launch draft, not the final legal policy. JobCraft will publish the responsible business/legal identity, privacy contact, retention details and any jurisdiction-specific disclosures before full public launch.</p></section>
        </div>
      </article>
    </main>
  );
}
