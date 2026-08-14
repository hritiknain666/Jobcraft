"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_SITE_URL = "https://jobcraft.hritiknain666-35e.workers.dev";

function safeNextPath(value: FormDataEntryValue | string | null) {
  const next = String(value ?? "").trim();
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

function authUrl(path: "/auth/login" | "/auth/signup", values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function verificationOptions(next = "/dashboard") {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");
  const params = new URLSearchParams({ message: "Email confirmed. You can log in now." });
  if (next !== "/dashboard") params.set("next", next);
  return { emailRedirectTo: `${siteUrl}/auth/login?${params.toString()}` };
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(authUrl("/auth/login", { error: error.message, email, next: next === "/dashboard" ? undefined : next }));

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      ...verificationOptions(next),
    },
  });

  if (error) redirect(authUrl("/auth/signup", { error: error.message, next: next === "/dashboard" ? undefined : next }));

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  redirect(authUrl("/auth/login", {
    message: "Account created. Check your inbox or spam folder to confirm your email. If it does not arrive, resend it below.",
    email,
    next: next === "/dashboard" ? undefined : next,
  }));
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNextPath(formData.get("next"));

  if (!email) redirect(authUrl("/auth/login", {
    error: "Enter the email you used to sign up, then resend the confirmation.",
    next: next === "/dashboard" ? undefined : next,
  }));

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: verificationOptions(next),
  });

  if (error) redirect(authUrl("/auth/login", { error: error.message, email, next: next === "/dashboard" ? undefined : next }));
  redirect(authUrl("/auth/login", {
    message: "Confirmation email sent again. Check your inbox and spam folder.",
    email,
    next: next === "/dashboard" ? undefined : next,
  }));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
