import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

async function sha256(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function checkUrl(url: string) {
  const headers = {
    "User-Agent": "JobCraft/1.0 vacancy link health check",
    Accept: "text/html,application/xhtml+xml,*/*",
  };

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers,
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { ...headers, Range: "bytes=0-0" },
        signal: AbortSignal.timeout(8_000),
      });
    }

    if (response.status === 404 || response.status === 410) return "dead" as const;
    if (response.status >= 200 && response.status < 400) return "ok" as const;
    return "unknown" as const;
  } catch {
    return "unknown" as const;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const url = Deno.env.get("SUPABASE_URL");
  const secretMap = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let adminKey = legacy;
  if (secretMap) {
    try { adminKey = JSON.parse(secretMap)?.default ?? legacy; } catch { adminKey = legacy; }
  }
  if (!url || !adminKey) return Response.json({ error: "Server configuration unavailable" }, { status: 500 });

  const supabase = createClient(url, adminKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const supplied = req.headers.get("x-jobcraft-cron-secret") ?? "";
  const { data: authRow, error: authError } = await supabase
    .from("job_refresh_auth")
    .select("secret_sha256")
    .eq("id", true)
    .single();

  if (authError || !authRow || !supplied || !constantEqual(await sha256(supplied), String(authRow.secret_sha256))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: run, error: runError } = await supabase
    .from("job_refresh_runs")
    .insert({ status: "running" })
    .select("id")
    .single();
  if (runError || !run?.id) return Response.json({ error: "Could not create audit record" }, { status: 500 });

  try {
    const recheckBefore = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id,apply_url")
      .eq("is_active", true)
      .is("duplicate_of", null)
      .not("apply_url", "is", null)
      .or(`apply_url_checked_at.is.null,apply_url_checked_at.lt.${recheckBefore}`)
      .order("apply_url_checked_at", { ascending: true, nullsFirst: true })
      .limit(12);
    if (error) throw error;

    const checkedAt = new Date().toISOString();
    const results = await Promise.all((jobs ?? []).map(async (job) => ({
      id: job.id,
      status: await checkUrl(String(job.apply_url)),
    })));

    let ok = 0;
    let dead = 0;
    let unknown = 0;
    for (const result of results) {
      if (result.status === "ok") ok += 1;
      else if (result.status === "dead") dead += 1;
      else unknown += 1;

      const { error: updateError } = await supabase
        .from("jobs")
        .update({
          apply_url_status: result.status,
          apply_url_checked_at: checkedAt,
          ...(result.status === "dead" ? { is_active: false } : {}),
        })
        .eq("id", result.id);
      if (updateError) throw updateError;
    }

    const summary = { LinkCheck: { checked: results.length, ok, dead, unknown } };
    const { error: auditError } = await supabase
      .from("job_refresh_runs")
      .update({ status: "success", finished_at: checkedAt, summary })
      .eq("id", run.id);
    if (auditError) throw auditError;

    await supabase.rpc("jobcraft_run_feed_maintenance");
    return Response.json({ ok: true, ...summary.LinkCheck });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown link check error";
    await supabase
      .from("job_refresh_runs")
      .update({ status: "failed", finished_at: new Date().toISOString(), error: message })
      .eq("id", run.id);
    return Response.json({ error: message }, { status: 500 });
  }
});
