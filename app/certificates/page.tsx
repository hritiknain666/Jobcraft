import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteCertificate, saveCertificate } from "./actions";

export default async function CertificatesPage({ searchParams }: { searchParams: Promise<{ error?: string; added?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id,name,issuer,issue_date,expiry_date,credential_id,credential_url,storage_path,created_at")
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return <main className="min-h-screen bg-[#f7f8fc] text-[#090d1f]"><div className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Link href="/dashboard" className="text-sm font-black text-violet-600">← Dashboard</Link><p className="mt-5 text-xs font-black tracking-[.15em] text-violet-600">CERTIFICATE LIBRARY</p><h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Keep your credentials ready for every resume.</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Save certificate details once, upload optional proof privately, and choose what appears on each JobCraft resume.</p></div><Link href="/resume/builder" className="rounded-xl bg-[#090d1f] px-5 py-3 font-bold text-white">Open resume builder →</Link></div>

    {params.error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{params.error}</p>}
    {params.added && <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Certificate added to your library.</p>}

    <section className="mt-8 rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.05)] sm:p-7"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-xl font-black">Add a certificate</h2><p className="mt-1 text-sm text-slate-500">Only add credentials you genuinely hold. Proof stays private unless you choose to share a public credential URL.</p></div><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">PRIVATE BY DEFAULT</span></div>
      <form action={saveCertificate} className="mt-6 grid gap-4 md:grid-cols-2"><Field name="name" label="Certificate name" placeholder="Google Data Analytics Professional Certificate" required/><Field name="issuer" label="Issuing organisation" placeholder="Google / Coursera" required/><Field name="issueDate" label="Issue date" type="date"/><Field name="expiryDate" label="Expiry date (optional)" type="date"/><Field name="credentialId" label="Credential ID (optional)" placeholder="ABC-12345"/><Field name="credentialUrl" label="Credential URL (optional)" type="url" placeholder="https://..."/><label className="md:col-span-2 text-sm font-bold">Certificate proof <span className="font-normal text-slate-500">(optional, private)</span><input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"/><span className="mt-2 block text-xs font-normal text-slate-500">PDF, JPG or PNG up to 5 MB.</span></label><div className="md:col-span-2"><button className="rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-200">Add certificate</button></div></form>
    </section>

    <section className="mt-9"><div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[.15em] text-violet-600">YOUR CREDENTIALS</p><h2 className="mt-2 text-2xl font-black">Certificate library</h2></div><span className="text-sm font-bold text-slate-400">{certificates?.length ?? 0} saved</span></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{certificates?.length ? certificates.map((certificate: any) => <article key={certificate.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-violet-600">{certificate.issuer}</p><h3 className="mt-1 text-xl font-black">{certificate.name}</h3></div>{certificate.storage_path && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Proof saved</span>}</div><div className="mt-4 space-y-1 text-sm text-slate-500">{certificate.issue_date && <p>Issued {new Date(certificate.issue_date).toLocaleDateString()}</p>}{certificate.expiry_date && <p>Expires {new Date(certificate.expiry_date).toLocaleDateString()}</p>}{certificate.credential_id && <p>Credential ID: {certificate.credential_id}</p>}</div><div className="mt-5 flex flex-wrap gap-2">{certificate.credential_url && <a href={certificate.credential_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">View credential ↗</a>}<form action={deleteCertificate}><input type="hidden" name="id" value={certificate.id}/><button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700">Delete</button></form></div></article>) : <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-black">No certificates yet</h3><p className="mt-2 text-sm text-slate-500">Add professional certifications, licences, course credentials or training certificates you want available for resumes.</p></div>}</div>
    </section>
  </div></main>;
}

function Field({ name, label, placeholder = "", type = "text", required = false }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-bold">{label}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"/></label>;
}
