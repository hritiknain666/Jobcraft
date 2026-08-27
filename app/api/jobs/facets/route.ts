import { NextResponse } from "next/server";
import { getJobFacets } from "@/lib/job-sources/facets";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const facets = await getJobFacets(supabase);
    return NextResponse.json(facets, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Could not load job filters." }, { status: 500 });
  }
}
