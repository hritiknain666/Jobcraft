import Link from "next/link";
import AuthPageShell from "@/components/auth-page-shell";
import { updatePassword } from "./actions";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <AuthPageShell mode="login">
      {params.error && <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">{params.error}</p>}
      <div className="mt-7 rounded-2xl border border-[#cfe0d8] bg-[#e9f4ed] p-4"><p className="text-sm font-black text-[#285844]">Choose a new password</p><p className="mt-1 text-sm leading-6 text-[#5f786f]">This page only works after opening a valid password-recovery email. Your recovery session is checked again before the password is changed.</p></div>
      <form action={updatePassword} className="mt-5 space-y-4"><label className="jc-form-field">New password<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="At least 8 characters" className="jc-input mt-2" /></label><label className="jc-form-field">Confirm new password<input name="confirmPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" placeholder="Repeat your new password" className="jc-input mt-2" /></label><button className="jc-button-primary w-full !py-4">Update password securely →</button></form>
      <p className="mt-6 text-center text-sm text-[#789087]">Recovery link expired? <Link href="/auth/forgot-password" className="font-black text-[#278363]">Request another</Link></p>
    </AuthPageShell>
  );
}
