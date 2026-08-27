import { NextResponse } from "next/server";
import { logMonitoringEvent } from "@/lib/monitoring";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const REFRESH_STALE_AFTER_MS = 30 * 60 * 60 * 1_000;
const REFRESH_STUCK_AFTER_MS = 15 * 60 * 1_000;
const AI_SPIKE_WINDOW_MS = 15 * 60 * 1_000;
const AI_SPIKE_USER_THRESHOLD = 5;

type SourceHealth = {
  source_key: string;
  status: string;
};

export async function GET() {
  const checkedAt = new Date();

  try {
    const admin = createAdminClient();
    const aiWindowStart = new Date(checkedAt.getTime() - AI_SPIKE_WINDOW_MS).toISOString();
    const [{ data: sources, error: sourceError }, { data: refresh, error: refreshError }, aiResult] =
      await Promise.all([
        admin.from("job_source_health").select("source_key,status").eq("enabled", true),
        admin
          .from("job_refresh_runs")
          .select("status,triggered_at,finished_at")
          .order("triggered_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin
          .from("ai_rate_limits")
          .select("user_id", { count: "exact", head: true })
          .gte("request_count", 10)
          .gte("updated_at", aiWindowStart),
      ]);

    if (sourceError || refreshError || aiResult.error) {
      throw sourceError ?? refreshError ?? aiResult.error;
    }

    const unhealthySources = ((sources ?? []) as SourceHealth[])
      .filter((source) => source.status === "degraded" || source.status === "error")
      .map((source) => source.source_key);
    const refreshAgeMs = refresh?.triggered_at
      ? checkedAt.getTime() - new Date(refresh.triggered_at).getTime()
      : Number.POSITIVE_INFINITY;
    const refreshStale = !Number.isFinite(refreshAgeMs) || refreshAgeMs > REFRESH_STALE_AFTER_MS;
    const refreshFailed =
      !refresh ||
      refresh.status === "failed" ||
      (refresh.status === "running" && refreshAgeMs > REFRESH_STUCK_AFTER_MS);
    const aiUsersAtLimit = aiResult.count ?? 0;
    const aiSpike = aiUsersAtLimit >= AI_SPIKE_USER_THRESHOLD;
    const status = unhealthySources.length || refreshStale || refreshFailed || aiSpike ? "degraded" : "ok";

    if (status !== "ok") {
      logMonitoringEvent("warn", "operational_health_degraded", {
        unhealthySources,
        refreshStatus: refresh?.status ?? "missing",
        refreshStale,
        aiUsersAtLimit,
      });
    }

    return NextResponse.json(
      {
        status,
        service: "jobcraft",
        checks: {
          database: "ok",
          providers: {
            status: unhealthySources.length ? "degraded" : "ok",
            unhealthySources,
          },
          refresh: {
            status: refreshFailed ? "failed" : refreshStale ? "stale" : "ok",
            lastRunAt: refresh?.triggered_at ?? null,
            lastCompletedAt: refresh?.finished_at ?? null,
          },
          aiRateLimits: {
            status: aiSpike ? "spike" : "ok",
            usersAtLimit15m: aiUsersAtLimit,
            alertThreshold: AI_SPIKE_USER_THRESHOLD,
          },
        },
        timestamp: checkedAt.toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logMonitoringEvent("error", "operational_health_unavailable", {
      error: error instanceof Error ? error.message : "Unknown monitoring error",
    });
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "jobcraft",
        checks: { database: "unavailable" },
        timestamp: checkedAt.toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
