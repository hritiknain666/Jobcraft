import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="text-2xl font-black text-indigo-600">JobCraft</span>
          <form action={logout}><button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Log out</button></form>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="font-bold text-indigo-600">YOUR DASHBOARD</p>
        <h1 className="mt-2 text-4xl font-black">Welcome to JobCraft</h1>
        <p className="mt-3 text-slate-600">Signed in as {user.email}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Resume", "Upload your resume to unlock AI matching."],
            ["Job matches", "Your recommended jobs will appear here."],
            ["Applications", "Track every application from one place."],
            ["Career assistant", "Get personalized career guidance."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
