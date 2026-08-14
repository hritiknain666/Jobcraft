# JobCraft Production Launch Checklist

This file tracks only the remaining production-launch items that require external credentials, account configuration, provider approval, or final legal/business details. Code-side launch hardening completed on 14 August 2026 is recorded separately below.

## 1. Live job provider

- [ ] Create/confirm Adzuna developer account
- [ ] Obtain `ADZUNA_APP_ID`
- [ ] Obtain `ADZUNA_APP_KEY`
- [ ] Add both as server-only deployment secrets
- [ ] Use the protected import endpoint with `"preview": true` and verify real India provider fields without writing jobs
- [ ] Add/confirm the official required "Jobs by Adzuna" attribution/logo treatment for every displayed Adzuna advert
- [ ] Confirm the intended JobCraft use is permitted under Adzuna's current API/commercial terms and whether an ongoing licence is required after any trial period
- [ ] Only after those checks, set server-only `ADZUNA_PUBLISHING_READY=true`
- [ ] Run a controlled first persisted import and verify source labels, external links and job details
- [ ] Re-enable the scheduled GitHub refresh only after the controlled import passes

## 2. Server-only import security

- [ ] Obtain Supabase `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Generate a long random `JOB_IMPORT_SECRET`
- [ ] Store `SUPABASE_SERVICE_ROLE_KEY` in the production deployment environment only
- [ ] Store `JOB_IMPORT_SECRET` in the production deployment environment
- [ ] Store the same `JOB_IMPORT_SECRET` in GitHub Actions
- [ ] Confirm `/api/jobs/import` rejects missing/invalid authorization on the deployed production origin

## 3. Production domain and HTTPS

- [ ] Choose/buy the final JobCraft domain
- [ ] Attach the domain to the Cloudflare Worker/custom domain route
- [ ] Confirm the site opens with `https://` and a valid certificate
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin
- [ ] Set GitHub Actions `JOBCRAFT_SITE_URL` to the same origin
- [ ] Confirm `/api/health`, `/robots.txt`, and `/sitemap.xml` work on the production domain

Cloudflare handles normal public HTTPS traffic on port 443 once the custom domain is configured.

## 4. Supabase Auth production configuration

- [ ] Add the production site origin to Supabase Auth URL configuration
- [ ] Allow the production `/auth/callback` redirect URL
- [x] Signup → email confirmation → login flow observed successfully on the Worker during production testing
- [x] Authenticated session refresh and logout observed successfully on the Worker
- [ ] Test forgot-password email and password update end-to-end on the final production domain
- [ ] Enable Supabase leaked-password protection if/when the selected Supabase plan supports it
- [ ] Confirm production email delivery/rate capacity is appropriate before broad public launch

## 5. Legal and support details

- [ ] Provide the responsible business/legal name
- [ ] Provide official support/privacy contact email
- [ ] Replace the pre-launch notice in `/privacy` with final reviewed policy text
- [ ] Replace the pre-launch notice in `/terms` with final reviewed terms
- [ ] Add governing-law/jurisdiction and required India-specific disclosures after legal review

## 6. Final pre-launch test

- [x] GitHub Actions regression tests, Next.js build and Cloudflare/OpenNext build are green on the release candidate
- [ ] Merge the verified release candidate to `main` and confirm the same build is green on `main`
- [ ] Homepage/mobile navigation smoke test on the final domain
- [ ] Auth + password reset smoke test on the final domain
- [ ] Profile and certificate ownership smoke test on the final domain
- [ ] Jobs search/filter smoke test for title, location, skill, mode, salary and experience using real provider data
- [ ] Smart match consistency test on Jobs list and Job Details using real provider data
- [x] Sample jobs remain explicitly labeled as sample roles in code
- [ ] Confirm imported provider jobs show source/live labels, required provider attribution and valid external application links
- [x] Duplicate live imports are guarded by `(source, external_id)` and import-batch duplicate validation
- [x] Search/facets hide jobs older than the 45-day freshness window
- [ ] Confirm Privacy and Terms links and final text on the final domain

## Code-side hardening completed 14 August 2026

- [x] Provider work mode and minimum experience can be `NULL` instead of being invented as `On-site` / `0`
- [x] Production Supabase migration `20260814094835_allow_unknown_job_metadata` applied and verified
- [x] Bootstrap schema synced to the production metadata model
- [x] Match scoring uses only known signals and exposes evidence coverage/confidence
- [x] Skill search can fall back to provider title/description text when no structured skill array is supplied
- [x] Job result pagination added with a 24-job page size
- [x] 45-day freshness filter added to job results and dynamic facets
- [x] Profile experience/work-mode inputs hardened server-side
- [x] Core normalization/matching regression tests added using Node's built-in test runner
- [x] CI now runs production dependency audit + regression tests + Next.js build + OpenNext build
- [x] Refresh workflow changed to manual-only until provider credentials/publication checks are ready, preventing false-green scheduled imports
- [x] Next.js `proxy.ts` migration was tested and intentionally reverted because the current OpenNext Cloudflare build rejects it; keep `middleware.ts` until the adapter path is compatible

## Launch rule

Do not present provider vacancies as live until the provider credentials are configured, a protected preview has been manually verified, required attribution/commercial-use requirements are satisfied, and `ADZUNA_PUBLISHING_READY=true` has been deliberately set. Do not expose service-role keys, provider keys, or import secrets to browser code or GitHub source files.
