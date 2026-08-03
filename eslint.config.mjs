import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-off research script from a past data-expansion pass — not wired
    // into build:data, CI, or the app itself (confirmed via package.json
    // and git log). Its untyped Wikidata API responses aren't worth typing
    // properly for a tool that's already served its purpose and isn't run
    // again as part of anything live.
    "scripts/fetch-wikidata-influences.ts",
  ]),
]);

export default eslintConfig;
