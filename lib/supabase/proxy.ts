import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPreviewRewrites: Record<string, string> = {
  "/resume/builder": "/preview/resume-builder",
  "/resume/tailor": "/preview/resume-tailor",
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
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
    const rewritten = NextResponse.rewrite(previewUrl);
    response.cookies.getAll().forEach((cookie) => rewritten.cookies.set(cookie));
    return rewritten;
  }

  return response;
}
