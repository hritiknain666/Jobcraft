# JobCraft

JobCraft is an India-first career platform for job discovery, transparent job matching, resumes, application tracking, certificates, and career assistance. Model-backed AI generation is a planned product layer and should not be presented as active until it is actually integrated and tested.

## Current product state

Implemented and build-verified on `main`:

- Supabase authentication, profiles and SSR session refresh
- Password recovery flow
- Jobs search and filtering
- Shared transparent job-match scoring across the app
- Smart skill aliases (for example Power BI/PowerBI, React/React.js, PostgreSQL/Postgres)
- Resume and career-product surfaces
- Application tracking
- Certificate support, private storage and ownership controls
- Loading, error, empty and mobile navigation states
- Job-source normalization architecture
- Explicit sample-vs-live job labeling
- Secure server-side job import endpoint with protected preview mode
- Adzuna provider adapter, publishing gate and import orchestration
- Atomic upsert using `(source, external_id)`
- Dynamic job facets for titles, locations, skills and work modes
- Scheduled live-job refresh workflow scaffold
- Security headers, health endpoint, sitemap and robots metadata
- Privacy Policy and Terms launch-draft pages
- GitHub Actions verification for Next.js and Cloudflare/OpenNext builds

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

## Environment variables

See `.env.example` for required variables. Server-only secrets must never use the `NEXT_PUBLIC_` prefix.

## Live job imports

The persistent live import path is intentionally disabled until production credentials, provider publication requirements and attribution checks are complete. Current sample roles remain clearly separated from future provider listings.

Required server-side configuration for Adzuna access/publishing:

- `SUPABASE_SERVICE_ROLE_KEY`
- `JOB_IMPORT_SECRET`
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `ADZUNA_PUBLISHING_READY` (keep `false` until publication requirements are complete)
- `NEXT_PUBLIC_SITE_URL`

The protected import endpoint supports previewing normalized provider data before any row is persisted.

## Launch status

The application code is in launch-preparation state. Remaining work is primarily external account configuration: production domain/HTTPS routing, provider credentials and publication requirements, deployment secrets, Supabase auth/security settings, and final legal/business identity details.

See `LAUNCH_CHECKLIST.md` for the remaining production-launch steps.
