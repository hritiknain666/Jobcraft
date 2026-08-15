const LOCATION_ALIASES: Array<[RegExp, string]> = [
  [/\b(?:bengaluru|bangalore)\b/i, "Bengaluru"],
  [/\b(?:gurugram|gurgaon)\b/i, "Gurugram"],
  [/\b(?:mumbai|bombay)\b/i, "Mumbai"],
  [/\bnoida\b/i, "Noida"],
  [/\b(?:new delhi|delhi ncr|delhi)\b/i, "Delhi NCR"],
  [/\bhyderabad\b/i, "Hyderabad"],
  [/\bpune\b/i, "Pune"],
  [/\bchennai\b/i, "Chennai"],
  [/\b(?:kolkata|calcutta)\b/i, "Kolkata"],
  [/\bahmedabad\b/i, "Ahmedabad"],
  [/\b(?:kochi|cochin)\b/i, "Kochi"],
  [/\bjaipur\b/i, "Jaipur"],
  [/\bchandigarh\b/i, "Chandigarh"],
  [/\bcoimbatore\b/i, "Coimbatore"],
  [/\bindore\b/i, "Indore"],
  [/\bsurat\b/i, "Surat"],
  [/\bvadodara\b/i, "Vadodara"],
  [/\bnashik\b/i, "Nashik"],
  [/\b(?:mysuru|mysore)\b/i, "Mysuru"],
  [/\b(?:remote|work from home|wfh)\b/i, "Remote"],
];

export function normalizeLocationSearch(value: string | null | undefined) {
  const cleaned = (value ?? "").trim().replace(/\s+/g, " ").slice(0, 180);
  if (!cleaned) return "";
  for (const [pattern, canonical] of LOCATION_ALIASES) {
    if (pattern.test(cleaned)) return canonical;
  }
  return cleaned;
}
