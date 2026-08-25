export type ProfileRecord = {
  full_name?: string | null;
  headline?: string | null;
  city?: string | null;
  experience_years?: number | null;
  skills?: string[] | null;
  target_roles?: string[] | null;
  preferred_work_modes?: string[] | null;
};

export type ResumeRecord = {
  id: string;
  name: string;
  storage_path: string | null;
  is_primary: boolean;
  created_at: string;
  structured_data?: Record<string, unknown> | null;
};

export type CertificateRecord = {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  storage_path?: string | null;
};

export type JobRecord = {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  location_normalized: string | null;
  work_mode: string | null;
  salary_min_lpa: number | null;
  salary_max_lpa: number | null;
  experience_min: number | null;
  experience_max: number | null;
  skills: string[] | null;
  source: string | null;
  posted_at: string | null;
  apply_url: string | null;
};

export type ApplicationRecord = {
  id: string;
  status: string;
  created_at?: string;
  updated_at: string;
  job_id?: string;
  jobs?: JobRecord | null;
};
