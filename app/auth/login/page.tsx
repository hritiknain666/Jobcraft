import Link from "next/link";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-2xl font-black text-indigo-600">JobCraft</Link>
        <h1 className="mt-8 text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-slate-600">Log in to continue your job search.</p>

        {params.error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
        {params.message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p>}

        <form action={login} className="mt-8 space-y-5">
          <label className="block text-sm font-bold">Email
            <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
          </label>
          <label className="block text-sm font-bold">Password
            <input name="password" type="password" required minLength={6} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
          </label>
          <button className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white hover:bg-indigo-700">Log in</button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">New to JobCraft? <Link href="/auth/signup" className="font-bold text-indigo-600">Create an account</Link></p>
      </div>
    </main>
  );
}
