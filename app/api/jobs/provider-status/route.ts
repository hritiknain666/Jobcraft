import { NextResponse } from "next/server";
import { logMonitoringEvent } from "@/lib/monitoring";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_job_source_health");

  if (error) {
    logMonitoringEvent("error", "provider_status_unavailable", { error: error.message });
    return NextResponse.json(
      { status: "unavailable", sources: [], checkedAt: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const sources = data ?? [];
  const hasError = sources.some((source: { status?: string }) => source.status === "error");
  const hasDegraded = sources.some((source: { status?: string }) => source.status === "degraded");
  const unhealthySources = sources
    .filter((source: { status?: string }) => source.status === "error" || source.status === "degraded")
    .map((source: { source_key?: string }) => source.source_key ?? "unknown");

  if (hasError || hasDegraded) {
    logMonitoringEvent("warn", "provider_status_degraded", { unhealthySources });
  }

  return NextResponse.json({
    status: hasError ? "degraded" : hasDegraded ? "degraded" : "healthy",
    sources,
    checkedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store" } });
}
