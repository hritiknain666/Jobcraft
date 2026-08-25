export function safeNextPath(value: FormDataEntryValue | string | null) {
  const next = String(value ?? "").trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\") || /[\u0000-\u001f]/.test(next)) {
    return "/dashboard";
  }
  return next;
}
