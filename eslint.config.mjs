import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["app/**/page.tsx"],
    rules: { "react-hooks/purity": "off" },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".test-build/**",
    "node_modules/**",
    "cloudflare-env.d.ts",
    "supabase/functions/**",
  ]),
]);
