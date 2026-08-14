import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPagePrefixes = [
  "/jobs",
  "/applications",
  "/profile",
  "/resume",
  "/resumes",
  "/certificates",
  "/cover-letter",
  "/career-assistant",
];

function isProtectedPage(pathname: string) {
  return protectedPagePrefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

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

  // Refresh and verify the cookie-backed session before Server Components use it.
  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims?.sub);

  if (!authenticated && isProtectedPage(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.pathname = "/dashboard";
    loginUrl.search = "";
    loginUrl.searchParams.set("auth", "login");
    loginUrl.searchParams.set("next", nextPath);

    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
