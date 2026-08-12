import Link from "next/link";
import AuthPageShell from "@/components/auth-page-shell";
import { login, resendConfirmation } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; email?: string }> }) {
  const params = await searchParams;

  return (
    <AuthPageShell mode="login">
      {params.error && <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">{params.error}</p>}
      {params.message && <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm leading-6 text-emerald-700">{params.message}</p>}

      <form action={login} className="mt-7 space-y-4">
        <label className="block text-sm font-black">Email
          <input name="email" type="email" required autoComplete="email" defaultValue={params.email ?? ""} placeholder="you@example.com" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        </label>
        <label className="block text-sm font-black">Password
          <input name="password" type="password" required minLength={6} autoComplete="current-password" placeholder="Your password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        </label>
        <button className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-black text-white shadow-[0_16px_35px_rgba(124,58,237,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,58,237,.32)]">Log in to JobCraft →</button>
      </form>

      <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
        <p className="text-sm font-black text-violet-950">Didn&apos;t get the confirmation email?</p>
        <p className="mt-1 text-xs leading-5 text-violet-800">Check spam first. If it still hasn&apos;t arrived, enter the same signup email and resend it.</p>
        <form action={resendConfirmation} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input name="email" type="email" required defaultValue={params.email ?? ""} placeholder="Signup email" className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-400" />
          <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-violet-700 shadow-sm ring-1 ring-violet-200 transition hover:-translate-y-0.5">Resend email</button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">New to JobCraft? <Link href="/auth/signup" className="font-black text-violet-600 hover:text-violet-700">Create an account</Link></p>
    </AuthPageShell>
  );
}
