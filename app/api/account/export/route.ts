import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const [profile, resumes, applications, coverLetters, tailoredResumes, certificates] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("resumes")
        .select("id,name,is_primary,parsed_text,skills,structured_data,created_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("applications")
        .select("id,job_id,status,notes,applied_at,created_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("cover_letters")
        .select("id,job_id,title,body,created_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("tailored_resumes")
        .select("id,source_resume_id,job_id,title,content,created_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("certificates")
        .select(
          "id,name,issuer,issue_date,expiry_date,credential_id,credential_url,created_at,updated_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

  const failed = [profile, resumes, applications, coverLetters, tailoredResumes, certificates].find(
    (result) => result.error,
  );
  if (failed?.error) {
    console.error("Account export failed", failed.error);
    return NextResponse.json({ error: "Could not prepare your data export." }, { status: 500 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
    },
    profile: profile.data,
    resumes: resumes.data ?? [],
    applications: applications.data ?? [],
    coverLetters: coverLetters.data ?? [],
    tailoredResumes: tailoredResumes.data ?? [],
    certificates: certificates.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="jobcraft-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
