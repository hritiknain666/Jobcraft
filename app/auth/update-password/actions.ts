"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirect(
      `/auth/update-password?error=${encodeURIComponent("Use at least 8 characters for your new password.")}`,
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/auth/update-password?error=${encodeURIComponent("The two passwords do not match.")}`,
    );
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(
      `/auth/login?error=${encodeURIComponent("Your recovery session has expired. Please request a new password reset link.")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect(
    `/auth/login?message=${encodeURIComponent("Password updated successfully. Log in with your new password.")}`,
  );
}
