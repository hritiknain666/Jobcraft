import type { Metadata } from "next";
import { Suspense } from "react";
import MobileAppNav from "@/components/mobile-app-nav";
import AuthModal from "@/components/auth-modal";
import AuthNavigationBridge from "@/components/auth-navigation-bridge";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jobcraft.hritiknain666-35e.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JobCraft | Career Platform for India",
    template: "%s | JobCraft",
  },
  description: "Find better-fit jobs, improve your resume, and manage your job search with career tools built for the Indian market.",
  applicationName: "JobCraft",
  keywords: ["jobs India", "job matching", "resume builder", "career assistant", "application tracker"],
  openGraph: {
    type: "website",
    siteName: "JobCraft",
    title: "JobCraft | Career Platform for India",
    description: "Find better-fit jobs, improve your resume, and manage your job search with career tools built for the Indian market.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "JobCraft | Career Platform for India",
    description: "Find better-fit jobs, improve your resume, and manage your job search with career tools built for the Indian market.",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <AuthNavigationBridge />
          <AuthModal authenticated={Boolean(user)} />
        </Suspense>
        <MobileAppNav authenticated={Boolean(user)} />
      </body>
    </html>
  );
}
