# JobCraft Production Launch Checklist

This checklist now tracks only work that is still external, account-dependent, or intentionally deferred. The core non-AI MVP and no-key free live-job pipeline are already running on the Cloudflare Workers HTTPS origin.

## 1. Free live-job sources

Completed:

- [x] Daily Supabase Cron refresh installed
- [x] Supabase Edge Function deployed for free-source ingestion
- [x] Jobicy live import verified
- [x] Remotive live import verified
- [x] Himalayas live import verified
- [x] Remote OK live import verified
- [x] Arbeitnow connector enabled with India-location filtering
- [x] `(source, external_id)` deduplication enforced
- [x] External application URLs retained
- [x] Stale external roles older than the freshness window are removed from active search
- [x] Internal refresh authorization/audit tables have RLS enabled with no browser/client access
- [x] Provider attribution is visible on supported external listings

Optional free-account sources still requiring user-created keys:

- [ ] Create IndianAPI account/key and store as `INDIANAPI_JOBS_API_KEY` in Supabase Edge Function secrets
- [ ] Create Jooble API key and store as `JOOBLE_API_KEY`
- [ ] Create TheirStack free API key and store as `THEIRSTACK_API_KEY`
- [ ] Trigger/observe the next refresh and verify each newly enabled provider before relying on it

## 2. Adzuna (optional additional provider)

- [ ] Create/confirm Adzuna developer account
- [ ] Obtain `ADZUNA_APP_ID`
- [ ] Obtain `ADZUNA_APP_KEY`
- [ ] Preview real India data through the protected provider import path before persistence
- [x] Adzuna attribution support exists in the UI
- [ ] Confirm JobCraft's intended use is permitted under Adzuna's current commercial/publisher terms
- [ ] Only after provider approval/requirements are satisfied, deliberately enable persisted publishing
- [ ] Run a controlled first persisted Adzuna import and verify source labels, attribution and apply links

Adzuna is not required for the current free-source MVP.

## 3. Production domain and HTTPS — intentionally deferred

Current development/public testing continues on the existing Cloudflare Workers HTTPS origin.

Later, when a custom domain is purchased:

- [ ] Choose/buy the final JobCraft domain
- [ ] Attach it to the Cloudflare Worker/custom-domain route
- [ ] Confirm HTTPS certificate/port 443 behavior
- [ ] Update `NEXT_PUBLIC_SITE_URL`
- [ ] Update Supabase Auth site/redirect configuration
- [ ] Re-test `/api/health`, `/robots.txt`, `/sitemap.xml`, auth callback and password reset on the final domain

## 4. Supabase Auth production configuration

Already verified on the Workers origin:

- [x] Signup → email confirmation → login
- [x] Authenticated session refresh
- [x] Logout

Remaining external/plan-dependent items:

- [ ] Re-test forgot-password email and password update before a broad public launch
- [ ] Confirm production email delivery/rate capacity is appropriate for expected traffic
- [ ] Enable Supabase leaked-password protection if/when the selected Supabase plan supports it

Supabase's current security advisor reports only the leaked-password-protection warning; no new RLS exposure was introduced by the refresh infrastructure.

## 5. Legal and support details

Requires user/business decisions and final legal review:

- [ ] Provide responsible business/legal/operator name
- [ ] Provide official support/privacy contact email
- [ ] Replace pre-launch wording in `/privacy` with final reviewed policy text
- [ ] Replace pre-launch wording in `/terms` with final reviewed terms
- [ ] Add final governing-law/jurisdiction and India-specific disclosures after legal review

## 6. Final pre-launch verification

Completed/currently automated:

- [x] Production dependency audit
- [x] Core regression tests
- [x] Next.js production build
- [x] Cloudflare/OpenNext production build
- [x] Automatic deployment of a verified green `main` build to Cloudflare Workers
- [x] Sample jobs explicitly labeled as samples
- [x] Live-job provider/source labels and application links
- [x] Database duplicate check for provider identities
- [x] No active external job is missing an application URL in the current dataset
- [x] No active external job is older than the freshness window in the current dataset

Still worth repeating immediately before broad public promotion:

- [ ] Mobile navigation smoke test across major routes
- [ ] Auth/password-reset smoke test
- [ ] Profile/resume/certificate ownership smoke test
- [ ] Jobs filters: title, location, skill, work mode, salary and experience
- [ ] Match consistency between Jobs list and Job Details
- [ ] Privacy/Terms final-text check

## Launch rule

Never expose service-role keys, provider keys, refresh secrets or other server credentials to browser code or GitHub source files. New providers must keep their source attribution and external application link, and any provider-specific commercial/publisher requirements must be satisfied before their listings are presented as live.
