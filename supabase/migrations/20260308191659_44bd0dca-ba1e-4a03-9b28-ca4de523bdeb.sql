
-- CSR Projects table
CREATE TABLE public.hr_csr_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  csr_partner text,
  description text,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CSR Staff Allocations
CREATE TABLE public.hr_csr_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  csr_project_id uuid NOT NULL REFERENCES public.hr_csr_projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  hours_spent numeric DEFAULT 0,
  activity_log text,
  assigned_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Skills
CREATE TABLE public.hr_employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_category text NOT NULL DEFAULT 'technical',
  proficiency_level text DEFAULT 'intermediate',
  certified boolean DEFAULT false,
  certification_name text,
  certification_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer Activities / Impact tracking
CREATE TABLE public.hr_volunteer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_name text NOT NULL,
  volunteer_email text,
  project_name text,
  activity_type text NOT NULL DEFAULT 'fieldwork',
  hours_contributed numeric DEFAULT 0,
  communities_served integer DEFAULT 0,
  beneficiaries_reached integer DEFAULT 0,
  events_supported integer DEFAULT 0,
  activity_date date DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hr_csr_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_csr_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_activities ENABLE ROW LEVEL SECURITY;

-- CSR Projects policies
CREATE POLICY "HR admin can manage CSR projects" ON public.hr_csr_projects FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view CSR projects" ON public.hr_csr_projects FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- CSR Allocations policies
CREATE POLICY "HR admin can manage CSR allocations" ON public.hr_csr_allocations FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view CSR allocations" ON public.hr_csr_allocations FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Employee Skills policies
CREATE POLICY "HR admin can manage skills" ON public.hr_employee_skills FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Employees can manage own skills" ON public.hr_employee_skills FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()))
  WITH CHECK (employee_id IN (SELECT id FROM hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "HR users can view skills" ON public.hr_employee_skills FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Volunteer Activities policies
CREATE POLICY "HR admin can manage volunteer activities" ON public.hr_volunteer_activities FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view volunteer activities" ON public.hr_volunteer_activities FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));
