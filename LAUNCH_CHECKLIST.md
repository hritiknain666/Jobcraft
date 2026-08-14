# JobCraft Production Launch Checklist

This file tracks only the remaining production-launch items that require external credentials, account configuration, provider approval, or final legal/business details.

## 1. Live job provider

- [ ] Create/confirm Adzuna developer account
- [ ] Obtain `ADZUNA_APP_ID`
- [ ] Obtain `ADZUNA_APP_KEY`
- [ ] Add both as server-only deployment secrets
- [ ] Use the protected import endpoint with `"preview": true` and verify real India provider fields without writing jobs
- [ ] Add the official required "Jobs by Adzuna" attribution/logo treatment to every displayed Adzuna advert before publishing
- [ ] Confirm the intended JobCraft use is permitted under Adzuna's current API/commercial terms and whether an ongoing licence is required after any trial period
- [ ] Only after those checks, set server-only `ADZUNA_PUBLISHING_READY=true`
- [ ] Run a controlled first persisted import and verify source labels, external links and job details before enabling scheduled refreshes

## 2. Server-only import security

- [ ] Obtain Supabase `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Generate a long random `JOB_IMPORT_SECRET`
- [ ] Store `SUPABASE_SERVICE_ROLE_KEY` in the production deployment environment only
- [ ] Store `JOB_IMPORT_SECRET` in the production deployment environment
- [ ] Store the same `JOB_IMPORT_SECRET` in GitHub Actions for the scheduled importer
- [ ] Confirm `/api/jobs/import` rejects missing/invalid authorization

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
- [ ] Test signup email confirmation end-to-end
- [ ] Test login from homepage and protected routes
- [ ] Test forgot-password email and password update end-to-end
- [ ] Enable Supabase leaked-password protection

## 5. Legal and support details

- [ ] Provide the responsible business/legal name
- [ ] Provide official support/privacy contact email
- [ ] Replace the pre-launch notice in `/privacy` with final reviewed policy text
- [ ] Replace the pre-launch notice in `/terms` with final reviewed terms
- [ ] Add governing-law/jurisdiction and any required India-specific disclosures after legal review

## 6. Final pre-launch test

- [ ] GitHub Actions Next.js and Cloudflare OpenNext builds are green on `main`
- [ ] Homepage/mobile navigation smoke test
- [ ] Auth + password reset smoke test
- [ ] Profile and certificate ownership test
- [ ] Jobs search/filter test for title, location, skill, mode, salary and experience
- [ ] Smart match score consistency test on Jobs list and Job Details
- [ ] Confirm sample jobs show sample labels
- [ ] Confirm imported provider jobs show source/live labels, required provider attribution and valid external application links
- [ ] Confirm duplicate imports do not create duplicate rows
- [ ] Confirm inactive/stale job handling strategy before broad public launch
- [ ] Confirm Privacy and Terms links are visible

## Launch rule

Do not present provider vacancies as live until the provider credentials are configured, a protected preview has been manually verified, required attribution/commercial-use requirements are satisfied, and `ADZUNA_PUBLISHING_READY=true` has been deliberately set. Do not expose service-role keys, provider keys, or import secrets to browser code or GitHub source files.
