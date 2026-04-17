-- Offboarding requests table
CREATE TABLE public.hr_offboarding_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  initiated_by uuid REFERENCES auth.users(id),
  reason text NOT NULL DEFAULT 'resignation',
  last_working_date date,
  status text NOT NULL DEFAULT 'initiated',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Offboarding clearances table (one row per department per request)
CREATE TABLE public.hr_offboarding_clearances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offboarding_id uuid NOT NULL REFERENCES public.hr_offboarding_requests(id) ON DELETE CASCADE,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(offboarding_id, department)
);

ALTER TABLE public.hr_offboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_offboarding_clearances ENABLE ROW LEVEL SECURITY;

-- RLS for offboarding_requests
CREATE POLICY "HR admin can manage offboarding" ON public.hr_offboarding_requests FOR ALL TO authenticated
USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view offboarding" ON public.hr_offboarding_requests FOR SELECT TO authenticated
USING (has_any_hr_role(auth.uid()));

CREATE POLICY "Employees can view own offboarding" ON public.hr_offboarding_requests FOR SELECT TO authenticated
USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

-- RLS for offboarding_clearances
CREATE POLICY "HR admin can manage clearances" ON public.hr_offboarding_clearances FOR ALL TO authenticated
USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view clearances" ON public.hr_offboarding_clearances FOR SELECT TO authenticated
USING (has_any_hr_role(auth.uid()));

CREATE POLICY "HR users can update own dept clearance" ON public.hr_offboarding_clearances FOR UPDATE TO authenticated
USING (has_any_hr_role(auth.uid()));

CREATE POLICY "Employees can view own clearances" ON public.hr_offboarding_clearances FOR SELECT TO authenticated
USING (offboarding_id IN (SELECT id FROM hr_offboarding_requests WHERE employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid())));

-- Triggers for updated_at
CREATE TRIGGER update_hr_offboarding_requests_updated_at BEFORE UPDATE ON public.hr_offboarding_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_offboarding_clearances_updated_at BEFORE UPDATE ON public.hr_offboarding_clearances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();