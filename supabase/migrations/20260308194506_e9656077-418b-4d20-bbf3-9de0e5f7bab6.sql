CREATE POLICY "Public can view published job postings"
ON public.hr_job_postings
FOR SELECT
TO anon, authenticated
USING (status = 'published');