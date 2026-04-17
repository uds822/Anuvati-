
-- Employee documents table
CREATE TABLE public.hr_employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.hr_employee_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own documents" ON public.hr_employee_documents
  FOR SELECT USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "HR admin can manage documents" ON public.hr_employee_documents
  FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Employees can upload own documents" ON public.hr_employee_documents
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

-- Employee lifecycle history table
CREATE TABLE public.hr_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.hr_employees(id) ON DELETE CASCADE NOT NULL,
  from_stage text,
  to_stage text NOT NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hr_lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can view lifecycle events" ON public.hr_lifecycle_events
  FOR SELECT USING (has_any_hr_role(auth.uid()));

CREATE POLICY "HR admin can manage lifecycle events" ON public.hr_lifecycle_events
  FOR ALL USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Storage bucket for HR documents
INSERT INTO storage.buckets (id, name, public) VALUES ('hr-documents', 'hr-documents', false);

-- Storage RLS: employees can upload to their own folder
CREATE POLICY "Employees can upload own docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hr-documents' AND has_any_hr_role(auth.uid()));

CREATE POLICY "Employees can view own docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'hr-documents' AND has_any_hr_role(auth.uid()));

CREATE POLICY "HR admin can manage all docs" ON storage.objects
  FOR ALL USING (bucket_id = 'hr-documents' AND (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)))
  WITH CHECK (bucket_id = 'hr-documents' AND (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role)));
