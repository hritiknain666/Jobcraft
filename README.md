# JobCraft

JobCraft is an India-first career platform for job discovery, transparent job matching, resumes, application tracking, certificates, and career assistance. Model-backed AI generation is a planned product layer and should not be presented as active until it is actually integrated and tested.

## Current product state

Implemented and production-verified:

- Supabase authentication, profiles and SSR session refresh
- Password recovery flow
- Browse-first product experience; login is required only for personal/save actions
- Jobs search and filtering with database-backed pagination
- Provider-aware freshness: aggregator listings older than 45 days are deactivated, while Greenhouse/Lever jobs stay active only while present in successful employer snapshots
- Skill filtering that can fall back to title/description text when a provider has no structured skill array
- Shared transparent job-match scoring with evidence coverage/confidence
- Resume, tailoring, cover-letter, certificate and career-assistance surfaces
- Application tracking
- Private user storage and ownership controls
- Loading, error, empty and mobile navigation states
- Normalized multi-provider job-source architecture
- Unknown provider work mode/experience preserved as unknown instead of invented defaults
- Explicit sample-vs-live job labeling and provider attribution
- Atomic live-job upsert using `(source, external_id)`
- Dynamic job facets for titles, locations, skills and work modes
- Security headers, health endpoint, sitemap and robots metadata
- Privacy Policy and Terms launch-draft pages
- GitHub Actions dependency audit, regression tests, Next.js build and Cloudflare/OpenNext build
- Automatic verified production deployment to Cloudflare Workers after a green `main` build

## Live jobs

The free no-key live-job pipeline is active in production through a Supabase Edge Function and Supabase Cron.

Currently enabled no-key sources:

- Jobicy
- Remotive
- Himalayas
- Remote OK
- Arbeitnow (India-location filter; may legitimately return zero India roles on a given refresh)

The refresh runs daily, normalizes provider data, keeps only India-eligible roles, deduplicates on `(source, external_id)`, marks old records inactive, preserves external application URLs, and writes an internal refresh audit record.

Additional free-account connectors are prepared and remain dormant until their server-side keys are configured:

- Jooble
- TheirStack

Adzuna remains separately gated. Its adapter and preview/import path exist, but persisted publishing must remain disabled until credentials, provider/commercial approval and required attribution are confirmed.

Production refresh implementation:

- `supabase/functions/refresh-free-jobs/index.ts`
- `supabase/migrations/20260815012000_add_free_job_refresh_infrastructure.sql`
- `supabase/migrations/20260815012600_lock_refresh_internal_tables.sql`
- `supabase/migrations/20260815012800_schedule_free_job_refresh.sql`

The Edge Function uses server-only Supabase credentials supplied by the Supabase runtime. No service-role key is committed to GitHub or exposed to the browser.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage, Edge Functions, Cron)
- Cloudflare Workers / OpenNext
- GitHub Actions CI/CD

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Run the core regression suite with:

```bash
npm test
```

For repository structure, readability rules, and the full local verification checklist, see [`docs/code-guide.md`](docs/code-guide.md).

## Environment variables

See `.env.example` for optional provider/deployment variables. Server-only secrets must never use the `NEXT_PUBLIC_` prefix.

The active no-key Supabase refresh does not require Cloudflare to hold the Supabase service-role key.

Free-account Edge Function secrets, when obtained, use these names:

```text
JOOBLE_API_KEY
THEIRSTACK_API_KEY
```

## Cloudflare / Next.js compatibility note

Next.js 16 deprecates the `middleware.ts` filename in favor of `proxy.ts`, but the currently pinned `@opennextjs/cloudflare` deployment path rejects the `proxy.ts` output as unsupported Node.js middleware. JobCraft therefore intentionally retains the working `middleware.ts` entrypoint for Cloudflare compatibility. CI verifies the OpenNext build; revisit this when the adapter supports the proxy path without breaking deployment.

## Launch status

The core non-AI MVP and free live-job pipeline are running on the existing Cloudflare Workers HTTPS origin. Buying a custom domain is intentionally deferred and is not required for current development/testing.

Remaining blockers are external decisions/accounts rather than core code: optional free provider keys, Adzuna approval/credentials if used, final business/legal identity and support/privacy contact details, final legal review, and later custom-domain configuration.

See `LAUNCH_CHECKLIST.md` for the remaining user-dependent launch items.
