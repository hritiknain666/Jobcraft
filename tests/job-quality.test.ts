import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLocationSearch } from "../lib/job-sources/location-search";
import { safeExternalUrl } from "../lib/job-sources/safe-external-url";

test("normalizes common Indian city aliases", () => {
  assert.equal(normalizeLocationSearch("Bangalore"), "Bengaluru");
  assert.equal(normalizeLocationSearch("Bengaluru, India"), "Bengaluru");
  assert.equal(normalizeLocationSearch("Gurgaon"), "Gurugram");
  assert.equal(normalizeLocationSearch("New Delhi"), "Delhi NCR");
  assert.equal(normalizeLocationSearch("work from home"), "Remote");
});

test("preserves unknown location searches", () => {
  assert.equal(normalizeLocationSearch("Thiruvananthapuram"), "Thiruvananthapuram");
  assert.equal(normalizeLocationSearch(""), "");
});

test("accepts public http and https application URLs", () => {
  assert.equal(
    safeExternalUrl("https://jobs.example.com/role")?.startsWith("https://jobs.example.com/role"),
    true,
  );
  assert.equal(
    safeExternalUrl("http://example.com/apply")?.startsWith("http://example.com/apply"),
    true,
  );
});

test("rejects unsafe application URLs", () => {
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl("http://localhost/apply"), null);
  assert.equal(safeExternalUrl("http://127.0.0.1/apply"), null);
  assert.equal(safeExternalUrl("http://10.0.0.5/apply"), null);
  assert.equal(safeExternalUrl("http://172.20.0.1/apply"), null);
  assert.equal(safeExternalUrl("http://192.168.1.5/apply"), null);
});
