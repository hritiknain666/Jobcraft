import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_job_source_health");

  if (error) {
    return NextResponse.json(
      { status: "unavailable", sources: [], checkedAt: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const sources = data ?? [];
  const hasError = sources.some((source: { status?: string }) => source.status === "error");
  const hasDegraded = sources.some((source: { status?: string }) => source.status === "degraded");

  return NextResponse.json({
    status: hasError ? "degraded" : hasDegraded ? "degraded" : "healthy",
    sources,
    checkedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store" } });
}
