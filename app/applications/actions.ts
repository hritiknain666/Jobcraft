"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
] as const;

export async function saveApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const jobId = String(formData.get("jobId") ?? "");
  const status = String(formData.get("status") ?? "Saved");
  if (!jobId || !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) return;

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("user_id", user.id);
  } else {
    await supabase.from("applications").insert({ user_id: user.id, job_id: jobId, status });
  }

  revalidatePath("/applications");
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateApplicationStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "Saved");
  if (!id || !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) return;

  await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/applications");
}

export async function deleteApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("applications").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/applications");
}
