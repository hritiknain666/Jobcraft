"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function verificationOptions() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return siteUrl ? { emailRedirectTo: `${siteUrl}/auth/login?message=${encodeURIComponent("Email confirmed. You can log in now.")}` } : undefined;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      ...verificationOptions(),
    },
  });

  if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  redirect(`/auth/login?message=${encodeURIComponent("Account created. Check your inbox or spam folder to confirm your email. If it does not arrive, resend it below.")}&email=${encodeURIComponent(email)}`);
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) redirect(`/auth/login?error=${encodeURIComponent("Enter the email you used to sign up, then resend the confirmation.")}`);

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: verificationOptions(),
  });

  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  redirect(`/auth/login?message=${encodeURIComponent("Confirmation email sent again. Check your inbox and spam folder.")}&email=${encodeURIComponent(email)}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
