import { NextResponse } from "next/server";
import { logMonitoringEvent } from "@/lib/monitoring";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const AI_SPIKE_USER_THRESHOLD = 5;

type OperationalHealth = {
  unhealthy_sources: string[] | null;
  refresh_status: "ok" | "stale" | "failed" | "missing";
  refresh_triggered_at: string | null;
  refresh_finished_at: string | null;
  ai_users_at_limit: number;
};

export async function GET() {
  const checkedAt = new Date();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_jobcraft_operational_health");
    if (error) throw error;

    const health = (data?.[0] ?? null) as OperationalHealth | null;
    if (!health) throw new Error("Operational health RPC returned no result.");

    const unhealthySources = health.unhealthy_sources ?? [];
    const refreshFailed = health.refresh_status === "failed" || health.refresh_status === "missing";
    const refreshStale = health.refresh_status === "stale";
    const aiUsersAtLimit = Number(health.ai_users_at_limit ?? 0);
    const aiSpike = aiUsersAtLimit >= AI_SPIKE_USER_THRESHOLD;
    const status = unhealthySources.length || refreshStale || refreshFailed || aiSpike ? "degraded" : "ok";

    if (status !== "ok") {
      logMonitoringEvent("warn", "operational_health_degraded", {
        unhealthySources,
        refreshStatus: health.refresh_status,
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
            status: health.refresh_status,
            lastRunAt: health.refresh_triggered_at,
            lastCompletedAt: health.refresh_finished_at,
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
