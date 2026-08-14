# JobCraft

JobCraft is an India-first AI career platform for job discovery, job matching, resumes, application tracking, certificates, and career assistance.

## Current product state

Implemented and build-verified on `main`:

- Supabase authentication and profiles
- Password recovery flow
- Jobs search and filtering
- Shared job-match scoring across the app
- Smart skill aliases (for example Power BI/PowerBI, React/React.js, PostgreSQL/Postgres)
- Resume and career-product surfaces
- Application tracking
- Certificate support and ownership controls
- Loading, error, empty and mobile navigation states
- Job-source normalization architecture
- Explicit sample-vs-live job labeling
- Secure server-side job import endpoint
- Adzuna provider adapter and import orchestration
- Atomic upsert using `(source, external_id)`
- Dynamic job facets for titles, locations, skills and work modes
- Scheduled live-job refresh workflow scaffold
- Security headers, health endpoint, sitemap and robots metadata
- Privacy Policy and Terms launch-draft pages
- GitHub Actions build verification

## Tech stack

- Next.js
- React
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

The live import path is intentionally disabled until production credentials are configured. Current sample roles remain clearly separated from future provider listings.

Required server-side configuration for live Adzuna imports:

- `SUPABASE_SERVICE_ROLE_KEY`
- `JOB_IMPORT_SECRET`
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Launch status

The application code is in launch-preparation state. Remaining work is primarily external account configuration: production domain/HTTPS routing, provider credentials, deployment secrets, Supabase auth redirect/security settings, and final legal/business identity details.

See `LAUNCH_CHECKLIST.md` for the remaining production-launch steps.
