"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeUploadFilename, validateUpload } from "@/lib/uploads/file-validation";

export async function uploadResume(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/resumes?error=Please select a resume file");
  }
  const validation = await validateUpload(file, "resume");
  if (!validation.valid) redirect(`/resumes?error=${encodeURIComponent(validation.error)}`);

  const filename = `${crypto.randomUUID()}-${safeUploadFilename(file.name)}`;
  const path = `${user.id}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(path, file, { upsert: false, contentType: validation.contentType });

  if (uploadError) redirect(`/resumes?error=${encodeURIComponent(uploadError.message)}`);

  const { error: rowError } = await supabase.from("resumes").insert({
    user_id: user.id,
    name: file.name.replace(/\.(pdf|docx)$/i, ""),
    storage_path: path,
    is_primary: false,
  });

  if (rowError) {
    await supabase.storage.from("resumes").remove([path]);
    redirect(`/resumes?error=${encodeURIComponent(rowError.message)}`);
  }

  revalidatePath("/resumes");
  revalidatePath("/dashboard");
  redirect("/resumes?message=Resume uploaded successfully");
}

export async function deleteResume(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const id = String(formData.get("id") ?? "");
  const { data: resume } = await supabase
    .from("resumes")
    .select("id,storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!resume) redirect("/resumes?error=Resume not found");

  if (resume.storage_path) {
    await supabase.storage.from("resumes").remove([resume.storage_path]);
  }
  const { error } = await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/resumes?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/resumes");
  revalidatePath("/dashboard");
  redirect("/resumes?message=Resume deleted");
}
