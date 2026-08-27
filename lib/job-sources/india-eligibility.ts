const INDIA_LOCATION_PATTERN =
  /\bindia\b|\bbengaluru\b|\bbangalore\b|\bhyderabad\b|\bmumbai\b|\bdelhi\b|\bnew delhi\b|\bnoida\b|\bgurugram\b|\bgurgaon\b|\bchennai\b|\bpune\b|\bkolkata\b|\bahmedabad\b|\bjaipur\b|\bkochi\b|\bcochin\b|\bthiruvananthapuram\b|\btrivandrum\b|\bchandigarh\b|\bindore\b|\bvadodara\b|\bsurat\b|\blucknow\b/i;

const GLOBAL_REMOTE_PATTERN = /\bworldwide\b|\banywhere\b|\bglobal\b|\bmultiple countries\b/i;
const REGION_REMOTE_PATTERN = /\basia\b|\bapac\b|\basia[- ]pacific\b/i;

export function isIndiaLocation(value: string | null | undefined) {
  return INDIA_LOCATION_PATTERN.test(value ?? "");
}

export function isIndiaEligibleRemoteLocation(value: string | null | undefined) {
  const location = value ?? "";
  return (
    isIndiaLocation(location) ||
    GLOBAL_REMOTE_PATTERN.test(location) ||
    REGION_REMOTE_PATTERN.test(location)
  );
}
