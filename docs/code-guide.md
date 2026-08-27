# JobCraft code guide

This guide explains how the repository is organised and how to change it without accidentally changing the website.

## Start here

- `app/` contains pages, API routes, and server actions.
- `components/` contains reusable visual components.
- `lib/` contains shared application logic and external-service adapters.
- `supabase/functions/` contains scheduled server-side jobs.
- `supabase/migrations/` is the permanent database change history. Never edit a migration after it has reached production.
- `tests/` contains fast regression and security-contract tests.

## Keep code easy to understand

1. Use names that describe the value or action. Prefer `unhealthySources` over abbreviations.
2. Keep external calls, validation, and database writes in separate steps.
3. Return early for errors and authorization failures.
4. Use explicit TypeScript types at service boundaries.
5. Keep JSX text, class names, element order, and form field names unchanged during readability-only work.
6. Never put service-role keys or provider secrets in browser code or `NEXT_PUBLIC_` variables.
7. Add a focused test whenever a security or behavior contract could regress.

## Common commands

```bash
npm run format
npm run format:check
npm run lint
npm test
npx tsc --noEmit
npm run build
npx opennextjs-cloudflare build
npx wrangler deploy --dry-run
```

Run every command above before deploying a repository-wide refactor.

## Safe change boundaries

A readability-only refactor may change formatting, variable names, comments, and helper boundaries. It must not change:

- rendered copy, colors, spacing, layout, or responsive behavior;
- URLs, redirects, HTTP methods, status codes, or JSON response shapes;
- authentication, authorization, RLS, CSP, or secret handling;
- database schema or stored data;
- provider selection, refresh schedules, or job filtering rules.

If one of those must change, treat it as a separate feature or remediation with its own test and deployment note.
