import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobSourceAdapter } from "./adapters";
import { upsertLiveJobs } from "./upsert";

export async function importProviderPayload<T>(
  supabase: SupabaseClient,
  adapter: JobSourceAdapter<T>,
  payload: T,
) {
  const jobs = adapter(payload);
  const upserted = await upsertLiveJobs(supabase, jobs);

  return {
    normalizedCount: jobs.length,
    upsertedCount: upserted.length,
    upserted,
  };
}
