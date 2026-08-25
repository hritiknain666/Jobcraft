import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPreviewRewrites: Record<string, string> = {
  "/resume/builder": "/preview/resume-builder",
  "/resume/tailor": "/preview/resume-tailor",
};

export function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function updateSession(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const secure = (nextResponse: NextResponse) => {
    nextResponse.headers.set("Content-Security-Policy", csp);
    return nextResponse;
  };

  let response = secure(NextResponse.next({ request: { headers: requestHeaders } }));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = secure(NextResponse.next({ request: { headers: requestHeaders } }));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  // Refresh and verify the cookie-backed session for Server Components.
  // Product browsing is public. Personal actions remain protected by their
  // server actions/RLS. Two deep tools still require a personal workspace to
  // render, so signed-out visitors see an internal preview at the same URL.
  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims?.sub);
  const previewPath = publicPreviewRewrites[request.nextUrl.pathname];

  if (!authenticated && previewPath) {
    const previewUrl = request.nextUrl.clone();
    previewUrl.pathname = previewPath;
    const rewritten = secure(NextResponse.rewrite(previewUrl, { request: { headers: requestHeaders } }));
    response.cookies.getAll().forEach((cookie) => rewritten.cookies.set(cookie));
    return rewritten;
  }

  return response;
}
