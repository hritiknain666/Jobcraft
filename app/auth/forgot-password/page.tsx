import Link from "next/link";
import AuthPageShell from "@/components/auth-page-shell";
import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; email?: string }> }) {
  const params = await searchParams;
  return (
    <AuthPageShell mode="login">
      {params.error && <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">{params.error}</p>}
      {params.message && <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm leading-6 text-emerald-700">{params.message}</p>}
      <div className="mt-7 rounded-2xl border border-[#cfe0d8] bg-[#e9f4ed] p-4"><p className="text-sm font-black text-[#285844]">Reset your password</p><p className="mt-1 text-sm leading-6 text-[#5f786f]">Enter the email linked to your JobCraft account. We&apos;ll send a secure recovery link if the account exists.</p></div>
      <form action={requestPasswordReset} className="mt-5 space-y-4"><label className="jc-form-field">Email<input name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={params.email ?? ""} placeholder="you@example.com" className="jc-input mt-2" /></label><button className="jc-button-primary w-full !py-4">Send secure reset link →</button></form>
      <p className="mt-6 text-center text-sm text-[#789087]">Remembered your password? <Link href="/auth/login" className="font-black text-[#278363]">Back to login</Link></p>
    </AuthPageShell>
  );
}
