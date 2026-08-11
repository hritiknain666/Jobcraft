"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function csv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const experienceRaw = String(formData.get("experienceYears") ?? "").trim();
  const experienceYears = experienceRaw ? Number(experienceRaw) : null;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    headline: String(formData.get("headline") ?? "").trim(),
    experience_years: Number.isFinite(experienceYears) ? experienceYears : null,
    skills: csv(formData.get("skills")),
    target_roles: csv(formData.get("targetRoles")),
    preferred_work_modes: formData.getAll("workMode").map(String),
    updated_at: new Date().toISOString(),
  });

  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?message=Profile saved");
}
