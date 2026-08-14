import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; next?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.auth === "login" || params.auth === "signup") {
    query.set("auth", params.auth);
  }

  if (params.next?.startsWith("/") && !params.next.startsWith("//")) {
    query.set("next", params.next);
  }

  const suffix = query.toString();
  redirect(suffix ? `/dashboard?${suffix}` : "/dashboard");
}
