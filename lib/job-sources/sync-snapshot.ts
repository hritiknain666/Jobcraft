import type { SupabaseClient } from "@supabase/supabase-js";
import { toJobsTableRow } from "./normalize";
import type { NormalizedJob } from "./types";
import { validateLiveImportBatch } from "./validate";

export async function syncLiveJobSnapshot(
  supabase: SupabaseClient,
  source: string,
  jobs: NormalizedJob[],
  options: { externalIdPrefix?: string } = {},
) {
  const validated = validateLiveImportBatch(jobs);
  const rows = validated.map(toJobsTableRow);

  if (rows.length) {
    const { error } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "source,external_id" });
    if (error) throw error;
  }

  let existingQuery = supabase
    .from("jobs")
    .select("id,external_id")
    .eq("source", source)
    .eq("is_active", true);

  if (options.externalIdPrefix) {
    existingQuery = existingQuery.like("external_id", `${options.externalIdPrefix}%`);
  }

  const { data: existing, error: existingError } = await existingQuery;
  if (existingError) throw existingError;

  const incomingIds = new Set(validated.map((job) => job.externalId));
  const staleIds = (existing ?? [])
    .filter((job) => !incomingIds.has(job.external_id))
    .map((job) => job.id);

  for (let index = 0; index < staleIds.length; index += 200) {
    const batch = staleIds.slice(index, index + 200);
    const { error } = await supabase.from("jobs").update({ is_active: false }).in("id", batch);
    if (error) throw error;
  }

  return { upserted: rows.length, deactivated: staleIds.length };
}
