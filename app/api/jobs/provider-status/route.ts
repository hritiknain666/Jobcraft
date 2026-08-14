import { NextResponse } from "next/server";
import { getAdzunaConfig } from "@/lib/job-sources/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    adzuna: {
      configured: Boolean(getAdzunaConfig()),
      importsEnabled: Boolean(
        getAdzunaConfig() &&
        process.env.JOB_IMPORT_SECRET?.trim() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
