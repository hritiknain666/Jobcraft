import type { Metadata } from "next";
import { Suspense } from "react";
import MobileAppNav from "@/components/mobile-app-nav";
import AuthModal from "@/components/auth-modal";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobCraft | AI Career Platform for India",
  description: "Find better-fit jobs, improve your resume, and manage your job search with AI built for the Indian market.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}><AuthModal /></Suspense>
        <MobileAppNav authenticated={Boolean(user)} />
      </body>
    </html>
  );
}
