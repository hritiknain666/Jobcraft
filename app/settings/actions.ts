"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function removeStoredFiles(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const [{ data: resumes, error: resumeQueryError }, { data: certificates, error: certificateQueryError }] = await Promise.all([
    admin.from("resumes").select("storage_path").eq("user_id", userId),
    admin.from("certificates").select("storage_path").eq("user_id", userId),
  ]);

  if (resumeQueryError) throw resumeQueryError;
  if (certificateQueryError) throw certificateQueryError;

  const resumePaths = (resumes ?? []).map((item) => item.storage_path).filter((path): path is string => Boolean(path));
  const certificatePaths = (certificates ?? []).map((item) => item.storage_path).filter((path): path is string => Boolean(path));

  if (resumePaths.length > 0) {
    const { error } = await admin.storage.from("resumes").remove(resumePaths);
    if (error) throw error;
  }

  if (certificatePaths.length > 0) {
    const { error } = await admin.storage.from("certificates").remove(certificatePaths);
    if (error) throw error;
  }
}

export async function deleteAccount(formData: FormData) {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "DELETE") {
    redirect("/settings?deleteError=Type%20DELETE%20to%20confirm%20account%20deletion.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard?auth=login");

  const admin = createAdminClient();

  try {
    await removeStoredFiles(admin, user.id);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    console.error("Account deletion failed", error);
    redirect("/settings?deleteError=Account%20deletion%20failed.%20Please%20try%20again.");
  }

  redirect("/?accountDeleted=1");
}
