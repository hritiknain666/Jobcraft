import Link from "next/link";
import AuthPageShell from "@/components/auth-page-shell";
import { signup } from "../actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <AuthPageShell mode="signup">
      {params.error && <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">{params.error}</p>}

      <form action={signup} className="mt-7 space-y-4">
        <label className="block text-sm font-black">Full name
          <input name="fullName" type="text" required autoComplete="name" placeholder="Your full name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        </label>
        <label className="block text-sm font-black">Email
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        </label>
        <label className="block text-sm font-black">Password
          <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          <span className="mt-2 block text-xs font-normal leading-5 text-slate-400">Use a password you do not reuse elsewhere.</span>
        </label>
        <button className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-black text-white shadow-[0_16px_35px_rgba(124,58,237,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,58,237,.32)]">Create free account →</button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link href="/auth/login" className="font-black text-violet-600 hover:text-violet-700">Log in</Link></p>
    </AuthPageShell>
  );
}
