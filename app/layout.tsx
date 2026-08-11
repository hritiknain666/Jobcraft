import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobCraft | AI Career Platform for India",
  description:
    "Find better-fit jobs, improve your resume, and manage your job search with AI built for the Indian market.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
