import type { Metadata } from "next";
import { Suspense } from "react";
import MobileAppNav from "@/components/mobile-app-nav";
import AuthModal from "@/components/auth-modal";
import AuthNavigationBridge from "@/components/auth-navigation-bridge";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import "./marketing-home.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jobcraft.hritiknain666-35e.workers.dev";
const IS_TEMPORARY_HOST = new URL(SITE_URL).hostname.endsWith(".workers.dev");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JobCraft | Your Career, More Clearly",
    template: "%s | JobCraft",
  },
  description:
    "Discover job opportunities, strengthen your resume, and organise your job search with career tools built to help you take your next step.",
  applicationName: "JobCraft",
  keywords: [
    "job search",
    "career platform",
    "job matching",
    "resume builder",
    "career tools",
    "application tracker",
  ],
  robots: {
    index: !IS_TEMPORARY_HOST,
    follow: !IS_TEMPORARY_HOST,
  },
  openGraph: {
    type: "website",
    siteName: "JobCraft",
    title: "JobCraft | Your Career, More Clearly",
    description:
      "Discover job opportunities, strengthen your resume, and organise your job search with career tools built to help you take your next step.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "JobCraft | Your Career, More Clearly",
    description:
      "Discover job opportunities, strengthen your resume, and organise your job search with career tools built to help you take your next step.",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <AuthNavigationBridge />
          <AuthModal authenticated={Boolean(user)} />
        </Suspense>
        <MobileAppNav />
      </body>
    </html>
  );
}
