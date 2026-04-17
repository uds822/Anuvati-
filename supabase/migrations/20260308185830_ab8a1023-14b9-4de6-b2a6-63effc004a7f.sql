
-- Volunteers table
CREATE TABLE public.hr_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  gender text,
  age integer,
  city text,
  state text,
  skills text[],
  areas_of_interest text[],
  availability text DEFAULT 'weekdays',
  status text NOT NULL DEFAULT 'pending',
  user_id uuid,
  employee_id uuid REFERENCES public.hr_employees(id),
  joined_at timestamptz,
  notes text,
  total_hours numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer hours log
CREATE TABLE public.hr_volunteer_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.hr_projects(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  hours numeric NOT NULL DEFAULT 0,
  activity text,
  notes text,
  verified_by uuid REFERENCES public.hr_employees(id),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer project assignments
CREATE TABLE public.hr_volunteer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.hr_projects(id) ON DELETE CASCADE,
  role text DEFAULT 'volunteer',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  status text DEFAULT 'active',
  UNIQUE(volunteer_id, project_id)
);

-- Volunteer certificates
CREATE TABLE public.hr_volunteer_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.hr_volunteers(id) ON DELETE CASCADE,
  certificate_type text NOT NULL DEFAULT 'completion',
  issued_at timestamptz NOT NULL DEFAULT now(),
  issued_by uuid REFERENCES public.hr_employees(id),
  total_hours numeric DEFAULT 0,
  project_names text[],
  certificate_number text NOT NULL,
  notes text
);

-- Enable RLS
ALTER TABLE public.hr_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_volunteer_certificates ENABLE ROW LEVEL SECURITY;

-- RLS: hr_volunteers
CREATE POLICY "HR admin can manage volunteers" ON public.hr_volunteers FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage volunteers" ON public.hr_volunteers FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view volunteers" ON public.hr_volunteers FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

CREATE POLICY "Volunteers can view own record" ON public.hr_volunteers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS: hr_volunteer_hours
CREATE POLICY "HR admin can manage volunteer hours" ON public.hr_volunteer_hours FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage volunteer hours" ON public.hr_volunteer_hours FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view volunteer hours" ON public.hr_volunteer_hours FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- RLS: hr_volunteer_assignments
CREATE POLICY "HR admin can manage assignments" ON public.hr_volunteer_assignments FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "Managers can manage assignments" ON public.hr_volunteer_assignments FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'manager'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'manager'::hr_role));

CREATE POLICY "HR users can view assignments" ON public.hr_volunteer_assignments FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- RLS: hr_volunteer_certificates
CREATE POLICY "HR admin can manage certificates" ON public.hr_volunteer_certificates FOR ALL TO authenticated
  USING (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role))
  WITH CHECK (has_hr_role(auth.uid(), 'super_admin'::hr_role) OR has_hr_role(auth.uid(), 'hr_admin'::hr_role));

CREATE POLICY "HR users can view certificates" ON public.hr_volunteer_certificates FOR SELECT TO authenticated
  USING (has_any_hr_role(auth.uid()));

-- Triggers
CREATE TRIGGER update_hr_volunteers_updated_at BEFORE UPDATE ON public.hr_volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
