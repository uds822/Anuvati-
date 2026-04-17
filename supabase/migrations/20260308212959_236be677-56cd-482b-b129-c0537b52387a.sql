
-- Add JD file URL to job postings
ALTER TABLE public.hr_job_postings ADD COLUMN IF NOT EXISTS jd_file_url text;

-- Add review_status to candidate_documents for per-document approval
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
