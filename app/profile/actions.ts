"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_WORK_MODES = new Set(["On-site", "Hybrid", "Remote"]);

function csv(value: FormDataEntryValue | null) {
  return [...new Set(
    String(value ?? "")
      .split(",")
      .map((item) => item.trim().slice(0, 80))
      .filter(Boolean)
  )].slice(0, 50);
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const experienceRaw = String(formData.get("experienceYears") ?? "").trim();
  const experienceYears = experienceRaw ? Number(experienceRaw) : null;
  if (experienceYears !== null && (!Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 60)) {
    redirect("/profile?error=Experience+must+be+between+0+and+60+years");
  }

  const requestedWorkModes = formData.getAll("workMode").map(String);
  if (requestedWorkModes.some((mode) => !ALLOWED_WORK_MODES.has(mode))) {
    redirect("/profile?error=Invalid+work+mode");
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: String(formData.get("fullName") ?? "").trim().slice(0, 120),
    phone: String(formData.get("phone") ?? "").trim().slice(0, 30),
    city: String(formData.get("city") ?? "").trim().slice(0, 120),
    headline: String(formData.get("headline") ?? "").trim().slice(0, 180),
    experience_years: experienceYears,
    skills: csv(formData.get("skills")),
    target_roles: csv(formData.get("targetRoles")).slice(0, 25),
    preferred_work_modes: [...new Set(requestedWorkModes)],
    updated_at: new Date().toISOString(),
  });

  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?message=Profile saved");
}
