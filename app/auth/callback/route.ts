import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SAFE_NEXT_PATHS = new Set(["/auth/update-password"]);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/auth/update-password";
  const next = SAFE_NEXT_PATHS.has(requestedNext) ? requestedNext : "/auth/update-password";

  if (!code) {
    const response = NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent("The recovery link is invalid or incomplete. Please request a new one.")}`,
        requestUrl.origin,
      ),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const response = NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent("The recovery link has expired or was already used. Please request a new one.")}`,
        requestUrl.origin,
      ),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
