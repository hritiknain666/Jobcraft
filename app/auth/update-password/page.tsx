import Link from "next/link";
import AuthPageShell from "@/components/auth-page-shell";
import { updatePassword } from "./actions";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthPageShell mode="login">
      {params.error && (
        <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <div className="mt-7 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
        <p className="text-sm font-black text-violet-950">Choose a new password</p>
        <p className="mt-1 text-sm leading-6 text-violet-800">
          This page only works after opening a valid password-recovery email. Your recovery session is checked again before the password is changed.
        </p>
      </div>

      <form action={updatePassword} className="mt-5 space-y-4">
        <label className="block text-sm font-black">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <label className="block text-sm font-black">
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-normal outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <button className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-black text-white shadow-[0_16px_35px_rgba(124,58,237,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(124,58,237,.32)]">
          Update password securely →
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Recovery link expired?{" "}
        <Link href="/auth/forgot-password" className="font-black text-violet-600 hover:text-violet-700">
          Request another
        </Link>
      </p>
    </AuthPageShell>
  );
}
