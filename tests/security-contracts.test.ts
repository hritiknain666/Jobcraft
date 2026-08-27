import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

test("maintenance RPC migration denies client roles and grants service role", () => {
  const sql = source("supabase/migrations/20260825005246_restrict_internal_maintenance_rpcs.sql");
  for (const name of [
    "jobcraft_dedupe_jobs",
    "jobcraft_run_feed_maintenance",
    "jobcraft_sync_refresh_health",
  ]) {
    assert.match(
      sql,
      new RegExp(
        `revoke execute on function public\\.${name}\\(\\) from public, anon, authenticated`,
        "i",
      ),
    );
    assert.match(
      sql,
      new RegExp(`grant execute on function public\\.${name}\\(\\) to service_role`, "i"),
    );
  }
});

test("application GET is read-only and saved-role mutation lives in POST", () => {
  const route = source("app/api/jobs/[id]/apply/route.ts");
  const getBody = route.slice(
    route.indexOf("export async function GET"),
    route.indexOf("export async function POST"),
  );
  const postBody = route.slice(route.indexOf("export async function POST"));
  assert.doesNotMatch(getBody, /applications|\.insert\(|\.update\(|\.delete\(/);
  assert.match(postBody, /from\("applications"\)/);
  assert.match(postBody, /\.insert\(/);
});

test("account deletion removes auth before storage and keeps a cleanup record", () => {
  const action = source("app/settings/actions.ts");
  assert.ok(
    action.indexOf('from("account_deletion_cleanup").upsert') <
      action.indexOf("admin.auth.admin.deleteUser"),
  );
  assert.ok(
    action.indexOf("admin.auth.admin.deleteUser") < action.lastIndexOf("removeStoredFiles"),
  );
  assert.match(action, /status: "failed"/);
});

test("AI rate limiting is atomic and service-role only", () => {
  const sql = source(
    "supabase/migrations/20260825005430_harden_account_deletion_and_ai_rate_limits.sql",
  );
  assert.match(sql, /for update/i);
  assert.match(
    sql,
    /revoke execute on function public\.consume_ai_rate_limit[\s\S]*public, anon, authenticated/i,
  );
  assert.match(sql, /grant execute on function public\.consume_ai_rate_limit[\s\S]*service_role/i);
});

test("CSP uses a per-request nonce and strict-dynamic", () => {
  const proxy = source("lib/supabase/proxy.ts");
  assert.match(proxy, /crypto\.randomUUID/);
  assert.match(proxy, /script-src 'nonce-\$\{nonce\}' 'strict-dynamic'/);
  assert.doesNotMatch(proxy, /script-src[^\n]*unsafe-inline/);
});

test("production monitoring checks health and provider degradation", () => {
  const workflow = source(".github/workflows/monitor-production.yml");
  const worker = source("wrangler.jsonc");
  const health = source("app/api/health/route.ts");
  const migration = source("supabase/migrations/20260827091848_add_operational_health_rpc.sql");
  const snapshotMigration = source(
    "supabase/migrations/20260827101806_add_operational_health_snapshot.sql",
  );
  const restrictionMigration = source(
    "supabase/migrations/20260827102100_restrict_operational_health_rpc.sql",
  );

  assert.match(workflow, /cron:\s*"\*\/15 \* \* \* \*"/i);
  assert.match(workflow, /\/api\/health/);
  assert.match(workflow, /\/api\/jobs\/provider-status/);
  assert.match(worker, /"observability"[\s\S]*"head_sampling_rate": 1/i);
  assert.match(health, /aiRateLimits[\s\S]*usersAtLimit15m/);
  assert.match(health, /jobcraft_operational_health_snapshot/);
  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = pg_catalog, public/i);
  assert.match(
    migration,
    /revoke all on function public\.get_jobcraft_operational_health\(\) from public/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.get_jobcraft_operational_health\(\) to anon, authenticated, service_role/i,
  );
  assert.match(migration, /job_source_health/);
  assert.match(migration, /job_refresh_runs/);
  assert.match(migration, /ai_rate_limits/);
  assert.match(snapshotMigration, /enable row level security/i);
  assert.match(snapshotMigration, /for select[\s\S]*to anon, authenticated/i);
  assert.match(snapshotMigration, /jobcraft_refresh_operational_health_snapshot/i);
  assert.match(restrictionMigration, /revoke execute[\s\S]*public, anon, authenticated/i);
});

test("IndianAPI is retired from every executable refresh path", () => {
  const edgeRefresh = source("supabase/functions/refresh-free-jobs/index.ts");
  const appRefresh = source("app/api/jobs/refresh/route.ts");
  const runner = source("lib/job-sources/provider-runner.ts");
  const config = source("lib/job-sources/config.ts");
  const migration = source("supabase/migrations/20260827092817_retire_indianapi_source.sql");

  for (const runtimeSource of [edgeRefresh, appRefresh, runner, config]) {
    assert.doesNotMatch(runtimeSource, /IndianAPI|indianapi|INDIANAPI/);
  }
  assert.match(migration, /set is_active = false[\s\S]*source = 'IndianAPI'/i);
  assert.match(migration, /enabled = false[\s\S]*status = 'disabled'/i);
});
