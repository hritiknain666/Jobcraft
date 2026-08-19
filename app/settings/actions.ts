"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function removeUserStorage(admin: ReturnType<typeof createAdminClient>, bucket: "resumes" | "certificates", userId: string) {
  const { data, error } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
  if (error) throw error;

  const paths = (data ?? [])
    .filter((item) => item.name && item.id)
    .map((item) => `${userId}/${item.name}`);

  if (paths.length === 0) return;
  const { error: removeError } = await admin.storage.from(bucket).remove(paths);
  if (removeError) throw removeError;
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
    await removeUserStorage(admin, "resumes", user.id);
    await removeUserStorage(admin, "certificates", user.id);

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    console.error("Account deletion failed", error);
    redirect("/settings?deleteError=Account%20deletion%20failed.%20Please%20try%20again.");
  }

  redirect("/?accountDeleted=1");
}
