function isPrivateIpv4(hostname: string) {
  if (/^(?:127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(hostname)) return true;
  const match = hostname.match(/^172\.(\d{1,3})\./);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

export function safeExternalUrl(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const hostname = url.hostname.toLowerCase();
    if (!hostname || hostname === "localhost" || hostname.endsWith(".local") || isPrivateIpv4(hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
