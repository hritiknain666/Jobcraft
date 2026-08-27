import Link from "next/link";
import AuthPageShell from "@/components/auth-page-shell";
import { signup } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  const nextQuery = next === "/dashboard" ? "" : `?next=${encodeURIComponent(next)}`;

  return (
    <AuthPageShell mode="signup">
      {params.error && (
        <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
          {params.error}
        </p>
      )}
      <form action={signup} className="mt-7 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="jc-form-field">
          Full name
          <input
            name="fullName"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Your full name"
            className="jc-input mt-2"
          />
        </label>
        <label className="jc-form-field">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
            className="jc-input mt-2"
          />
        </label>
        <label className="jc-form-field">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="jc-input mt-2"
          />
          <span className="mt-2 block text-[11px] font-normal leading-5 text-[#789087]">
            Use at least 8 characters and do not reuse a password from another service.
          </span>
        </label>
        <button className="jc-button-primary w-full !py-4">Create free account →</button>
      </form>
      <p className="mt-6 text-center text-sm text-[#789087]">
        Already registered?{" "}
        <Link href={`/auth/login${nextQuery}`} className="font-black text-[#278363]">
          Log in
        </Link>
      </p>
    </AuthPageShell>
  );
}
