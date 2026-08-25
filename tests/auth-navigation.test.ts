import test from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "../lib/auth/navigation";

test("auth redirects accept only local absolute paths", () => {
  assert.equal(safeNextPath("/jobs/123?from=login"), "/jobs/123?from=login");
  assert.equal(safeNextPath("https://evil.example"), "/dashboard");
  assert.equal(safeNextPath("//evil.example"), "/dashboard");
  assert.equal(safeNextPath("/\\evil.example"), "/dashboard");
  assert.equal(safeNextPath(null), "/dashboard");
});
