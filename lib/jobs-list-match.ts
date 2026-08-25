import { calculateJobMatch, getJobMatchLabel } from "@/lib/job-match";

export type JobsListProfile = {
  skills?: string[] | null;
  experience_years?: number | null;
  city?: string | null;
  target_roles?: string[] | null;
  preferred_work_modes?: string[] | null;
};

export type JobsListJob = {
  title: string;
  skills?: string[] | null;
  experience_min?: number | null;
  location?: string | null;
  work_mode?: string | null;
};

export function calculateJobsListMatch(job: JobsListJob, profile: JobsListProfile | null) {
  if (!profile) return null;

  const match = calculateJobMatch({
    jobSkills: job.skills ?? [],
    userSkills: profile.skills ?? [],
    jobMinExperience: job.experience_min,
    userExperience: profile.experience_years,
    jobLocation: job.location,
    userCity: profile.city,
    jobWorkMode: job.work_mode,
    preferredWorkModes: profile.preferred_work_modes ?? [],
    targetRoles: profile.target_roles ?? [],
    jobTitle: job.title,
  });

  return {
    ...match,
    matched: match.matchedSkills,
    missing: match.missingSkills,
    label: getJobMatchLabel(match.score, match.confidence),
  };
}
