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

  // Opening an employer/provider page is not proof that an application was
  // submitted. For signed-in users we therefore add an untracked role to the
  // application plan as Saved, but never overwrite a more advanced status.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", id)
      .maybeSingle();

    if (!existing) {
      // Tracking should never block access to the real application page. RLS and
      // the unique (user_id, job_id) constraint remain the final safety guards.
      await supabase.from("applications").insert({
        user_id: user.id,
        job_id: id,
        status: "Saved",
      });
    }
  }

  const response = NextResponse.redirect(target, 302);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
