
-- Students table (privacy-minimal)
CREATE TABLE public.crm_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.crm_schools(id) ON DELETE CASCADE,
  grade text,
  age_band text,
  gender text,
  parent_name text,
  parent_contact text,
  caste_category text,
  consent_parent_info boolean DEFAULT false,
  consent_caste_info boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_students ENABLE ROW LEVEL SECURITY;

-- RLS: CRM users can view students (funder can only see non-PII via app logic)
CREATE POLICY "CRM users can view students" ON public.crm_students FOR SELECT TO authenticated USING (has_any_crm_role(auth.uid()));
CREATE POLICY "Admin/supervisor can manage students" ON public.crm_students FOR ALL TO authenticated USING (has_crm_role(auth.uid(), 'crm_admin'::crm_role) OR has_crm_role(auth.uid(), 'supervisor'::crm_role)) WITH CHECK (has_crm_role(auth.uid(), 'crm_admin'::crm_role) OR has_crm_role(auth.uid(), 'supervisor'::crm_role));

-- Add approval_status to gallery tracking (using a metadata table)
CREATE TABLE public.crm_media_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL UNIQUE,
  school_id uuid REFERENCES public.crm_schools(id),
  activity_tag text,
  uploaded_by uuid,
  approval_status text DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_media_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM users can view media metadata" ON public.crm_media_metadata FOR SELECT TO authenticated USING (has_any_crm_role(auth.uid()));
CREATE POLICY "CRM users can insert media metadata" ON public.crm_media_metadata FOR INSERT TO authenticated WITH CHECK (has_any_crm_role(auth.uid()));
CREATE POLICY "Admin/supervisor can update media metadata" ON public.crm_media_metadata FOR UPDATE TO authenticated USING (has_crm_role(auth.uid(), 'crm_admin'::crm_role) OR has_crm_role(auth.uid(), 'supervisor'::crm_role));

-- Add update trigger for students
CREATE TRIGGER update_crm_students_updated_at BEFORE UPDATE ON public.crm_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
