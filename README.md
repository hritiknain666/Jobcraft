# JobCraft

JobCraft is an India-first career platform for job discovery, transparent job matching, resumes, application tracking, certificates, and career assistance. Model-backed AI generation is a planned product layer and should not be presented as active until it is actually integrated and tested.

## Current product state

Implemented and build-verified:

- Supabase authentication, profiles and SSR session refresh
- Password recovery flow
- Jobs search and filtering
- Database-backed pagination for job results
- 45-day freshness policy so stale listings stop appearing in search/facets
- Skill filtering that can fall back to title/description text when a provider has no structured skill array
- Shared transparent job-match scoring across the app
- Match evidence coverage/confidence so sparse provider data cannot look artificially precise
- Smart skill aliases (for example Power BI/PowerBI, React/React.js, PostgreSQL/Postgres)
- Resume and career-product surfaces
- Application tracking
- Certificate support, private storage and ownership controls
- Loading, error, empty and mobile navigation states
- Job-source normalization architecture
- Unknown provider work mode/experience preserved as unknown instead of invented defaults
- Explicit sample-vs-live job labeling
- Secure server-side job import endpoint with protected preview mode
- Adzuna provider adapter, publishing gate and import orchestration
- Atomic upsert using `(source, external_id)`
- Dynamic job facets for titles, locations, skills and work modes
- Security headers, health endpoint, sitemap and robots metadata
- Privacy Policy and Terms launch-draft pages
- GitHub Actions production-dependency audit, regression tests, Next.js build and Cloudflare/OpenNext build

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)
- Cloudflare Workers / OpenNext deployment target
- GitHub Actions CI

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

## Environment variables

See `.env.example` for required variables. Server-only secrets must never use the `NEXT_PUBLIC_` prefix.

## Live job imports

Persistent live imports are intentionally disabled until production credentials, provider publication requirements and attribution checks are complete. Current sample roles remain clearly separated from future provider listings.

Required server-side configuration for Adzuna access/publishing:

- `SUPABASE_SERVICE_ROLE_KEY`
- `JOB_IMPORT_SECRET`
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `ADZUNA_PUBLISHING_READY` (keep `false` until publication requirements are complete)
- `NEXT_PUBLIC_SITE_URL`

The protected import endpoint supports previewing normalized provider data before any row is persisted. The GitHub refresh workflow is deliberately `workflow_dispatch`-only until a controlled production preview/import is approved; re-enable a schedule only after that verification.

## Cloudflare / Next.js compatibility note

Next.js 16 deprecates the `middleware.ts` filename in favor of `proxy.ts`, but the currently pinned `@opennextjs/cloudflare` deployment path rejects the `proxy.ts` output as unsupported Node.js middleware. JobCraft therefore intentionally retains the working `middleware.ts` entrypoint for Cloudflare compatibility. CI verifies the OpenNext build, and this exception should be revisited when the adapter supports the Next.js proxy path without breaking deployment.

## Launch status

The application code is in launch-preparation state. The remaining blockers are primarily external account/business configuration: live job-provider credentials and publication requirements, deployment/GitHub secrets, a final production domain, Supabase auth hardening that depends on plan/settings, and final legal/business identity details.

See `LAUNCH_CHECKLIST.md` for the remaining production-launch steps.
