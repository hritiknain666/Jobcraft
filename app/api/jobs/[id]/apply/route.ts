import { NextRequest, NextResponse } from "next/server";
import { safeExternalUrl } from "@/lib/job-sources/safe-external-url";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("apply_url,is_active,duplicate_of,source")
    .eq("id", id)
    .eq("is_active", true)
    .is("duplicate_of", null)
    .neq("source", "JobCraft")
    .maybeSingle();

  const target = safeExternalUrl(job?.apply_url);
  if (!target) {
    return NextResponse.redirect(new URL(`/jobs/${id}?apply=unavailable`, request.url), 302);
  }

  const response = NextResponse.redirect(target, 302);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
