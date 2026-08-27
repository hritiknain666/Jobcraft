"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function list(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveResumeDraft(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "JobCraft Resume").trim() || "JobCraft Resume";
  const certificateIds = formData
    .getAll("certificate_ids")
    .map((value) => String(value))
    .filter(Boolean);

  if (certificateIds.length) {
    const { data: ownedCertificates } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .in("id", certificateIds);
    const ownedIds = new Set((ownedCertificates ?? []).map((certificate) => certificate.id));
    if (certificateIds.some((certificateId) => !ownedIds.has(certificateId))) {
      redirect("/resume/builder?error=One+or+more+selected+certificates+are+not+available");
    }
  }

  const structured_data = {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    skills: list(formData.get("skills")),
    education: String(formData.get("education") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    projects: String(formData.get("projects") ?? ""),
    certifications: String(formData.get("certifications") ?? ""),
    certificate_ids: certificateIds,
  };

  if (id) {
    const { error } = await supabase
      .from("resumes")
      .update({ name, structured_data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) redirect(`/resume/builder?id=${id}&error=${encodeURIComponent(error.message)}`);
  } else {
    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: user.id, name, structured_data, is_primary: false })
      .select("id")
      .single();
    if (error) redirect(`/resume/builder?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/resume");
    redirect(`/resume/builder?id=${data.id}&saved=1`);
  }

  revalidatePath("/resume");
  revalidatePath("/resume/builder");
  redirect(`/resume/builder?id=${id}&saved=1`);
}
