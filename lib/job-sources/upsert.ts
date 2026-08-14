import type { SupabaseClient } from "@supabase/supabase-js";
import { toJobsTableRow } from "./normalize";
import type { NormalizedJob } from "./types";
import { validateLiveImportBatch } from "./validate";

export async function upsertLiveJobs(supabase: SupabaseClient, jobs: NormalizedJob[]) {
  const rows = validateLiveImportBatch(jobs).map(toJobsTableRow);
  if (!rows.length) return [];

  const { data, error } = await supabase
    .from("jobs")
    .upsert(rows, { onConflict: "source,external_id" })
    .select("id,source,external_id");

  if (error) throw error;
  return data ?? [];
}
