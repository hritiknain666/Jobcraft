export const JOB_FRESHNESS_DAYS = 45;

export function jobFreshnessCutoff(now = new Date(), days = JOB_FRESHNESS_DAYS) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff.toISOString();
}
