"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeUploadFilename, validateUpload } from "@/lib/uploads/file-validation";

export async function saveCertificate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const name = String(formData.get("name") ?? "").trim();
  const issuer = String(formData.get("issuer") ?? "").trim();
  const issueDate = String(formData.get("issueDate") ?? "").trim() || null;
  const expiryDate = String(formData.get("expiryDate") ?? "").trim() || null;
  const credentialId = String(formData.get("credentialId") ?? "").trim() || null;
  const credentialUrl = String(formData.get("credentialUrl") ?? "").trim() || null;
  const file = formData.get("file") as File | null;

  if (!name || !issuer) redirect("/certificates?error=Certificate+name+and+issuer+are+required");
  if (credentialUrl && !/^https?:\/\//i.test(credentialUrl))
    redirect("/certificates?error=Credential+URL+must+start+with+http+or+https");

  let storagePath: string | null = null;
  if (file && file.size > 0) {
    const validation = await validateUpload(file, "certificate");
    if (!validation.valid) redirect(`/certificates?error=${encodeURIComponent(validation.error)}`);
    const safeName = safeUploadFilename(file.name);
    storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(storagePath, file, { upsert: false, contentType: validation.contentType });
    if (uploadError) redirect(`/certificates?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error } = await supabase.from("certificates").insert({
    user_id: user.id,
    name,
    issuer,
    issue_date: issueDate,
    expiry_date: expiryDate,
    credential_id: credentialId,
    credential_url: credentialUrl,
    storage_path: storagePath,
  });

  if (error) {
    if (storagePath) await supabase.storage.from("certificates").remove([storagePath]);
    redirect(`/certificates?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/certificates");
  revalidatePath("/resume/builder");
  redirect("/certificates?added=1");
}

export async function deleteCertificate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const id = String(formData.get("id") ?? "");
  const { data: certificate } = await supabase
    .from("certificates")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (certificate?.storage_path)
    await supabase.storage.from("certificates").remove([certificate.storage_path]);
  await supabase.from("certificates").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/certificates");
  revalidatePath("/resume/builder");
}
