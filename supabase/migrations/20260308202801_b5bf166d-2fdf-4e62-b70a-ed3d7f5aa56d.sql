
-- Add onboarding_status to hr_employees
ALTER TABLE public.hr_employees ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'pending_documents';

-- Employee bank details
CREATE TABLE public.hr_employee_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  account_holder_name text,
  bank_name text,
  account_number text,
  ifsc_code text,
  branch_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);
ALTER TABLE public.hr_employee_bank_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own bank details" ON public.hr_employee_bank_details FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage bank details" ON public.hr_employee_bank_details FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee emergency contacts
CREATE TABLE public.hr_employee_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  relationship text,
  phone text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_employee_emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own emergency contacts" ON public.hr_employee_emergency_contacts FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage emergency contacts" ON public.hr_employee_emergency_contacts FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee education records
CREATE TABLE public.hr_employee_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  degree text NOT NULL,
  institution text NOT NULL,
  field_of_study text,
  year_of_passing integer,
  grade_or_percentage text,
  certificate_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_employee_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own education" ON public.hr_employee_education FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage education" ON public.hr_employee_education FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee previous employment
CREATE TABLE public.hr_employee_previous_employment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  designation text,
  from_date date,
  to_date date,
  reason_for_leaving text,
  experience_letter_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_employee_previous_employment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own previous employment" ON public.hr_employee_previous_employment FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage previous employment" ON public.hr_employee_previous_employment FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Employee medical info
CREATE TABLE public.hr_employee_medical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  blood_group text,
  allergies text,
  medical_conditions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);
ALTER TABLE public.hr_employee_medical ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage own medical info" ON public.hr_employee_medical FOR ALL
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "HR admin can manage medical info" ON public.hr_employee_medical FOR ALL
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

-- Update existing employees to approved status
UPDATE public.hr_employees SET onboarding_status = 'approved' WHERE employment_status = 'active';

-- Add read policy for all HR users on new tables
CREATE POLICY "HR users can view bank details" ON public.hr_employee_bank_details FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view emergency contacts" ON public.hr_employee_emergency_contacts FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view education" ON public.hr_employee_education FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view previous employment" ON public.hr_employee_previous_employment FOR SELECT
  USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR users can view medical info" ON public.hr_employee_medical FOR SELECT
  USING (has_any_hr_role(auth.uid()));
