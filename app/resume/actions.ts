"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeUploadFilename, validateUpload } from "@/lib/uploads/file-validation";

export async function uploadResume(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const file = formData.get("file") as File | null;
  const name = String(formData.get("name") ?? "My Resume").trim() || "My Resume";
  if (!file || file.size === 0) redirect("/resume?error=Choose+a+PDF+or+DOCX+file");
  const validation = await validateUpload(file, "resume");
  if (!validation.valid) redirect(`/resume?error=${encodeURIComponent(validation.error)}`);

  const safeName = safeUploadFilename(file.name);
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file, { upsert: false, contentType: validation.contentType });
  if (uploadError) redirect(`/resume?error=${encodeURIComponent(uploadError.message)}`);

  const { error } = await supabase.from("resumes").insert({ user_id: user.id, name, storage_path: path, is_primary: false });
  if (error) {
    await supabase.storage.from("resumes").remove([path]);
    redirect(`/resume?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/resume");
  redirect("/resume?uploaded=1");
}

export async function deleteResume(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  const { data: resume } = await supabase.from("resumes").select("storage_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (resume?.storage_path) await supabase.storage.from("resumes").remove([resume.storage_path]);
  await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/resume");
}

export async function setPrimaryResume(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  await supabase.from("resumes").update({ is_primary: false }).eq("user_id", user.id);
  await supabase.from("resumes").update({ is_primary: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/resume");
}
