"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthModalProps = { authenticated: boolean };

const protectedPaths = ["/dashboard", "/applications", "/profile", "/certificates", "/cover-letter", "/resume/builder", "/resume/tailor"];

export default function AuthModal({ authenticated }: AuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("auth");
  const isOpen = mode === "login" || mode === "signup";
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  function hrefFor(nextMode?: "login" | "signup") {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode) params.set("auth", nextMode); else params.delete("auth");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function emailRedirectTo() {
    return `${window.location.origin}/auth/login?message=${encodeURIComponent("Email confirmed. You can log in now.")}`;
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      let nextMode: "login" | "signup" | null = null;
      if (url.pathname === "/auth/login") nextMode = "login";
      if (url.pathname === "/auth/signup") nextMode = "signup";
      if (!authenticated && protectedPaths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) nextMode = "login";
      if (!nextMode) return;

      event.preventDefault();
      setError("");
      setMessage("");
      router.replace(hrefFor(nextMode), { scroll: false });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [authenticated, pathname, router, searchParams]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  if (!isOpen) return null;

  function close() {
    setError("");
    setMessage("");
    setPendingEmail("");
    router.replace(hrefFor(), { scroll: false });
  }

  async function resend() {
    if (!pendingEmail) return setError("Enter the same email you used to sign up first.");
    setLoading(true);
    setError("");
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email: pendingEmail, options: { emailRedirectTo: emailRedirectTo() } });
    setLoading(false);
    if (resendError) return setError(resendError.message);
    setMessage("Confirmation email sent again. Check your inbox and spam folder.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPendingEmail(email);

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) return setError(authError.message);
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const fullName = String(form.get("fullName") ?? "").trim();
    const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: emailRedirectTo() } });
    setLoading(false);
    if (authError) return setError(authError.message);
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    setMessage("Account created. Check your inbox or spam folder to confirm your email. If it does not arrive, resend it below.");
  }

  return <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
    <button aria-label="Close authentication modal" onClick={close} className="absolute inset-0 bg-[#102f26]/55 backdrop-blur-[4px]" />
    <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative z-10 w-full max-w-md overflow-hidden rounded-[26px] border border-[#d8d1c5] bg-[#fbfaf6] shadow-[0_35px_100px_rgba(18,60,48,.30)]">
      <div className="border-b border-[#e4ded4] px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f49a48] text-lg text-[#173f33]">✣</span><span className="jc-serif text-2xl font-bold text-[#173f33]">JobCraft</span></div>
          <button onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efede7] text-lg font-black text-[#718981] hover:bg-[#e6e1d8]">×</button>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-8">
        <p className="jc-eyebrow">{mode === "login" ? "WELCOME BACK" : "CREATE YOUR WORKSPACE"}</p>
        <h2 id="auth-title" className="jc-serif mt-2 text-3xl font-bold leading-tight text-[#173f33]">{mode === "login" ? "Continue your JobCraft search." : "Build your career signal."}</h2>
        <p className="mt-3 text-sm leading-6 text-[#789087]">{mode === "login" ? "Your roles, resumes, certificates and applications stay connected in one workspace." : "Create an account to save your profile, resumes, certificates and application plan."}</p>

        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</div>}
        {message && <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && <label className="jc-form-field">Full name<input name="fullName" required maxLength={120} autoComplete="name" className="jc-input mt-2" /></label>}
          <label className="jc-form-field">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className="jc-input mt-2" /></label>
          <label className="jc-form-field">Password<input name="password" type="password" required minLength={8} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className="jc-input mt-2" />{mode === "signup" ? <span className="mt-2 block text-[11px] font-normal text-[#789087]">Use at least 8 characters.</span> : null}</label>
          {mode === "login" && <div className="flex justify-end"><Link href="/auth/forgot-password" className="jc-text-link">Forgot password?</Link></div>}
          <button disabled={loading} className="jc-button-primary w-full disabled:opacity-60">{loading ? "Please wait…" : mode === "login" ? "Log in →" : "Create account →"}</button>
        </form>

        {pendingEmail && message && <div className="mt-4 rounded-xl border border-[#cfe0d8] bg-[#e9f4ed] p-3.5 text-sm text-[#285844]"><p className="font-black">No email yet?</p><p className="mt-1 text-xs leading-5">Check spam first, then resend the confirmation to <b>{pendingEmail}</b>.</p><button type="button" disabled={loading} onClick={resend} className="mt-3 rounded-lg bg-[#fbfaf6] px-3.5 py-2 text-xs font-black text-[#278363] shadow-sm ring-1 ring-[#bfd4ca] disabled:opacity-60">Resend confirmation</button></div>}

        <p className="mt-6 text-center text-sm text-[#789087]">{mode === "login" ? "New to JobCraft?" : "Already have an account?"} <button onClick={() => { setError(""); setMessage(""); router.replace(hrefFor(mode === "login" ? "signup" : "login"), { scroll: false }); }} className="font-black text-[#278363]">{mode === "login" ? "Create one" : "Log in"}</button></p>
        <p className="mt-5 text-center text-[11px] leading-5 text-[#9aaba4]">By continuing, you agree to keep JobCraft profile information accurate and use the platform responsibly.</p>
      </div>
    </section>
  </div>;
}