
-- HR Role enum
CREATE TYPE public.hr_role AS ENUM ('super_admin', 'hr_admin', 'manager', 'employee', 'volunteer', 'finance');

-- HR Departments
CREATE TABLE public.hr_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  head_employee_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HR Employees
CREATE TABLE public.hr_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  gender TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  department_id UUID REFERENCES public.hr_departments(id) ON DELETE SET NULL,
  designation TEXT,
  reporting_manager_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  joining_date DATE,
  employment_type TEXT DEFAULT 'full_time',
  employment_status TEXT DEFAULT 'active',
  lifecycle_stage TEXT DEFAULT 'onboarding',
  salary_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for department head back-reference
ALTER TABLE public.hr_departments ADD CONSTRAINT hr_departments_head_fk FOREIGN KEY (head_employee_id) REFERENCES public.hr_employees(id) ON DELETE SET NULL;

-- HR User Roles
CREATE TABLE public.hr_user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role hr_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- HR Activity Log
CREATE TABLE public.hr_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer functions for HR roles
CREATE OR REPLACE FUNCTION public.has_hr_role(_user_id UUID, _role hr_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_hr_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hr_user_roles WHERE user_id = _user_id
  )
$$;

-- Updated_at triggers
CREATE TRIGGER update_hr_departments_updated_at BEFORE UPDATE ON public.hr_departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_employees_updated_at BEFORE UPDATE ON public.hr_employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS: hr_departments
CREATE POLICY "HR users can view departments" ON public.hr_departments FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage departments" ON public.hr_departments FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_employees
CREATE POLICY "HR users can view employees" ON public.hr_employees FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage employees" ON public.hr_employees FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view own record" ON public.hr_employees FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: hr_user_roles
CREATE POLICY "Super admin can manage HR roles" ON public.hr_user_roles FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view own HR roles" ON public.hr_user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: hr_activity_log
CREATE POLICY "HR admin can view activity log" ON public.hr_activity_log FOR SELECT TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "HR users can insert activity log" ON public.hr_activity_log FOR INSERT TO authenticated WITH CHECK (has_any_hr_role(auth.uid()));

-- Enable realtime for activity log
ALTER PUBLICATION supabase_realtime ADD TABLE public.hr_activity_log;
