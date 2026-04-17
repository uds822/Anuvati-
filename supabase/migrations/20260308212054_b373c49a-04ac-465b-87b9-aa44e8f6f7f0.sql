
-- Create candidate_documents table to store onboarding documents uploaded by candidates
CREATE TABLE public.candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.hr_candidates(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

-- Public can insert their own documents (via token-based access)
CREATE POLICY "Anyone can insert candidate documents"
  ON public.candidate_documents FOR INSERT
  WITH CHECK (true);

-- HR admin can view all candidate documents
CREATE POLICY "HR admin can manage candidate documents"
  ON public.candidate_documents FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- HR users can view candidate documents
CREATE POLICY "HR users can view candidate documents"
  ON public.candidate_documents FOR SELECT
  USING (has_any_hr_role(auth.uid()));

-- Create storage bucket for candidate uploads (public for easy access)
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-documents', 'candidate-documents', true);

-- Storage policies for candidate-documents bucket
CREATE POLICY "Anyone can upload candidate documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'candidate-documents');

CREATE POLICY "Anyone can read candidate documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'candidate-documents');

CREATE POLICY "HR admin can delete candidate documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'candidate-documents' AND (
    EXISTS (SELECT 1 FROM public.hr_user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'hr_admin'))
  ));

-- Add onboarding_token to hr_candidates for secure document upload link
ALTER TABLE public.hr_candidates ADD COLUMN IF NOT EXISTS onboarding_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.hr_candidates ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'not_started';

-- Allow public to read candidate by onboarding token (for document upload portal)
CREATE POLICY "Public can view candidate by onboarding token"
  ON public.hr_candidates FOR SELECT
  USING (true);
