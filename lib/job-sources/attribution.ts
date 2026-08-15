export type ProviderAttribution = {
  label: string;
  href: string | null;
  requiredPerListing: boolean;
};

export function getProviderAttribution(source: string | null | undefined, applyUrl?: string | null): ProviderAttribution | null {
  const normalized = (source ?? "").trim().toLowerCase();

  if (normalized === "adzuna") {
    return { label: "Jobs by Adzuna", href: "https://www.adzuna.in/", requiredPerListing: true };
  }
  if (normalized === "arbeitnow") {
    return { label: "Source: Arbeitnow", href: applyUrl || "https://www.arbeitnow.com/", requiredPerListing: true };
  }
  if (normalized === "remotive") {
    return { label: "Source: Remotive", href: applyUrl || "https://remotive.com/", requiredPerListing: true };
  }
  if (normalized === "jooble") {
    return { label: "Source: Jooble", href: applyUrl || "https://jooble.org/", requiredPerListing: false };
  }
  if (normalized === "indianapi") {
    return { label: "Source: IndianAPI", href: "https://indianapi.in/jobs-api", requiredPerListing: false };
  }
  if (normalized === "theirstack") {
    return { label: "Source: TheirStack", href: "https://theirstack.com/", requiredPerListing: false };
  }
  if (normalized === "greenhouse") {
    return { label: "Employer listing via Greenhouse", href: applyUrl ?? null, requiredPerListing: false };
  }
  if (normalized === "lever") {
    return { label: "Employer listing via Lever", href: applyUrl ?? null, requiredPerListing: false };
  }
  return null;
}
