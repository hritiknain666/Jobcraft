"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_SITE_URL = "https://jobcraft.hritiknain666-35e.workers.dev";

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent("Enter your email address.")}`);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    redirect(
      `/auth/forgot-password?error=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`,
    );
  }

  redirect(
    `/auth/forgot-password?message=${encodeURIComponent("If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.")}&email=${encodeURIComponent(email)}`,
  );
}
