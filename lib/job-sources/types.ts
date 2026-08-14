export type NormalizedJob = {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  workMode: string | null;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  skills: string[];
  description: string;
  applyUrl: string | null;
  postedAt: string;
  isActive: boolean;
  isSample: boolean;
};

export type JobSourceInput = {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location?: string | null;
  workMode?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  salaryMinLpa?: number | null;
  salaryMaxLpa?: number | null;
  skills?: string[] | null;
  description?: string | null;
  applyUrl?: string | null;
  postedAt?: string | null;
  isActive?: boolean | null;
  isSample?: boolean | null;
};
