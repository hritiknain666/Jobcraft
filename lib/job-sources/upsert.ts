import type { SupabaseClient } from "@supabase/supabase-js";
import { toJobsTableRow } from "./normalize";
import { assertLiveImport } from "./source-kind";
import type { NormalizedJob } from "./types";

export async function upsertLiveJobs(supabase: SupabaseClient, jobs: NormalizedJob[]) {
  const rows = jobs.map(assertLiveImport).map(toJobsTableRow);
  if (!rows.length) return [];

  const { data, error } = await supabase
    .from("jobs")
    .upsert(rows, { onConflict: "source,external_id" })
    .select("id,source,external_id");

  if (error) throw error;
  return data ?? [];
}
