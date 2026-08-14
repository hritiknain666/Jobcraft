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
        <label className="jc-form-field">Email<input name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={params.email ?? ""} placeholder="you@example.com" className="jc-input mt-2" /></label>
        <label className="jc-form-field">Password<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="current-password" placeholder="Your password" className="jc-input mt-2" /></label>
        <div className="flex justify-end"><Link href="/auth/forgot-password" className="jc-text-link">Forgot password?</Link></div>
        <button className="jc-button-primary w-full !py-4">Log in to JobCraft →</button>
      </form>

      <div className="mt-5 rounded-2xl border border-[#cfe0d8] bg-[#e9f4ed] p-4">
        <p className="text-sm font-black text-[#285844]">Didn&apos;t get the confirmation email?</p>
        <p className="mt-1 text-xs leading-5 text-[#5f786f]">Check spam first. If it still hasn&apos;t arrived, enter the same signup email and resend it.</p>
        <form action={resendConfirmation} className="mt-3 flex flex-col gap-2 sm:flex-row"><input name="email" type="email" required maxLength={254} defaultValue={params.email ?? ""} placeholder="Signup email" className="jc-input min-w-0 flex-1 !py-2.5 text-sm" /><button className="jc-button-secondary !px-4 !py-2.5 text-sm">Resend email</button></form>
      </div>

      <p className="mt-6 text-center text-sm text-[#789087]">New to JobCraft? <Link href="/auth/signup" className="font-black text-[#278363]">Create an account</Link></p>
    </AuthPageShell>
  );
}
