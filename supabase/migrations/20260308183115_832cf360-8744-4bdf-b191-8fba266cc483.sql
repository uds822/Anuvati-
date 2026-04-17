
-- Attendance table
CREATE TABLE public.hr_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present',
  work_mode TEXT DEFAULT 'office',
  notes TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Leave types
CREATE TABLE public.hr_leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  annual_quota INTEGER NOT NULL DEFAULT 12,
  carry_forward BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave requests
CREATE TABLE public.hr_leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.hr_leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL DEFAULT 1,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave balances
CREATE TABLE public.hr_leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.hr_leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_allocated NUMERIC NOT NULL DEFAULT 0,
  used NUMERIC NOT NULL DEFAULT 0,
  remaining NUMERIC GENERATED ALWAYS AS (total_allocated - used) STORED,
  UNIQUE(employee_id, leave_type_id, year)
);

-- Salary structures
CREATE TABLE public.hr_salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE UNIQUE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  hra NUMERIC DEFAULT 0,
  transport_allowance NUMERIC DEFAULT 0,
  medical_allowance NUMERIC DEFAULT 0,
  special_allowance NUMERIC DEFAULT 0,
  pf_deduction NUMERIC DEFAULT 0,
  tax_deduction NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  effective_from DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payslips
CREATE TABLE public.hr_payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Triggers
CREATE TRIGGER update_hr_attendance_updated_at BEFORE UPDATE ON public.hr_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_leave_requests_updated_at BEFORE UPDATE ON public.hr_leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hr_salary_structures_updated_at BEFORE UPDATE ON public.hr_salary_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payslips ENABLE ROW LEVEL SECURITY;

-- RLS: hr_attendance
CREATE POLICY "HR users can view attendance" ON public.hr_attendance FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage attendance" ON public.hr_attendance FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can mark own attendance" ON public.hr_attendance FOR INSERT TO authenticated WITH CHECK (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);
CREATE POLICY "Employees can update own attendance" ON public.hr_attendance FOR UPDATE TO authenticated USING (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_leave_types
CREATE POLICY "HR users can view leave types" ON public.hr_leave_types FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage leave types" ON public.hr_leave_types FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_leave_requests
CREATE POLICY "HR users can view leave requests" ON public.hr_leave_requests FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage leave requests" ON public.hr_leave_requests FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can create own leave requests" ON public.hr_leave_requests FOR INSERT TO authenticated WITH CHECK (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_leave_balances
CREATE POLICY "HR users can view leave balances" ON public.hr_leave_balances FOR SELECT TO authenticated USING (has_any_hr_role(auth.uid()));
CREATE POLICY "HR admin can manage leave balances" ON public.hr_leave_balances FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));

-- RLS: hr_salary_structures
CREATE POLICY "Finance/admin can view salary structures" ON public.hr_salary_structures FOR SELECT TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin') OR has_hr_role(auth.uid(), 'finance'));
CREATE POLICY "HR admin can manage salary structures" ON public.hr_salary_structures FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view own salary" ON public.hr_salary_structures FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- RLS: hr_payslips
CREATE POLICY "Finance/admin can view payslips" ON public.hr_payslips FOR SELECT TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin') OR has_hr_role(auth.uid(), 'finance'));
CREATE POLICY "HR admin can manage payslips" ON public.hr_payslips FOR ALL TO authenticated USING (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin')) WITH CHECK (has_hr_role(auth.uid(), 'super_admin') OR has_hr_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view own payslips" ON public.hr_payslips FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid())
);

-- Seed default leave types
INSERT INTO public.hr_leave_types (name, description, annual_quota, carry_forward) VALUES
  ('Casual Leave', 'For personal matters and short absences', 12, false),
  ('Sick Leave', 'For health-related absences with medical certificate', 10, false),
  ('Earned Leave', 'Accumulated leave based on service duration', 15, true),
  ('Maternity Leave', 'For eligible employees during pregnancy', 180, false),
  ('Paternity Leave', 'For eligible employees after childbirth', 15, false),
  ('Field Work Leave', 'For field assignments and community visits', 20, false);
