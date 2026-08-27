import test from "node:test";
import assert from "node:assert/strict";
import { validateUpload } from "../lib/uploads/file-validation";

function upload(name: string, type: string, bytes: number[]) {
  return new File([new Uint8Array(bytes)], name, { type });
}

test("accepts files whose extension, MIME and signature agree", async () => {
  const pdf = upload(
    "resume.pdf",
    "application/pdf",
    [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
  );
  const png = upload("proof.png", "image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal((await validateUpload(pdf, "resume")).valid, true);
  assert.equal((await validateUpload(png, "certificate")).valid, true);
});

test("rejects spoofed extensions and MIME types", async () => {
  const spoofedPdf = upload("resume.pdf", "application/pdf", [0x4d, 0x5a, 0x90]);
  const wrongMime = upload(
    "proof.png",
    "image/jpeg",
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  );
  assert.equal((await validateUpload(spoofedPdf, "resume")).valid, false);
  assert.equal((await validateUpload(wrongMime, "certificate")).valid, false);
});

test("recognizes DOCX as an Office ZIP package, not an arbitrary ZIP", async () => {
  const encoder = new TextEncoder();
  const valid = new File(
    [
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      encoder.encode("[Content_Types].xml word/document.xml"),
    ],
    "resume.docx",
    { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  );
  const zip = upload(
    "resume.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    [0x50, 0x4b, 0x03, 0x04],
  );
  assert.equal((await validateUpload(valid, "resume")).valid, true);
  assert.equal((await validateUpload(zip, "resume")).valid, false);
});
