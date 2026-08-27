"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type StorageObject = { bucket: "resumes" | "certificates"; path: string };

async function collectStoredFiles(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<StorageObject[]> {
  const [
    { data: resumes, error: resumeQueryError },
    { data: certificates, error: certificateQueryError },
  ] = await Promise.all([
    admin.from("resumes").select("storage_path").eq("user_id", userId),
    admin.from("certificates").select("storage_path").eq("user_id", userId),
  ]);

  if (resumeQueryError) throw resumeQueryError;
  if (certificateQueryError) throw certificateQueryError;

  return [
    ...(resumes ?? []).flatMap((item) =>
      item.storage_path ? [{ bucket: "resumes" as const, path: item.storage_path }] : [],
    ),
    ...(certificates ?? []).flatMap((item) =>
      item.storage_path ? [{ bucket: "certificates" as const, path: item.storage_path }] : [],
    ),
  ];
}

async function removeStoredFiles(
  admin: ReturnType<typeof createAdminClient>,
  objects: StorageObject[],
) {
  for (const bucket of ["resumes", "certificates"] as const) {
    const paths = objects.filter((item) => item.bucket === bucket).map((item) => item.path);
    if (paths.length === 0) continue;
    const { error } = await admin.storage.from(bucket).remove(paths);
    if (error) throw error;
  }
}

export async function deleteAccount(formData: FormData) {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "DELETE") {
    redirect("/settings?deleteError=Type%20DELETE%20to%20confirm%20account%20deletion.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard?auth=login");

  const admin = createAdminClient();
  let cleanupQueued = false;

  try {
    const objects = await collectStoredFiles(admin, user.id);
    const { error: queueError } = await admin.from("account_deletion_cleanup").upsert({
      user_id: user.id,
      storage_objects: objects,
      status: "pending",
      attempts: 0,
      last_error: null,
      updated_at: new Date().toISOString(),
    });
    if (queueError) throw queueError;
    cleanupQueued = true;

    // Auth deletion cascades database-owned user records. Storage is removed
    // only after this succeeds, so a failed deletion never strips user files.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    if (cleanupQueued) await admin.from("account_deletion_cleanup").delete().eq("user_id", user.id);
    console.error("Account deletion failed", error);
    redirect("/settings?deleteError=Account%20deletion%20failed.%20Please%20try%20again.");
  }

  const { data: cleanup } = await admin
    .from("account_deletion_cleanup")
    .select("storage_objects,attempts")
    .eq("user_id", user.id)
    .maybeSingle();

  try {
    const objects = Array.isArray(cleanup?.storage_objects)
      ? cleanup.storage_objects.filter(
          (item): item is StorageObject =>
            Boolean(item) &&
            typeof item === "object" &&
            (item.bucket === "resumes" || item.bucket === "certificates") &&
            typeof item.path === "string",
        )
      : [];
    await removeStoredFiles(admin, objects);
    await admin.from("account_deletion_cleanup").delete().eq("user_id", user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown storage cleanup error";
    console.error("Account deleted; storage cleanup queued for retry", error);
    await admin
      .from("account_deletion_cleanup")
      .update({
        status: "failed",
        attempts: (cleanup?.attempts ?? 0) + 1,
        last_error: message.slice(0, 1_000),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  redirect("/?accountDeleted=1");
}
