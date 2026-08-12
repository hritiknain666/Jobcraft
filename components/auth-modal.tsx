"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
    <button aria-label="Close authentication modal" onClick={close} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]" />
    <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_35px_100px_rgba(15,23,42,.28)]">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#090d1f] text-sm font-black text-white">JC</span><span className="text-xl font-black">Job<span className="text-violet-600">Craft</span></span></div>
          <button onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-500 hover:bg-slate-200">×</button>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-8">
        <p className="text-xs font-black tracking-[.14em] text-violet-600">{mode === "login" ? "WELCOME BACK" : "CREATE YOUR WORKSPACE"}</p>
        <h2 id="auth-title" className="mt-2 text-3xl font-black tracking-[-.035em]">{mode === "login" ? "Continue your JobCraft search." : "Start your JobCraft workspace."}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{mode === "login" ? "Your jobs, resumes, certificates and applications stay connected in one place." : "Create an account to save your profile, resumes, certificates and applications."}</p>

        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</div>}
        {message && <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && <label className="block text-sm font-black">Full name<input name="fullName" required autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-normal outline-none focus:border-violet-400 focus:bg-white" /></label>}
          <label className="block text-sm font-black">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-normal outline-none focus:border-violet-400 focus:bg-white" /></label>
          <label className="block text-sm font-black">Password<input name="password" type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-normal outline-none focus:border-violet-400 focus:bg-white" /></label>
          <button disabled={loading} className="w-full rounded-xl bg-[#090d1f] px-5 py-3.5 font-black text-white transition hover:bg-violet-600 disabled:opacity-60">{loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        </form>

        {pendingEmail && message && <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/70 p-3.5 text-sm text-violet-900"><p className="font-black">No email yet?</p><p className="mt-1 text-xs leading-5 text-violet-700">Check spam first, then resend the confirmation to <b>{pendingEmail}</b>.</p><button type="button" disabled={loading} onClick={resend} className="mt-3 rounded-lg bg-white px-3.5 py-2 text-xs font-black text-violet-700 shadow-sm ring-1 ring-violet-200 disabled:opacity-60">Resend confirmation</button></div>}

        <p className="mt-6 text-center text-sm text-slate-500">{mode === "login" ? "New to JobCraft?" : "Already have an account?"} <button onClick={() => { setError(""); setMessage(""); router.replace(hrefFor(mode === "login" ? "signup" : "login"), { scroll: false }); }} className="font-black text-violet-600">{mode === "login" ? "Create one" : "Log in"}</button></p>
        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">By continuing, you agree to use JobCraft responsibly and keep profile information accurate.</p>
      </div>
    </section>
  </div>;
}
