
-- Allow admins to update submission status (approve, complete, etc.)
CREATE POLICY "Admins can update submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add certificate_requested_at column to track when user requests certificate
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS certificate_requested_at timestamptz DEFAULT NULL;

-- Add approved_at column
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS approved_at timestamptz DEFAULT NULL;

-- Add completed_at column  
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL;
